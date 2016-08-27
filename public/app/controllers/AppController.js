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
	$scope.orderFormDate = null;
	$scope.orderFormTimeFrom = null;
	$scope.orderFormTimeTo = null;

	//Init of date picker
	$('#datetimepicker5').datetimepicker({
	    format: "dddd, MMM Do",
	    disabledDates: []
	  });
	//Init of time from picker
	$('#datetimepicker3').datetimepicker({
	    format: "LT"
	  });
	//Init of time to picker
	$('#datetimepicker4').datetimepicker({
	    format: "LT"
	  });	

	//Listener on datepicker - when changed it updates scope var
	$("#datetimepicker5").on("dp.change", function() {
		console.log("Date Changed!");
		$scope.orderFormDate = $("#datetimepicker5").data("DateTimePicker").date().toString();
		//Digest the change of scope to refresh view
		$scope.$digest();
		console.log($scope.orderFormDate);
	});
	//Listener on time from picker
	$("#datetimepicker3").on("dp.change", function() {
		var timeFromHours = $("#datetimepicker3").data("DateTimePicker").date().hour().toString();
		var timeFromMinutes = $("#datetimepicker3").data("DateTimePicker").date().minute().toString();
		$scope.orderFormTimeFrom = timeFromHours + "h" + timeFromMinutes;
		$scope.$digest();
	});
	//Listener on time to picker
	$("#datetimepicker4").on("dp.change", function() {
		var timeToHours = $("#datetimepicker4").data("DateTimePicker").date().hour().toString();
		var timeToMinutes = $("#datetimepicker4").data("DateTimePicker").date().minute().toString();
		$scope.orderFormTimeTo = timeToHours + "h" + timeToMinutes;
		$scope.$digest();
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
					$scope.orderForm.formDateTime.$valid &&
					$scope.orderForm.formAddress.$valid &&
					$scope.orderFormTimeFrom &&
					$scope.orderFormTimeTo) {
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
					$scope.orderFormValidationFormatting('formDateTimeCase');
					$scope.orderFormValidationFormatting('formAddressCase');
					$scope.orderFormValidationFormatting('formTimeFromCase');
					$scope.orderFormValidationFormatting('formTimeToCase');
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
	    "date_time": $scope.formDateTime,
	    "delivery_date": $scope.orderFormDate,
	    "delivery_time_from": $scope.orderFormTimeFrom,
	    "delivery_time_to": $scope.orderFormTimeTo,
	    "delivery_address": $scope.formAddress,
	    "free_text": $scope.formFreeText,
	    "status": "ORDERED",
	    "paid": false,
	    "userUid": firebase.auth().currentUser.uid,
	    "userDisplayName": firebase.auth().currentUser.displayName       
		}).then(function(ref) {

			//Index the order under the users/<userUid>/userOrders/ part of the tree
			var refUserOrders = firebase.database().ref().child("users/" 
				+ firebase.auth().currentUser.uid + "/userOrders/" + ref.key).set(true);

			console.log("Index " + ref.key + " created under user orders!");
			});
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

	//Method to change order status
	$scope.changeOrderStatus = function(order,newStatus) {
		order.status = newStatus;
		$scope.orders.$save(order);
		console.log("order status changed!");
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

			case 'formDateTimeCase':
				if($scope.orderForm.formDateTime.$valid) {
					$("#formGroupDateTime").removeClass("has-error");
				} else {
					$("#formGroupDateTime").addClass("has-error");
				}
			break;

			case 'formAddressCase':
				if($scope.orderForm.formAddress.$valid) {
					$("#formGroupAddress").removeClass("has-error");
				} else {
					$("#formGroupAddress").addClass("has-error");
				}
			break;

			case 'formTimeFromCase':
				if($scope.orderFormTimeFrom) {
					$("#formGroupTimeFrom").removeClass("has-error");
				} else {
					$("#formGroupTimeFrom").addClass("has-error");
				}
			break;

			case 'formTimeToCase':
				if($scope.orderFormTimeTo) {
					$("#formGroupTimeTo").removeClass("has-error");
				} else {
					$("#formGroupTimeTo").addClass("has-error");
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







