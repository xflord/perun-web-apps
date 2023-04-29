/// <reference types="cypress" />

describe('VO management with role VO admin', () => {
  const dbVoName = 'test-e2e-vo-to-delete';

  before(() => {
    cy.login('', 'perun');
  });

  beforeEach(() => {
    cy.visit('home')
      .get(`[data-cy=access-item-button]`)
      .click()
  });

  it('test delete vo', () => {
    cy.intercept('**/vosManager/deleteVo**')
      .as('deleteVo')
      .get('[data-cy=filter-input]')
      .type(`${dbVoName}`, {force: true})
      .get(`[data-cy=${dbVoName}]`)
      .click({force: true}) // covered by toolbar (header)
      .get('[data-cy=delete-vo]')
      .click({force: true}) // covered by span
      .get('[data-cy=force-delete]')
      .click()
      .get('[data-cy=force-delete-control]')
      .type('DELETE', {force: true})
      .get('[data-cy=force-delete-button]')
      .click()
      .wait('@deleteVo')

      // assert that the delete action was successful
      .get('[data-cy=notification-message]')
      .contains('Organization was successfully removed')
      .should('exist');
  });

});
