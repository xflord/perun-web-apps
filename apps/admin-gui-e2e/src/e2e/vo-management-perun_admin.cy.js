/// <reference types="cypress" />

context('Actions', () => {
  const dbVoName = 'test-e2e-vo-from-db';
  const dbGroupName = 'test-group-from-db';
  const dbApplicationItemTextFieldName = 'input-test';
  const dbVoManager = 'vo-manager-2';
  const dbUser = 'test';

  const addedAttribute = 'notification-default-language';

  before(() => {
    if (Cypress.env('BA_USERNAME_VO_MANAGER')) {
      sessionStorage.setItem('baPrincipal', '{"name": "voManager"}');
      sessionStorage.setItem('basicUsername', Cypress.env('BA_USERNAME_VO_MANAGER'));
      sessionStorage.setItem('basicPassword', Cypress.env('BA_PASSWORD_VO_MANAGER'));
      cy.visit('service-access');
    }
  });

  beforeEach(() => {
    cy.visit('home')
      .get(`[data-cy=access-item-button]`)
      .click()
  });

  it('test create vo', () => {
    cy.intercept('**/vosManager/createVo/**')
      .as('createVo')
      .intercept('**/vosManager/getEnrichedVoById**')
      .as('getVoById')
      .get('[data-cy=new-vo-button]')
      .click()
      .get('[data-cy=vo-name-input]')
      .type('test-e2e-vo', {force: true})
      .get('[data-cy=vo-shortname-input]')
      .type('test-e2e-vo', {force: true})
      .get('[data-cy=create-vo-button]')
      .click()
      .wait('@createVo')
      .wait('@getVoById')
      // assert that the vo was created
      .get('[data-cy=notification-message]')
      .contains('New organization was successfully created')
      .should('exist');
  });

  it('test add attribute', () => {
    cy.intercept('**/attributesManager/setAttributes/vo')
      .as('setAttributes')
      .get('[data-cy=auto-focused-filter]')
      .type(dbVoName, {force: true})
      .get(`[data-cy=${dbVoName}]`)
      .click()
      .get('[data-cy=attributes]')
      .click()
      .get('[data-cy=add-attributes]')
      .click()
      // get attribute Notification default language
      .get(`[data-cy=${addedAttribute}-value]`)
      .type('en', {force: true})
      .intercept('**/attributesManager/getAttributes/vo**')
      .as('getAttributes')
      .get('[data-cy=save-selected-attributes]')
      .click()
      .wait('@setAttributes')
      .wait('@getAttributes')
      // assert that attribute exists
      .get('[data-cy=unfocused-filter]')
      .type('notification default language', {force: true})
      .get(`[data-cy=${addedAttribute}-value]`)
      .should('exist');
  });

  it('test delete attribute', () => {
    cy.intercept('**/attributesManager/removeAttributes/**')
      .as('removeAttributes')
      .get('[data-cy=auto-focused-filter]')
      .type(dbVoName, {force: true})
      .get(`[data-cy=${dbVoName}]`)
      .click()
      .get('[data-cy=attributes]')
      .click()
      // get attribute Link to AUP
      .get('[data-cy=unfocused-filter]')
      .type('link to aup', {force: true})
      .get('[data-cy=link-to-aup-checkbox]')
      .click()
      .get('[data-cy=remove-attributes]')
      .click()
      .intercept('**/attributesManager/getAttributes/vo**')
      .as('getAttributes')
      .get('[data-cy=delete-attributes]')
      .click()
      .wait('@removeAttributes')
      .wait('@getAttributes')
      // assert that attribute exists
      .get('[data-cy=link-to-aup-checkbox]')
      .should('not.exist');
  });

  it('test add vo member', () => {
    cy.intercept('**/membersManager/addMemberCandidates')
      .as('addMemberCandidates')
      .get('[data-cy=auto-focused-filter]')
      .type(dbVoName, {force: true})
      .get(`[data-cy=${dbVoName}]`)
      .click()
      .get('[data-cy=members]')
      .click()
      .get('[data-cy=add-members]')
      .should('have.attr', 'color', 'accent') // check if the button is enabled (due to the force click below)
      .click({ force: true })
      .get('[data-cy=search-members]')
      .find('[data-cy=filter-input]')
      .type(`${dbUser}`, {force: true})
      .get(`[data-cy=${dbUser}-checkbox]`)
      .click()
      .intercept('**/membersManager/getMembersPage')
      .as('getMembers')
      .get('[data-cy=add-button]')
      .click()
      .wait('@addMemberCandidates')
      .wait('@getMembers')
      // assert that member was created
      .get('[data-cy=filter-input]')
      .type(dbUser, {force: true})
      .get(`[data-cy=${dbUser}-checkbox]`)
      .should('exist');
  });

  it('test remove vo member', () => {
    cy.intercept('**/membersManager/deleteMembers**')
      .as('deleteMembers')
      .get('[data-cy=auto-focused-filter]')
      .type(dbVoName, {force: true})
      .get(`[data-cy=${dbVoName}]`)
      .click()
      .get('[data-cy=members]')
      .click()
      .get('[data-cy=filter-input]')
      .type(dbVoManager, {force: true})
      .intercept('**/membersManager/getMembersPage')
      .as('getMembers')
      .wait('@getMembers')
      .get(`[data-cy=${dbVoManager}-checkbox]`)
      .click()
      .get('[data-cy=remove-members]')
      .should('have.attr', 'color', 'warn') // check if the button is enabled (due to the force click below)
      .click({ force: true })
      .get('[data-cy=remove-members-dialog]')
      .click()
      .wait('@deleteMembers')
      .wait('@getMembers')
      // assert that member was removed
      .get(`[data-cy=${dbVoManager}-checkbox]`)
      .should('not.exist');
  });

  it('test add group', () => {
    cy.intercept('**/groupsManager/createGroup/**')
      .as('createGroup')
      .get('[data-cy=auto-focused-filter]')
      .type(dbVoName, {force: true})
      .get(`[data-cy=${dbVoName}]`)
      .click()
      .get('[data-cy=groups]')
      .click()
      .get('[data-cy=create-group-button]')
      .click()
      .get('[data-cy=group-name]')
      .type('test-group', {force: true})
      .get('[data-cy=group-description]')
      .type('test-group-description', {force: true})
      .get('[data-cy=create-group-button-dialog]')
      .click()
      .wait('@createGroup')
      .intercept('**/groupsManager/getAllRichGroupsWithAttributesByNames**')
      .as('getGroups')
      .wait('@getGroups')
      // assert that group was created
      .get('[data-cy=filter-input]')
      .type('test-group', {force: true})
      .get('[data-cy=test-group-checkbox]')
      .should('exist');
  });

  it('test remove group', () => {
    cy.intercept('**/groupsManager/deleteGroups')
      .as('deleteGroups')
      .get('[data-cy=auto-focused-filter]')
      .type(dbVoName, {force: true})
      .get(`[data-cy=${dbVoName}]`)
      .click()
      .get('[data-cy=groups]')
      .click()
      .get('[data-cy=filter-input]')
      .type(dbGroupName, {force: true})
      .get(`[data-cy=${dbGroupName}-checkbox]`)
      .click()
      .get('[data-cy=delete-group-button]')
      .click()
      .get('[data-cy=delete-button-dialog]')
      .click()
      .wait('@deleteGroups')
      .intercept('**/groupsManager/getAllRichGroupsWithAttributesByNames**')
      .as('getGroups')
      .wait('@getGroups')
      // assert that group was deleted
      .get(`[data-cy=${dbGroupName}-checkbox]`)
      .should('not.exist');
  });

  it('test create vo application form item', () => {
    cy.intercept('**/registrarManager/updateFormItems/**')
      .as('addFormItem')
      .get('[data-cy=auto-focused-filter]')
      .type(dbVoName, {force: true})
      .get(`[data-cy=${dbVoName}]`)
      .click()
      .get('[data-cy=advanced-settings]')
      .click()
      .get('[data-cy=application-form]')
      .click()
      .get('[data-cy=add-form-item]')
      .click()
      .get('[data-cy=item-short-name]')
      .type('Header', {force: true})
      .get('[data-cy=add-form-item-button-dialog]')
      .click()
      .get('[data-cy=edit-form-item-button-dialog]')
      .click()
      .intercept('**/registrarManager/getFormItems/vo**')
      .as('getFormItems')
      .get('[data-cy=save-application-form]')
      .click()
      .wait('@addFormItem')
      .wait('@getFormItems')
      .get('[data-cy=refresh-button]')
      .click()
      .wait('@getFormItems')
      // assert that form item exists
      .get('[data-cy=header-delete]')
      .should('exist');
  });

  it('test delete vo application form item', () => {
    cy.intercept('**/registrarManager/updateFormItems/**')
      .as('deleteFormItem')
      .intercept('**/registrarManager/getFormItems/vo**')
      .as('getFormItems')
      .get('[data-cy=auto-focused-filter]')
      .type(dbVoName, {force: true})
      .get(`[data-cy=${dbVoName}]`)
      .click()
      .get('[data-cy=advanced-settings]')
      .click()
      .get('[data-cy=application-form]')
      .click()
      .wait('@getFormItems')
      .get(`[data-cy=${dbApplicationItemTextFieldName}-delete]`)
      .click()
      .get('[data-cy=delete-application-form-item-dialog]')
      .click()
      .get('[data-cy=save-application-form]')
      .click()
      .wait('@deleteFormItem')
      .get('[data-cy=refresh-button]')
      .click()
      // assert that form item doesn't exist
      .get(`[data-cy=${dbApplicationItemTextFieldName}-delete]`)
      .should('not.exist');
  });

  it('test add vo manager', () => {
    cy.intercept('**/authzResolver/setRole/**')
      .as('setRole')
      .get('[data-cy=auto-focused-filter]')
      .type(dbVoName, {force: true})
      .get(`[data-cy=${dbVoName}]`)
      .click()
      .get('[data-cy=advanced-settings]')
      .click()
      .get('[data-cy=managers]')
      .click()
      .get('[data-cy=add-manager-button]')
      .click()
      .get('[data-cy=search-manager-input]')
      .type(`${dbUser}`, {force: true})
      .get('[data-cy=search-manager-button]')
      .click()
      .get(`[data-cy=${dbUser}-checkbox]`)
      .click()
      .get('[data-cy=add-manager-button-dialog]')
      .click()
      .intercept('**/authzResolver/getRichAdmins**')
      .as('getRichAdmins')
      .wait('@setRole')
      .wait('@getRichAdmins')
      // assert that manager was added
      .get(`[data-cy=${dbUser}-checkbox]`)
      .should('exist');
  });

  it('test remove vo manager', () => {
    cy.intercept('**/authzResolver/unsetRole/**')
      .as('unsetRole')
      .get('[data-cy=auto-focused-filter]')
      .type(dbVoName, {force: true})
      .get(`[data-cy=${dbVoName}]`)
      .click()
      .get('[data-cy=advanced-settings]')
      .click()
      .get('[data-cy=managers]')
      .click()
      .get(`[data-cy=${dbVoManager}-checkbox]`)
      .click()
      .get('[data-cy=remove-manager-button]')
      .click()
      .intercept('**/authzResolver/getRichAdmins**')
      .as('getRichAdmins')
      .get('[data-cy=remove-manager-button-dialog]')
      .click()
      .wait('@unsetRole')
      .wait('@getRichAdmins')
      // assert that manager doesn't exist
      .get(`[data-cy=${dbVoManager}-checkbox]`)
      .should('not.exist');
  });

  it('test delete vo (perun admin)', () => {
    // change role to perun admin
    sessionStorage.setItem('baPrincipal', '{"name": "perun"}');
    sessionStorage.setItem('basicUsername', Cypress.env('BA_USERNAME'));
    sessionStorage.setItem('basicPassword', Cypress.env('BA_PASSWORD'));
    cy.reload();

    cy.visit('home')
      .get(`[data-cy=access-item-button]`)
      .click()

    cy.intercept('**/vosManager/deleteVo**')
      .as('deleteVo')
      .get('[data-cy=auto-focused-filter]')
      .type(`${dbVoName}`, {force: true})
      .get(`[data-cy=${dbVoName}]`)
      .click({force: true}) // covered by toolbar (header)
      .get('[data-cy=delete-vo]')
      .click({force: true}) // covered by span
      .get('[data-cy=force-delete]')
      .click()
      .get('[data-cy=force-delete-control]')
      .type('DELETE', {force: true})
      .get('[data-cy=force-delete-button]')
      .click()
      .wait('@deleteVo')

      // assert that the delete action was successful
      .get('[data-cy=notification-message]')
      .contains('Organization was successfully removed')
      .should('exist');
  });
});
