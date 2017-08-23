// Jquery wrapper for drupal to avoid conflicts between libraries.
(function ($) {

  // Jquery onload function.
  var file = undefined;
  $(document).ready(function(){
    var uid = drupalSettings.client_side_file_crypto.uid;
  	$("#privKey").change(function(e){
  		e.preventDefault();
  		file = e.target.files[0];
  		var fileName = file.name;
      if(fileName.startsWith("PrivateKey")){
        var reader = new FileReader();
        reader.onload = function(event_){
          localStorage.setItem("csfcPrivKey_" + uid, event_.target.result);
          $("#errMessage_").text("PrivateKey restored!");
        }
        reader.readAsText(file);
      } else {
        $("#errMessage_").text("File not PrivateKey.pem");
      }      
	  });
  });
})(jQuery, Drupal); 

