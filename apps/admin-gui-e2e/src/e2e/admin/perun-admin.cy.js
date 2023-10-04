/// <reference types="cypress" />

describe('Perun admin management with role Perun admin', () => {
  const dbAttrFriendlyName = 'perunAdminTestAttr';
  const dbServiceName = 'test_service_db';
  const dbServiceName2 = 'test_service_db2';
  const dbExtSourceName = 'test_ext_source_db';
  const dbConsentHubName = 'test-e2e-facility-from-db-3';
  const dbOwnerName = 'DbOwnerTest';
  const loginToBlock = "testLoginToBlock"
  const dbBlockedLogin = "test_blocking_login"
  const dbBlockedLoginListOnly = "test_blocking_login_list"

  const dbSearcherAttrDisplayName = 'login-namespace:einfra';
  const dbSearcherAttrValue = 'e2etestlogin';
  const dbSearcherUserFirstName = 'Test6';

  before(() => {
    cy.login('', 'perun');
  });

  beforeEach(() => {
    cy.visit('home')
      .get('[data-cy=admin-button]')
      .click();
  });

  context('Attribute definitions', () => {
    beforeEach(() => {
      cy.get('[data-cy=attribute-definitions]')
        .click()
    });

    it('test attribute detail', () => {
      cy.get('[data-cy=filter-input]')
        .type(dbAttrFriendlyName, {force: true})
        .get(`[data-cy=${dbAttrFriendlyName.toLowerCase()}-friendly-name]`)
        .click()
        .get('[data-cy=display-name-input]')
        .should('have.value', dbAttrFriendlyName);
    });

    it('test create attribute', () => {
      cy.intercept('**/attributesManager/createAttribute**')
        .as('createAttribute')
        .intercept('**/attributesManager/getAttributesDefinition**')
        .as('getAttributesDefinition')
        .get('[data-cy=new-attr-definition-button]')
        .click({force: true})
        .get('[data-cy=attribute-entity-input]')
        .click()
        .get('mat-option')
        .contains('facility')
        .click()
        .get('[data-cy=attribute-value-type-input]')
        .click()
        .get('mat-option')
        .contains('Integer')
        .click()
        .get('[data-cy=attribute-definition-type-input]')
        .click()
        .get('mat-option')
        .contains('def')
        .click()
        .get('[data-cy=attribute-friendly-name-input]')
        .type('testAttrE2E', {force: true})
        .get('[data-cy=attribute-display-name-input]')
        .type('testAttrE2E', {force: true})
        .get('[data-cy=attribute-description-input]')
        .type('test attribute for E2E tests', {force: true})
        .get('[data-cy=checkbox-read-operation]')
        .click()
        .get('[data-cy=checkbox-read-critical]')
        .click()
        .get('[data-cy=create-attr-definition-button]')
        .click()
        .wait('@createAttribute')
        .wait('@getAttributesDefinition')
        // assert that attribute exists
        .get('[data-cy=filter-input]')
        .type('testAttrE2E', {force: true})
        .get('[data-cy=testattre2e-checkbox]')
        .should('exist');
    });

    it('test delete attribute', () => {
      cy.intercept('**/attributesManager/deleteAttributes**')
        .as('deleteAttributes')
        .intercept('**/attributesManager/getAttributesDefinition**')
        .as('getAttributesDefinition')
        .get('[data-cy=filter-input]')
        .type('e2eTestAttrFromDb', {force: true})
        .get('[data-cy=e2e-test-attr-from-db-checkbox]')
        .click()
        .get('[data-cy=delete-attr-definition-button]')
        .click()
        .get('[data-cy=confirm-delete-attr-definition-button]')
        .click()
        .wait('@deleteAttributes')
        .wait('@getAttributesDefinition')
        // assert that attribute doesn't exist
        .get(`[data-cy=e2e-test-attr-from-db-checkbox]`)
        .should('not.exist');
    });
  });

  it('test change users name', () => {
    cy.intercept('**/usersManager/updateUser**')
      .as('updateUser')
      .intercept('**/usersManager/getUserById**')
      .as('getUserById')
      .get('[data-cy=users]')
      .click()
      .get('[data-cy=filter-input]')
      .type('test5', {force: true})
      .intercept('**/usersManager/getUsersPage')
      .as('getUsers')
      .wait('@getUsers')
      .get('[data-cy=test5-td]')
      .click({force: true})
      .get('[data-cy=edit-user-button]')
      .click({force: true})
      .get('[data-cy=user-first-name-input]')
      .clear()
      .type('Test555', {force: true})
      .get('[data-cy=user-save-button]')
      .click()
      .wait('@updateUser')
      .wait('@getUserById')
      // assert that the name changed
      .get('[data-cy=user-name-link]')
      .contains('Test555 User14');
  });

  context('Services', () => {
    beforeEach(() => {
      cy.get('[data-cy=services]')
        .click()
    });

    it('test create service', () => {
      cy.intercept('**/servicesManager/createService**')
        .as('createService')
        .intercept('**/servicesManager/getServices**')
        .as('getServices')
        .get('[data-cy=service-create-button]')
        .click({force: true})
        .get('[data-cy=service-name-input]')
        .type('e2e_test_service', {force: true})
        .get('[data-cy=service-description-input]')
        .type('testing service', {force: true})
        .get('[data-cy=service-create-edit-dialog-button]')
        .click()
        .wait('@createService')
        .wait('@getServices')
        // assert that service exists
        .get('[data-cy=filter-input]')
        .type('e2e_test_service', {force: true})
        .get('[data-cy=e2e_test_service-checkbox]')
        .should('exist');
    });

    it('test delete service', () => {
      cy.intercept('**/servicesManager/deleteService**')
        .as('deleteService')
        .intercept('**/servicesManager/getServices**')
        .as('getServices')
        .get('[data-cy=filter-input]')
        .type(dbServiceName, {force: true})
        .get(`[data-cy=${dbServiceName.toLowerCase()}-checkbox]`)
        .click()
        .get('[data-cy=service-delete-button]')
        .click({force: true})
        .get('[data-cy=delete-button-dialog]')
        .click()
        .wait('@deleteService')
        .wait('@getServices')
        // assert that service doesn't exist
        .get(`[data-cy=${dbServiceName.toLowerCase()}-checkbox]`)
        .should('not.exist');
    });

    it('test rename service', () => {
      cy.intercept('**/servicesManager/updateService**')
        .as('updateService')
        .intercept('**/servicesManager/getServiceById**')
        .as('getServiceById')
        .get('[data-cy=filter-input]')
        .type(dbServiceName2, {force: true})
        .get(`[data-cy=${dbServiceName2.toLowerCase()}-name-td]`)
        .click()
        .get('[data-cy=service-edit-button]')
        .click({force: true})
        .get('[data-cy=service-name-input]')
        .clear()
        .type(dbServiceName2 + 'edit', {force: true})
        .get('[data-cy=service-create-edit-dialog-button]')
        .click()
        .wait('@updateService')
        .wait('@getServiceById')
        // assert that service is renamed
        .get(`[data-cy=service-name-link]`)
        .contains(dbServiceName2 + 'edit');
    });
  });

  context('Blocked logins management', () => {
    beforeEach(() => {
      cy.get('[data-cy=blocked-logins]')
        .click();
    });

    it("test get blocked login", () => {
      cy.get('[data-cy=filter-input]')
        .type(dbBlockedLoginListOnly, {force: true})
        .get(`[data-cy=${dbBlockedLoginListOnly}-checkbox]`)
        .should('exist');
    })

    it('test block login', () => {
      cy.intercept('**/usersManager/blockLogins**')
        .as('blockLogin')
        .intercept('**/usersManager/getBlockedLoginsPage**')
        .as('getBlockedLogins')
        .get('[data-cy=block-logins-button]')
        .click({force: true})
        .get('[data-cy=logins-input]')
        .type(loginToBlock, {force: true})
        .get('[data-cy=submit-blocked-logins-button]')
        .click()
        .wait('@blockLogin')
        .wait('@getBlockedLogins')
        // assert that the login is listed as blocked
        .get('[data-cy=filter-input]')
        .type(loginToBlock, {force: true})
        .get(`[data-cy=${loginToBlock}-checkbox]`)
        .should('exist');
    });

    it('test unblock login', () => {
      cy.intercept('**/usersManager/unblockLoginsById**')
        .as('unblockLogins')
        .intercept('**/usersManager/getBlockedLoginsPage**')
        .as('getBlockedLogins')
        .get('[data-cy=filter-input]')
        .type(dbBlockedLogin, {force: true})
        .get(`[data-cy=${dbBlockedLogin}-checkbox]`)
        .click()
        .get('[data-cy=unblock-logins-button]')
        .click({force: true})
        .get('[data-cy=unblock-button-dialog]')
        .click()
        .wait('@unblockLogins')
        .wait('@getBlockedLogins')
        // assert that the login is no longer listed as blocked
        .get(`[data-cy=${dbBlockedLogin}-checkbox]`)
        .should('not.exist');
    });
  });

  it('test list ext sources', () => {
    cy.get('[data-cy=external-sources]')
      .click()
      .get('[data-cy=filter-input]')
      .type(dbExtSourceName, {force: true})
      .get(`[data-cy=${dbExtSourceName.toLowerCase()}-name-td]`)
      .should('exist');
  });

  it('test audit message detail', () => {
    cy.get('[data-cy=audit-log]')
      .click()
      .get(`[data-cy=audit-message-detail-button]`)
      .first()
      .click({force: true})
      .get('#mat-tab-label-0-1') // click on Message tab
      .click()
      .get(`[data-cy=audit-message-text]`)
      .should('not.be.empty');
  });

  it('test list consent hubs', () => {
    cy.get('[data-cy=consent-hubs]')
      .click()
      .get('[data-cy=filter-input]')
      .type(dbConsentHubName, {force: true})
      .get(`[data-cy=${dbConsentHubName.toLowerCase()}-name-td]`)
      .should('exist');
  });

  it('test search attribute', () => {
    cy.get('[data-cy=searcher]')
      .click()
      .get(`[data-cy=filter-input]`)
      .type(dbSearcherAttrValue, {force: true})
      .get(`[data-cy=search-select-input]`)
      .click()
      .get('[data-cy=find-input] > div > input')
      .type(dbSearcherAttrDisplayName, {force: true})
      .get('mat-option')
      .contains(dbSearcherAttrDisplayName)
      .click()
      .get('[data-cy=searcher-search-button]')
      .click()
      .get(`[data-cy=${dbSearcherUserFirstName.toLowerCase()}-firstName-td]`)
      .should('exist');
  });

  it('test list owners', () => {
    cy.get('[data-cy=owners]')
      .click()
      .get('[data-cy=filter-input]')
      .type(dbOwnerName, {force: true})
      .get(`[data-cy=${dbOwnerName}]`)
      .should('exist');
  });
});
