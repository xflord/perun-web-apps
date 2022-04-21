import { getGreeting } from '../support/app.po';

describe('users-page', () => {
  beforeEach(() => cy.visit('/'));

  it('should display welcome message', () => {
    // Custom command example, see `../support/commands.ts` file
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    cy.login('my-email@something.com', 'myPassword');

    // Function helper example, see `../support/app.po.ts` file
    getGreeting().contains('Welcome to users-page!');
  });
});
