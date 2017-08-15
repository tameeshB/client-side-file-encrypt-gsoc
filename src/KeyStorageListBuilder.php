<?php

namespace Drupal\client_side_file_crypto;

use Drupal\Core\Entity\EntityInterface;
use Drupal\Core\Entity\EntityListBuilder;
use Drupal\Core\Link;

/**
 * Defines a class to build a listing of Key storage entities.
 *
 * @ingroup client_side_file_crypto
 */
class KeyStorageListBuilder extends EntityListBuilder {


  /**
   * {@inheritdoc}
   */
  public function buildHeader() {
    $header['id'] = $this->t('Key storage ID');
    $header['name'] = $this->t('Name');
    return $header + parent::buildHeader();
  }

  /**
   * {@inheritdoc}
   */
  public function buildRow(EntityInterface $entity) {
    /* @var $entity \Drupal\client_side_file_crypto\Entity\KeyStorage */
    $row['id'] = $entity->id();
    $row['name'] = Link::createFromRoute(
      $entity->label(),
      'entity.key_storage.edit_form',
      ['key_storage' => $entity->id()]
    );
    return $row + parent::buildRow($entity);
  }

}
