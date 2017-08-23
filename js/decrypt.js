// Jquery wrapper for drupal to avoid conflicts between libraries.
(function ($) {
  // Jquery onload function.
  
  $(document).ready(function(){
    var uid = drupalSettings.client_side_file_crypto.uid;
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


    //Get the current node ID for the REST request.
    var nodeID = drupalSettings.client_side_file_crypto.nodeid;

    /**
     * File taking in plaintext file parameters and generating and downloading
     * the file.
     */
    function downloadBlob(fileContents, fileName, fileMIMEtype){
      //checking if file is an image for preview
      if(fileMIMEtype.includes("image")){
        var img = document.getElementById("previewImg");
        var url = img.src.replace(/^data:image\/[^;]/, 'data:application/octet-stream');
      }
      var fileContents = fileContents.replace('data:' + fileMIMEtype, 'data:application/octet-stream');
      var downloadLink = document.createElement("a");
      downloadLink.href = (fileMIMEtype.includes("image")) ? url : fileContents;
      downloadLink.download = fileName;
      document.body.appendChild(downloadLink);
      //simulating a click to download
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }

    //Function taking ciphertext and rolename and returning cleartext.
    function decryptData(ciphertext,roleName){
      var chipertextFileContent = ciphertext;
      var privateKey = localStorage.getItem("csfcPrivKey_" + uid);
      var decrypt = new JSEncrypt();
      decrypt.setPrivateKey(privateKey);
      var accessKey = getAccessKey(roleName);
      if(!accessKey){
        $("<br><font color='#FF0000'>AccessKey unavailable for selected role.<br>Please try again later.</font>").insertAfter(".csfc-file-field[csfc-file-role='" + roleName + "']");
      }
      //currently for testing, using only one role, will later add a dropdown or something for this.
      var group_access_key = decrypt.decrypt(accessKey);
      var reader = new FileReader();
      var decrypted = CryptoJS.AES.decrypt(chipertextFileContent, group_access_key).toString(CryptoJS.enc.Latin1);
      // downloadBlob(decrypted,fileName,fileMIMEtype);
      return decrypted;
      

    }

    //Method get file contents from url parameter
    function getFileAsText(fileUrl){
      // read text from URL location
      return $.ajax({
        url: fileUrl,
        type: 'GET',
        async: false,
        success: function(fileContent) {
        }
      }).responseText;
    } 

    //Function to get triggered onclick of the dynamically generated anchors
    function getFile() {
      var chipertextFileContent = getFileAsText(this.getAttribute('csfc-file-path'));
      var fileName =  this.innerHTML;
      var fileMIMEtype = this.getAttribute('csfc-file-MIME-type');
      var roleName = this.getAttribute('csfc-file-role');
      var decrypted = decryptData(chipertextFileContent,roleName);
      downloadBlob(decrypted,fileName,fileMIMEtype);
    }

    //Build image preview
    function imagePreview(imgPath,imgDOMID){
      if(fileMIMEtype.includes("image")){
        var imgCiphertext = getFileAsText(imgPath);
        decryptData(imgCiphertext);
        var img = document.getElementById(imgDOMID);
        var url = img.src.replace(/^data:image\/[^;]/, 'data:application/octet-stream');
      }
      else{
        $("#" + imgDOMID).hide();
      }
    }

    //Fetching the file list and appending to the DOM
    if(nodeID != -1){
      $.get("../fileMetadata/" + nodeID + "/?_format=json", function(fileMetaData){
        if(fileMetaData.fileCount != 0){
          $(".node__content div[property='schema:text']").append("<h3 class='title'>Encrypted Files</h3>");
          var files = fileMetaData.files;
          files.forEach(function(fileData){
            //get the file name
            var dynamicValue = fileData.name;
            //create an anchor element
            var fileAnchor = document.createElement('a');
            fileAnchor.className = 'csfc-file-field';
            fileAnchor.innerHTML = dynamicValue.slice(10);
            fileAnchor.setAttribute("style","cursor:pointer");
            fileAnchor.setAttribute("alt","Download File");
            fileAnchor.setAttribute("csfc-file-path", fileData.path);
            fileAnchor.setAttribute("csfc-file-ID", fileData.fileID);
            fileAnchor.setAttribute("csfc-file-role", fileData.roleName);
            fileAnchor.setAttribute("csfc-file-MIME-type", fileData.MIMEtype);
            fileAnchor.setAttribute("csfc-file-isImage", fileData.isImage);
            encryptedFileList.append(fileAnchor);
            if(fileData.isImage == 1){
              encryptedFileList.append("<img src='' class='csfc-img' id='csfc-img-" + fileData.fileID + "'>");
              imagePreview(fileData.path, 'csfc-img-' + fileData.fileID);
              // call decrypt to preview image
            }
            // binding the function to the onclick event of the dynamically
            // generated elements
            fileAnchor.onclick = getFile;
            encryptedFileList.append("<br>");
          });
        }
      });
    }
  });
})(jQuery,Drupal);
