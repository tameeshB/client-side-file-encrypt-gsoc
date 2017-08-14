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
    ////-----------
    $.get("/publicKey/?_format=json", function(xhrPubKey){
      var publicKey = xhrPubKey['publicKey'];
      var privateKey = localStorage.getItem("csfcPrivKey_" + uid);
      var encrypt = new JSEncrypt();
      $.get("/accessKey/pending?_format=json", function(pendingKeysJSON){
        var decrypt = new JSEncrypt();
        decrypt.setPrivateKey(privateKey);
        pendingKeys = pendingKeysJSON['accessKeys'];
        pendingKeys.forEach(function(accessKey) {
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
    ////-----------
  });
  $(document).ajaxStop(function() {
    window.location="/";
  });
})(jQuery, Drupal); 
