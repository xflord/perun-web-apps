/// <reference types="cypress" />

context('Actions', () => {
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
    if (Cypress.env('BA_USERNAME_PERUN_OBSERVER')) {
      sessionStorage.setItem('baPrincipal', '{"name": "perunObserver"}');
      sessionStorage.setItem('basicUsername', Cypress.env('BA_USERNAME_PERUN_OBSERVER'));
      sessionStorage.setItem('basicPassword', Cypress.env('BA_PASSWORD_PERUN_OBSERVER'));
      cy.visit('service-access');
    }
  });

  beforeEach(() => {
    // save route for correct authorization
    localStorage.setItem('routeAuthGuard', '/admin');
    cy.visit('admin');
  });

  it('test attribute detail', () => {
    cy.get('[data-cy=attribute-definitions]')
      .click()
      .get('[data-cy=unfocused-filter]')
      .type(dbAttrFriendlyName)
      .get(`[data-cy=${dbAttrFriendlyName.toLowerCase()}-friendly-name]`)
      .click()
      .get('[data-cy=display-name-input]')
      .should('have.value', dbAttrFriendlyName);
  });

  it('test user detail', () => {
    cy.get('[data-cy=users]')
      .click()
      .get('[data-cy=perunobservertest1-td]')
      .click()
      .get('[data-cy=user-name-link]')
      .contains('PerunObserverTest1 PerunObserverTest1');
  });

  it('test list owners', () => {
    cy.get('[data-cy=owners]')
      .click()
      .get(`[data-cy=${dbOwnerName}]`)
      .should('exist');
  });

  it('test service detail', () => {
    cy.get('[data-cy=services]')
      .click()
      .get(`[data-cy=${dbServiceName.toLowerCase()}-name-td]`)
      .click()
      .get(`[data-cy=service-name-link]`)
      .contains(dbServiceName);
  });

  it('test list ext sources', () => {
    cy.get('[data-cy=external-sources]')
      .click()
      .get(`[data-cy=${dbExtSourceName.toLowerCase()}-name-td]`)
      .should('exist');
  });

  it('test audit message detail', () => {
    cy.get('[data-cy=audit-log]')
      .click()
      .get(`[data-cy=audit-message-detail-button]`)
      .first()
      .click()
      .get('.mat-tab-label')
      .contains('Message')
      .click()
      .get(`[data-cy=audit-message-text]`)
      .should('not.be.empty');
  });

  it('test list consent hubs', () => {
    cy.get('[data-cy=consent-hubs]')
      .click()
      .get(`[data-cy=${dbConsentHubName.toLowerCase()}-name-td]`)
      .should('exist');
  });

  it('test search attribute', () => {
    cy.get('[data-cy=searcher]')
      .click()
      .get(`[data-cy=filter-input]`)
      .type(dbSearcherAttrValue)
      .get(`[data-cy=search-select-input]`)
      .click()
      .get('mat-option')
      .contains(dbSearcherAttrDisplayName)
      .click()
      .get('[data-cy=searcher-search-button]')
      .click()
      .get(`[data-cy=${dbSearcherUserFirstName.toLowerCase()}-firstName-td]`)
      .should('exist');
  });
});
