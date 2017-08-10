// Jquery wrapper for drupal to avoid conflicts between libraries.
(function ($) {
  
  // Jquery onload function.
  function download(filename, text) {
      var pom = document.createElement('a');
      pom.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
      pom.setAttribute('download', filename);
      if (document.createEvent) {
          var event = document.createEvent('MouseEvents');
          event.initEvent('click', true, true);
          pom.dispatchEvent(event);
      }
      else {
          pom.click();
      }
  }
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
  /**
   * Generating group keys for keys with no access keys generated yet.
   */
  function generateGroupKeys(publicKey,){
    $.get("../groupKeys?_format=json", function(pending_roles){
      var pending_role_names = pending_roles['roleNames'];
      pending_role_names.forEach(function(role_name) {
        var encrypt = new JSEncrypt();
        encrypt.setPublicKey(publicKey);
        var aes_key = CryptoJS.enc.Hex.stringify(CryptoJS.lib.WordArray.random(16));
        var aes_key_str = aes_key.toString();
        // console.log('pub_key',publicKey);
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
          url: '/accessKey/?_format=json',
          method: 'POST',
          headers: {
            'Content-Type': 'application/hal+json',
            'X-CSRF-Token': getCsrfToken()
          },
          data: JSON.stringify(json_body),
          success: function (node) {
            // console.log(node);
          }
        }).done(function(data) {
            console.log(data);
        });
      });
    });
  }
  

  $(document).ready(function(){
    var uid = drupalSettings.client_side_file_crypto.uid;
    console.log(uid);
    //default pubkey size for now = 1024
    var keySize = parseInt(1024);
    var crypt = new JSEncrypt({default_key_size: keySize});
    crypt.getKey();
    console.log("New keys generated");
    var private_key = crypt.getPrivateKey();
    var public_key = crypt.getPublicKey();
    console.log(private_key);
    console.log(public_key);
    localStorage.setItem("csfcPubKey_"+uid,public_key);
    localStorage.setItem("csfcPrivKey_"+uid,private_key);
    var csrf_t = '';
    var data_ = {
      'publicKey' : public_key,
    };
    jQuery.ajax({
      url: '/publicKey?_format=json',
      method: 'POST',
      headers: {
        'Content-Type': 'application/hal+json',
        'X-CSRF-Token': getCsrfToken(),
      },
      data: JSON.stringify(data_),
      success: function (node) {
        console.log(node);
      }
    });
    $("#key-status").text("Key generated.");
    $("#more-info").text("A private key has been downloaded to your computer that you will need to keep to keep safe in case your browser data gets wiped and to access the encrypted files on other devices. In case you need to restore the keys you can do it at /reloadPrivateKey");
    download('PrivateKey.pem', private_key);
  });
  $(document).ajaxStop(function() {
    // window.location="/";
  });
})(jQuery,Drupal); 

