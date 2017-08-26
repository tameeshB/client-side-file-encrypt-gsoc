// Jquery wrapper for drupal to avoid conflicts between libraries.
(function ($) {
  var baseURL = drupalSettings.client_side_file_crypto.baseURL;
  /**
   * Method to return the csrf token
   */
  function getCsrfToken() {
    return $.ajax({
      type: "GET",
        url: baseURL + "/rest/session/token",
      async: false
      }).responseText;
  }

  var file = undefined;
  $(document).ready(function(){
    $(".node-form").attr("action", "/node/add/" + $(".node-form").attr('data-drupal-selector').split("-")[1]);
    var uid = drupalSettings.client_side_file_crypto.uid;
    $("#cryptoFields").change(function(e){
      e.preventDefault();
      file = e.target.files[0];
      var role = $("#roleSelect").val();
      var fileName = "encrypted_" + file.name;
      $.get(baseURL + "/accessKey/?_format=json", function(xhrAccessKey){
        var privateKey = localStorage.getItem("csfcPrivKey_" + uid);
        var decrypt = new JSEncrypt();
        decrypt.setPrivateKey(privateKey);
        //currently for testing, using only one role, will later add a dropdown or something for this.
        if(xhrAccessKey['accessKeys'][role]){
          var reader = new FileReader();
          var groupAccessKey = decrypt.decrypt(xhrAccessKey['accessKeys'][role]);
          reader.onload = function(event){
            var encrypted = CryptoJS.AES.encrypt(event.target.result, groupAccessKey); 
            var formData = new FormData();
            formData.append('file', new File([new Blob([encrypted])], fileName));
            formData.append('csfcFileName', fileName);
            formData.append('csfcFileMIME', file.type);
            formData.append('csfcRoleName', role);

            $.ajax({
              url: baseURL + '/encryptedFileUpload',
              data: formData,
              processData: false,
              contentType: false,
              type: 'POST',
              headers: {
                'X-CSRF-Token': getCsrfToken()
              },
              success: function(response) {
                $("#cryptoFields").hide();
                $("#cryptoFields--description").text('File Encrypted and Uploaded Successfully!');
                $("#cryptoFields--description").css("color", "#42a211");
                $("[name='fileID']").val(response['file_id']);
              },
              error: function(response) {
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
})(jQuery, Drupal);

