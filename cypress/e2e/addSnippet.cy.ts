import { BACKEND_URL } from "../../src/utils/constants";

describe('Add snippet tests', () => {
  beforeEach(() => {
    cy.loginToAuth0(
      Cypress.env("AUTH0_USERNAME"),
      Cypress.env("AUTH0_PASSWORD")
    )
  })
  it('Can add snippets manually', () => {
    cy.visit("/")

    // Intercept the file types request to ensure it loads before we interact with the select
    cy.intercept('GET', BACKEND_URL + "/snippets/filetypes").as('getFileTypes');

    cy.intercept('POST', BACKEND_URL + "/snippets/create", (req) => {
      req.reply((res) => {
        expect(res.body).to.include.keys("id", "name", "content", "language")
        expect(res.statusCode).to.eq(200);
      });
    }).as('postRequest');

    /* ==== Generated with Cypress Studio ==== */
    cy.get('.css-9jay18 > .MuiButton-root').click();
    cy.get('.MuiList-root > [tabindex="0"]').click();

    // Wait for file types to load before interacting with the select
    cy.wait('@getFileTypes');

    cy.get('#name').type('Some snippet name');
    cy.get('#demo-simple-select').click();

    // The language value is lowercase "printscript" based on the API response
    cy.get('[data-testid="menu-option-printscript"]').should('be.visible').click();

    cy.get('[data-testid="add-snippet-code-editor"]').click();
    cy.get('[data-testid="add-snippet-code-editor"]').type(`const snippet: String = "some snippet" \n print(snippet)`);

    // Use the new data-testid for the save button
    cy.get('[data-testid="save-snippet-button"]').click();

    cy.wait('@postRequest').its('response.statusCode').should('eq', 200);
  })

  it('Can add snippets via file', () => {
    cy.visit("/")

    cy.intercept('POST', BACKEND_URL + "/snippets/create", (req) => {
      req.reply((res) => {
        expect(res.body).to.include.keys("id", "name", "content", "language")
        expect(res.statusCode).to.eq(200);
      });
    }).as('postRequest');

    /* ==== Generated with Cypress Studio ==== */
    cy.get('[data-testid="upload-file-input"').selectFile("cypress/fixtures/example_ps.ps", { force: true })

    // Wait for the modal to open and be ready
    cy.get('[data-testid="save-snippet-button"]').should('be.visible');

    // Use the new data-testid for the save button
    cy.get('[data-testid="save-snippet-button"]').click();

    cy.wait('@postRequest').its('response.statusCode').should('eq', 200);
  })
})
