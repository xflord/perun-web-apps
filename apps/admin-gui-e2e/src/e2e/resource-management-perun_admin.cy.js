context('Actions', () => {
  const dbVoName = 'test-e2e-vo-from-db-3';
  const dbResourceName = 'test-e2e-resource-from-db-2';

  const dbAddManager = 'test4';
  const dbRemoveManager = 'resource-admin-2';

  const dbAttributeToAdd = 'user-settings-name';
  const dbAttributeToDelete = 'user-settings-description';

  const dbGroupToAssign = 'test-e2e-group-from-db-2';
  const dbGroupToRemove = 'test-e2e-group-from-db-1';

  before(() => {
    if (Cypress.env('BA_USERNAME_RESOURCE_MANAGER')) {
      sessionStorage.setItem('baPrincipal', '{"name": "resourceManager"}');
      sessionStorage.setItem('basicUsername', Cypress.env('BA_USERNAME_RESOURCE_MANAGER'));
      sessionStorage.setItem('basicPassword', Cypress.env('BA_PASSWORD_RESOURCE_MANAGER'));
      cy.visit('service-access');
    }
  });

  beforeEach(() => {
    cy.visit('organizations')
      .get(`[data-cy=${dbVoName}]`)
      .click()
      .get('[data-cy=resources]')
      .click()
      .get('[data-cy=resource-list]')
      .click()
      .get(`[data-cy=${dbResourceName}]`)
      .click();
  });

  it('test add attribute', () => {
    cy.get('[data-cy=attributes]')
      .click()
      .get('[data-cy=add-attributes]')
      .click()
      .get(`[data-cy=${dbAttributeToAdd}-value]`)
      .type('test')
      .intercept('**/attributesManager/getAttributes/r**')
      .as('getAttributes')
      .get('[data-cy=save-selected-attributes]')
      .click()
      .wait('@getAttributes')

      // check that attribute was added
      .get(`[data-cy=${dbAttributeToAdd}-value]`)
      .should('exist');
  });

  it('test delete attribute', () => {
    cy.get('[data-cy=attributes]')
      .click()
      .get(`[data-cy=${dbAttributeToDelete}-checkbox]`)
      .click()
      .get('[data-cy=remove-attributes]')
      .click()
      .intercept('**/attributesManager/getAttributes/r**')
      .as('getAttributes')
      .get('[data-cy=delete-attributes]')
      .click()
      .wait('@getAttributes')

      // check that attribute was deleted
      .get(`[data-cy=${dbAttributeToDelete}-checkbox]`)
      .should('not.exist');
  });

  it('test add resource manager', () => {
    cy.get('[data-cy=advanced-settings]')
      .click()
      .get('[data-cy=managers]')
      .click()
      .get('[data-cy=add-manager-button]')
      .click()
      .get('[data-cy=search-manager-input]')
      .type(`${dbAddManager}`)
      .get('[data-cy=search-manager-button]')
      .click()
      .get(`[data-cy=${dbAddManager}-checkbox]`)
      .click()
      .intercept('**/authzResolver/getRichAdmins**')
      .as('getRichAdmins')
      .get('[data-cy=add-manager-button-dialog]')
      .click()
      .wait('@getRichAdmins')

      // assert that manager was added
      .get(`[data-cy=${dbAddManager}-checkbox]`)
      .should('exist');
  });

  it('test remove resource manager', () => {
    cy.get('[data-cy=advanced-settings]')
      .click()
      .get('[data-cy=managers]')
      .click()
      .get(`[data-cy=${dbRemoveManager}-checkbox]`)
      .click()
      .get('[data-cy=remove-manager-button]')
      .click()
      .intercept('**/authzResolver/getRichAdmins**')
      .as('getRichAdmins')
      .get('[data-cy=remove-manager-button-dialog]')
      .click()
      .wait('@getRichAdmins')

      // assert that manager was removed
      .get(`[data-cy=${dbRemoveManager}-checkbox]`)
      .should('not.exist');
  });

  it('test assign group to resource', () => {
    cy.get('[data-cy=assigned-groups]')
      .click()
      .get('[data-cy=add-group-button]')
      .click()
      .get(`[data-cy=${dbGroupToAssign}-checkbox]`)
      .click()
      .get('[data-cy=next-button]')
      .click()
      .intercept('**/resourcesManager/getGroupAssignments**')
      .as('getGroupAssignments')
      .get('[data-cy=assign-button]')
      .click()
      .wait('@getGroupAssignments')

      //  assert that group was added
      .get(`[data-cy=${dbGroupToAssign}-checkbox]`)
      .should('exist');
  });

  it('test remove group from resource', () => {
    cy.get('[data-cy=assigned-groups]')
      .click()
      .get(`[data-cy=${dbGroupToRemove}-checkbox]`)
      .click()
      .get('[data-cy=remove-group-button]')
      .click()
      .intercept('**/resourcesManager/getGroupAssignments**')
      .as('getGroupAssignments')
      .get('[data-cy=delete-button]')
      .click()
      .wait('@getGroupAssignments')

      //  assert that group was removed
      .get(`[data-cy=${dbGroupToRemove}-checkbox]`)
      .should('not.exist');
  });
});
