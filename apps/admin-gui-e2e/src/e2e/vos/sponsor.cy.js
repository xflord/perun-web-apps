/// <reference types="cypress" />

describe('VO management with role Sponsor', () => {
  const dbVoName = 'test-e2e-vo-from-db-7';
  const dbMemberToSponsor = 'MemberToSponsor';
  const dbSponsoredMember = 'SponsoredMember';
  const dbMemberToUnsponsor = 'MemberToUnsponsor'
  const dbSponsor = 'Sponsor'

  const newSponsoredMemberFirstName = "Frank"
  const newSponsoredMemberLastName = "Sinatra"
  const newSponsoredMemberEmail = "frank.sinatra@test.con"
  const newSponsoredMemberLogin = "frankie420"
  const newSponsoredMemberPasswd = "1234567890Abc"

  const csvMemberFirstName = "John"
  const csvMemberLastName = "Doe"
  const csvMemberEmail = "john.doe@test.com"
  const csvMemberLogin = "john420"
  const csvMembersToSponsor = csvMemberFirstName + ";" + csvMemberLastName + ";" + csvMemberEmail + ";" + csvMemberLogin;

  before(() => {
    cy.login('SPONSOR', 'sponsor');
  });

  beforeEach(() => {
    cy.intercept('**/membersManager/getSponsoredMembersAndTheirSponsors**').as('getSponsoredMembers')
      .visit('home')
      .get(`[data-cy=access-item-button]`)
      .click()
      .get('[data-cy=filter-input]')
      .type(dbVoName, {force: true})
      .get(`[data-cy=${dbVoName}]`)
      .click()
      .get('[data-cy=sponsored-members]')
      .click()
      .wait('@getSponsoredMembers')
  })

  it ('test list member sponsors', () => {
      cy.get('[data-cy=filter-input]')
        .type(dbSponsoredMember, {force: true})
        .get(`[data-cy=${dbSponsoredMember}-edit-sponsors-button]`)
        .click()

        // assert that sponsor is listed
        .get(`[data-cy=${dbSponsor}-unsponsor-mark-button]`)
        .should('exist')
  })

  it ('test sponsor existing member', () => {
    cy.get(`[data-cy=sponsor-existing-button]`)
      .should('have.attr', 'color', 'accent') // check if the button is enabled (due to the force click below)
      .click({ force: true })
      .get(`[data-cy=sponsor-search-input]`)
      .type(`${dbMemberToSponsor}`, {force: true})
      .get(`[data-cy=sponsor-search-button]`)
      .click()
      .get(`[data-cy=${dbMemberToSponsor}-checkbox]`)
      .click()
      .get('[data-cy=sponsor-member-button]')
      .click()
      .intercept('**/membersManager/getSponsoredMembersAndTheirSponsors**').as('getSponsoredMembers')
      .wait('@getSponsoredMembers')

      // assert that sponsored member exists
      .get('[data-cy=filter-input]')
      .type(dbMemberToSponsor, {force: true})
      .get(`[data-cy=${dbMemberToSponsor}-name]`)
      .should('exist')
  })

  it ('test sponsor new member', () => {
    cy.intercept('**/membersManager/createSponsoredMember/withFullName**').as('createSponsoredMember')
      .get('[data-cy=sponsor-dropdown-button]')
      .should('have.attr', 'color', 'accent') // check if the button is enabled (due to the force click below)
      .click({ force: true })
      .get(`[data-cy=sponsor-new-button]`)
      .click()
      .get(`[data-cy=first-name-input]`)
      .type(`${newSponsoredMemberFirstName}`, {force: true})
      .get(`[data-cy=last-name-input]`)
      .type(`${newSponsoredMemberLastName}`, {force: true})
      .get(`[data-cy=next-button]`)
      .click()
      .get(`[data-cy=namespace-filter]`)
      .click()
      .get(`[data-cy=dummy]`)
      .click()
      .get(`[data-cy=email-input]`)
      .type(`${newSponsoredMemberEmail}`, {force: true})
      .get(`[data-cy=login-input]`)
      .type(`${newSponsoredMemberLogin}`, {force: true})
      .get(`[data-cy=passwd-input]`)
      .type(`${newSponsoredMemberPasswd}`, {force: true})
      .get(`[data-cy=confirm-passwd-input]`)
      .type(`${newSponsoredMemberPasswd}`, {force: true})
      .get(`[data-cy=next-button]`)
      .click()
      .get(`[data-cy=next-button]`)
      .click()
      .get(`[data-cy=confirm-button]`)
      .click()
      .wait('@createSponsoredMember')
      .get(`[data-cy=ok-button]`)
      .click()
      .intercept('**/membersManager/getSponsoredMembersAndTheirSponsors**').as('getSponsoredMembers')
      .wait('@getSponsoredMembers')

      // assert that sponsored member exists
      .get('[data-cy=filter-input]')
      .type(newSponsoredMemberFirstName, {force: true})
      .get(`[data-cy=${newSponsoredMemberFirstName}-name]`)
      .should('exist')
  })

  it ('test create sponsors csv', () => {
    cy.get('[data-cy=sponsor-dropdown-button]')
      .should('have.attr', 'color', 'accent') // check if the button is enabled (due to the force click below)
      .click({ force: true })
      .get('[data-cy=sponsor-csv-button]')
      .click()
      .get(`[data-cy=namespace-filter]`)
      .click()
      .get(`[data-cy=dummy]`)
      .click()
      .get('[data-cy=csv-input]')
      .type(`${csvMembersToSponsor}`, {force: true})
      .get('[data-cy=next-button]')
      .click()
      .get('[data-cy=next-button]')
      .click()
      .get('[data-cy=next-button]')
      .click()
      .get('[data-cy=no-assign-button]')
      .click()
      .get('[data-cy=submit-button]')
      .click()
      .get('[data-cy=close-button]')
      .click()
      .intercept('**/membersManager/getSponsoredMembersAndTheirSponsors**').as('getSponsoredMembers')
      .wait('@getSponsoredMembers')

      // assert that sponsored member exists
      .get('[data-cy=filter-input]')
      .type(csvMemberFirstName, {force: true})
      .get(`[data-cy=${csvMemberFirstName}-name]`)
      .should('exist')
  })

  it ('test remove sponsor from sponsored member', () => {
    cy.get('[data-cy=filter-input]')
      .type(dbMemberToUnsponsor, {force: true})
      .get(`[data-cy=${dbMemberToUnsponsor}-edit-sponsors-button]`)
      .click()
      .get(`[data-cy=${dbSponsor}-unsponsor-mark-button]`)
      .click()
      .get(`[data-cy=unsponsor-confirm-button]`)
      .click()
      .intercept('**/membersManager/getSponsoredMembersAndTheirSponsors**').as('getSponsoredMembers')
      .wait('@getSponsoredMembers')

      // assert that member is removed (last sponsor was removed)
      .get(`[data-cy=${dbMemberToUnsponsor}-edit-sponsors-button]`)
      .should('not.exist')

  })

  it ('test send password reset email', () => {
    cy.intercept('**/membersManager/sendPasswordResetLinkEmail**').as('sendPasswordResetLinkEmail')
      .get('[data-cy=filter-input]')
      .type(dbSponsoredMember, {force: true})
      .get(`[data-cy=${dbSponsoredMember}-reset-passwd-button]`)
      .click()
      .get(`[data-cy=reset-passwd-confirm-button]`)
      .click()
      .intercept('**/membersManager/sendPasswordResetLinkEmail**').as('sendPasswordResetLinkEmail')
      .wait('@sendPasswordResetLinkEmail')

      .its('response.statusCode')
      .should('eq', 200);
  })

})
