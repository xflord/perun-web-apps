/// <reference types="cypress" />

describe('Resource management with role Resource self service', () => {
  const dbVoName = 'test-e2e-vo-from-db-6';
  const dbResourceName = 'test-e2e-resource-from-db-4';

  const dbGroupToAssign = 'test-e2e-group-from-db-9';
  const dbGroupToRemove = 'test-e2e-group-from-db-8';
  const dbGroupToActivate = 'test-e2e-group-from-db-7';
  const dbGroupToDeactivate = 'test-e2e-group-from-db-6';


  before(() => {
    cy.login('RESOURCE_SELF_SERVICE', 'resourceSelfService');
  });

  beforeEach(() => {
    cy.visit('home')
      .get(`[data-cy=access-item-button]`)
      .click()
      .get('[data-cy=filter-input]')
      .type(dbVoName, {force: true})
      .get(`[data-cy=${dbVoName}]`)
      .click()
      .get(`[data-cy=resource-list]`)
      .click()
      .get('[data-cy=filter-input]')
      .type(dbResourceName, {force: true})
      .get(`[data-cy=${dbResourceName}]`)
      .click()
      .get('[data-cy=assigned-groups]')
      .click();
  });

  it('test assign group to resource', () => {
    cy.get('[data-cy=add-group-button]')
      .should('have.attr', 'color', 'accent') // check if the button is enabled (due to the force click below)
      .click({ force: true })
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
      .get('[data-cy=filter-input]')
      .type(dbGroupToAssign, {force: true})
      .get(`[data-cy=${dbGroupToAssign}-checkbox]`)
      .should('exist');
  });

  it('test remove group from resource', () => {
    cy.get('[data-cy=filter-input]')
      .type(dbGroupToRemove, {force: true})
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

  it('test activate group resource assignment', () => {
    cy.get('[data-cy=filter-input]')
      .type(dbGroupToActivate, {force: true})
      .get(`[data-cy=${dbGroupToActivate}-inactive]`)
      .click()
      .intercept('**/resourcesManager/activateGroupResourceAssignment**')
      .as('activateGroupResourceAssignment')
      .get('[data-cy=change-status-button]')
      .click()
      .wait('@activateGroupResourceAssignment')

      //  assert that group is active
      .get(`[data-cy=${dbGroupToActivate}-active]`)
      .should('exist');
  });

  it('test deactivate group resource assignment', () => {
    cy.get('[data-cy=filter-input]')
      .type(dbGroupToDeactivate, {force: true})
      .get(`[data-cy=${dbGroupToDeactivate}-active]`)
      .click()
      .intercept('**/resourcesManager/deactivateGroupResourceAssignment**')
      .as('deactivateGroupResourceAssignment')
      .get('[data-cy=change-status-button]')
      .click()
      .wait('@deactivateGroupResourceAssignment')

      //  assert that group is inactive
      .get(`[data-cy=${dbGroupToDeactivate}-inactive]`)
      .should('exist');
  });
});
