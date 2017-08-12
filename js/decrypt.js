// Jquery wrapper for drupal to avoid conflicts between libraries.
(function ($) {
  // Jquery onload function.
  
  $(document).ready(function(){
  	var file = null;
  	var encryptedFileList = $(".node__content div[property='schema:text']");

		//Method to return the csrf token.
  	function getCsrfToken() {
	    return $.ajax({
	      type: "GET",
	      url: "/rest/session/token",
	      async: false
	    }).responseText;
  	}

		//Get the access Key to a role for the user
	  function getAccessKey(roleName){
	  	var xhrData = $.ajax({
  	    type: "GET",
  	    url: "/accessKey/?_format=json",
  	    async: false
  	  }).responseText;
  	  var accessKeysObject = JSON.parse(xhrData);
	  	return accessKeysObject.accessKeys[roleName];
	  }

		//Method get file contents from url parameter
		function getFileAsText(fileUrl){
			console.log("File to fetch", fileUrl);
		  // read text from URL location
		  $.ajax({
		    url: fileUrl,
		    type: 'get',
		    async: false,
		    success: function(fileContent) {
		      return(fileContent);
		    }
		  });
		}	

		//Get the current node ID for the REST request.
  	var nodeID = document.querySelector("link[rel='shortlink']").getAttribute("href").split('/')[2];
  	console.log("nodeID:",nodeID);

  	//Function to get triggered onclick of the dynamically generated anchors
  	function getFile() {
  		var chipertextFileContent = getFileAsText(this.getAttribute('csfc-file-path'));
			var fileName =  this.innerHTML;
			var fileMIMEtype = this.getAttribute('csfc-file-MIME-type');
			var roleName = this.getAttribute('csfc-file-role');
			console.log("fileName:",fileName);
			console.log("MIME:",fileMIMEtype);
	  	var decrypted = decryptData(chipertextFileContent,roleName);
			console.log("clearText: ",decrypted);
			downloadBlob(decrypted,fileName,fileMIMEtype);
  	}

  	//Function taking ciphertext and rolename and returning cleartext.
  	function decryptData(ciphertext,roleName){
  		var chipertextFileContent = ciphertext;
  		var privateKey = localStorage.getItem("privKey");
  		var decrypt = new JSEncrypt();
	  	decrypt.setPrivateKey(privateKey);
    	var acessKey = getAccessKey('administrator');
    	console.log(accessKey);
  		//currently for testing, using only one role, will later add a dropdown or something for this.
  		var group_access_key = decrypt.decrypt(acessKey);
  		console.log("symmetric Key:",group_access_key);
  		var reader = new FileReader();
			var decrypted = CryptoJS.AES.decrypt(chipertextFileContent, group_access_key).toString(CryptoJS.enc.Latin1); 
			console.log("clearText: ",decrypted);
			// downloadBlob(decrypted,fileName,fileMIMEtype);
  		return decrypted;
	  	

  	}

  	//Build image preview
  	function imagePreview(imgPath,imgDOMID){
  		console.log("imagePreview called with params:"+imgPath+imgDOMID);
  		if(fileMIMEtype.includes("image")){
  			var imgCiphertext = getFileAsText(imgPath);
  			decryptData(imgCiphertext);
  			var img = document.getElementById(imgDOMID);
  			var url = img.src.replace(/^data:image\/[^;]/, 'data:application/octet-stream');
			}
			else{
				$("#"+imgDOMID).hide();
			}
  	}

  	/**
  	 * File taking in plaintext file parameters and generating and downloading
  	 * the file.
  	 */
  	function downloadBlob(fileContents,fileName,fileMIMEtype){
  		console.log("downloadBlob called with params:"+fileContents.substring(0,10)+' '+fileName+' '+fileMIMEtype);
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

		//Fetching the file list and appending to the DOM
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
    			anc.setAttribute("style","cursor:pointer");
    			anc.setAttribute("alt","Download File");
    			anc.setAttribute("csfc-file-path", fileData.path);
    			anc.setAttribute("csfc-file-ID", fileData.fileID);
    			anc.setAttribute("csfc-file-role", fileData.roleName);
    			anc.setAttribute("csfc-file-MIME-type", fileData.MIMEtype);
    			anc.setAttribute("csfc-file-isImage", fileData.isImage);
    			encryptedFileList.append(anc);
    			if(fileData.isImage==1){
    				encryptedFileList.append("<img src='' class='csfc-img' id='csfc-img-"+fileData.fileID+"'>");
    				imagePreview(fileData.path,'csfc-img-'+fileData.fileID);
    				// call decrypt to preview image
    			}
    			// binding the function to the onclick event of the dynamically
    			// generated elements
    			anc.onclick = getFile;
    			encryptedFileList.append("<br>");
    		});
    	}
    });
  });
})(jQuery); 

