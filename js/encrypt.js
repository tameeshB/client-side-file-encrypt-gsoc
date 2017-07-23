// Jquery wrapper for drupal to avoid conflicts between libraries.
(function ($) {
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
  // Jquery onload function.
  var file = null;
  $(document).ready(function(){
  	$("#cryptoFields").change(function(e){
  		e.preventDefault();
  		//currently only for first file field in DOM, later add a forEach loop
  		file = e.target.files[0];
  		console.log(file.size);
  		console.log(file.name);
  		var file_name = "encrypted_" + file.name;
  		console.log("fileName:",file_name);
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
	    			var encrypted = CryptoJS.AES.encrypt(event_.target.result, group_access_key); 
	    			console.log("cipherText: ",encrypted);
	    			download(file_name,encrypted);
	    			var boundary = "---------------------------7da24f2e50046";
	    			var body = '--' + boundary + '\r\n'
	    			         // Parameter name is "file" and local filename is "temp.txt"
	    			         + 'Content-Disposition: form-data; name="file";'
	    			         + 'filename="' + file_name + '"\r\n'
	    			         // Add the file's mime-type
	    			         + 'Content-type: plain/text\r\n\r\n'
	    			         // Add your data:
	    			         + encrypted + '\r\n'
	    			         + '--'+ boundary + '--';

	    			$.ajax({
	    			    contentType: "multipart/form-data; boundary="+boundary,
	    			    data: body,
	    			    type: "POST",
	    			    url: "back.php",
	    			    success: function (data, status) {
	    			    	console.log(data,status);
	    			    }
	    			});
	    		}
	    		console.log(reader.readAsDataURL(file));

	    		// var decrypted = CryptoJS.AES.decrypt(encrypted, group_access_key).toString(CryptoJS.enc.Latin1); 
	    		// console.log("cipherText: ",decrypted);
	    	});
	    });
	  });
  });
})(jQuery); 

