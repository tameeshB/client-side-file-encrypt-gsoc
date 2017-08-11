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

  // Jquery onload function.
  var file = null;
  $(document).ready(function(){
    var uid = drupalSettings.client_side_file_crypto.uid;
  	$("#cryptoFields").change(function(e){
  		e.preventDefault();
  		//currently only for first file field in DOM, later add a forEach loop
  		file = e.target.files[0];
  		console.log(file.size);
  		console.log(file.type);
  		console.log(file.name);
  		var file_name = "encrypted_" + file.name;
  		console.log("fileName:",file_name);
      $.get("/accessKey/?_format=json", function(xhr_access_key){
    		var privateKey = localStorage.getItem("csfcPrivKey_"+uid);
    		console.log("csrf",getCsrfToken());
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
    			//downloading generated file for debugging/testing
    			console.log("cipherText: ",encrypted);
    			download(file_name,encrypted);
    			//AJAX file generate and upload 1
    			/*
    			var boundary = "---------------------------7da24f2e50046";
    			var body = '--' + boundary + '\r\n'
    			         // Parameter name is "file" and local filename is "temp.txt"
    			         + 'Content-Disposition: form-data; name="file";'
    			         + 'filename="' + file_name + '"\r\n'
    			         // Add the file's mime-type
    			         + 'Content-type: ' + file.type + '\r\n\r\n'
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
    			}); */
    			//AJAX file generate and upload 2
    			//alternate AJAX
    			var formData = new FormData();
    			formData.append('file', new File([new Blob([encrypted])], file_name));
    			formData.append('another-form-field', 'some value');

    			$.ajax({
    			    url: 'back.php',//replace
    			    data: formData,
    			    processData: false,
    			    contentType: false,
    			    type: 'POST',
    			    success: function () {
    			        console.log('ok');
    			    },
    			    error: function () {
    			        console.log('err'); // replace with proper error handling
    			    }
    			});
    			
    		}
    		console.log(reader.readAsDataURL(file));
    	});
	  });
  });
})(jQuery,Drupal); 

