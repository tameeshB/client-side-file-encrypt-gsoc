// Jquery wrapper for drupal to avoid conflicts between libraries.
(function ($) {
	function download(filename, text) {
	    var pom = document.createElement('a');
	    pom.setAttribute('href', 'data:application/octet-stream;charset=utf-8,' + encodeURIComponent(text));
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
	var BASE64_MARKER = ';base64,';

	function convertDataURIToBinary(dataURI) {
	  var base64Index = dataURI.indexOf(BASE64_MARKER) + BASE64_MARKER.length;
	  var base64 = dataURI.substring(base64Index);
	  var raw = window.atob(base64);
	  var rawLength = raw.length;
	  var array = new Uint8Array(new ArrayBuffer(rawLength));

	  for(i = 0; i < rawLength; i++) {
	    array[i] = raw.charCodeAt(i);
	  }
	  return array;
	}
	function dataURLtoFile(dataurl, filename) {
	    var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
	        bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
	    while(n--){
	        u8arr[n] = bstr.charCodeAt(n);
	    }
	    return new File([u8arr], filename, {type:mime});
	}
	function setBase64ToImage(baseStringIP){

		var baseString = baseStringIP.trim();
		// data:image/png;base64
		
		if(baseString.substring(0,4) != "data"){
			baseString = "data:image/png;base64," + baseString;
		}
		
		$("#previewImg").prop('src',baseString);	
		$("#previewImg").addClass("span12 baseurlopa2");
		$("#dwnldLink").show();
		$("#dwnldLink").prop('href',baseString);
	}

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
	    			// var encrypted = CryptoJS.AES.encrypt(event_.target.result, group_access_key); 
	    			console.log("clearText: ",decrypted);
	    			setBase64ToImage(decrypted);
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
	    			// window.open(url);
	    			// var file = dataURLtoFile(decrypted, file_name);
	    			// console.log(file);
	    			// download(file_name,url);

	    		}
	    		reader.readAsText(file);
	    		// var decrypted = CryptoJS.AES.decrypt(encrypted, group_access_key).toString(CryptoJS.enc.Latin1); 
	    		// console.log("cipherText: ",decrypted);
	    	});
	    });
	  });
  });
})(jQuery); 

