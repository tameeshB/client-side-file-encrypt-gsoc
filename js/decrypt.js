// Jquery wrapper for drupal to avoid conflicts between libraries.
(function ($) {
  // Jquery onload function.
  function getCsrfToken() {
  	$.get("../../rest/session/token", function(csrfToken){
  		return csrfToken;
  	});
  }
  
  var file = null;
  $(document).ready(function(){
  	
  	//get the nodeID for the REST request
  	var nodeID = document.querySelector("link[rel='shortlink']").getAttribute("href").split('/')[2];
  	console.log("nodeID:",nodeID);

  	//fetching the file list and appending to the DOM
    $.get("../fileMetadata/"+nodeID+"/?_format=json", function(fileMetaData){
    	console.log(fileMetaData);
    	if(fileMetaData.fileCount!=0){
    		$(".node__content div[property='schema:text']").append("<h3 class='title'>Encrypted Files</h3>");
    		var files = fileMetaData.files;
    		files.forEach(function(fileData){
    			$(".node__content div[property='schema:text']").append("<a class='csfc-file-field' id='fileField' csfc-file-path='"+fileData.path+"'>"+fileData.name+"</a><br>");
    		});
    	}
    });

    /**
    	* Section responsible for on click event handling and triggering of the 
      * decryption and download functions
      */
    $("a").click(function(event_){//for testing
  		event_.preventDefault();
  		//get file contents from url
  		
  	});

    // $(".csfc-file-field").click(function(){
    // 	console.log("this");
    // 	alert($(this).attr('csfc-file-path'));
    // });
    
    /**
     * 
     */
  	$("#decryptFields").click(function(e){
  		// append all to list
  		e.preventDefault();
  		// currently only for first file field in DOM, later add a forEach loop
  		file = e.target.files[0];
  		console.log(file.size);
  		console.log(file.name);
  		var file_name =  file.name.slice(10);
  		var fileMIMEtype = file.type;
  		console.log("fileName:",file_name);
  		console.log("MIME:",fileMIMEtype);
	    $.get("../../rest/session/token", function(csrfToken){
	      $.get("../../accessKey/?_format=json", function(xhr_access_key){
	    		var privateKey = localStorage.getItem("privKey");
	    		// console.log("csrf",getCsrfToken());
	    		// console.log("accessKey",xhr_access_key);
	    		// console.log("privKey",privateKey);
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

