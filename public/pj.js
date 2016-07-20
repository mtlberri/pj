//AngularFire - Synchronized Array for Oders
var app = angular.module("pjApp", ["firebase"]);
//Inject firebaseObject into the controller
app.controller("orderListController", ["$scope", "$firebaseObject", 
	function($scope, $firebaseObject) {
	  var ref = firebase.database().ref().child("orders");
	  //Download firebase into a local object
	  $scope.orders = $firebaseObject(ref);
	}
]);