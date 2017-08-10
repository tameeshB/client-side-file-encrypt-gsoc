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
 *   id = "access_key",
 *   label = @Translation("Access key"),
 *   uri_paths = {
 *     "canonical" = "//accessKey",
 *     "https://www.drupal.org/link-relations/create" = "/accessKey"
 *   }
 * )
 */
class AccessKey extends ResourceBase {

  /**
   * A current user instance.
   *
   * @var \Drupal\Core\Session\AccountProxyInterface
   */
  protected $currentUser;

  /**
   * Constructs a new AccessKey object.
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
    $key = "";
    $needsKey = 1;
    $result = [];
    $current_user = User::load($this->currentUser->id());
    $db_result = db_query("SELECT * FROM {client_side_file_crypto_Keys} WHERE (userID = :uid AND needsKey = :needsKeyVal)", [
      ':uid' => $current_user->get('uid')->value,
      ':needsKeyVal' => 0,
    ]);
    // Db num rows condition.
    if ($db_result) {
      $accessKeyIndex = 0;
      $accessKeys = [];
      while ($row = $db_result->fetchAssoc()) {
        $accessKeys[$row["roleName"]] = $row["accessKey"];
      }
      if (count($accessKeys) > 0) {
        $return["message"] = "AccessKey Fetch Complete.";
        $return["keyCount"] = $accessKeyIndex;
        $return["accessKeys"] = $accessKeys;
        $status = 200;
      }
      else {
        $return["message"] = "Unable to fetch keys";
        $status = 204;
      }

    }
    else {
      $return["message"] = "An error occured.";
      $status = 400;
    }
    return new ResourceResponse($return, $status);
  }

  /**
   * Responds to POST requests.
   *
   * Registers an Access key against the access key request by a user.
   *
   * @throws \Symfony\Component\HttpKernel\Exception\HttpException
   *   Throws exception expected.
   */
  public function post(array $data = []) {
    $status = 400;
    $return = [];
    // Use current user after pass authentication to validate access.
    if (!$this->currentUser->hasPermission('access content')) {
      throw new AccessDeniedHttpException();
    }
    if ($user = User::load($this->currentUser->id())) {
      // Data validation.
      $query = \Drupal::database()->update('client_side_file_crypto_Keys');
      $query->fields([
        'accessKey' => $data['accessKey'],
        'needsKey' => 0,
      ]);
      $query->condition('userID', $data['userID']);
      $query->condition('needsKey', '1');
      $query->condition('roleName', $data['roleName']);
      if ($query->execute()) {
        $return["message"] = "Registered successfully.";
        $status = 200;
      }
    }
    else {
      $return["message"] = "Error loading user.";
      $status = 400;
    }
    return new ResourceResponse($return, $status);
  }

}
