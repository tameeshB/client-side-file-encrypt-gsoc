// Jquery wrapper for drupal to avoid conflicts between libraries.
(function ($) {
  // Jquery onload function.
  $(document).ready(function(){
    $.get( "../../rest/session/token", function( csrf_t ){
      $.get( "../../accessKey/?_format=json", function( xhr_access_key ){
    		var privateKey = localStorage.getItem("privKey");
    		console.log("csrf",csrf_t);
    		console.log("accessKey",xhr_access_key);
    		console.log("privKey",privateKey);
    		var decrypt = new JSEncrypt();
    		decrypt.setPrivateKey(privateKey);
    		var group_access_key = decrypt.decrypt(xhr_access_key['accessKeys']['administrator']);
    		console.log("symmetric Key:",group_access_key);
    		var file_contents="some stuff";
    		var encrypted = CryptoJS.AES.encrypt(file_contents, group_access_key); 
    		console.log("cipherText: ",encrypted);
    		var decrypted = CryptoJS.AES.decrypt(encrypted, group_access_key).toString(CryptoJS.enc.Latin1); 
    		console.log("cipherText: ",decrypted);
    	});
    });
    // $(":file").change(function(e){
    // 	// event.preventDefault();
    // 	alert('Form alter works!');
    // });
     
  });
})(jQuery); 

