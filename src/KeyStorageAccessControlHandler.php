<?php

namespace Drupal\client_side_file_crypto;

use Drupal\Core\Entity\EntityAccessControlHandler;
use Drupal\Core\Entity\EntityInterface;
use Drupal\Core\Session\AccountInterface;
use Drupal\Core\Access\AccessResult;

/**
 * Access controller for the Key storage entity.
 *
 * @see \Drupal\client_side_file_crypto\Entity\KeyStorage.
 */
class KeyStorageAccessControlHandler extends EntityAccessControlHandler {

  /**
   * {@inheritdoc}
   */
  protected function checkAccess(EntityInterface $entity, $operation, AccountInterface $account) {
    /** @var \Drupal\client_side_file_crypto\Entity\KeyStorageInterface $entity */
    switch ($operation) {
      case 'view':
        if (!$entity->isPublished()) {
          return AccessResult::allowedIfHasPermission($account, 'view unpublished key storage entities');
        }
        return AccessResult::allowedIfHasPermission($account, 'view published key storage entities');

      case 'update':
        return AccessResult::allowedIfHasPermission($account, 'edit key storage entities');

      case 'delete':
        return AccessResult::allowedIfHasPermission($account, 'delete key storage entities');
    }

    // Unknown operation, no opinion.
    return AccessResult::neutral();
  }

  /**
   * {@inheritdoc}
   */
  protected function checkCreateAccess(AccountInterface $account, array $context, $entity_bundle = NULL) {
    return AccessResult::allowedIfHasPermission($account, 'add key storage entities');
  }

}
