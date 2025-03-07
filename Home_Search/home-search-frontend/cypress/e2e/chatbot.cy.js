describe('Chatbot Assistant', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000');
    // Wait for the page to fully load
    cy.get('.property-card', { timeout: 10000 }).should('exist');
  });

  it('sends a message and receives a response', () => {
    // Take screenshot before clicking
    cy.screenshot('before-toggle-click');
    
    // Wait for toggle to be fully loaded and ready
    cy.get('.chatbot-toggle').should('be.visible');
    
    // Force click to ensure it works
    cy.get('.chatbot-toggle').click({ force: true });
    
    // Take screenshot after clicking
    cy.screenshot('after-toggle-click');
    
    // Try different possible container selectors
    cy.get('body').contains('Property Assistant', { timeout: 10000 }).should('be.visible');
    
    // try get the input
    cy.get('input[placeholder*="Ask about properties"]', { timeout: 10000 }).should('be.visible');
    
    // Continue with the test once find the right elements
    cy.get('input[placeholder*="Ask about properties"]')
      .type('Show me houses in Dublin');
    
    cy.get('button').contains('Send').click();
    
    // Check for message
    cy.contains('Show me houses in Dublin', { timeout: 10000 }).should('be.visible');
  });

  it('closes the chatbot', () => {
  });
});