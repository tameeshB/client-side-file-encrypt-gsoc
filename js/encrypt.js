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

  var file = undefined;
  $(document).ready(function(){
  	$(".node-form").attr("action", "/node/add/"+$(".node-form").attr('data-drupal-selector').split("-")[1]);
    var uid = drupalSettings.client_side_file_crypto.uid;
  	$("#cryptoFields").change(function(e){
  		e.preventDefault();
  		file = e.target.files[0];
  		var role=$("#roleSelect").val();
  		console.log(file.size);
  		console.log(file.type);
  		console.log(file.name);
  		var fileName = "encrypted_" + file.name;
  		console.log("fileName:", fileName);
      $.get("/accessKey/?_format=json", function(xhrAccessKey){
    		var privateKey = localStorage.getItem("csfcPrivKey_"+uid);
    		console.log("csrf", getCsrfToken());
    		console.log("accessKey", xhrAccessKey);
    		console.log("privKey", privateKey);
    		var decrypt = new JSEncrypt();
    		decrypt.setPrivateKey(privateKey);
    		//currently for testing, using only one role, will later add a dropdown or something for this.
        if(xhrAccessKey['accessKeys'][role]){
      		var groupAccessKey = decrypt.decrypt(xhrAccessKey['accessKeys'][role]);
      		console.log("symmetric Key:", groupAccessKey);
      		var reader = new FileReader();
      		reader.onload = function(event_){
      			var encrypted = CryptoJS.AES.encrypt(event_.target.result, groupAccessKey); 
      			var formData = new FormData();
      			formData.append('file', new File([new Blob([encrypted])], fileName));
      			formData.append('csfcFileName', fileName);
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
  			        $("#cryptoFields--description").css("color", "#42a211");
  			        $("[name='fileID']").val(response['file_id']);
  			        console.log(response['file_id']);
    			    },
    			    error: function (response) {
  			    		console.log(response);
  			        console.log('Error IN uploading file'); // replace with proper error handling
    			    }
      			});
      		}
        } else {
          // $("#cryptoFields").hide();
          $("#cryptoFields--description").html('AccessKey unavailable for selected role.<br>Please try again later.');
          $("#cryptoFields--description").css("color", "#FF0000");
        }
    		reader.readAsDataURL(file);
    	});
	  });
  });
  $(document).ajaxStop(function() {
  });
})(jQuery, Drupal); 

