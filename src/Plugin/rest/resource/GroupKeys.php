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
 * Provides a resource to get JSON object of all the groups with no access
 * keys generated yet.
 *
 * @RestResource(
 *   id = "group_key_pending",
 *   label = @Translation("Group key pending"),
 *   uri_paths = {
 *     "canonical" = "//groupKeys"
 *   }
 * )
 */
class GroupKeys extends ResourceBase {

  /**
   * A current user instance.
   *
   * @var \Drupal\Core\Session\AccountProxyInterface
   */
  protected $currentUser;

  /**
   * Constructs a new GroupKeyPending object.
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
   * Returns a JSON object with roles with no generated access keys.
   *
   * @throws \Symfony\Component\HttpKernel\Exception\HttpException
   *   Throws exception expected.
   */
  public function get() {

    // Use current user after pass authentication to validate access.
    if (!$this->currentUser->hasPermission('access content')) {
      throw new AccessDeniedHttpException();
    }
    $status = 400;
    $return = [];
    $pendingRoles = [];
    $current_user = User::load($this->currentUser->id());
    // Array of all the roles of the current user.
    $roles = $current_user->getRoles();
    foreach ($roles as $role) {
      $db_result = db_query("SELECT COUNT(*) FROM {client_side_file_crypto_Keys} WHERE ( roleName = :role AND needsKey = :keyval)", [
        ':role' => $role,
        ':keyval' => 1,
      ]);
      if ($db_result) {
        while ($row = $db_result->fetchAssoc()) {
          if ($row['COUNT(*)'] > 0) {
            $pendingRoles[] = $role;
          }
        }

      }
      else {
        $return["message"] = "Error fetching keys.";
        $status = 400;
      }
      $return["message"] = "Pending Group Keys fetched successfully.";
      $status = 200;
      $return["keyCount"] = count($pendingRoles);
      $return["userID"] = $current_user->id();

      $return["roleNames"] = $pendingRoles;
    }

    if ($current_user->isAnonymous()) {
      $return = [];
      $return["message"] = "Unauthenticated access.";
      $status = 401;
    }
    return new ResourceResponse($return, $status);
  }

}
