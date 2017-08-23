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
    var routeName = drupalSettings.client_side_file_crypto.routeName;
    if(routeName != 'client_side_file_crypto.newKeys')
    $.get("/publicKey/?_format=json", function(xhr_pub_key){
      var encrypt = new JSEncrypt();
      encrypt.setPublicKey(xhr_pub_key['publicKey']);
      $.get("/groupKeys?_format=json", function(pending_roles){
        var pending_role_names = pending_roles['roleNames'];
        if(pending_role_names.length>0){
          pending_role_names.forEach(function(role_name) {
            var aes_key = CryptoJS.enc.Hex.stringify(CryptoJS.lib.WordArray.random(16));
            var aes_key_str = aes_key.toString();
            var new_access_key = encrypt.encrypt(aes_key_str);
            var json_body = {
              "accessKey" : new_access_key,
              "roleName" : role_name,
              "userID" : pending_roles['userID'],
            };
            jQuery.ajax({
              url: '../accessKey/?_format=json',
              method: 'POST',
              headers: {
                'Content-Type': 'application/hal+json',
                'X-CSRF-Token': getCsrfToken()
              },
              data: JSON.stringify(json_body),
              success: function (node) {
              }
            }).done(function(data) {
            });
          });  
        }
        
      });
    });
    
  });
})(jQuery, Drupal); 

