/// <reference types="cypress" />

describe('VO management with role VO observer', () => {
  const dbVoName = "vo-observer-vo-from-db";
  const dbGroupName = "vo-observer-group-from-db";
  const dbMemberName = "vo-observer-user3";
  const dbAdminName = "vo-observer-user2";

  const dbApplicationItemTextFieldName = 'input-test';

  before(() => {
    cy.login('VO_OBSERVER', 'voObserver');
  });

  beforeEach(() => {
    cy.visit('home')
      .get(`[data-cy=access-item-button]`)
      .click()
      .get('[data-cy=auto-focused-filter]')
      .type(dbVoName, {force: true})
      .get(`[data-cy=${dbVoName}]`)
      .click()
  });

  it('test view applications', () => {
    cy.intercept('**/registrarManager/getApplicationsPage**').as("getApplicationsPage")
      .get('[data-cy=applications]')
      .click()
      .wait('@getApplicationsPage')

      // the application was created by user 'perun' during Docker build
      .get(`[data-cy=perun-createdBy]`)
      .should('exist')
  })

  it('view group detail', () => {
    cy.intercept('**/groupsManager/getGroupById**').as('getGroupById')
      .get('[data-cy=groups]')
      .click()
      .get('[data-cy=filter-input]')
      .type(dbGroupName, {force: true})
      .get(`[data-cy=${dbGroupName}]`)
      .click()
      .wait('@getGroupById')

      // the group name on the group detail page should be visible
      .get(`[data-cy=${dbGroupName}-shortName]`)
      .should('exist')
  })

  it('view member detail', () => {
    cy.intercept('**/membersManager/getRichMemberWithAttributes**').as('getRichMemberWithAttributes')
      .get('[data-cy=members]')
      .click()
      .get('[data-cy=filter-input]')
      .type(dbMemberName, {force: true})
      .intercept('**/membersManager/getMembersPage')
      .as('getMembers')
      .wait('@getMembers')
      .get(`[data-cy=${dbMemberName}-firstName-td]`)
      .click()
      .wait('@getRichMemberWithAttributes')

      // the member name on the member detail page should be visible
      .get(`[data-cy=${dbMemberName}-firstName]`)
      .should('exist')
  })

  context('Advanced settings', () => {
    beforeEach(() => {
      cy.get('[data-cy=advanced-settings]')
        .click()
    })

    it('view vo managers', () => {
      cy.intercept('**/authzResolver/getRichAdmins**').as('getRichAdmins')
        .get('[data-cy=managers]')
        .click()
        .wait('@getRichAdmins')

        // the first name of the admin should be visible
        .get(`[data-cy=${dbAdminName}-firstName-td]`)
        .should('exist')
    })

    it('test view application form', () => {
      cy.intercept('**/registrarManager/getFormItems/vo**').as('getFormItems')
        .get('[data-cy=application-form]')
        .click()
        .wait('@getFormItems')

        // form item should be visible
        .get(`[data-cy=${dbApplicationItemTextFieldName}-shortname-td]`)
        .should('exist');
    })

    it ('test view Ext Sources', () => {
      cy.intercept('**/extSourcesManager/getVoExtSources**').as('getVoExtSources')
        .get('[data-cy=external-sources]')
        .click()
        .wait('@getVoExtSources')
        .get('[data-cy=unfocused-filter]')
        .type('internal', {force: true})

        // the vo external source was set to INTERNAL in the db (id 1)
        .get('[data-cy=internal-name-td]')
        .should('exist')
    })
  })
})
