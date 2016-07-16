//////////Facebook SDK for Javascript
window.fbAsyncInit = function() {
  FB.init({
    appId      : '651800564970614',
    xfbml      : true,
    version    : 'v2.6'
  });
};

(function(d, s, id){
   var js, fjs = d.getElementsByTagName(s)[0];
   if (d.getElementById(id)) {return;}
   js = d.createElement(s); js.id = id;
   js.src = "//connect.facebook.net/en_US/sdk.js";
   fjs.parentNode.insertBefore(js, fjs);
 }(document, 'script', 'facebook-jssdk'));


//////////// Old fields e-mail / password 
var email_input = document.getElementById("email");
var signin_button = document.getElementById("signin_button");

signin_button.addEventListener("click", function() {

  console.log(email_input.value); 

  firebase.database().ref("users/").push({
    email: email_input.value
  });

});

////////////// Ordering
var order_red_orange = document.getElementById("red_orange_order_button");
red_orange_order_button.addEventListener("click", function() {

  if (firebase.auth().currentUser) {

    var red_orange_qty = document.getElementById("red_orange_qty").value;
    var red_orange_Date_Time = document.getElementById("red_orange_Date_Time").value;
    var red_orange_address = document.getElementById("red_orange_address").value;

    console.log("Red Orange ordered!");
    console.log("Qty:" + red_orange_qty);
    console.log("Date and Time:" + red_orange_Date_Time);
    console.log("Delivery Address:" + red_orange_address);

    firebase.database().ref("orders/").push({
      userUid: firebase.auth().currentUser.uid,
      userDisplayName: firebase.auth().currentUser.displayName,
      juice_id: "Red Orange",
      qty: red_orange_qty,
      date_time: red_orange_Date_Time,
      delivery_adress: red_orange_address
    });
  
  }

});

