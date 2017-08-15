<?php

namespace Drupal\client_side_file_crypto\Controller;

use Drupal\Component\Utility\Xss;
use Drupal\Core\Controller\ControllerBase;
use Drupal\Core\DependencyInjection\ContainerInjectionInterface;
use Drupal\Core\Url;
use Drupal\client_side_file_crypto\Entity\KeyStorageInterface;

/**
 * Class KeyStorageController.
 *
 *  Returns responses for Key storage routes.
 *
 * @package Drupal\client_side_file_crypto\Controller
 */
class KeyStorageController extends ControllerBase implements ContainerInjectionInterface {

  /**
   * Displays a Key storage  revision.
   *
   * @param int $key_storage_revision
   *   The Key storage  revision ID.
   *
   * @return array
   *   An array suitable for drupal_render().
   */
  public function revisionShow($key_storage_revision) {
    $key_storage = $this->entityManager()->getStorage('key_storage')->loadRevision($key_storage_revision);
    $view_builder = $this->entityManager()->getViewBuilder('key_storage');

    return $view_builder->view($key_storage);
  }

  /**
   * Page title callback for a Key storage  revision.
   *
   * @param int $key_storage_revision
   *   The Key storage  revision ID.
   *
   * @return string
   *   The page title.
   */
  public function revisionPageTitle($key_storage_revision) {
    $key_storage = $this->entityManager()->getStorage('key_storage')->loadRevision($key_storage_revision);
    return $this->t('Revision of %title from %date', ['%title' => $key_storage->label(), '%date' => format_date($key_storage->getRevisionCreationTime())]);
  }

  /**
   * Generates an overview table of older revisions of a Key storage .
   *
   * @param \Drupal\client_side_file_crypto\Entity\KeyStorageInterface $key_storage
   *   A Key storage  object.
   *
   * @return array
   *   An array as expected by drupal_render().
   */
  public function revisionOverview(KeyStorageInterface $key_storage) {
    $account = $this->currentUser();
    $langcode = $key_storage->language()->getId();
    $langname = $key_storage->language()->getName();
    $languages = $key_storage->getTranslationLanguages();
    $has_translations = (count($languages) > 1);
    $key_storage_storage = $this->entityManager()->getStorage('key_storage');

    $build['#title'] = $has_translations ? $this->t('@langname revisions for %title', ['@langname' => $langname, '%title' => $key_storage->label()]) : $this->t('Revisions for %title', ['%title' => $key_storage->label()]);
    $header = [$this->t('Revision'), $this->t('Operations')];

    $revert_permission = (($account->hasPermission("revert all key storage revisions") || $account->hasPermission('administer key storage entities')));
    $delete_permission = (($account->hasPermission("delete all key storage revisions") || $account->hasPermission('administer key storage entities')));

    $rows = [];

    $vids = $key_storage_storage->revisionIds($key_storage);

    $latest_revision = TRUE;

    foreach (array_reverse($vids) as $vid) {
      /** @var \Drupal\client_side_file_crypto\KeyStorageInterface $revision */
      $revision = $key_storage_storage->loadRevision($vid);
      // Only show revisions that are affected by the language that is being
      // displayed.
      if ($revision->hasTranslation($langcode) && $revision->getTranslation($langcode)->isRevisionTranslationAffected()) {
        $username = [
          '#theme' => 'username',
          '#account' => $revision->getRevisionUser(),
        ];

        // Use revision link to link to revisions that are not active.
        $date = \Drupal::service('date.formatter')->format($revision->getRevisionCreationTime(), 'short');
        if ($vid != $key_storage->getRevisionId()) {
          $link = $this->l($date, new Url('entity.key_storage.revision', ['key_storage' => $key_storage->id(), 'key_storage_revision' => $vid]));
        }
        else {
          $link = $key_storage->link($date);
        }

        $row = [];
        $column = [
          'data' => [
            '#type' => 'inline_template',
            '#template' => '{% trans %}{{ date }} by {{ username }}{% endtrans %}{% if message %}<p class="revision-log">{{ message }}</p>{% endif %}',
            '#context' => [
              'date' => $link,
              'username' => \Drupal::service('renderer')->renderPlain($username),
              'message' => ['#markup' => $revision->getRevisionLogMessage(), '#allowed_tags' => Xss::getHtmlTagList()],
            ],
          ],
        ];
        $row[] = $column;

        if ($latest_revision) {
          $row[] = [
            'data' => [
              '#prefix' => '<em>',
              '#markup' => $this->t('Current revision'),
              '#suffix' => '</em>',
            ],
          ];
          foreach ($row as &$current) {
            $current['class'] = ['revision-current'];
          }
          $latest_revision = FALSE;
        }
        else {
          $links = [];
          if ($revert_permission) {
            $links['revert'] = [
              'title' => $this->t('Revert'),
              'url' => $has_translations ?
              Url::fromRoute('entity.key_storage.translation_revert', ['key_storage' => $key_storage->id(), 'key_storage_revision' => $vid, 'langcode' => $langcode]) :
              Url::fromRoute('entity.key_storage.revision_revert', ['key_storage' => $key_storage->id(), 'key_storage_revision' => $vid]),
            ];
          }

          if ($delete_permission) {
            $links['delete'] = [
              'title' => $this->t('Delete'),
              'url' => Url::fromRoute('entity.key_storage.revision_delete', ['key_storage' => $key_storage->id(), 'key_storage_revision' => $vid]),
            ];
          }

          $row[] = [
            'data' => [
              '#type' => 'operations',
              '#links' => $links,
            ],
          ];
        }

        $rows[] = $row;
      }
    }

    $build['key_storage_revisions_table'] = [
      '#theme' => 'table',
      '#rows' => $rows,
      '#header' => $header,
    ];

    return $build;
  }

}
