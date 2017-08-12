// Jquery wrapper for drupal to avoid conflicts between libraries.
(function ($) {
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
  	$("#node-article-form").attr("action","/node/add/article");
    var uid = drupalSettings.client_side_file_crypto.uid;
  	$("#cryptoFields").change(function(e){
  		e.preventDefault();
  		//currently only for first file field in DOM, later add a forEach loop
  		file = e.target.files[0];
  		var role='administrator';
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
    		var group_access_key = decrypt.decrypt(xhr_access_key['accessKeys'][role]);
    		console.log("symmetric Key:",group_access_key);
    		var reader = new FileReader();
    		reader.onload = function(event_){
    			var encrypted = CryptoJS.AES.encrypt(event_.target.result, group_access_key); 
    			var formData = new FormData();
    			formData.append('file', new File([new Blob([encrypted])], file_name));
    			formData.append('csfcFileName', file_name);
    			formData.append('csfcFileMIME', file.type);
    			formData.append('csfcRoleName', role);

    			$.ajax({
    			    url: '/encryptedFileUpload',
    			    data: formData,
    			    processData: false,
    			    contentType: false,
    			    type: 'POST',
    			    headers: {
            		'X-CSRF-Token': getCsrfToken()
          		},
    			    success: function (response) {
    			    		console.log(response);
    			        console.log('File Upload Successful');
    			        $("#cryptoFields").hide();
    			        $("#cryptoFields--description").text('File Encrypted and Uploaded Successfully!');
    			        $("#cryptoFields--description").css("color","#42a211")
    			        $("[name='fileID']").val(response['file_id']);
    			        console.log(response['file_id']);
    			    },
    			    error: function (response) {
    			    		console.log(response);
    			        console.log('Error IN uploading file'); // replace with proper error handling
    			    }
    			});
    			
    		}
    		reader.readAsDataURL(file);
    	});
	  });
  });
  $(document).ajaxStop(function() {
  });
})(jQuery,Drupal); 

