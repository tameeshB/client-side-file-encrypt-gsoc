<?php

namespace Drupal\client_side_file_crypto\Controller;

use Drupal\Core\Controller\ControllerBase;

/**
 * Controller class extending ControllerBase for module's API endpoints.
 */
class ClientSideFileCryptoController extends ControllerBase {

  /**
   * Display the markup.
   *
   * @return array
   *   returns the render array for the page to redirect to after.
   */
  public function newKeys() {
    $output = [];
    $output["heading2"] = [
      '#type' => 'markup',
      '#markup' => t('You have been redirected here post your first login to generate a new asymmetric keypair'),
      '#attached' => [
        'library' => [
          'client_side_file_crypto/csfcPubKeyGen',
        ],
      ],
    ];

    $output["status"] = [
      '#type' => 'markup',
      '#markup' => "<br><a id='key-status'>" . t('Generating keypair...') . "</a><p id='more-info'></p>",
    ];

    return $output;
  }

  /**
   * Display the markup.
   *
   * @return array
   *   returns the render array for the page to redirect to post login.
   */
  public function postLoginCheck() {
    global $user;
    $output = [];
    $output['heading1'] = [
      '#type' => 'markup',
      '#markup' => $this->t('You were redirected to this page to check for any pending key requests.'),
      '#attached' => [
        'library' => [
          'client_side_file_crypto/csfcUpdatePendingKeys',
        ],
      ],
    ];
    return $output;
  }

  /**
   * Display the markup.
   *
   * @return array
   *   returns the render array for the page to reload keys.
   */
  public function restoreKeys() {
    $output['head'] = [
      '#type' => 'markup',
      '#markup' => $this->t('You can reload the private key on the browser by uploading the .pem file here'),
      '#attached' => [
        'library' => [
          'client_side_file_crypto/csfcRestoreKeys',
        ],
      ],
    ];
    $output['privKey'] = [
      '#type' => 'file',
      '#title' => t('Private Key'),
      '#id' => 'privKey',
    ];
    $output['errMessage'] = [
      '#type' => 'markup',
      '#id' => 'errMessage',
      '#markup' => "<div id ='errMessage_'>" . $this->t('Upload PrivateKey.pem here.') . "</div>",
    ];
    return $output;
  }

}
