import { AUTH0_USERNAME, AUTH0_PASSWORD } from "../../src/utils/constants";

describe('Protected routes test', () => {
  it('should redirect to Auth0 login when accessing a protected route unauthenticated', () => {
    // Clear any existing sessions
    cy.clearAllSessionStorage();
    cy.clearAllCookies();
    cy.clearAllLocalStorage();

    // Visit the protected route
    cy.visit('/');

    // Wait for Auth0 redirect
    cy.wait(2000);

    // Check if the URL is redirected to Auth0 login page
    cy.url().should('include', Cypress.env('VITE_AUTH0_DOMAIN'));
    cy.url().should('include', '/u/login');
  });

  it('should display Auth0 login content', () => {
    // Clear any existing sessions
    cy.clearAllSessionStorage();
    cy.clearAllCookies();
    cy.clearAllLocalStorage();

    // Visit the app which will redirect to Auth0
    cy.visit('/');

    // Wait for Auth0 redirect
    cy.wait(2000);

    // Verify we're on Auth0 domain and check for login elements
    cy.origin(
      Cypress.env('VITE_AUTH0_DOMAIN'),
      () => {
        // Look for elements that appear on Auth0 login page
        cy.get('input#username').should('exist');
        cy.get('input#password').should('exist');
        cy.get('button[data-action-button-primary="true"]').should('exist');
      }
    );
  });

  it('should not redirect to login when the user is already authenticated', () => {
    // Login using the custom command
    cy.loginToAuth0(
      Cypress.env("AUTH0_USERNAME"),
      Cypress.env("AUTH0_PASSWORD")
    );

    // Visit the protected route
    cy.visit('/');

    // Wait for page to load
    cy.wait(1000);

    // Check that we stayed on the app (not redirected to Auth0)
    cy.url().should('equal', 'http://localhost:5173/');
    cy.url().should('not.include', Cypress.env('VITE_AUTH0_DOMAIN'));
    cy.url().should('not.include', '/u/login');
  });

  it('should have valid Auth0 session after login', () => {
    // Login using the custom command
    cy.loginToAuth0(
      Cypress.env("AUTH0_USERNAME"),
      Cypress.env("AUTH0_PASSWORD")
    );

    // Visit the app
    cy.visit('/');

    // Validate that Auth0 token exists in localStorage
    cy.window().its('localStorage').then((ls) => {
      const keys = Object.keys(ls);
      const hasToken = keys.some(key => key.includes('auth0spajs'));
      expect(hasToken, 'Auth0 token should exist in localStorage').to.be.true;
    });
  });
});
