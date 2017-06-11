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
  public function postFirstLogin() {
    return [
      '#type' => 'markup',
      '#markup' => $this->t('Redirection after first login after module install is redirected here.'),
    ];
  }

  /**
   * Display the markup.
   *
   * @return array
   *   returns the render array for the page to redirect to post login.
   */
  public function postLoginCheck() {
    return [
      '#type' => 'markup',
      '#markup' => $this->t('Controller called post every login to check for pending keys'),
    ];
  }

  /**
   * Display the markup.
   *
   * @return array
   *   returns the render array for the page to generate new keys.
   */
  public function newKeys() {
    return [
      '#type' => 'markup',
      '#markup' => $this->t('Controller for rendering the page handling new key generation.'),
    ];
  }

  /**
   * Display the markup.
   *
   * @return array
   *   returns the render array for the page to reload keys.
   */
  public function reloadKeys() {
    return [
      '#type' => 'markup',
      '#markup' => $this->t('You can reload the private key on the browser by uploading the .pem file here'),
    ];
  }

}
