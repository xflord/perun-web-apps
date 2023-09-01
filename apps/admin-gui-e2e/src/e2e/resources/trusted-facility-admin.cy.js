/// <reference types="cypress" />

describe('Resource management with role Trusted facility admin', () => {
  const dbVoName = 'test-e2e-vo-from-db-5';
  const dbResourceName = 'test-e2e-resource-from-db-3';
  const dbFacilityName = 'test-e2e-facility-from-db-5';

  const dbGroupToAssign = 'test-e2e-group-from-db-3';
  const dbGroupToRemove = 'test-e2e-group-from-db-4';
  const dbGroupToActivate = 'test-e2e-group-from-db-4';
  const dbGroupToDeactivate = 'test-e2e-group-from-db-5';
  const dbUserToAssignRoles = 'test7';
  const dbUserToRemoveRoles = 'test8';

  before(() => {
    cy.login('TRUSTED_FACILITY_ADMIN', 'trustedFacilityAdmin');
  });

  beforeEach(() => {
    cy.visit('home')
      .get(`[data-cy=facilities-button]`)
      .click()
      .get('[data-cy=filter-input]')
      .type(dbFacilityName, {force: true})
      .get(`[data-cy=${dbFacilityName}]`)
      .click()
      .get('[data-cy=resources]')
      .click()
      .get('[data-cy=filter-input]')
      .type(dbResourceName, {force: true})
      .get(`[data-cy=${dbResourceName}]`)
      .click()
  })

  it( 'test assign group to resource', () => {

    cy.intercept('**/groupsManager/getAllGroups**').as('getAllGroups')
      .get('[data-cy=assigned-groups]')
      .click()
      .get('[data-cy=add-group-button]')
      .should('have.attr', 'color', 'accent') // check if the button is enabled (due to the force click below)
      .click({ force: true })
      .wait('@getAllGroups')
      .get(`[data-cy=${dbGroupToAssign}-checkbox]`)
      .click()
      .get('[data-cy=next-button]')
      .click()
      .intercept('**/resourcesManager/getGroupAssignments**').as('getGroupAssignments')
      .get('[data-cy=assign-button]')
      .click()
      .wait('@getGroupAssignments')

      //  assert that group was added
      .get('[data-cy=filter-input]')
      .type(dbGroupToAssign, {force: true})
      .get(`[data-cy=${dbGroupToAssign}-checkbox]`)
      .should('exist')

  })

  it('test activate group assignment', () => {

    cy.get('[data-cy=assigned-groups]')
      .click()
      .get('[data-cy=filter-input]')
      .type(dbGroupToActivate, {force: true})
      .get(`[data-cy=${dbGroupToActivate}-inactive]`)
      .click()
      .get('[data-cy=change-status-button]')
      .click()
      .intercept('**/resourcesManager/getGroupAssignments**').as('getGroupAssignments')
      .wait('@getGroupAssignments')

      // assert that group was activated
      .get(`[data-cy=${dbGroupToActivate}-active]`)
      .should('exist')

  })

  it( 'test remove group from resource', () => {

    cy.get('[data-cy=assigned-groups]')
      .click()
      .get('[data-cy=filter-input]')
      .type(dbGroupToRemove, {force: true})
      .get(`[data-cy=${dbGroupToRemove}-checkbox]`)
      .click()
      .get('[data-cy=remove-group-button]')
      .click()
      .intercept('**/resourcesManager/getGroupAssignments**').as('getGroupAssignments')
      .get('[data-cy=delete-button]')
      .click()
      .wait('@getGroupAssignments')

      //  assert that group was removed
      .get(`[data-cy=${dbGroupToRemove}-checkbox]`)
      .should('not.exist')

  })

  it('test deactivate group assignment', () => {

    cy.get('[data-cy=assigned-groups]')
      .click()
      .get('[data-cy=filter-input]')
      .type(dbGroupToDeactivate, {force: true})
      .get(`[data-cy=${dbGroupToDeactivate}-active]`)
      .click()
      .get('[data-cy=change-status-button]')
      .click()
      .intercept('**/resourcesManager/getGroupAssignments**').as('getGroupAssignments')
      .wait('@getGroupAssignments')

      // assert that group was deactivated
      .get(`[data-cy=${dbGroupToDeactivate}-inactive]`)
      .should('exist')

  })

  context('Advanced settings - Managers', () => {
    beforeEach(() => {
      cy.get('[data-cy=managers]')
        .click()
    })
    it('test add resource manager', () => {

      cy.get('[data-cy=add-manager-button]')
        .click()
        .get('[data-cy=search-manager-input]')
        .type(`${dbUserToAssignRoles}`, {force: true})
        .get('[data-cy=search-manager-button]')
        .click()
        .get(`[data-cy=${dbUserToAssignRoles}-checkbox]`)
        .click()
        .intercept('**/authzResolver/getRichAdmins**').as('getRichAdmins')
        .get('[data-cy=add-manager-button-dialog]')
        .click()
        .wait('@getRichAdmins')

        // assert that manager was added
        .get(`[data-cy=${dbUserToAssignRoles}-checkbox]`)
        .should('exist')
    })

    it('test add resource observer', () => {

      cy.get('[data-cy=role-filter]')
        .click()
        .get('[data-cy=resourceobserver]')
        .click()
        .get('[data-cy=add-manager-button]')
        .click()
        .get('[data-cy=search-manager-input]')
        .type(`${dbUserToAssignRoles}`, {force: true})
        .get('[data-cy=search-manager-button]')
        .click()
        .get(`[data-cy=${dbUserToAssignRoles}-checkbox]`)
        .click()
        .intercept('**/authzResolver/getRichAdmins**').as('getRichAdmins')
        .get('[data-cy=add-manager-button-dialog]')
        .click()
        .wait('@getRichAdmins')

        // assert that manager was added
        .get(`[data-cy=${dbUserToAssignRoles}-checkbox]`)
        .should('exist')
    })

    it('test add resource self service', () => {

      cy.get('[data-cy=role-filter]')
        .click()
        .get('[data-cy=resourceselfservice]')
        .click()
        .get('[data-cy=add-manager-button]')
        .click()
        .get('[data-cy=search-manager-input]')
        .type(`${dbUserToAssignRoles}`, {force: true})
        .get('[data-cy=search-manager-button]')
        .click()
        .get(`[data-cy=${dbUserToAssignRoles}-checkbox]`)
        .click()
        .intercept('**/authzResolver/getRichAdmins**').as('getRichAdmins')
        .get('[data-cy=add-manager-button-dialog]')
        .click()
        .wait('@getRichAdmins')

        // assert that manager was added
        .get(`[data-cy=${dbUserToAssignRoles}-checkbox]`)
        .should('exist')
    })

    it('test remove resource manager', () => {

      cy.get(`[data-cy=${dbUserToRemoveRoles}-checkbox]`)
        .click()
        .get('[data-cy=remove-manager-button]')
        .click()
        .intercept('**/authzResolver/getRichAdmins**').as('getRichAdmins')
        .get('[data-cy=remove-manager-button-dialog]')
        .click()
        .wait('@getRichAdmins')

        // assert that manager was removed
        .get(`[data-cy=${dbUserToRemoveRoles}-checkbox]`)
        .should('not.exist')
    })

    it('test remove resource observer', () => {

      cy.get('[data-cy=role-filter]')
        .click()
        .get('[data-cy=resourceobserver]')
        .click()
        .get(`[data-cy=${dbUserToRemoveRoles}-checkbox]`)
        .click()
        .get('[data-cy=remove-manager-button]')
        .click()
        .intercept('**/authzResolver/getRichAdmins**').as('getRichAdmins')
        .get('[data-cy=remove-manager-button-dialog]')
        .click()
        .wait('@getRichAdmins')
        .get('[data-cy=role-filter]')
        .click()
        .get('[data-cy=resourceobserver]')
        .click()
        .intercept('**/authzResolver/getRichAdmins**').as('getRichAdmins')
        .wait('@getRichAdmins')

        // assert that manager was removed
        .get(`[data-cy=${dbUserToRemoveRoles}-checkbox]`)
        .should('not.exist')
    })

    it('test remove resource self service', () => {

      cy.get('[data-cy=role-filter]')
        .click()
        .get('[data-cy=resourceselfservice]')
        .click()
        .get(`[data-cy=${dbUserToRemoveRoles}-checkbox]`)
        .click()
        .get('[data-cy=remove-manager-button]')
        .click()
        .intercept('**/authzResolver/getRichAdmins**').as('getRichAdmins')
        .get('[data-cy=remove-manager-button-dialog]')
        .click()
        .wait('@getRichAdmins')
        .get('[data-cy=role-filter]')
        .click()
        .get('[data-cy=resourceselfservice]')
        .click()
        .intercept('**/authzResolver/getRichAdmins**').as('getRichAdmins')
        .wait('@getRichAdmins')


        // assert that manager was removed
        .get(`[data-cy=${dbUserToRemoveRoles}-checkbox]`)
        .should('not.exist')
    })
  })
})
