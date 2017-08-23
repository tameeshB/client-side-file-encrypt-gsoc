<?php

namespace \Drupal\Tests\client_side_file_crypto\FunctionalJavascript;

use \Drupal\FunctionalJavascriptTests\JavascriptTestBase;

/**
 * Tests RESTResource functionality.
 *
 * @group client_side_file_crypto
 */
class KeyGenTest extends JavascriptTestBase {

  /**
   * {@inheritdoc}
   */
  public static $modules = ['node', 'client_side_file_crypto'];

  /**
   * {@inheritdoc}
   */
  protected function setUp() {
    parent::setUp();

    // Create a user with permissions to manage.
    $permissions = [
      'administer site configuration',
    ];
    $account = $this->drupalCreateUser($permissions);

    // Initiate user session.
    $this->drupalLogin($account);
  }
  /**
   * Tests enabling a resource and accessing it.
   */
  public function testConsumers() {
  	// Check that user can access the administration interface.
    $this->assertEquals(200, $this->getSession()->getStatusCode());
    $this->assertSession()->assertWaitOnAjaxRequest();
    $page = $this->getSession()->getPage();
    $this->assertSession()->pageTextContains('Key generated.');
    

  }
}