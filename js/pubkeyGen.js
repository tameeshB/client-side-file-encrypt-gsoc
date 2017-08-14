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
  function generateGroupKeys(publicKey){
    $.get("../groupKeys?_format=json", function(pendingRoles){
      var pendingRoleNames = pendingRoles['roleNames'];
      pendingRoleNames.forEach(function(roleName) {
        var encrypt = new JSEncrypt();
        encrypt.setPublicKey(publicKey);
        var aesKey = CryptoJS.enc.Hex.stringify(CryptoJS.lib.WordArray.random(16));
        var aesKeyStr = aesKey.toString();
        // console.log('pub_key',publicKey);
        console.log('aesKeyStr',aesKeyStr);
        var newAccessKey = encrypt.encrypt(aesKeyStr);
        console.log('newAccessKey',newAccessKey);
        var jsonBody = {
          "accessKey" : newAccessKey,
          "roleName" : roleName,
          "userID" : pendingRoles['userID'],
        };
        console.log(jsonBody);
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
    var privateKey = crypt.getPrivateKey();
    var publicKey = crypt.getPublicKey();
    console.log(privateKey);
    console.log(publicKey);
    generateGroupKeys(publicKey);
    localStorage.setItem("csfcPubKey_" + uid, publicKey);
    localStorage.setItem("csfcPrivKey_" + uid, privateKey);
    var data_ = {
      'publicKey' : publicKey,
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
    download('PrivateKey.pem', privateKey);
  });
  $(document).ajaxStop(function() {
    // window.location="/";
  });
})(jQuery,Drupal); 

