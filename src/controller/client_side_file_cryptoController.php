<?php

namespace Drupal\client_side_file_crypto\Controller;

use Drupal\Core\Controller\ControllerBase;

class client_side_file_cryptoController extends ControllerBase {

    /**
     * Display the markup.
     *
     * @return array
     */
    public function reloadKeys() {
        return array(
            '#type' => 'markup',
            '#markup' => $this->t('You can reload the private key on the browser by uploading the .pem file here'),
        );
    }

}