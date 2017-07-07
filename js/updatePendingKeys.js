// Jquery wrapper for drupal to avoid conflicts between libraries.
(function ($) {
  // Jquery onload function.
  $(document).ready(function(){
  				// var new_accessKey_ = '';
  				// $.get( "../publicKey?_format=json", function(pkey) {
  				// 	console.log(pkey['publicKey']);
	  	  //   		var encrypt = new JSEncrypt();
	  	  //   		var decrypt = new JSEncrypt();
	  			//   	encrypt.setPublicKey(pkey['publicKey']);
	  			//   	new_accessKey_ = encrypt.encrypt("yippie!");
	  			//   	console.log("ciphertext : " + new_accessKey_ );
	  			//   	decrypt.setPrivateKey(localStorage.getItem("privKey"));
				  // 	console.log("clearText:"  + decrypt.decrypt(new_accessKey_));

  				// });
//   				var node = {
// 	"accessKey":"J8i5a+90n0NDhGhyoMxYFO5RWfuVzMrlP6X6oS407TA5wE1mtJ2p9yvFwfcaih9tJT4r2YBjPVMbJOR4HxrdUAPqmbkxL37hRaGGva7nN5EijejqUznG5akYn7mnQiCI1DZ1C709BD2irRdMeIhWsFCgvB/IBSykAwP/XC01S8k=",
// 	"roleName":"authenticated",
// 	"userID":"2"
// };
//   				  jQuery.ajax({
  				
//     url: '../accessKey/?_format=json',
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/hal+json',
//       'X-CSRF-Token': 'NYhgRSicnDBVPJNQfYy7ZA8DXIPKNccE8xAn3AHygyA'
//     },
//     data: JSON.stringify(node),
//     success: function (node) {
//       console.log(node);
//     }
//   }).done(function( data ) {
//       console.log( "Sample of data:", data );
//   });
		////-----------
			$.get( "../rest/session/token", function( csrf_t ){
				$.get( "../publicKey/?_format=json", function( xhr_pub_key ){
					// console.log("publicKey:"+xhr_pub_key['publicKey']);
					var publicKey = xhr_pub_key['publicKey'];
					var privateKey = localStorage.getItem("privKey");
					var encrypt = new JSEncrypt();
					// console.log("priv_key : "+ privateKey);
					$.get( "../accessKey/pending?_format=json", function( pending_keys_json ){
						var decrypt = new JSEncrypt();
						decrypt.setPrivateKey(privateKey);
						pending_keys = pending_keys_json['accessKeys'];
						pending_keys.forEach(function(accessKey) {
							var group_access_key = decrypt.decrypt(accessKey['access_key']);
							encrypt.setPublicKey(accessKey['pub_key']);
							var new_access_key = encrypt.encrypt(group_access_key);
							console.log(group_access_key);
							console.log(new_access_key);
							var json_body = {
								"accessKey" : new_access_key,
								"roleName" : accessKey['role'],
								"userID" : accessKey['uid'],
							};
							var node = {
								"accessKey":"J8i5a+90n0NDhGhyoMxYFO5RWfuVzMrlP6X6oS407TA5wE1mtJ2p9yvFwfcaih9tJT4r2YBjPVMbJOR4HxrdUAPqmbkxL37hRaGGva7nN5EijejqUznG5akYn7mnQiCI1DZ1C709BD2irRdMeIhWsFCgvB/IBSykAwP/XC01S8k=",
								"roleName":"authenticated",
								"userID":"2"
							};
							jQuery.ajax({
											
							  url: '../accessKey/?_format=json',
							  method: 'POST',
							  headers: {
							    'Content-Type': 'application/hal+json',
							    'X-CSRF-Token': csrf_t
							  },
							  data: JSON.stringify(json_body),
							  success: function (node) {
							    console.log(node);
							  }
							}).done(function( data ) {
							    console.log( "Sample of data:", data );
							});
							console.log(json_body);
							// var group_access_key = decrypt.decrypt(accessKey['access_key']);
						});

					});
				});
			});
  	////-----------
  });
})(jQuery); 
