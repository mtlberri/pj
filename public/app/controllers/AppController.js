//AngularFire - Synchronized Array for Oders
var app = angular.module("pjApp", ["firebase"]);

//Factory that creates a re-usable order object


//Inject firebaseObject into the controller
app.controller("AppController", ["$scope", "$firebaseArray", 
	function($scope, $firebaseArray) {

	//Observer on the Auth object to set $scope variable uid and orders
	$scope.uid = null;
	$scope.userName = null;
	$scope.orders = null;

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
				document.getElementById('userPhoto').src = photoURL;

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
				//Programmatically call the Modal for order confirmation
				$('#orderModal').modal();				
			}


			//Else if user is not signed in
			else {
				//Programmatically call the Modal for sign in
				$('#signInModal').modal();	
			}


	};

	$scope.orderFormValidationFormatting = function(){
		console.log("Form Control Formatting!");

		//Check if the form input has been touched already or not yet
		//Dirty is True if user has already interacted with the form.
		if($scope.orderForm.formJuice.$dirty) {

			//Check if form input is valid or not, and format accordingly
			if($scope.orderForm.formJuice.$valid) {
				$("#formGroupJuice").removeClass("has-error");
				$("#formGroupJuice").addClass("has-success");
				console.log("has-success class set!");
			} else {
				$("#formGroupJuice").addClass("has-error");
				$("#formGroupJuice").removeClass("has-success");
				console.log("has-error class set!");
			}

		}

	};

	//Method to add a new Order, called by the form ng-submit
	$scope.addOrder = function(){

		if ($scope.uid) {
		//Add the order in the overall list of orders (Firebase)
		$scope.orders.$add({
	    "orderNumber": $scope.lastOrderNumber() + 1,
	    "juice_id": $scope.formJuice,	        
	    "qty": $scope.formQty,
	    "date_time": $scope.formDateTime,
	    "delivery_address": $scope.formAddress,
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
			alert("Please Sign In to be able to order ;)");
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

	//Method to Delete an Order (NOT TO BE USED!!!)
	/*
	$scope.removeOrder = function(order) {
		console.log("Cancel button pressed!")
		$scope.orders.$remove(order);
	};
	*/
	}
]);