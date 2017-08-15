<?php

namespace Drupal\client_side_file_crypto;

use Drupal\Core\Entity\ContentEntityStorageInterface;
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
interface KeyStorageStorageInterface extends ContentEntityStorageInterface {

  /**
   * Gets a list of Key storage revision IDs for a specific Key storage.
   *
   * @param \Drupal\client_side_file_crypto\Entity\KeyStorageInterface $entity
   *   The Key storage entity.
   *
   * @return int[]
   *   Key storage revision IDs (in ascending order).
   */
  public function revisionIds(KeyStorageInterface $entity);

  /**
   * Gets a list of revision IDs having a given user as Key storage author.
   *
   * @param \Drupal\Core\Session\AccountInterface $account
   *   The user entity.
   *
   * @return int[]
   *   Key storage revision IDs (in ascending order).
   */
  public function userRevisionIds(AccountInterface $account);

  /**
   * Counts the number of revisions in the default language.
   *
   * @param \Drupal\client_side_file_crypto\Entity\KeyStorageInterface $entity
   *   The Key storage entity.
   *
   * @return int
   *   The number of revisions in the default language.
   */
  public function countDefaultLanguageRevisions(KeyStorageInterface $entity);

  /**
   * Unsets the language for all Key storage with the given language.
   *
   * @param \Drupal\Core\Language\LanguageInterface $language
   *   The language object.
   */
  public function clearRevisionsLanguage(LanguageInterface $language);

}
