import { BACKEND_URL } from "../../src/utils/constants";

describe('Add snippet tests', () => {
  beforeEach(() => {
    cy.loginToAuth0(
      Cypress.env("AUTH0_USERNAME"),
      Cypress.env("AUTH0_PASSWORD")
    )
    // Wait a bit for authentication to be fully established
    cy.wait(500)
  })
  it('Can add snippets manually', () => {
    cy.visit("/")

    // Intercept the file types request to ensure it loads before we interact with the select
    cy.intercept('GET', BACKEND_URL + "/snippets/filetypes").as('getFileTypes');

    cy.intercept('POST', BACKEND_URL + "/snippets/create").as('postRequest');

    /* ==== Generated with Cypress Studio ==== */
    cy.get('[data-testid="add-snippet-button"]').click();
    cy.get('[data-testid="create-snippet-menu-item"]').click();

    // Wait for file types to load before interacting with the select
    cy.wait('@getFileTypes').then((interception) => {
       assert.isNotNull(interception.response.body, 'La API respondió con datos');
       assert.isNotEmpty(interception.response.body, 'La lista de lenguajes no está vacía');
    });

    cy.get('#name').type('Some snippet name');
    cy.get('#demo-simple-select').click();

    // Wait for the MUI Select menu to open (it renders in a portal)
    cy.get('[role="presentation"]').should('be.visible');

    // The language value is lowercase "printscript" based on the API response
    cy.get('[data-testid="menu-option-PrintScript"]').should('be.visible').click();

    cy.get('[data-testid="add-snippet-code-editor"]').click();
    cy.get('[data-testid="add-snippet-code-editor"]').type(`const snippet: String = "some snippet" \n print(snippet)`);

    // Use the new data-testid for the save button
    cy.get('[data-testid="save-snippet-button"]').click();

    cy.wait('@postRequest').then((interception) => {
      expect(interception.response?.statusCode).to.eq(200);
      expect(interception.response?.body).to.have.property("id");
    });
  })

  it('Can add snippets via file', () => {
    cy.visit("/")

    cy.intercept('POST', BACKEND_URL + "/snippets/create").as('postRequest');

    /* ==== Generated with Cypress Studio ==== */
    // First, open the menu to access the file upload option
    cy.get('[data-testid="add-snippet-button"]').click();
    cy.get('[data-testid="load-snippet-menu-item"]').click();
    
    // Now select the file - this should trigger the file load and open the modal
    cy.get('[data-testid="upload-file-input"]').selectFile("cypress/fixtures/example_ps.ps", { force: true });

    // Wait for the modal to appear in the DOM first
    cy.get('[data-testid="modal-wrapper"]', { timeout: 10000 }).should('exist');
    
    // Then wait for the modal content to be visible
    cy.contains('Add Snippet', { timeout: 10000 }).should('be.visible');
    
    // Wait for the modal to be fully rendered - check for the name input field
    // Using the id selector as fallback since Material-UI Input may not pass data-testid correctly
    cy.get('#name', { timeout: 10000 })
      .should('be.visible')
      .should(($input) => {
        const value = $input.val() as string;
        expect(value).to.not.be.empty;
      });
    
    // Wait for the button to be available and enabled
    cy.get('[data-testid="save-snippet-button"]', { timeout: 10000 })
      .should('be.visible')
      .should('not.be.disabled')
      .click();

    cy.wait('@postRequest').then((interception) => {
      expect(interception.response?.statusCode).to.eq(200);
      expect(interception.response?.body).to.have.property("id");
    });
  })
})
