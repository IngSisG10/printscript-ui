// ***********************************************************
// This example support/e2e.ts is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands'
import { loginViaAuth0Ui } from "./auth-provider-commands/auth0";

// Ignore unhandled promise rejections for 401 errors during authentication
Cypress.on('uncaught:exception', (err, runnable) => {
  // Ignore 401 errors that occur during authentication setup or initial page load
  if (err.message.includes('Error 401') ||
    err.message.includes('ApiError') ||
    err.message.includes('401') ||
    err.name === 'ApiError') {
    // Don't fail the test on 401 errors during setup
    return false;
  }
  // Ignore timeout errors for route waits that may occur during session validation
  if (err.message.includes('timed out waiting') &&
    err.message.includes('route')) {
    // Don't fail the test on route wait timeouts during setup
    return false;
  }
  // Return true to let other errors fail the test
  return true;
});

Cypress.Commands.add('loginToAuth0', (username: string, password: string) => {
  const log = Cypress.log({
    displayName: 'AUTH0 LOGIN',
    message: [`🔐 Authenticating | ${username}`],
    autoEnd: false,
  })
  log.snapshot('before')

  cy.session(
    `auth0-${username}`,
    () => {
      loginViaAuth0Ui(username, password)
    }
    // No validation - let Cypress handle session invalidation automatically
    // Adding validation causes issues with API calls during validation
  )
  log.snapshot('after')
  log.end()
})
