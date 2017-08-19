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
  		console.log(file.size);
  		console.log(file.type);
  		console.log(file.name);
      if(fileName.startsWith("PrivateKey")){
          console.log("match1");
        var reader = new FileReader();
        reader.onload = function(event_){
          localStorage.setItem("csfcPrivKey_" + uid, event_.target.result);
          console.log(event_.target.result);
          $("#errMessage_").text("PrivateKey restored!");
          console.log("match2");

        }
        reader.readAsText(file);
      } else {
          console.log("mismatch");
        $("#errMessage_").text("File not PrivateKey.pem");
      }      
	  });
  });
})(jQuery, Drupal); 

