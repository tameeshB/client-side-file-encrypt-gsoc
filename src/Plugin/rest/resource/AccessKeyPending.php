<?php

namespace Drupal\client_side_file_crypto\Plugin\rest\resource;

use Drupal\user\Entity\User;
use Drupal\Core\Session\AccountProxyInterface;
use Drupal\rest\Plugin\ResourceBase;
use Drupal\rest\ResourceResponse;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Psr\Log\LoggerInterface;

/**
 * Provides a resource to get view modes by entity and bundle.
 *
 * @RestResource(
 *   id = "access_key_pending",
 *   label = @Translation("Access key pending"),
 *   uri_paths = {
 *     "canonical" = "//accessKey/pending"
 *   }
 * )
 */
class AccessKeyPending extends ResourceBase {

  /**
   * A current user instance.
   *
   * @var \Drupal\Core\Session\AccountProxyInterface
   */
  protected $currentUser;

  /**
   * Constructs a new AccessKeyPending object.
   *
   * @param array $configuration
   *   A configuration array containing information about the plugin instance.
   * @param string $plugin_id
   *   The plugin_id for the plugin instance.
   * @param mixed $plugin_definition
   *   The plugin implementation definition.
   * @param array $serializer_formats
   *   The available serialization formats.
   * @param \Psr\Log\LoggerInterface $logger
   *   A logger instance.
   * @param \Drupal\Core\Session\AccountProxyInterface $current_user
   *   A current user instance.
   */
  public function __construct(
    array $configuration,
    $plugin_id,
    $plugin_definition,
    array $serializer_formats,
    LoggerInterface $logger,
    AccountProxyInterface $current_user) {
    parent::__construct($configuration, $plugin_id, $plugin_definition, $serializer_formats, $logger);

    $this->currentUser = $current_user;
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container, array $configuration, $plugin_id, $plugin_definition) {
    return new static(
      $configuration,
      $plugin_id,
      $plugin_definition,
      $container->getParameter('serializer.formats'),
      $container->get('logger.factory')->get('client_side_file_crypto'),
      $container->get('current_user')
    );
  }

  /**
   * Responds to GET requests.
   *
   * Returns a list of bundles for specified entity.
   *
   * @throws \Symfony\Component\HttpKernel\Exception\HttpException
   *   Throws exception expected.
   */
  public function get() {

    // Use current user after pass authentication to validate access.
    if (!$this->currentUser->hasPermission('access content')) {
      throw new AccessDeniedHttpException();
    }
    $return = [];
    $pendingKeys = [];
    $current_user = User::load($this->currentUser->id());
    // Array of all the roles of the current user.
    $roles = $current_user->getRoles();
    $query = db_select('client_side_file_crypto_Keys');
    $query->condition('userID', $current_user->id(), '<>');
    $query->condition('needsKey', 1);
    $query->condition('roleName', $roles, 'in');
    $query->addField('client_side_file_crypto_Keys', 'roleName');
    $query->addField('client_side_file_crypto_Keys', 'userID');
    $query->addField('client_side_file_crypto_Keys', 'keyIndex');
    $db_result = $query->execute();
    if ($db_result) {
      foreach ($db_result as $record) {
        $accessKey = $this->getAccessKey($record->roleName);
        if ($accessKey != -1) {
          $thisUserPubKey = $this->getPubKey($record->userID);
          if ($thisUserPubKey) {
            $pendingKeys[] = [
              'index' => $record->keyIndex,
              'uid' => $record->userID,
              'role' => $record->roleName,
              'pub_key' => $thisUserPubKey,
              'access_key' => $accessKey,
            ];
          }
        }
      }
      $return['uid'] = $current_user->id();
      $return["message"] = "Pending Access Keys fetched successfully.";
      $return["keyCount"] = count($pendingKeys);
      $return["accessKeys"] = $pendingKeys;
      $status = 200;

    }
    else {
      $return["message"] = "Error fetching keys.";
      $status = 400;
    }
    if ($current_user->isAnonymous()) {
      $return = [];
      $return["message"] = "Unauthenticated access.";
      $status = 404;
    }
    return new ResourceResponse($return, $status);
  }

  /**
   * Function to return the Public Key of the parameter user.
   *
   * @param int $uid
   *   Is the optional parameter for user's UID
   *   If the $uid is absent, the public key of the current logged in user
   *   is returned.
   *
   * @return string
   *   Public key.
   */
  public function getPubKey($uid = NULL) {
    if ($uid == NULL) {
      $uid = \Drupal::currentUser()->id();
    }
    if ($user = User::load($uid)) {
      return $user->get('pub_key')->value;
    }
    throw new \Exception("User not found");
  }

  /**
   * Function to return the Access Key of the parameter user.
   *
   * @param int $role
   *   If the $uid is absent, the public key of the current logged in user
   *   is returned.
   *
   * @return string
   *   Public key.
   */
  public function getAccessKey($role) {
    $accessKeys = -1;
    $current_user = User::load(\Drupal::currentUser()->id());
    $query = db_select('client_side_file_crypto_Keys');
    $query->condition('userID', $current_user->get('uid')->value);
    $query->condition('needsKey', 0);
    $query->condition('roleName', $role);
    $query->addField('client_side_file_crypto_Keys', 'accessKey');
    $db_result = $query->execute();
    foreach ($db_result as $record) {
      $accessKeys = $result->accessKey;
    }
    return $accessKeys;
  }

}
