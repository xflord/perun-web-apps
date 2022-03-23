/// <reference types="cypress" />

context('Actions', () => {
  const dbGroupName = 'test-group-from-db-2';
  const dbSubGroupName = 'subgroup';
  const dbApplicationItemTextFieldName = 'input-test';
  const dbUser = 'test2';
  const dbGroupManager = 'group-manager-2';
  const addedAttribute = 'mail-footer';
  const dbGroupAttribute = 'notification-default-language';

  before(() => {
    if (Cypress.env('BA_USERNAME_GROUP_MANAGER')) {
      sessionStorage.setItem('baPrincipal', '{"name": "groupManager"}');
      sessionStorage.setItem('basicUsername', Cypress.env('BA_USERNAME_GROUP_MANAGER'));
      sessionStorage.setItem('basicPassword', Cypress.env('BA_PASSWORD_GROUP_MANAGER'));
      cy.visit('service-access');
    }
  });

  beforeEach(() => {
    cy.visit('home')
      .get(`[data-cy=${dbGroupName}]`)
      .click();
  });

  it('test create subgroup', () => {

    cy.intercept('**/groupsManager/createGroup/**').as('createGroup')
      .get(`[data-cy=subgroups]`)
      .click()
      .get('[data-cy=new-subgroup-button]')
      .click()
      .get('[data-cy=group-name]')
      .type('test-group')
      .get('[data-cy=group-description]')
      .type('test-group-description')
      .intercept('**/groupsManager/getAllRichSubGroupsWithAttributesByNames**').as('getRichSubGroups')
      .get('[data-cy=create-group-button-dialog]')
      .click()
      .wait('@createGroup')
      .wait('@getRichSubGroups')
      // assert that group was created
      .get('[data-cy=test-group-checkbox]')
      .should('exist')
    });

  it('test remove subgroup', () => {

    cy.intercept('**/groupsManager/deleteGroups').as('deleteGroups')
      .get('[data-cy=subgroups]')
      .click()
      .get(`[data-cy=${dbSubGroupName}-checkbox]`)
      .click()
      .get('[data-cy=delete-group-button]')
      .click()
      .get('[data-cy=delete-button-dialog]')
      .click()
      .wait('@deleteGroups')
      .intercept('**/groupsManager/getAllRichSubGroupsWithAttributesByNames**').as('getRichSubGroups')
      .wait('@getRichSubGroups')
      // assert that group was deleted
      .get(`[data-cy=${dbSubGroupName}-checkbox]`)
      .should('not.exist')
  });

  it('test add attribute', () => {

    cy.intercept('**/attributesManager/setAttributes/**').as('setAttributes')
      .get('[data-cy=attributes]')
      .click()
      .get('[data-cy=add-attributes]')
      .click()
      .get('[data-cy=filter-attributes]')
      .type('footer')
      .get(`[data-cy=${addedAttribute}-value]`)
      .type('test')
      .get('[data-cy=save-selected-attributes]')
      .click()
      .wait('@setAttributes')
      .intercept('**/attributesManager/getAttributes/g**').as('getAttributes')
      .wait('@getAttributes')
      // assert that attribute exists
      .get(`[data-cy=${addedAttribute}-value]`)
      .should('exist')
  });

  it('test delete attribute', () => {

    cy.intercept('**/attributesManager/removeAttributes/**').as('removeAttributes')
      .get('[data-cy=attributes]')
      .click()
      .get(`[data-cy=${dbGroupAttribute}-checkbox]`)
      .click()
      .get('[data-cy=remove-attributes]')
      .click()
      .intercept('**/attributesManager/getAttributes/g**').as('getAttributes')
      .get('[data-cy=delete-attributes]')
      .click()
      .wait('@removeAttributes')
      .wait('@getAttributes')
      // assert that attribute exists
      .get(`[data-cy=${dbGroupAttribute}-checkbox]`)
      .should('not.exist')
  });

  it('test add group member', () => {

    cy.intercept('**/groupsManager/addMember**').as('addMember')
      .get('[data-cy=members]')
      .click()
      .get('[data-cy=add-members]')
      .click()
      .get('[data-cy=search-members]')
      .type(`${dbUser}`)
      .get('[data-cy=search-button]')
      .click()
      .get(`[data-cy=${dbUser}-checkbox]`)
      .click()
      .get('[data-cy=add-button]')
      .click()
      .wait('@addMember')
      .intercept('**/membersManager/getMembersPage').as('getMembers')
      .wait('@getMembers')
      // assert that member was created
      .get(`[data-cy=${dbUser}-checkbox]`)
      .should('exist')
  });

  it('test remove group member', () => {

    cy.intercept('**/groupsManager/removeMember**').as('removeMember')
      .get('[data-cy=members]')
      .click()
      .get(`[data-cy=${dbGroupManager}-checkbox]`)
      .click()
      .get('[data-cy=remove-members]')
      .click()
      .get('[data-cy=remove-members-dialog]')
      .click()
      .wait('@removeMember')
      .intercept('**/membersManager/getMembersPage').as('getMembers')
      .wait('@getMembers')
      // assert that member was removed
      .get(`[data-cy=${dbGroupManager}-checkbox]`)
      .should('not.exist')
  });

  it('test create group application form item', () => {

    cy.intercept('**/registrarManager/updateFormItems/**').as('addFormItem')
      .get('[data-cy=advanced-settings]')
      .click()
      .get('[data-cy=application-form]')
      .click()
      .get('[data-cy=add-form-item]')
      .click()
      .get('[data-cy=item-short-name]')
      .type('Header')
      .get('[data-cy=add-form-item-button-dialog]')
      .click()
      .get('[data-cy=edit-form-item-button-dialog]')
      .click()
      .intercept('**/registrarManager/getFormItems/group**').as('getAttributes')
      .get('[data-cy=save-application-form]')
      .click()
      .wait('@getAttributes')
      .wait('@addFormItem')
      .get('[data-cy=refresh-button]')
      .click()
      // assert that form item exists
      .wait('@getAttributes')
      .get('[data-cy=header-delete]')
      .should('exist')
    });

  it('test delete group application form item', () => {
    cy.intercept('**/registrarManager/updateFormItems/**').as('deleteFormItem')
      .get('[data-cy=advanced-settings]')
      .click()
      .get('[data-cy=application-form]')
      .click()
      .get(`[data-cy=${dbApplicationItemTextFieldName}-delete]`)
      .click()
      .intercept('**/registrarManager/getFormItems/group**').as('getGroupFormItems')
      .get('[data-cy=delete-application-form-item-dialog]')
      .click()
      .get('[data-cy=save-application-form]')
      .click()
      .wait('@deleteFormItem')
      .wait('@getGroupFormItems')
      .get('[data-cy=refresh-button]')
      .click()
      .wait('@getGroupFormItems')
      // assert that form item doesn't exist
      .get(`[data-cy=${dbApplicationItemTextFieldName}-delete]`)
      .should('not.exist')
  });

  it('test add group manager', () => {

    cy.intercept('**/authzResolver/setRole/**').as('setRole')
      .get('[data-cy=advanced-settings]')
      .click()
      .get('[data-cy=managers]')
      .click()
      .get('[data-cy=add-manager-button]')
      .click()
      .get('[data-cy=search-manager-input]')
      .type(`${dbUser}`)
      .get('[data-cy=search-manager-button]')
      .click()
      .get(`[data-cy=${dbUser}-checkbox]`)
      .click()
      .intercept('**/authzResolver/getRichAdmins**').as('getRichAdmins')
      .get('[data-cy=add-manager-button-dialog]')
      .click()
      .wait('@setRole')
      .wait('@getRichAdmins')
      // assert that manager was added
      .get(`[data-cy=${dbUser}-checkbox]`)
      .should('exist')
  });

  it('test remove group manager', () => {

    cy.intercept('**/authzResolver/unsetRole/**').as('unsetRole')
      .get('[data-cy=advanced-settings]')
      .click()
      .get('[data-cy=managers]')
      .click()
      .get(`[data-cy=${dbGroupManager}-checkbox]`)
      .click()
      .get('[data-cy=remove-manager-button]')
      .click()
      .intercept('**/authzResolver/getRichAdmins**').as('getRichAdmins')
      .get('[data-cy=remove-manager-button-dialog]')
      .click()
      .wait('@unsetRole')
      .wait('@getRichAdmins')
      // assert that manager doesn't exist
      .get(`[data-cy=${dbGroupManager}-checkbox]`)
      .should('not.exist')
  });
});
