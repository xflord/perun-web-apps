/// <reference types="cypress" />

describe('Perun admin management with role Perun observer', () => {
  const dbServiceName = 'perun_observer_test';

  // the same data from perun admin tests
  const dbAttrFriendlyName = 'perunAdminTestAttr';
  const dbExtSourceName = 'test_ext_source_db';
  const dbConsentHubName = 'test-e2e-facility-from-db-3';
  const dbSearcherAttrDisplayName = 'login-namespace:einfra';
  const dbSearcherAttrValue = 'e2etestlogin';
  const dbSearcherUserFirstName = 'Test6';
  const dbOwnerName = 'DbOwnerTest';

  before(() => {
    cy.login('PERUN_OBSERVER', 'perunObserver');
  });

  beforeEach(() => {
    cy.visit('home')
      .get('[data-cy=admin-button]')
      .click();
  });

  it('test attribute detail', () => {
    cy.get('[data-cy=attribute-definitions]')
      .click()
      .get('[data-cy=unfocused-filter]')
      .type(dbAttrFriendlyName, {force: true})
      .get(`[data-cy=${dbAttrFriendlyName.toLowerCase()}-friendly-name]`)
      .click()
      .get('[data-cy=display-name-input]')
      .should('have.value', dbAttrFriendlyName);
  });

  it('test user detail', () => {
    cy.get('[data-cy=users]')
      .click()
      .get('[data-cy=filter-input]')
      .type('perunobservertest1', {force: true})
      .intercept('**/usersManager/getUsersPage')
      .as('getUsers')
      .wait('@getUsers')
      .get('[data-cy=perunobservertest1-td]')
      .click()
      .get('[data-cy=user-name-link]')
      .contains('PerunObserverTest1 PerunObserverTest1');
  });

  it('test list owners', () => {
    cy.get('[data-cy=owners]')
      .click()
      .get('[data-cy=unfocused-filter]')
      .type(dbOwnerName, {force: true})
      .get(`[data-cy=${dbOwnerName}]`)
      .should('exist');
  });

  it('test service detail', () => {
    cy.get('[data-cy=services]')
      .click()
      .get('[data-cy=unfocused-filter]')
      .type(dbServiceName, {force: true})
      .get(`[data-cy=${dbServiceName.toLowerCase()}-name-td]`)
      .click()
      .get(`[data-cy=service-name-link]`)
      .contains(dbServiceName);
  });

  it('test list ext sources', () => {
    cy.get('[data-cy=external-sources]')
      .click()
      .get('[data-cy=unfocused-filter]')
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
      .get('[data-cy=unfocused-filter]')
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
});
