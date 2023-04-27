/// <reference types="cypress" />

describe('Group management with role Top group creator', () => {
  const dbVoName = 'test-e2e-vo-from-db-4';
  const groupName = 'test';

  before(() => {
    cy.login('TOP_GROUP_CREATOR', 'topGroupCreator');
  });

  beforeEach(() => {
    cy.visit('home')
      .get(`[data-cy=access-item-button]`)
      .click()
      .get('[data-cy=auto-focused-filter]')
      .type(dbVoName, {force: true})
      .get(`[data-cy=${dbVoName}]`)
      .click()
      .get(`[data-cy=groups]`)
      .click()
  })

  it( 'test create top group', () => {
    cy.intercept('**/groupsManager/createGroup/**').as('createGroup')
      .get('[data-cy=create-group-button]')
      .click()
      .get('[data-cy=group-name]')
      .type(groupName, {force: true})
      .get('[data-cy=create-group-button-dialog]')
      .click()
      .wait('@createGroup')
      .intercept('**/groupsManager/getAllRichGroupsWithAttributesByNames**').as('getRichGroups')
      .wait('@getRichGroups')

      // assert that top group was created
      .get('[data-cy=filter-input]')
      .type(groupName, {force: true})
      .get(`[data-cy=${groupName}-checkbox]`)
      .should('exist');
  });

})
