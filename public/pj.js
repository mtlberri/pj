//AngularFire - Synchronized Array for Oders
var app = angular.module("pjApp", ["firebase"]);
app.controller("orderListController", function($scope, $firebaseArray) {
  var ref = firebase.database().ref().child("messages");
  // create a synchronzided array
  $scope.messages = $firebaseArray(ref);

});