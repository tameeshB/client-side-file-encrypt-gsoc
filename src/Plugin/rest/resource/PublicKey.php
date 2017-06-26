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
 *   id = "public_key",
 *   label = @Translation("Public key"),
 *   uri_paths = {
 *     "canonical" = "//publicKey",
 *     "https://www.drupal.org/link-relations/create" = "/publicKey"
 *   }
 * )
 */
class PublicKey extends ResourceBase {

  /**
   * A current user instance.
   *
   * @var \Drupal\Core\Session\AccountProxyInterface
   */
  protected $currentUser;

  /**
   * Constructs a new PublicKey object.
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
    if ($uid = $this->currentUser->id()) {
      if ($user = User::load($uid)) {
        $return["publicKey"] = $user->get('pub_key')->value;
        $return["uid"] = $user->get('name')->value;
        $return["message"] = "Success!";
        $status = 200;
      }
      else {
        // Error loading user.
        $return["message"] = "Error loading user.";
        $status = 400;
      }
    }
    else {
      // User not logged in.
      $return["message"] = "Unauthenticated access.";
      $status = 402;
    }
    return new ResourceResponse($return, $status);
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
    if ($user = User::load($this->currentUser->id())) {
      // POST input Data validation.
      if ($user->set('pub_key', $data['publicKey'])->save()) {
        $return["message"] = "Successfully added.";
        $status = 200;
      }
      else {
        $return["message"] = "Error writing to user entity field.";
        $status = 400;
      }
    }
    else {
      $return["message"] = "Error loading current user.";
      $status = 400;
    }
    return new ResourceResponse($return, $status);
  }

}
