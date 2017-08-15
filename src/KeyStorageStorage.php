<?php

namespace Drupal\client_side_file_crypto;

use Drupal\Core\Entity\Sql\SqlContentEntityStorage;
use Drupal\Core\Session\AccountInterface;
use Drupal\Core\Language\LanguageInterface;
use Drupal\client_side_file_crypto\Entity\KeyStorageInterface;

/**
 * Defines the storage handler class for Key storage entities.
 *
 * This extends the base storage class, adding required special handling for
 * Key storage entities.
 *
 * @ingroup client_side_file_crypto
 */
class KeyStorageStorage extends SqlContentEntityStorage implements KeyStorageStorageInterface {

  /**
   * {@inheritdoc}
   */
  public function revisionIds(KeyStorageInterface $entity) {
    return $this->database->query(
      'SELECT vid FROM {key_storage_revision} WHERE id=:id ORDER BY vid',
      [':id' => $entity->id()]
    )->fetchCol();
  }

  /**
   * {@inheritdoc}
   */
  public function userRevisionIds(AccountInterface $account) {
    return $this->database->query(
      'SELECT vid FROM {key_storage_field_revision} WHERE uid = :uid ORDER BY vid',
      [':uid' => $account->id()]
    )->fetchCol();
  }

  /**
   * {@inheritdoc}
   */
  public function countDefaultLanguageRevisions(KeyStorageInterface $entity) {
    return $this->database->query('SELECT COUNT(*) FROM {key_storage_field_revision} WHERE id = :id AND default_langcode = 1', [':id' => $entity->id()])
      ->fetchField();
  }

  /**
   * {@inheritdoc}
   */
  public function clearRevisionsLanguage(LanguageInterface $language) {
    return $this->database->update('key_storage_revision')
      ->fields(['langcode' => LanguageInterface::LANGCODE_NOT_SPECIFIED])
      ->condition('langcode', $language->getId())
      ->execute();
  }

}
