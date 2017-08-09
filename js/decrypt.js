// Jquery wrapper for drupal to avoid conflicts between libraries.
(function ($) {
  // Jquery onload function.
  
  
  var file = null;
  $(document).ready(function(){
  	
  	/**
		 * Method to return the csrf token
  	 */
  	function getCsrfToken() {
  		$.get("../../rest/session/token", function(csrfToken){
  			return csrfToken;
  		});
  	}

  	/**
		 * Method get file contents from url parameter
  	 */
		function getFileAsText(fileUrl){
		    // read text from URL location
		  $.ajax({
		    url: fileUrl,
		    type: 'get',
		    async: false,
		    success: function(contents) {
		      console.log(contents); /* only for testing */
		      return(contents);
		    }
		  });
		}	

  	/**
		 * Get the current node ID for the REST request.
  	 */
  	var nodeID = document.querySelector("link[rel='shortlink']").getAttribute("href").split('/')[2];
  	console.log("nodeID:",nodeID);

  	/**
  	 * Function to get triggered onclick of the dynamically generated anchors
  	 */
  	function getFile() {
  		console.log("Getting this file this file: ",this.getAttribute('csfc-file-path'));
  		getFileAsText(this.getAttribute('csfc-file-path'));
  		
  	}

  	/**
  	 * File taking in plaintext file parameters and generating and downloading
  	 * the file.
  	 */
  	function downloadBlob(fileContents,fileName,fileMIMEtype){
  		//checking if file is an image for preview
			if(fileMIMEtype.includes("image")){
  			var img = document.getElementById("previewImg");
  			var url = img.src.replace(/^data:image\/[^;]/, 'data:application/octet-stream');
			}
			var fileContents = decrypted.replace('data:' + fileMIMEtype, 'data:application/octet-stream');
			var downloadLink = document.createElement("a");
			downloadLink.href = (fileMIMEtype.includes("image"))?url:fileContents;
			downloadLink.download = fileName;
			document.body.appendChild(downloadLink);
			//simulating a click to download
			downloadLink.click();
			document.body.removeChild(downloadLink);
  	}

  	/**
		 * Fetching the file list and appending to the DOM
  	 */
    $.get("../fileMetadata/"+nodeID+"/?_format=json", function(fileMetaData){
    	console.log(fileMetaData);
    	if(fileMetaData.fileCount!=0){
    		$(".node__content div[property='schema:text']").append("<h3 class='title'>Encrypted Files</h3>");
    		var files = fileMetaData.files;
    		files.forEach(function(fileData){
    			//get the file name
    			var dynamicValue = fileData.name;
    			//create an anchor element
    			var anc = document.createElement('a');
    			anc.className = 'csfc-file-field';
    			anc.innerHTML = dynamicValue;
    			anc.setAttribute("csfc-file-path", fileData.path);
    			$(".node__content div[property='schema:text']").append(anc);
    			//binding the function to the onclick event of the dynamically
    			// generated elements
    			anc.onclick = getFile;
    			$(".node__content div[property='schema:text']").append("<br>");
    		});
    	}
    });

    /**
     * 
     */
  	$("#decryptFields").click(function(e){
  		// append all to list
  		e.preventDefault();
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
	    			downloadBlob(decrypted,file_name,fileMIMEtype);
	    		}
	    		reader.readAsText(file);
	    		
	    	});
	    });
	  });
  });
})(jQuery); 

