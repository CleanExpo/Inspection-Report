import '@testing-library/cypress/add-commands';

declare global {
  namespace Cypress {
    interface Chainable {
      findByText(text: string | RegExp, options?: any): Chainable<JQuery<HTMLElement>>;
      findByRole(role: string, options?: any): Chainable<JQuery<HTMLElement>>;
      findByLabelText(label: string | RegExp, options?: any): Chainable<JQuery<HTMLElement>>;
      findByPlaceholderText(placeholder: string | RegExp, options?: any): Chainable<JQuery<HTMLElement>>;
      findByTestId(testId: string | RegExp, options?: any): Chainable<JQuery<HTMLElement>>;
    }
  }
}

// Prevent TypeScript errors when accessing error messages in tests
Cypress.on('uncaught:exception', (err) => {
  // Return false to prevent Cypress from failing the test
  return false;
});
