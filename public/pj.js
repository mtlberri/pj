//AngularFire - Synchronized Array for Oders
var app = angular.module("pjApp", ["firebase"]);

//Factory that creates a re-usable order object


//Inject firebaseObject into the controller
app.controller("orderListController", ["$scope", "$firebaseArray", 
	function($scope, $firebaseArray) {
	  var refOrders = firebase.database().ref().child("orders");
	  //Download firebase into a local object
	  $scope.orders = $firebaseArray(refOrders);

	  //Method to Delete an Order
	  $scope.removeOrder = function(order) {
	  	console.log("Cancel button pressed!")
	  	$scope.orders.$remove(order);
	  }

	  //Method to add a new Order, called by the form ng-submit
	  $scope.addOrder = function(){
	  	$scope.orders.$add({
	        "qty": $scope.formQty,
	        "date_time": $scope.formDateTime,
	        "delivery_address": $scope.formAddress,
	        "juice_id": "Red Orange",
	        "userUid": firebase.auth().currentUser.uid,
	        "userDisplayName": firebase.auth().currentUser.displayName       
	  	});
	  }

	}
]);