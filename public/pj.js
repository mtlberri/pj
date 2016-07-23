//AngularFire - Synchronized Array for Oders
var app = angular.module("pjApp", ["firebase"]);

//Factory that creates a re-usable order object


//Inject firebaseObject into the controller
app.controller("orderListController", ["$scope", "$firebaseArray", 
	function($scope, $firebaseArray) {
	  var refOrders = firebase.database().ref().child("orders");
	  //Download firebase into a local object
	  $scope.orders = $firebaseArray(refOrders);

	  //Method to add a new Order, called by the form ng-submit
	  $scope.addOrder = function(){
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
	  }

	  //Method to retrieve the last order number from list of orders
	  $scope.lastOrderNumber = function() {
	  	return $scope.orders[$scope.orders.length - 1].orderNumber;
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