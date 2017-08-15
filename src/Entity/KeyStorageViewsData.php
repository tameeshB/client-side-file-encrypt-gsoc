<?php

namespace Drupal\client_side_file_crypto\Entity;

use Drupal\views\EntityViewsData;

/**
 * Provides Views data for Key storage entities.
 */
class KeyStorageViewsData extends EntityViewsData {

  /**
   * {@inheritdoc}
   */
  public function getViewsData() {
    $data = parent::getViewsData();

    // Additional information for Views integration, such as table joins, can be
    // put here.

    return $data;
  }

}
