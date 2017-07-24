// Jquery wrapper for drupal to avoid conflicts between libraries.
(function ($) {
  // Jquery onload function.
  var file = null;
  $(document).ready(function(){
  	$("#decryptFields").change(function(e){
  		e.preventDefault();
  		//currently only for first file field in DOM, later add a forEach loop
  		file = e.target.files[0];
  		console.log(file.size);
  		console.log(file.name);
  		var file_name =  file.name.slice(10);
  		var fileMIMEtype = file.type;
  		console.log("fileName:",file_name);
  		console.log("MIME:",fileMIMEtype);
	    $.get("../../rest/session/token", function(csrf_t){
	      $.get("../../accessKey/?_format=json", function(xhr_access_key){
	    		var privateKey = localStorage.getItem("privKey");
	    		console.log("csrf",csrf_t);
	    		console.log("accessKey",xhr_access_key);
	    		console.log("privKey",privateKey);
	    		var decrypt = new JSEncrypt();
	    		decrypt.setPrivateKey(privateKey);
	    		//currently for testing, using only one role, will later add a dropdown or something for this.
	    		var group_access_key = decrypt.decrypt(xhr_access_key['accessKeys']['administrator']);
	    		console.log("symmetric Key:",group_access_key);
	    		var reader = new FileReader();
	    		reader.onload = function(event_){
	    			var decrypted = CryptoJS.AES.decrypt(event_.target.result, group_access_key).toString(CryptoJS.enc.Latin1); 
	    			console.log("clearText: ",decrypted);
	    			if(fileMIMEtype.includes("image")){
		    			var img = document.getElementById("previewImg");
		    			var url = img.src.replace(/^data:image\/[^;]/, 'data:application/octet-stream');
	    			}
	    			var href = decrypted.replace('data:' + fileMIMEtype, 'data:application/octet-stream');
	    			var downloadLink = document.createElement("a");
	    			downloadLink.href = (fileMIMEtype.includes("image"))?url:href;
	    			downloadLink.download = file_name;
	    			document.body.appendChild(downloadLink);
	    			downloadLink.click();
	    			document.body.removeChild(downloadLink);
	    			

	    		}
	    		reader.readAsText(file);
	    		
	    	});
	    });
	  });
  });
})(jQuery); 

