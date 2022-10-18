/// <reference types="cypress" />

context('Actions', () => {
  const dbFacilityName = 'f-o-test-facility';
  const dbResourceName = 'f-o-test-resource';
  const dbUserFirstName = 'f-o-assigned-user-firstname';
  const dbGroupName = 'f-o-test-group';
  const dbServiceName = 'f-o-test-service';
  const dbDestinationName = 'test-destination-hostname-cz';
  const dbHostName = 'test-hostname-cz';
  const dbOwnerName = 'f-o-owner';
  const dbManagerFirstName = 'f-o-facility-manager-firstname';
  const dbAttributeName = 'uid-namespace';

  before(() => {
    if (Cypress.env('BA_USERNAME_FACILITY_OBSERVER')) {
      sessionStorage.setItem('baPrincipal', '{"name": "facilityObserver"}');
      sessionStorage.setItem('basicUsername', Cypress.env('BA_USERNAME_FACILITY_OBSERVER'));
      sessionStorage.setItem('basicPassword', Cypress.env('BA_PASSWORD_FACILITY_OBSERVER'));
      cy.visit('service-access');
    }
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
      .click()
      .get('[data-cy=unfocused-filter]')
      .type(dbResourceName)
      .get(`[data-cy=${dbResourceName}]`)
      .should('exist')
  });

  it('test list assigned users', () => {
    cy.get('[data-cy=assigned-users]')
      .click()
      .get('[data-cy=filter-input]')
      .type(dbUserFirstName)
      .intercept('**/usersManager/getUsersPage')
      .as('getUsers')
      .wait('@getUsers')
      .get(`[data-cy=${dbUserFirstName}-td]`)
      .should('exist')
  });

  it('test list allowed groups', () => {
    cy.get('[data-cy=allowed-groups]')
      .click()
      .get('[data-cy=unfocused-filter]')
      .type(dbGroupName)
      .get(`[data-cy=${dbGroupName}]`)
      .should('exist')
  });

  it('test get service status detail', () => {
    cy.get('[data-cy=services-status]')
      .click()
      .get('[data-cy=unfocused-filter]')
      .type(dbServiceName)
      .get(`[data-cy=${dbServiceName}]`)
      .click()
      .get('[data-cy=unfocused-filter]')
      .type(dbDestinationName)
      .get(`[data-cy=${dbDestinationName}]`)
      .should('exist')
  });

  it('test list destinations', () => {
    cy.get('[data-cy=services-destinations]')
      .click()
      .get('[data-cy=unfocused-filter]')
      .type('hostname.cz')
      .get(`[data-cy=${dbDestinationName}]`)
      .should('exist')
  });

  // FIXME: v route-policiy.service.ts je check na isFacilityAdmin();
  // it('test get host detail', () => {
  //   cy.get('[data-cy=hosts]')
  //     .click()
  //     .get(`[data-cy=${dbHostName}]`)
  //     .should('exist')
  // });

  it('test list attributes', () => {
    cy.get('[data-cy=attributes]')
      .click()
      .get('[data-cy=unfocused-filter]')
      .type(dbAttributeName)
      .get(`[data-cy=${dbAttributeName}-friendlyName]`)
      .should('exist')
  });

  it('test list owners', () => {
    cy.get('[data-cy=advanced-settings]')
      .click()
      .get('[data-cy=owners]')
      .click()
      .get('[data-cy=unfocused-filter]')
      .type(dbOwnerName)
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
