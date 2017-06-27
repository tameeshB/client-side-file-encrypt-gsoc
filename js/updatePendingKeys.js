// Jquery wrapper for drupal to avoid conflicts between libraries.
(function ($) {
  // Jquery onload function.
  $(document).ready(function(){
  				$.get( "../publicKey?_format=json", function(pkey) {
  					console.log(pkey['publicKey']);
	  	    		var encrypt = new JSEncrypt();
	  			  	encrypt.setPublicKey(pkey['publicKey']);
	  			  	var new_accessKey_ = encrypt.encrypt("yippie!");
	  			  	console.log("ciphertext : " + new_accessKey_ );
  				});
	  			  	console.log("ciphertext : " + new_accessKey_ );

  	//
  	var decrypt = new JSEncrypt();
  	var privkey = localStorage.getItem("privKey");
  	console.log("priveKey:" + privkey);
  	decrypt.setPrivateKey(privkey);
  	console.log("clearText:" + decrypt.decrypt(new_accessKey_));
  	var group_access_key_ = decrypt.decrypt(new_accessKey_);
    $.get( "../rest/session/token", function(csrf_t) {
	    $.get( "../accessKey/pending?_format=json", function( pending_keys_json ) {
	    	pending_keys = pending_keys_json['accessKeys'];
	    	pending_keys.forEach(function(accessKey) {
	    		console.log('access_key :' + accessKey['access_key']);
	    		var group_access_key = decrypt.decrypt(accessKey['access_key']);
	    		console.log('pending :' + group_access_key);
	    		var encrypt = new JSEncrypt();
			  	encrypt.setPublicKey(accessKey['pub_key']);
	    		console.log("pub_key :" + accessKey['pub_key']);
			  	var new_accessKey = encrypt.encrypt(group_access_key);
			  	console.log(new_accessKey);
			  	var json_body = {
			  		"accessKey" : new_accessKey,
			  		"roleName" : accessKey['role'],
			  		"userID" : accessKey['uid'],
			  	};
			  	console.log(json_body);
			  	jQuery.ajax({
			  	  url: '../accessKey/?_format=json',
			  	  method: 'POST',
			  	  headers: {
			  	    'Content-Type': 'application/hal+json',
			  	    'X-CSRF-Token': csrf_t,
			  	  },
			  	  data: JSON.stringify(json_body),
			  	  success: function (response_data) {
			  	    console.log(response_data);
			  	  }
			  	});
		    	console.log(accessKey);
	    	});

	    });
    });
  });
})(jQuery); 

