describe('Snippet Detail tests', () => {
  beforeEach(() => {
    cy.loginToAuth0(
      Cypress.env("AUTH0_USERNAME"),
      Cypress.env("AUTH0_PASSWORD")
    )

    // Visit the page after authentication
    cy.visit("/")

    // Wait for the page to load by checking for key elements
    // This is more reliable than intercepts when using cy.session
    cy.get('[data-testid="search-snippet-input"]', { timeout: 10000 }).should('be.visible')

    // Wait for snippets to load by checking for snippet rows
    cy.get('[data-testid="snippet-row"]', { timeout: 10000 }).should('have.length.greaterThan', 0)

    // Click on the first snippet in the table to open detail view
    cy.get('[data-testid="snippet-row"]').first().click();

    // Wait for the snippet detail drawer to appear (it's a Drawer, not a Modal)
    cy.get('.MuiDrawer-root', { timeout: 10000 }).should('be.visible')
    // Wait for the snippet content to load - check for the editor or save button
    cy.get('[data-testid="SaveIcon"]', { timeout: 10000 }).should('be.visible')
  })

  it('Can share a snippet ', () => {
    // Click the Share button to open the modal
    cy.get('[aria-label="Share"]').click();

    // Wait for the share modal to appear
    cy.get('[data-testid="modal-wrapper"]', { timeout: 10000 }).should('be.visible');
    cy.contains('Share your snippet').should('be.visible');

    // Wait for the autocomplete to be ready
    cy.get('[data-testid="share-user-autocomplete"]', { timeout: 15000 }).should('be.visible');

    // Wait a bit for users to load (the component has a debounce, so give it time)
    cy.wait(3500); // Wait for the 3 second debounce + API call time

    // Click on the autocomplete container to open the dropdown
    cy.get('[data-testid="share-user-autocomplete"]').click();

    // Wait for the dropdown listbox to appear (MUI Autocomplete renders in a portal)
    cy.get('[role="listbox"]', { timeout: 10000 }).should('be.visible');

    // Wait for the dropdown options to appear and select the first one
    cy.get('[role="option"]', { timeout: 10000 }).should('have.length.greaterThan', 0);
    cy.get('[role="option"]').first().click();

    // Verify that a user was selected (the button should be enabled)
    cy.get('[data-testid="confirm-share-button"]').should('not.be.disabled').click();

    // Wait a bit for the share operation to complete
    cy.wait(2000)
  })

  it('Can run snippets', function () {
    cy.get('[data-testid="PlayArrowIcon"]').click();
    cy.get('.css-1hpabnv > .MuiBox-root > div > .npm__react-simple-code-editor__textarea').should("have.length.greaterThan", 0);
  });

  it('Can format snippets', function () {
    cy.get('[data-testid="ReadMoreIcon"] > path').click();
  });

  it('Can save snippets', function () {
    cy.get('.css-10egq61 > .MuiBox-root > div > .npm__react-simple-code-editor__textarea').click();
    cy.get('.css-10egq61 > .MuiBox-root > div > .npm__react-simple-code-editor__textarea').type("Some new line");
    cy.get('[data-testid="SaveIcon"] > path').click();
  });

  it('Can delete snippets', function () {
    cy.get('[data-testid="DeleteIcon"] > path').click();
  });
})
