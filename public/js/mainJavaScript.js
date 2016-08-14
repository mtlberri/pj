// Facebook SDK for Javascript
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

//Various variables for showing or hiding nutrients
var showNutriRedOrange = false;

//Function called when show nutrients pressed
var showNutrientsClicked = function() {
  console.log("Show nutrients pressed!");

  if(showNutriRedOrange) {
    $("#nutri_red_orange").slideUp(1000);
    showNutriRedOrange = false;
  } else {
    $("#nutri_red_orange").slideDown(1000);
    showNutriRedOrange = true;
  }

};