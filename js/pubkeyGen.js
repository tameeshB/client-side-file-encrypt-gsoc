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

  //method to return, if any existing public keys
  function getPublicKey(uid){
    var xhrData = $.ajax({
      type: "GET",
      url: "/publicKey/"+uid+"/?_format=json",
      async: false
    }).responseText;
    var pubKeyObject = JSON.parse(xhrData);
    return pubKeyObject.publicKey;
  }

  // /**
  //  * Generating group keys for keys with no access keys generated yet.
  //  */
  // function generateGroupKeys(publicKey){
  //   console.log('this called');
  //   $.get("/groupKeys?_format=json", function(pendingRoles){
  //     var pendingRoleNames = pendingRoles['roleNames'];
  //     pendingRoleNames.forEach(function(roleName) {
  //       var encrypt = new JSEncrypt();
  //       encrypt.setPublicKey(publicKey);
  //       var aesKey = CryptoJS.enc.Hex.stringify(CryptoJS.lib.WordArray.random(16));
  //       var aesKeyStr = aesKey.toString();
  //       var newAccessKey = encrypt.encrypt(aesKeyStr);
  //       var jsonBody = {
  //         "accessKey" : newAccessKey,
  //         "roleName" : roleName,
  //         "userID" : pendingRoles['userID'],
  //       };
  //       jQuery.ajax({
  //         url: '/accessKey/?_format=json',
  //         method: 'POST',
  //         headers: {
  //           'Content-Type': 'application/hal+json',
  //           'X-CSRF-Token': getCsrfToken()
  //         },
  //         data: JSON.stringify(jsonBody),
  //         success: function (node) {
  //         }
  //       }).done(function(data) {
  //       });
  //     });
  //   });
  // }
  

  $(document).ready(function(){
    var uid = drupalSettings.client_side_file_crypto.uid;
    var baseURL = drupalSettings.client_side_file_crypto.baseURL;
    var ExistingPubKey = getPublicKey(uid);
    if(!ExistingPubKey && !localStorage.getItem("csfcPrivKey_" + uid)){
      //default pubkey size for now = 1024
      var keySize = parseInt(1024);
      var crypt = new JSEncrypt({default_key_size: keySize});
      crypt.getKey();
      var privateKey = crypt.getPrivateKey();
      var publicKey = crypt.getPublicKey();
      // generateGroupKeys(publicKey);
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
        }
      });
      $("#key-status").text("Key generated.");
      $("#more-info").text("A private key has been downloaded to your computer that you will need to keep to keep safe in case your browser data gets wiped and to access the encrypted files on other devices. In case you need to restore the keys you can do it at /restoreKeys");
      $("#more-info").append("<br><font color='#FF0000'>Key requests have been put up for each of your roles.<br>You will only be able to access the encrypted features once another user with the keys logs in and generated keys for you.<br>You will need to wait until then. </font><br><a href='"+baseURL+"/user/keyGenRedirect'>Go to home.</a>");
      download('PrivateKey.pem', privateKey);
    } else {
      $("#key-status").text("Key already generated!");
      $("#more-info").html("A key pair has already been generated for this user.<br><a href='"+baseURL+"'>Go to home.</a>");
    }
  });
  $(document).ajaxStop(function() {
    // window.location="/";
  });
})(jQuery, Drupal); 

