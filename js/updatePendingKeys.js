// Jquery wrapper for drupal to avoid conflicts between libraries.
(function ($) {
  // Jquery onload function.
  $(document).ready(function(){

    /**
     * Method to return the csrf token
     */
    function getCsrfToken() {
       return $.ajax({
         type: "GET",
           url: "/rest/session/token",
           async: false
         }).responseText;
     }

    var uid = drupalSettings.client_side_file_crypto.uid;
    var baseURL = drupalSettings.client_side_file_crypto.baseURL;
    var routeName = drupalSettings.client_side_file_crypto.routeName;
    console.log(routeName);
    var blockedRoutes = [
      //'client_side_file_crypto.postLogin',
      //'client_side_file_crypto.newKeys',
      ];
    if(jQuery.inArray(routeName , blockedRoutes)==-1 && uid!=0){
      $.get(baseURL + "/publicKey/?_format=json", function(xhrPubKey){
        console.log(baseURL + "/publicKey/?_format=json");
        var publicKey = xhrPubKey['publicKey'];
        if(!publicKey && uid!=0){
          window.location = baseURL + '/user/logout/';
        }
        var privateKey = localStorage.getItem("csfcPrivKey_" + uid);
        console.log("localStorage priv key:",privateKey);
        console.log("publicKey:",publicKey)
        var encrypt = new JSEncrypt();
        $.get("/accessKey/pending?_format=json", function(pendingKeysJSON){
          console.log('inhere');
          var decrypt = new JSEncrypt();
          decrypt.setPrivateKey(privateKey);
          pendingKeys = pendingKeysJSON['accessKeys'];
          console.log(pendingKeys);
          pendingKeys.forEach(function(accessKey) {
            console.log("ExistingAccessKey",accessKey['access_key']);
            var groupAccessKey = decrypt.decrypt(accessKey['access_key']);
            encrypt.setPublicKey(accessKey['pub_key']);
            var newAccessKey = encrypt.encrypt(groupAccessKey);
            console.log(groupAccessKey);
            console.log(newAccessKey);
            if(!newAccessKey || !groupAccessKey){
              console.log('Key generation error');
            } else {
              var jsonBody = {
                "accessKey" : newAccessKey,
                "roleName" : accessKey['role'],
                "userID" : accessKey['uid'],
              };
              jQuery.ajax({
                url: '/accessKey/?_format=json',
                method: 'POST',
                headers: {
                  'Content-Type': 'application/hal+json',
                  'X-CSRF-Token': getCsrfToken()
                },
                data: JSON.stringify(jsonBody),
                success: function (node) {
                  // console.log(node);
                }
              }).done(function(data) {
                  console.log(data);
              });
            }
          });
        });
      });
    }
  });
  $(document).ajaxStop(function() {
    if(drupalSettings.client_side_file_crypto.routeName == 'client_side_file_crypto.postLogin'){
      setTimeout(function(){ 
        window.location="/";
      }, 5000);
    }
  });
})(jQuery, Drupal); 
