// Jquery wrapper for drupal to avoid conflicts between libraries.
(function ($) {
  // Jquery onload function.
  $(document).ready(function(){
    var baseURL = drupalSettings.client_side_file_crypto.baseURL;

    /**
     * Method to return the csrf token
     */
    function getCsrfToken() {
       return $.ajax({
         type: "GET",
           url: baseURL + "/rest/session/token",
           async: false
         }).responseText;
     }

    var uid = drupalSettings.client_side_file_crypto.uid;
    var routeName = drupalSettings.client_side_file_crypto.routeName;
    var blockedRoutes = [
      //'client_side_file_crypto.postLogin',
      //'client_side_file_crypto.newKeys',
      ];
    if(jQuery.inArray(routeName , blockedRoutes)==-1 && uid!=0){
      $.get(baseURL + "/publicKey/?_format=json", function(xhrPubKey){
        var publicKey = xhrPubKey['publicKey'];
        if(!publicKey && uid != 0 && routeName != 'client_side_file_crypto.newKeys'){
          window.location = baseURL + '/user/logout/';
        }
        var privateKey = localStorage.getItem("csfcPrivKey_" + uid);
        var encrypt = new JSEncrypt();
        $.get(baseURL + "/accessKey/pending?_format=json", function(pendingKeysJSON){
          var decrypt = new JSEncrypt();
          decrypt.setPrivateKey(privateKey);
          pendingKeys = pendingKeysJSON['accessKeys'];
          pendingKeys.forEach(function(accessKey) {
            var groupAccessKey = decrypt.decrypt(accessKey['access_key']);
            encrypt.setPublicKey(accessKey['pub_key']);
            var newAccessKey = encrypt.encrypt(groupAccessKey);
            if(!newAccessKey || !groupAccessKey){
              //error
            } else {
              var jsonBody = {
                "accessKey" : newAccessKey,
                "roleName" : accessKey['role'],
                "userID" : accessKey['uid'],
              };
              jQuery.ajax({
                url: baseURL + '/accessKey/?_format=json',
                method: 'POST',
                headers: {
                  'Content-Type': 'application/hal+json',
                  'X-CSRF-Token': getCsrfToken()
                },
                data: JSON.stringify(jsonBody),
                success: function (node) {
                }
              }).done(function(data) {
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
