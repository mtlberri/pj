//AngularFire - Synchronized Array for Oders
var app = angular.module("pjApp", ["firebase"]);

//Factory that creates a re-usable order object


//Inject firebaseObject into the controller
app.controller("orderListController", ["$scope", "$firebaseObject", 
	function($scope, $firebaseObject) {
	  var refOrders = firebase.database().ref().child("orders");
	  //Download firebase into a local object
	  $scope.orders = $firebaseObject(refOrders);
	}
]);