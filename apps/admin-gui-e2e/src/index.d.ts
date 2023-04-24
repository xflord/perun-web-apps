declare namespace Cypress {
  interface Chainable<> {
    login(envRole: string, baPrincipalName: string): Chainable;
  }
}
