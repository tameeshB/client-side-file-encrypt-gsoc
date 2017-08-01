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
 *   id = "FileMetaData",
 *   label = @Translation("File Metadata"),
 *   uri_paths = {
 *     "canonical" = "//fileMetadata/{nodeID}"
 *   }
 * )
 */
class FileMetaData extends ResourceBase {

  /**
   * A current user instance.
   *
   * @var \Drupal\Core\Session\AccountProxyInterface
   */
  protected $currentUser;

  /**
   * Constructs a new FileMetaData object.
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
  public function get($nodeID) {

    // Use current user after pass authentication to validate access.
    if (!$this->currentUser->hasPermission('access content')) {
      throw new AccessDeniedHttpException();
    }
    // Check if user has access to view $nodeID.
    $key = "";
    $needsKey = 1;
    $result = [];
    $current_user = User::load($this->currentUser->id());
    // Array of all the roles of the current user.
    $roles = $current_user->getRoles();
    $db_result = db_query("SELECT * FROM {client_side_file_crypto_files} WHERE (nodeID = :nodeID roleName in (:roles[]))", [
      ':nodeID' => $nodeID,
      ':roles[]' => $roles,
    ]);
    // Db num rows condition.
    if ($db_result) {
      $fileIndex = 0;
      $files = [];
      while ($row = $db_result->fetchAssoc()) {
        $files[$fileIndex]["userID"] = $row["userID"];
        $files[$fileIndex]["roleName"] = $row["roleName"];
        $files[$fileIndex++]["accessKey"] = $row["accessKey"];
      }
      if (count($files) > 0) {
        $return["message"] = "AccessKey Fetch Complete.";
        $return["fileCount"] = $fileIndex;
        $return["files"] = $files;
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

}
