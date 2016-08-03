//AngularFire - Synchronized Array for Oders
var app = angular.module("pjApp", ["firebase"]);

//Factory that creates a re-usable order object


//Inject firebaseObject into the controller
app.controller("orderListController", ["$scope", "$firebaseArray", 
	function($scope, $firebaseArray) {

	//Firebase Array on orders
	var refOrders = firebase.database().ref().child("orders");
	$scope.orders = $firebaseArray(refOrders);
	
	//Firebase Array on <userUid>/userOrders/ part of the tree
	firebase.auth().onAuthStateChanged(function(user) {
		if (user) {
			var refUserOrders = firebase.database().ref().child("users/" 
				+ firebase.auth().currentUser.uid + "/userOrders");
			console.log("Ref to user portion of the tree created!");
			$scope.userOrders = $firebaseArray(refUserOrders);
		}
	});

	//Method to add a new Order, called by the form ng-submit
	$scope.addOrder = function(){
		//Add the order in the overall list of orders (Firebase)
		$scope.orders.$add({
	    "orderNumber": $scope.lastOrderNumber() + 1,
	    "juice_id": $scope.formJuice,	        
	    "qty": $scope.formQty,
	    "date_time": $scope.formDateTime,
	    "delivery_address": $scope.formAddress,
	    "status": "ordered",
	    "userUid": firebase.auth().currentUser.uid,
	    "userDisplayName": firebase.auth().currentUser.displayName       
		});

		//Index the order under the <userUid>/userOrders/ part of the tree
		$scope.userOrders.$add({
			"test": true
		});

	}

	//test

	//Method to retrieve the last order number from list of orders
	$scope.lastOrderNumber = function() {
		var result = 0;
		if ($scope.orders.length > 0) {
			result = $scope.orders[$scope.orders.length - 1].orderNumber;
		}
		return result;
	}

	//Method to change order status
	$scope.changeOrderStatus = function(order,newStatus) {
		order.status = newStatus;
		$scope.orders.$save(order);
		console.log("order status changed!");
	};

	//Method to Delete an Order (NOT TO BE USED!!!)
	$scope.removeOrder = function(order) {
		console.log("Cancel button pressed!")
		$scope.orders.$remove(order);
	};

	}
]);