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
      case 'putPubKey':
        if ($user = User::load(\Drupal::currentUser()->id())) {
          if ($user->set('pub_key', $key_param)->save()) {
            $return["status"] = 1;
            $return["message"] = "Successfully added.";
          }
        }
        else {
          $return["status"] = -1;
          $return["message"] = "Error occured.";
          throw new AccessDeniedHttpException();
        }
        break;

      // Case for handling fetcing of a public key.
      case 'getPubKey':
        $return = $this->getPubKey($key_param);
        break;

      case 'getAccessKey':
        $key = "";
        $needsKey = 1;
        $result = [];
        $curr_user = User::load(\Drupal::currentUser()->id());
        $db_result = db_query("SELECT * FROM {client_side_file_crypto_Keys} WHERE (userID = :uid AND roleName = :roleName )", [':uid' => $curr_user->get('uid')->value, ':roleName' => $key_param]);
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
        break;

      // Case for checking if a public key exists for the user.
      case 'checkPubKey':
        // $curr_user = User::load(\Drupal::currentUser()->id());
        if ($user = User::load($key_param)) {
          $pubKeyAvailable = $user->get('pub_key')->value;
          if ($pubKeyAvailable != NULL || $pubKeyAvailable != "") {
            $return = 1;
          }
          else {
            $return = 0;
          }
        }
        else {
          // Case where the userID provided does not exist.
          throw new \Exception("An error occured.");
        }

        break;

      // Case for get an array of all the public keys for pending access keys.
      case 'getPending':
        $return = [];
        $curr_user = User::load(\Drupal::currentUser()->id());
        // Array of all the roles of the current user.
        $roles = $curr_user->getRoles();
        $db_result = db_query("SELECT * FROM {client_side_file_crypto_Keys} WHERE (needsKey = :keyval AND roleName in (:roles[]) )", [':keyval' => 1, ':roles[]' => $roles]);
        if ($db_result) {
          while ($row = $db_result->fetchAssoc()) {
            $return[] = [
              'index' => $row['keyIndex'],
              'uid' => $row['userID'],
              'role' => $row['roleName'],
              'pub_key' => $this->getPubKey($row['userID']),
            ];
          }
        }
        else {
          throw new \Exception("An error occured.");
        }
        break;

      case 'putPending':
        foreach ($key_param as $key_data) {
          $values[] = [
            'accessKey' => $key_data['accessKey'],
            'roleName' => $key_data['roleName'],
            'userID' => $key_data['userID'],
            'needsKey' => 0,
          ];
        }
        $query = db_insert('client_side_file_crypto_Keys')->fields([
          'accessKey',
          'roleName',
          'userID',
        ]
        );
        foreach ($values as $record) {
          $query->values($record);
        }
        if ($query->execute()) {
          $return["status"] = 1;
          $return["message"] = "Successfully added.";
        }
        else {
          $return["status"] = -1;
          $return["message"] = "An error occured.";
          throw new \Exception("An error occured.");
        }
        break;

      default:
        $return = -1;
    }
    if($return==-1){
      throw new \Exception("Action not found.");
    }else{
      return new ResourceResponse($return);  
    }
    
  }

  /**
   * Function to return the Public Key of the parameter user.
   *
   * @param int $uid
   *   is the optional parameter for user's UID
   *   if the $uid is absent, the public key of the current logged in user
   *   is returned.
   *
   * @return string
   *   public key.
   */
  public function getPubKey($uid = NULL) {
    if ($uid == NULL) {
      $uid = \Drupal::currentUser()->id();
    }
    if ($user = User::load($uid)) {
      $return = $user->get('pub_key')->value;
    }
    else {
      throw new \Exception("User not found");
    }
    return $return;
  }

}
