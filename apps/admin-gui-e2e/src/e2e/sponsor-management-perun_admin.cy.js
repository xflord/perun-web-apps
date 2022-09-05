context('Actions', () => {
  const dbVoName;
  const dbMemberToSponsor;
  const dbSponsoredMember;
  const dbMemberToUnsponsor
  const dbSponsor;

  const newSponsoredMemberFirstName = "Frank"
  const newSponsoredMemberLastName = "Sinatra"
  const newSponsoredMemberEmail = "frank.sinatra@test.con"

  const csvMemberFirstName = "John"
  const csvMemberLastName = "Doe"
  const csvMemberEmail = "john.doe@test.com"
  const csvMembersToSponsor = csvMemberFirstName + ";" + csvMemberLastName + ";" + csvMemberEmail;

  before(() => {
    if (Cypress.env('BA_USERNAME_SPONSOR')) {
      sessionStorage.setItem('baPrincipal', '{"name": "sponsor"}');
      sessionStorage.setItem('basicUsername', Cypress.env('BA_USERNAME_SPONSOR'));
      sessionStorage.setItem('basicPassword', Cypress.env('BA_PASSWORD_SPONSOR'));
      cy.visit('service-access');
    }
  });

  beforeEach(() => {
    cy.visit('organizations')
      .get(`[data-cy=${dbVoName}]`)
      .click()
      .get('[data-cy=sponsoredMembers]')
      .click()
  })
  it ('test list member sponsors', () => {
      cy.get(`[data-cy=${dbSponsoredMember}-name]`)
        .intercept('**/membersManager/getRichMemberWithAttributes**').as('getRichMember')
        .click()
        .wait('@getRichMember')

        // assert that sponsor is listed
        .get(`[data-cy=${dbSponsor}]`)
        .should('exist')
  })

  it ('test sponsor existing member', () => {
    cy.get(`[data-cy=sponsor-existing-button]`)
      .click()
      .get(`[data-cy=sponsor-search-input]`)
      .type(`${dbMemberToSponsor}`)
      .get(`[data-cy=sponsor-search-button]`)
      .click()
      .get(`[${dbMemberToSponsor}-checkbox]`)
      .click()
      .intercept('**/membersManager/getSponsoredMembersAndTheirSponsors**').as('getSponsoredMembers')
      .wait('@getSponsoredMembers')

      // assert that sponsored member exists
      .get(`[${dbMemberToSponsor}-name]`)
      .should('exist')
  })

  it ('test sponsor new member', () => {
    cy.get(`[data-cy=sponsor-new-button]`)
      .click()
      .get(`[data-cy=first-name-input]`)
      .type(`${newSponsoredMemberFirstName}`)
      .get(`[data-cy=last-name-input]`)
      .type(`${newSponsoredMemberLastName}`)
      .get(`[data-cy=next-button]`)
      .click()
      .get(`[data-cy=namespace-filter]`)
      .click()
      .get(`[data-cy=No namespace]`)
      .click()
      .get(`[data-cy=email-input]`)
      .type(`${newSponsoredMemberEmail}`)
      .get(`[data-cy=next-button]`)
      .click()
      .get(`[data-cy=confirm-button]`)
      .click()
      .get(`[data-cy=ok-button]`)
      .click()
      .intercept('**/membersManager/getSponsoredMembersAndTheirSponsors**').as('getSponsoredMembers')
      .wait('@getSponsoredMembers')

      // assert that sponsored member exists
      .get(`[${newSponsoredMemberFirstName}-name]`)
      .should('exist')
  })

  it ('test create sponsors csv', () => {
    cy.get('[data-cy=sponsor-csv-button]')
      .click()
      .get('[data-cy=csv-input]')
      .type(`${csvMembersToSponsor}`)
      .get('[data-cy=next-button]')
      .click()
      .get('[data-cy=next-button]')
      .click()
      .get('[data-cy=next-button]')
      .click()
      .get('[data-cy=not-assign-button]')
      .click()
      .get('[data-cy=submit-button]')
      .click()
      .get('[data-cy=close-button]')
      .click()
      .intercept('**/membersManager/getSponsoredMembersAndTheirSponsors**').as('getSponsoredMembers')
      .wait('@getSponsoredMembers')

      // assert that sponsored member exists
      .get(`${csvMemberFirstName}`)
      .should('exist')
  })

})
