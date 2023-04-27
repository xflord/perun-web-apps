/// <reference types="cypress" />

describe('Facility management with role Facility observer', () => {
  const dbFacilityName = 'f-o-test-facility';
  const dbResourceName = 'f-o-test-resource';
  const dbUserFirstName = 'f-o-assigned-user-firstname';
  const dbGroupName = 'f-o-test-group';
  const dbServiceName = 'f-o-test-service';
  const dbDestinationName = 'test-destination-hostname-cz';
  const dbDestinationNameSearch = 'test-destination.hostname.cz';
  const dbHostName = 'test-hostname-cz';
  const dbOwnerName = 'f-o-owner';
  const dbManagerFirstName = 'f-o-facility-manager-firstname';
  const dbAttributeName = 'uid-namespace';

  before(() => {
    cy.login('FACILITY_OBSERVER', 'facilityObserver');
  });

  beforeEach(() => {
    cy.visit('home')
      .get(`[data-cy=facilities-button]`)
      .click()
      .get('[data-cy=auto-focused-filter]')
      .type(dbFacilityName)
      .get(`[data-cy=${dbFacilityName}]`)
      .click();
  });

  it('test list resources', () => {
    cy.get('[data-cy=resources]')
      .click({ force: true })
      .get('[data-cy=unfocused-filter]')
      .type(dbResourceName, {force: true})
      .get(`[data-cy=${dbResourceName}]`)
      .should('exist')
  });

  it('test list assigned users', () => {
    cy.get('[data-cy=assigned-users]')
      .click()
      .get('[data-cy=filter-input]')
      .type(dbUserFirstName, {force: true})
      .intercept('**/usersManager/getUsersPage')
      .as('getUsers')
      .wait('@getUsers')
      .get(`[data-cy=${dbUserFirstName}-td]`)
      .should('exist')
  });

  //FIXME: this test often fails when it is executed from command line (but NOT from UI)
  // There is problem with policies - test sometimes fails with error "You are not
  // authorized to perform this action", but according to getPerunPrincipal() method
  // there should be the privilege for given facility and called method (getAllowedGroups).
  // For the correct run in CI this test was skipped for this moment
  it.skip('test list allowed groups', () => {
    cy.get('[data-cy=allowed-groups]')
      .click()
      .reload()
      .get('[data-cy=unfocused-filter]')
      .type(dbGroupName, {force: true})
      .get(`[data-cy=${dbGroupName}]`)
      .should('exist')
  });

  it('test get service status detail', () => {
    cy.get('[data-cy=services-status]')
      .click()
      .get('[data-cy=unfocused-filter]')
      .type(dbServiceName, {force: true})
      .get(`[data-cy=${dbServiceName}]`)
      .click()
      .get('[data-cy=unfocused-filter]')
      .type(dbDestinationNameSearch, {force: true})
      .get(`[data-cy=${dbDestinationName}]`)
      .should('exist')
  });

  it('test list destinations', () => {
    cy.get('[data-cy=services-destinations]')
      .click()
      .get('[data-cy=unfocused-filter]')
      .type('hostname.cz', {force: true})
      .get(`[data-cy=${dbDestinationName}]`)
      .should('exist')
  });

  // FIXME: v route-policiy.service.ts is the check for isFacilityAdmin();
  it.skip('test get host detail', () => {
    cy.get('[data-cy=hosts]')
      .click()
      .get(`[data-cy=${dbHostName}]`)
      .should('exist')
  });

  it('test list attributes', () => {
    cy.get('[data-cy=attributes]')
      .click()
      .get('[data-cy=unfocused-filter]')
      .type(dbAttributeName, {force: true})
      .get(`[data-cy=${dbAttributeName}-friendlyName]`)
      .should('exist')
  });

  it('test list owners', () => {
    cy.get('[data-cy=advanced-settings]')
      .click()
      .get('[data-cy=owners]')
      .click()
      .get('[data-cy=unfocused-filter]')
      .type(dbOwnerName, {force: true})
      .get(`[data-cy=${dbOwnerName}]`)
      .should('exist')
  });

  it('test list managers', () => {
    cy.get('[data-cy=advanced-settings]')
      .click()
      .get('[data-cy=managers]')
      .click()
      .get(`[data-cy=${dbManagerFirstName}-firstName-td]`)
      .should('exist')
  });
});
