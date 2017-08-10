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
        $.get("/publicKey/?_format=json", function(xhr_pub_key){
          var publicKey = xhr_pub_key['publicKey'];
          var privateKey = localStorage.getItem("csfcPrivKey_"+uid);
          var encrypt = new JSEncrypt();
          $.get("/accessKey/pending?_format=json", function(pending_keys_json){
            var decrypt = new JSEncrypt();
            decrypt.setPrivateKey(privateKey);
            pending_keys = pending_keys_json['accessKeys'];
            pending_keys.forEach(function(accessKey) {
              var group_access_key = decrypt.decrypt(accessKey['access_key']);
              encrypt.setPublicKey(accessKey['pub_key']);
              var new_access_key = encrypt.encrypt(group_access_key);
              console.log(group_access_key);
              console.log(new_access_key);
              if(new_access_key==null || group_access_key == null){
                console.log('Key generation error');
              } else {
                var json_body = {
                  "accessKey" : new_access_key,
                  "roleName" : accessKey['role'],
                  "userID" : accessKey['uid'],
                };
                jQuery.ajax({
                  url: '/accessKey/?_format=json',
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/hal+json',
                    'X-CSRF-Token': getCsrfToken
                  },
                  data: JSON.stringify(json_body),
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
})(jQuery,Drupal); 
