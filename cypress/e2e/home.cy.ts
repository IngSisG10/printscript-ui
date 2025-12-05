import { BACKEND_URL, FRONTEND_URL } from "../../src/utils/constants";
import { CreateSnippet } from "../../src/utils/snippet";

describe('Home', () => {
  beforeEach(() => {
    cy.loginToAuth0(
      Cypress.env("AUTH0_USERNAME"),
      Cypress.env("AUTH0_PASSWORD")
    )
  })
  before(() => {
    process.env.FRONTEND_URL = Cypress.env("FRONTEND_URL");
    process.env.BACKEND_URL = Cypress.env("BACKEND_URL");
  })
  it('Renders home', () => {
    cy.visit(FRONTEND_URL)
    /* ==== Generated with Cypress Studio ==== */
    cy.get('.MuiTypography-h6').should('have.text', 'Printscript');
    cy.get('[data-testid="search-snippet-input"]').should('be.visible');
    cy.get('[data-testid="add-snippet-button"]').should('be.visible');
    cy.get('[data-testid="add-snippet-button"]').click();
    /* ==== End Cypress Studio ==== */
  })

  // You need to have at least 1 snippet in your DB for this test to pass
  it('Renders the first snippets', () => {
    cy.visit(FRONTEND_URL)
    const first10Snippets = cy.get('[data-testid="snippet-row"]')

    first10Snippets.should('have.length.greaterThan', 0)

    // Accept up to 10 snippets (the page size is 10, so having exactly 10 is valid)
    first10Snippets.should('have.length.at.most', 10)
  })

  it('Can create snippet find snippets by name', () => {
    cy.visit(FRONTEND_URL)
    const snippetData: CreateSnippet = {
      name: "Test name",
      content: "print(1)",
      language: "PrintScript",
      extension: ".ps"
    }

    cy.window().then((win) => {
      const auth0State = JSON.parse(localStorage.getItem(
        Object.keys(localStorage).find(key => key.startsWith('@@auth0spajs@@'))!
      )!);
      const accessToken = auth0State.body.access_token;

      cy.request({
        method: 'POST',
        url: BACKEND_URL + '/snippets/create',
        headers: {
          Authorization: `Bearer ${accessToken}`
        },
        body: snippetData,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.haveOwnProperty("id")

        // Set up intercept BEFORE triggering the search to capture the GET request
        cy.intercept('GET', '**/snippets/descriptors*').as('getSnippets');

        cy.get('[data-testid="search-snippet-input"]').clear();
        cy.get('[data-testid="search-snippet-input"]').type(snippetData.name + "{enter}");

        cy.wait("@getSnippets")
        cy.contains(snippetData.name).should('exist');
      })
    })
  })
})
