// Jquery wrapper for drupal to avoid conflicts between libraries.
(function ($) {
  // Jquery onload function.
  $(document).ready(function(){
    $.get( "../rest/session/token", function( csrf_t ){
      $.get( "../publicKey/?_format=json", function( xhr_pub_key ){
        var encrypt = new JSEncrypt();
        encrypt.setPublicKey(xhr_pub_key['publicKey']);
        $.get( "../groupKeys?_format=json", function( pending_roles ){
          var pending_role_names = pending_roles['roleNames'];
          pending_role_names.forEach(function(role_name) {
            var aes_key = CryptoJS.enc.Hex.stringify(CryptoJS.lib.WordArray.random(16));
            var aes_key_str = aes_key.toString();
            console.log('pub_key',xhr_pub_key);
            console.log('aes_key_str',aes_key_str);
            var new_access_key = encrypt.encrypt(aes_key_str);
            console.log('new_access_key',new_access_key);
            var json_body = {
              "accessKey" : new_access_key,
              "roleName" : role_name,
              "userID" : pending_roles['userID'],
            };
            console.log(json_body);
            jQuery.ajax({
              url: '../accessKey/?_format=json',
              method: 'POST',
              headers: {
                'Content-Type': 'application/hal+json',
                'X-CSRF-Token': csrf_t
              },
              data: JSON.stringify(json_body),
              success: function (node) {
                console.log(node);
              }
            }).done(function( data ) {
                console.log( data );
            });
          });
        });
      });
    });
    
  });
})(jQuery); 

