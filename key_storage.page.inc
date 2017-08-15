<?php

/**
 * @file
 * Contains key_storage.page.inc.
 *
 * Page callback for Key storage entities.
 */

use Drupal\Core\Render\Element;

/**
 * Prepares variables for Key storage templates.
 *
 * Default template: key_storage.html.twig.
 *
 * @param array $variables
 *   An associative array containing:
 *   - elements: An associative array containing the user information and any
 *   - attributes: HTML attributes for the containing element.
 */
function template_preprocess_key_storage(array &$variables) {
  // Fetch KeyStorage Entity Object.
  $key_storage = $variables['elements']['#key_storage'];

  // Helpful $content variable for templates.
  foreach (Element::children($variables['elements']) as $key) {
    $variables['content'][$key] = $variables['elements'][$key];
  }
}
