context('Actions', () => {
  const dbFacilityName1 = 'test-e2e-facility-from-db';
  const dbFacilityName2 = 'test-e2e-facility-from-db-2';
  const dbVoName = 'test-e2e-vo-from-db-for-facility';
  const dbResourceName = 'test-e2e-resource-from-db';
  const addedAttribute = 'login-namespace';
  const deleteAttribute = 'gid-namespace';
  const addManagerUser = 'facility-manager-2';
  const removeManagerUser = 'test3';

  before(() => {
    if (Cypress.env('BA_USERNAME_FACILITY_MANAGER')) {
      sessionStorage.setItem('baPrincipal', '{"name": "facilityManager"}');
      sessionStorage.setItem('basicUsername', Cypress.env('BA_USERNAME_FACILITY_MANAGER'));
      sessionStorage.setItem('basicPassword', Cypress.env('BA_PASSWORD_FACILITY_MANAGER'));
      cy.visit('service-access');
    }
  })

  beforeEach(() => {
    cy.visit('facilities');
  })

  it('test create facility', () => {

    cy.intercept('**/facilitiesManager/createFacility?**').as('createFacility')
      .intercept('**/facilitiesManager/getEnrichedFacilities').as('getEnrichedFacilities')
      .intercept('**/facilitiesManager/getFacilities').as('getFacilities')
      .get('[data-cy=new-facility-button]')
      .click()
      .wait('@getFacilities')
      .get('[data-cy=facility-name-input]')
      .type('test-e2e-facility')
      .get('[data-cy=facility-description-input]')
      .type('test-e2e-facility-description')
      .get('[data-cy=create-facility-button]')
      .click()
      .wait('@createFacility')
      .wait('@getEnrichedFacilities')
      // assert that the facility was created
      .get('[data-cy=auto-focused-filter]')
      .type('test-e2e-facility')
      .get('[data-cy=test-e2e-facility-checkbox]')
      .should('exist')
  });

  it('test delete facility', () => {

    cy.intercept('**/facilitiesManager/getEnrichedFacilities').as('getEnrichedFacilities')
      .intercept('**/facilitiesManager/deleteFacility?**').as('deleteFacility')
      .wait('@getEnrichedFacilities')
      .get(`[data-cy=${dbFacilityName1}-checkbox]`)
      .click()
      .get('[data-cy=delete-facility-button]')
      .click()
      .get('[data-cy=delete-button-dialog]')
      .click()
      .wait('@deleteFacility')
      .wait('@getEnrichedFacilities')
      .get(`[data-cy=${dbFacilityName1}-checkbox]`)
      .should('not.exist')
  });

  it('test create resource', () => {

    cy.intercept('**/facilitiesManager/getEnrichedFacilities').as('getEnrichedFacilities')
      .intercept('**/vosManager/getAllVos').as('getAllVos')
      .intercept('**/facilitiesManager/getAssignedRichResources?**').as('getAssignedResources')
      .intercept('**/resourcesManager/createResource?**').as('createResource')

      .wait('@getEnrichedFacilities')
      .get(`[data-cy=${dbFacilityName2}]`)
      .click()
      .get('[data-cy=resources]')
      .click()
      .get('[data-cy=create-resource-button]')
      .click()
      .wait('@getAllVos')
      .get('[data-cy=create-resource-select-vo]')
      .click()
      .get('mat-option').contains(`${dbVoName}`).click()
      //.get(`[data-cy=${dbVoName}]`)
      //.click()
      .get('[data-cy=create-resource-name-input]')
      .type('test-e2e-resource')
      .get('[data-cy=create-resource-dialog-button]')
      .click()
      .wait('@createResource')
      .wait('@getAssignedResources')
      .get('[data-cy=test-e2e-resource-checkbox]')
      .should('exist')
  });

  it('test delete resource', () => {

    cy.intercept('**/facilitiesManager/getEnrichedFacilities').as('getEnrichedFacilities')
      .intercept('**/facilitiesManager/getAssignedRichResources?**').as('getAssignedResources')
      .intercept('**/resourcesManager/deleteResource?**').as('deleteResource')

      .wait('@getEnrichedFacilities')
      .get(`[data-cy=${dbFacilityName2}]`)
      .click()
      .get('[data-cy=resources]')
      .click()
      .get(`[data-cy=${dbResourceName}-checkbox]`)
      .click()
      .get('[data-cy=delete-resource-button]')
      .click()
      .get('[data-cy=delete-button-dialog]')
      .click()
      .wait('@deleteResource')
      .wait('@getAssignedResources')
      .get(`[data-cy=${dbResourceName}-checkbox]`)
      .should('not.exist')
  });

  it('test add attribute', () => {

    cy.intercept('**/attributesManager/setAttributes/**').as('setAttributes')
      .intercept('**/facilitiesManager/getEnrichedFacilities').as('getEnrichedFacilities')
      .wait('@getEnrichedFacilities')
      .get(`[data-cy=${dbFacilityName2}]`)
      .click()
      .get('[data-cy=attributes]')
      .click()
      .get('[data-cy=add-attributes]')
      .click()
      .get('[data-cy=filter-attributes]')
      .type('Login namespace')
      .get(`[data-cy=${addedAttribute}-value]`)
      .type('einfra')
      .get('[data-cy=save-selected-attributes]')
      .click()
      .wait('@setAttributes')
      // assert that attribute exists
      .get(`[data-cy=${addedAttribute}-value]`)
      .should('exist')
  });

  it('test delete attribute', () => {

    cy.intercept('**/attributesManager/removeAttributes/**').as('removeAttributes')
      .intercept('**/facilitiesManager/getEnrichedFacilities').as('getEnrichedFacilities')
      .wait('@getEnrichedFacilities')
      .get(`[data-cy=${dbFacilityName2}]`)
      .click()
      .get('[data-cy=attributes]')
      .click()
      .get(`[data-cy=${deleteAttribute}-checkbox]`)
      .click()
      .get('[data-cy=remove-attributes]')
      .click()
      .get('[data-cy=delete-attributes]')
      .click()
      .wait('@removeAttributes')
      // assert that attribute exists
      .get(`[data-cy=${deleteAttribute}-checkbox]`)
      .should('not.exist')
  });

  it('test add facility manager', () => {

    cy.intercept('**/authzResolver/setRole/**').as('setRole')
      .intercept('**/facilitiesManager/getEnrichedFacilities').as('getEnrichedFacilities')
      .intercept('**/usersManager/findRichUsersWithAttributes?**').as('findRichUsers')
      .wait('@getEnrichedFacilities')
      .get(`[data-cy=${dbFacilityName2}]`)
      .click()
      .get('[data-cy=advanced-settings]')
      .click()
      .get('[data-cy=managers]')
      .click()
      .get('[data-cy=add-manager-button]')
      .click()
      .get('[data-cy=search-manager-input]')
      .type(`${addManagerUser}`)
      .get('[data-cy=search-manager-button]')
      .click()
      .wait('@findRichUsers')
      .get(`[data-cy=${addManagerUser}-checkbox]`)
      .click()
      .get('[data-cy=add-manager-button-dialog]')
      .click()
      .wait('@setRole')
      // assert that manager was added
      .get(`[data-cy=${addManagerUser}-checkbox]`)
      .should('exist')
  });

  it('test remove facility manager', () => {

    cy.intercept('**/authzResolver/unsetRole/**').as('unsetRole')
      .intercept('**/facilitiesManager/getEnrichedFacilities').as('getEnrichedFacilities')
      .wait('@getEnrichedFacilities')
      .get(`[data-cy=${dbFacilityName2}]`)
      .click()
      .get('[data-cy=advanced-settings]')
      .click()
      .get('[data-cy=managers]')
      .click()
      .get(`[data-cy=${removeManagerUser}-checkbox]`)
      .click()
      .get('[data-cy=remove-manager-button]')
      .click()
      .get('[data-cy=remove-manager-button-dialog]')
      .click()
      .wait('@unsetRole')
      // assert that manager doesn't exist
      .get(`[data-cy=${removeManagerUser}-checkbox]`)
      .should('not.exist')
  });
})
