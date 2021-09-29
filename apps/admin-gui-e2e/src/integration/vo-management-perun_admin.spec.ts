/// <reference types="cypress" />

context('Actions', () => {

  before(() => {
    if (Cypress.env('BA_USERNAME')) {
      sessionStorage.setItem('baPrincipal', '{"name": "test"}');
      sessionStorage.setItem('basicUsername', Cypress.env('BA_USERNAME'));
      sessionStorage.setItem('basicPassword', Cypress.env('BA_PASSWORD'));
      cy.visit('service-access');
    }
  })

  beforeEach(() => {
    cy.visit('home')
    cy.intercept('**/vosManager/createVo/**').as('createVo')
  })

  it('test create vo', () => {

    cy.get('#access-item-btn')
        .click()
      .get('#new-vo-btn')
        .click()
      .get('#vo-name-input')
        .type('test-e2e-vo')
      .get('#vo-shortname-input')
        .type('test-e2e-vo')
      .get('#create-vo-button')
        .click()
      .wait('@createVo')
      // assert that the vo was created
      .get('#vo-name-link')
        .contains('test-e2e-vo')
        .should('exist')
  })
})
