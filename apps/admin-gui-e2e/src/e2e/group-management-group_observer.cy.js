/// <reference types="cypress" />

context('Actions', () => {
  const dbGroupName = 'g-o-test-group';
  const dbGroupMember = 'g-o-testgroupmember';
  const dbGroupAdmin = 'g-o-testgroupadmin';
  const dbVoName = 'g-o-test-vo';
  const dbApplicationItemTextFieldName = 'g-o-input-test';
  const dbExtsource = 'internal';

  before(() => {
    if (Cypress.env('BA_USERNAME_GROUP_OBSERVER')) {
      sessionStorage.setItem('baPrincipal', '{"name": "groupObserver"}');
      sessionStorage.setItem('basicUsername', Cypress.env('BA_USERNAME_GROUP_OBSERVER'));
      sessionStorage.setItem('basicPassword', Cypress.env('BA_PASSWORD_GROUP_OBSERVER'));
      cy.visit('service-access');
    }
  });

  beforeEach(() => {
    cy.visit('home')
      .get(`[data-cy=access-item-button]`)
      .click()
      .get('[data-cy=auto-focused-filter]')
      .type(dbVoName)
      .get(`[data-cy=${dbVoName}]`)
      .click()
      .get(`[data-cy=groups]`)
      .click()
      .get('[data-cy=filter-input]')
      .type(dbGroupName)
      .get(`[data-cy=${dbGroupName}]`)
      .click();
  });

  it('test get member', () => {
    cy.get('[data-cy=members]')
      .click()
      .get('[data-cy=filter-input]')
      .type(dbGroupMember)
      .intercept('**/membersManager/getMembersPage')
      .as('getMembers')
      .wait('@getMembers')
      .get(`[data-cy=${dbGroupMember}-firstName-td]`)
      .click()
      .get('[data-cy=search-select-input]')
      .should('exist')
  });

  it('test list managers', () => {
    cy.get('[data-cy=advanced-settings]')
      .click()
      .get('[data-cy=managers]')
      .click()
      .get(`[data-cy=${dbGroupAdmin}-firstName-td]`)
      .should('exist')
  });

  it('test list extsources', () => {
    cy.get('[data-cy=advanced-settings]')
      .click()
      .get('[data-cy=external-sources]')
      .click()
      .get('[data-cy=unfocused-filter]')
      .type(dbExtsource)
      .get(`[data-cy=${dbExtsource}-name-td]`)
      .should('exist')
  });

  it('test list vo members', () => {
    cy.get('[data-cy=vo-link]')
      .click()
      .get('[data-cy=members]')
      .click()
      .get('[data-cy=filter-input]')
      .type(dbGroupMember)
      .intercept('**/membersManager/getMembersPage')
      .as('getMembers')
      .wait('@getMembers')
      .get(`[data-cy=${dbGroupMember}-firstName-td]`)
      .should('exist')
  });


  it('test get application form', () => {
    cy.get('[data-cy=advanced-settings]')
      .click()
      .get('[data-cy=application-form]')
      .click()
      .get(`[data-cy=${dbApplicationItemTextFieldName}-shortname-td]`)
      .should('exist')
  });

  it('test list applications', () => {
    cy.get('[data-cy=applications]')
      .click()
      .get(`[data-cy=${dbGroupName}-groupname-td]`)
      .click()
      .get(`[data-cy=${dbExtsource}-application-extsource]`)
      .should('exist')
  });

});
