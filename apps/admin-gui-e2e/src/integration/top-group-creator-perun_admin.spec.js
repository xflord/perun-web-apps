context('Actions', () => {
  const dbVoName = 'test-e2e-vo-from-db-4';
  const groupName = 'test';

  before(() => {
    if (Cypress.env('BA_PASSWORD_TOP_GROUP_CREATOR')) {
      sessionStorage.setItem('baPrincipal', '{"name": "topGroupCreator"}');
      sessionStorage.setItem('basicUsername', Cypress.env('BA_PASSWORD_TOP_GROUP_CREATOR'));
      sessionStorage.setItem('basicPassword', Cypress.env('BA_PASSWORD_TOP_GROUP_CREATOR'));
      cy.visit('service-access');
    }
  });

  beforeEach(() => {
    cy.visit('organizations')
      .get(`[data-cy=${dbVoName}]`)
      .click()
      .get('[data-cy=groups]')
      .click()
  })

  it( 'test create top group', () => {
    cy.intercept('**/groupsManager/createGroup/**').as('createGroup')
      .get('[data-cy=create-group-button]')
      .click()
      .get('[data-cy=group-name]')
      .type(groupName)
      .get('[data-cy=create-group-button-dialog]')
      .click()
      .wait('@createGroup')
      .intercept('**/groupsManager/getAllRichGroupsWithAttributesByNames**').as('getRichGroups')
      .wait('@getRichGroups')
      // assert that top group was created
      .get(`[data-cy=${groupName}-checkbox]`)
      .should('exist');
  });

})
