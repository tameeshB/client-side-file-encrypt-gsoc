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
    }$key = "";
    $needsKey = 1;
    $result = [];
    $curr_user = User::load(\Drupal::currentUser()->id());
    $db_result = db_query("SELECT * FROM {client_side_file_crypto_Keys} WHERE (userID = :uid AND roleName = :roleName )", [':uid' => $curr_user->get('uid')->value, ':roleName' => $data['roleName']]);
    if ($db_result) {
      while ($row = $db_result->fetchAssoc()) {

        if ($row['accessKey'] != NULL) {
          $db_data['key'] = $row['accessKey'];
          $key = $row['accessKey'];
          $needsKey = $row['needsKey'];
          break;
        }
      }
      if ($needsKey == 1) {
        $return["status"] = 0;
        $return["message"] = "Access key not provided yet.";
      }
      elseif ($needsKey == 0) {
        $return["status"] = 1;
        $return["key"] = $key;
      }
      else {
        throw new \Exception("An error occured.");

      }
    }
    else {
      $return["status"] = -1;
      $return["message"] = "Error occured.";
      throw new \Exception("An error occured.");
    }
    return new ResourceResponse($return);
  }

  /**
   * Responds to POST requests.
   *
   * Returns a list of bundles for specified entity.
   *
   * @throws \Symfony\Component\HttpKernel\Exception\HttpException
   *   Throws exception expected.
   */
  public function post(array $data = []) {

    // Use current user after pass authentication to validate access.
    if (!$this->currentUser->hasPermission('access content')) {
      throw new AccessDeniedHttpException();
    }
    if ($user = User::load(\Drupal::currentUser()->id())) {
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
        $return["status"] = 1;
        $return["message"] = "Registered successfully.";
      }
    }
    else {
      $return["status"] = -1;
      $return["message"] = "Error occured.";
      throw new AccessDeniedHttpException();
    }
    return new ResourceResponse($return);
  }

}
