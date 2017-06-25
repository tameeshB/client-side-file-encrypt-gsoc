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
    $curr_user = User::load(\Drupal::currentUser()->id());
    // Array of all the roles of the current user.
    $roles = $curr_user->getRoles();
    // AND userID <> :uid needsKey = :keyval AND.
    $db_result = db_query("SELECT * FROM {client_side_file_crypto_Keys} WHERE ( roleName in (:roles[])  )", [
      // ':keyval' => 1,.
      ':roles[]' => $roles,
      // ':uid' => $curr_user->get('uid')->value,.
    ]);
    if ($db_result) {
      while ($row = $db_result->fetchAssoc()) {
        $accessKey = $this->getAccessKey($row['roleName']);
        if ($accessKey != -1) {
          $pendingKeys[] = [
            'index' => $row['keyIndex'],
            'uid' => $row['userID'],
            'role' => $row['roleName'],
            'pub_key' => $this->getPubKey($row['userID']),
            'access_key' => $accessKey,
          ];
        }
      }
      $return["message"] = "Pending Access Keys fetched successfully.";
      $return["keyCount"] = count($pendingKeys);
      $return["accessKeys"] = $pendingKeys;
      $status = 200;

    }
    else {
      $return["message"] = "Error fetching keys.";
      $status = 400;
    }
    if ($curr_user->isAnonymous()) {
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
    $curr_user = User::load(\Drupal::currentUser()->id());
    $db_result = db_query("SELECT * FROM {client_side_file_crypto_Keys} WHERE (userID = :uid AND needsKey = :needsKeyVal AND roleName = :roleName)", [
      ':uid' => $curr_user->get('uid')->value,
      ':needsKeyVal' => 0,
      ':roleName' => $role,
    ]);
    while ($row = $db_result->fetchAssoc()) {
      $accessKeys = $row["accessKey"];
    }
    return $accessKeys;
  }

}
