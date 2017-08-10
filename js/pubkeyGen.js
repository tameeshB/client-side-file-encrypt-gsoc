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
  
  function getCsrfToken() {
    $.get("../rest/session/token", function(data) {
    return data;
  });
  }

  $(document).ready(function(){
    //default pubkey size for now = 1024
    var keySize = parseInt(1024);
    var crypt = new JSEncrypt({default_key_size: keySize});
    crypt.getKey();
    console.log("New keys generated");
    var private_key = crypt.getPrivateKey();
    var public_key = crypt.getPublicKey();
    console.log(private_key);
    console.log(public_key);
    localStorage.setItem("pubKey",public_key);
    localStorage.setItem("privKey",private_key);
    var csrf_t = '';
    $.get("../rest/session/token", function(csrf_t) {
      var data_ = {
        'publicKey' : public_key,
      };
      jQuery.ajax({
        url: '../publicKey?_format=json',
        method: 'POST',
        headers: {
          'Content-Type': 'application/hal+json',
          'X-CSRF-Token': csrf_t,
        },
        data: JSON.stringify(data_),
        success: function (node) {
          console.log(node);
        }
      });
    });
    $("#key-status").text("Key generated.");
    $("#more-info").text("A private key has been downloaded to your computer that you will need to keep to keep safe in case your browser data gets wiped and to access the encrypted files on other devices. In case you need to restore the keys you can do it at /reloadPrivateKey");
    download('PrivateKey.pem', private_key);
  });
  $(document).ajaxStop(function() {
    window.location="/";
  });
})(jQuery); 

