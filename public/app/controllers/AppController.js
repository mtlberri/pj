//AngularFire - Synchronized Array for Oders
var app = angular.module("pjApp", ["firebase"]);

//Inject firebaseObject into the controller
app.controller("AppController", ["$scope", "$firebaseArray", 
	function($scope, $firebaseArray) {

	//Observer on the Auth object to set $scope variable uid and orders
	$scope.uid = null;
	$scope.userName = null;
	$scope.orders = null;
	
	//various global scope variables initialization
	$scope.formFreeText = null;
	$scope.orderBeingCancelled = null;
	$scope.orderBeingPaid = null;
	$scope.orderFormDate = null;

	//Init of date picker
	$('#datetimepicker5').datetimepicker({
	    format: "dddd, MMM Do",
	    //minDate: moment().add(2,"days")
	  });

	//Listener on datepicker - when changed it updates scope var
	$("#datetimepicker5").on("dp.change", function() {
		console.log("Date Changed!");
		$scope.orderFormDate = $("#datetimepicker5").data("DateTimePicker").date().toString().slice(0,15);
		//Digest the change of scope to refresh view
		$scope.$digest();
		//Format the input depending if filled or not
		$scope.orderFormValidationFormatting('formDateCase');
		console.log($scope.orderFormDate);
	});

	firebase.auth().onAuthStateChanged(function(user) {
		if (user) {
			//If user logged In
			console.log("User is Logged In!");
			$scope.uid = user.uid;
			console.log("$scope.uid set to " + $scope.uid);
			$scope.userName = user.displayName;
			console.log("$scope.userName set to " + $scope.userName);

			//Gather user info...
			var displayName = user.displayName;
			var email = user.email;
			var emailVerified = user.emailVerified;
			var photoURL = user.photoURL;
			var uid = user.uid;
			var providerData = user.providerData;
			user.getToken().then(function(accessToken) {

				//Display name in the Nav bar
				$("#user_name_navbar").text(displayName);
				$("#sign_in_out").text("Sign out");

				//jQuery hiding the Firebase UI Auth when the user is logged in
				console.log("Hide Firebase UI Auth please!");
				$("#firebaseui-auth-container").slideUp(1000);  

				//Enable Ordering Form
				$("#orderFormId :input").prop("disabled", false);
				//Adapt the text for Ordering Form
				$("#signed_out_text_Order").hide();
				$("#signed_in_text_Order").show();


				// Push user account details to HTML content
				if (photoURL != null) {
					//Use valid Photo URL from Google or Facebook 
					document.getElementById('userPhoto').src = photoURL;
				} else {
					//Else, Default photo is used
					document.getElementById('userPhoto').src = "images/default_user.png";
				}

				// Set user account details to Firebase
				firebase.database().ref("users/" + uid + "/userDetails/").set({
				  "displayName": displayName,
				  "email": email,
				  "emailVerified": emailVerified,
				  "photoURL": photoURL,
				  "uid": uid,
				  "accessToken": accessToken,
				  "providerData": providerData
				  });

			}); 


			//Firebase Array is synced on orders
			var refOrders = firebase.database().ref().child("orders");
			$scope.orders = $firebaseArray(refOrders);
			console.log("$scope.orders synced with Firebase!");

		} else {
			
			//Disable Ordering Form
			$("#orderFormId :input").prop("disabled", true);
			//Adapt the text for Ordering Form
			$("#signed_out_text_Order").show();
			$("#signed_in_text_Order").hide();

			console.log("User is Logged Out!");
			$scope.uid = null;
			console.log("$scope.uid set to null");
			$scope.orders = null;
			console.log("$scope.ordes set to null");

			console.log("Show Firebase UI Auth please!");
			//jQuery showing the Firebase UI Auth when the user is logged in
			$("#firebaseui-auth-container").slideDown(1000); 
		}
	});

	$scope.orderClicked = function(){
			
			//If user is signed in, show the Order modal
			if($scope.uid) {		
				
				//If all mandatory fields are valid...
				if($scope.orderForm.formJuice.$valid && 
					$scope.orderForm.formQty.$valid &&
					$scope.orderForm.formAddress.$valid &&
					$scope.orderFormDate &&
					$scope.orderForm.formTimeSlot.$valid) {
					//Programmatically call the Modal for order confirmation
					$('#orderModal').modal();					
				} else {
					//Pop-up a Modal to prompt user to fill mandatory fields
					$('#orderFieldsMissingModal').modal();	
					//Format the invalid fields to highlight errors to user
					//If field valid it will not be formatted
					//If field invalid it will be formatted in error
					$scope.orderFormValidationFormatting('formJuiceCase');
					$scope.orderFormValidationFormatting('formQtyCase');
					$scope.orderFormValidationFormatting('formDateCase');
					$scope.orderFormValidationFormatting('formTimeSlotCase');
					$scope.orderFormValidationFormatting('formAddressCase');
				}
			
			}

			//Else if user is not signed in
			else {
				//Programmatically call the Modal for sign in
				$('#signInModal').modal();	
			}


	};


	//Method to add a new Order, called by the form ng-submit
	$scope.addOrder = function(){
		if ($scope.uid) {
		//Add the order in the overall list of orders (Firebase)
		console.log("Add Order to Firebase!");
		$scope.orders.$add({
	    "orderNumber": $scope.lastOrderNumber() + 1,
	    "juice_id": $scope.formJuice,	        
	    "qty": $scope.formQty,
	    "delivery_date": $scope.orderFormDate,
	    "delivery_time_slot": $scope.formTimeSlot,
	    "delivery_address": $scope.formAddress,
	    "free_text": $scope.formFreeText,
	    "status": "ORDERED",
	    "paid": false,
	    "userUid": firebase.auth().currentUser.uid,
	    "userDisplayName": firebase.auth().currentUser.displayName,
	    "history": moment().toString() + ": Order created; "    
		}).then(function(ref) {

			//Index the order under the users/<userUid>/userOrders/ part of the tree
			var refUserOrders = firebase.database().ref().child("users/" 
				+ firebase.auth().currentUser.uid + "/userOrders/" + ref.key).set(true);

			console.log("Index " + ref.key + " created under user orders!");
			});

			$('#orderCreatedModal').modal();

		}
		else {
			//Do Nothing
		}

	};

	//Method to retrieve the last order number from list of orders
	$scope.lastOrderNumber = function() {
		var result = 0;
		if ($scope.orders.length > 0) {
			result = $scope.orders[$scope.orders.length - 1].orderNumber;
		}
		return result;
	};

	//Method called when Cancel button pressed
	$scope.cancelBtnPressed = function(orderToCancel) {
		
		//Record the order being cancelled for use by pop-up modal
		$scope.orderBeingCancelled = orderToCancel;
		//Pop-up modal
		$('#orderCancelModal').modal();
	};	

	//Method called when Payment button pressed
	$scope.paymentBtnPressed = function(orderToPay) {
		console.log("Payment button pressed!");
		//Record the order being paid for use by pop-up modal
		$scope.orderBeingPaid = orderToPay;
		//Pop-up modal
		$('#orderPaymentModal').modal();
	};	

	//Method to change order status
	$scope.changeOrderStatus = function(order,newStatus) {
		order.status = newStatus;
		order.history += moment().toString() + ": Order status changed to " + newStatus + "; ";
		$scope.orders.$save(order);
		console.log("order status changed to: " + newStatus);

	};

	//Method to change order payment
	$scope.setOrderPayment = function() {
		$scope.orderBeingPaid.paid = $scope.paymentAmount;
		$scope.orderBeingPaid.history += moment().toString() + ": Order paid " + $scope.paymentAmount + "; "
		$scope.orders.$save($scope.orderBeingPaid);
		console.log("order payment set to: " + $scope.paymentAmount);
	};	

	//Method to filter orders in table (depending on order status, ...)
	$scope.tableFilterFunction = function(value, index, array) {
		var result;
		// If order is not archived and belongs to User, then displayed in table
		if (value.status != "ARCHIVED" && value.userUid == $scope.uid) {
			result = true;
		} else {
			result = false;
		}
		return result;
	};	


	//Method to filter orders in table (depending on order status, ...)
	$scope.jarTableFilterFunction = function(value, index, array) {
		var result;
		// If order is not archived and belongs to User, then displayed in table
		if (value.status != "ARCHIVED" && $scope.uid == "M29HBj83K9RY3S8YtSqqvglPJrG2") {
			result = true;
		} else {
			result = false;
		}
		return result;
	};	

	//Format order form "formId" if entry is not valid
	$scope.orderFormValidationFormatting = function(formIdCase){

		switch(formIdCase) {
			
			case 'formJuiceCase':
				//Check if form input is valid or not, and format accordingly
				if($scope.orderForm.formJuice.$valid) {
					$("#formGroupJuice").removeClass("has-error");
				} else {
					$("#formGroupJuice").addClass("has-error");
				}
			break;

			case 'formQtyCase':
				if($scope.orderForm.formQty.$valid) {
					$("#formGroupQty").removeClass("has-error");
				} else {
					$("#formGroupQty").addClass("has-error");
				}
			break;

			case 'formDateCase':
				if($scope.orderFormDate) {
					$("#formGroupDate").removeClass("has-error");
				} else {
					$("#formGroupDate").addClass("has-error");
				}
			break;

			case 'formTimeSlotCase':
				if($scope.orderForm.formTimeSlot.$valid) {
					$("#formGroupTimeSlot").removeClass("has-error");
				} else {
					$("#formGroupTimeSlot").addClass("has-error");
				}
			break;

			case 'formAddressCase':
				if($scope.orderForm.formAddress.$valid) {
					$("#formGroupAddress").removeClass("has-error");
				} else {
					$("#formGroupAddress").addClass("has-error");
				}
			break;

			default: 
			break;
		}

	};


	//Method to Delete an Order (NOT TO BE USED!!!)
	/*
	$scope.removeOrder = function(order) {
		console.log("Cancel button pressed!")
		$scope.orders.$remove(order);
	};
	*/
	}
]);







