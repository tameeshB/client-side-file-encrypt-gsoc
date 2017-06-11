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
 *   id = "key_manager",
 *   label = @Translation("Key manager"),
 *   uri_paths = {
 *     "canonical" = "//keys/{action}/{key_param}"
 *   }
 * )
 */
class KeyManager extends ResourceBase {

  /**
   * A current user instance.
   *
   * @var \Drupal\Core\Session\AccountProxyInterface
   */
  protected $currentUser;

  /**
   * Constructs a new KeyManager object.
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
   * @param string $action
   *   : Switch variable for request to process.
   * @param string $key_param
   *   : Parameter required for processing the request.
   *
   * @throws \Symfony\Component\HttpKernel\Exception\HttpException
   *   Throws exception expected.
   */
  public function get($action, $key_param) {
    if (!$this->currentUser->hasPermission('access content')) {
      throw new AccessDeniedHttpException();
    }
    switch ($action) {
      // Case to handle registration of the public key.
      case 'putKey':
        if ($user = User::load(\Drupal::currentUser()->id())) {
          if ($user->set('pub_key', $key_param)->save()) {
            $return = "Done!";
          }
        }
        else {
          throw new AccessDeniedHttpException();
        }
        break;

      // Case for handling fetcing of a public key.
      case 'getKey':
        if ($user = User::load($key_param)) {
          $return = $user->get('pub_key')->value;
        }
        else {
          throw new \Exception("User not found");
        }
        break;

      // Case for get an array of all the public keys for pending access keys.
      case 'getPending':
        // Forward to another controller.
        break;

      case 'putPending':
        break;

      default:
        throw new AccessDeniedHttpException();
    }
    return new ResourceResponse($return);
  }

}
