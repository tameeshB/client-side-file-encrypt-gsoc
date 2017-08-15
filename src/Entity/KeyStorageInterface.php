<?php

namespace Drupal\client_side_file_crypto\Entity;

use Drupal\Core\Entity\RevisionLogInterface;
use Drupal\Core\Entity\RevisionableInterface;
use Drupal\Core\Entity\EntityChangedInterface;
use Drupal\user\EntityOwnerInterface;

/**
 * Provides an interface for defining Key storage entities.
 *
 * @ingroup client_side_file_crypto
 */
interface KeyStorageInterface extends RevisionableInterface, RevisionLogInterface, EntityChangedInterface, EntityOwnerInterface {

  // Add get/set methods for your configuration properties here.

  /**
   * Gets the Key storage name.
   *
   * @return string
   *   Name of the Key storage.
   */
  public function getName();

  /**
   * Sets the Key storage name.
   *
   * @param string $name
   *   The Key storage name.
   *
   * @return \Drupal\client_side_file_crypto\Entity\KeyStorageInterface
   *   The called Key storage entity.
   */
  public function setName($name);

  /**
   * Gets the Key storage creation timestamp.
   *
   * @return int
   *   Creation timestamp of the Key storage.
   */
  public function getCreatedTime();

  /**
   * Sets the Key storage creation timestamp.
   *
   * @param int $timestamp
   *   The Key storage creation timestamp.
   *
   * @return \Drupal\client_side_file_crypto\Entity\KeyStorageInterface
   *   The called Key storage entity.
   */
  public function setCreatedTime($timestamp);

  /**
   * Returns the Key storage published status indicator.
   *
   * Unpublished Key storage are only visible to restricted users.
   *
   * @return bool
   *   TRUE if the Key storage is published.
   */
  public function isPublished();

  /**
   * Sets the published status of a Key storage.
   *
   * @param bool $published
   *   TRUE to set this Key storage to published, FALSE to set it to unpublished.
   *
   * @return \Drupal\client_side_file_crypto\Entity\KeyStorageInterface
   *   The called Key storage entity.
   */
  public function setPublished($published);

  /**
   * Gets the Key storage revision creation timestamp.
   *
   * @return int
   *   The UNIX timestamp of when this revision was created.
   */
  public function getRevisionCreationTime();

  /**
   * Sets the Key storage revision creation timestamp.
   *
   * @param int $timestamp
   *   The UNIX timestamp of when this revision was created.
   *
   * @return \Drupal\client_side_file_crypto\Entity\KeyStorageInterface
   *   The called Key storage entity.
   */
  public function setRevisionCreationTime($timestamp);

  /**
   * Gets the Key storage revision author.
   *
   * @return \Drupal\user\UserInterface
   *   The user entity for the revision author.
   */
  public function getRevisionUser();

  /**
   * Sets the Key storage revision author.
   *
   * @param int $uid
   *   The user ID of the revision author.
   *
   * @return \Drupal\client_side_file_crypto\Entity\KeyStorageInterface
   *   The called Key storage entity.
   */
  public function setRevisionUserId($uid);

}
