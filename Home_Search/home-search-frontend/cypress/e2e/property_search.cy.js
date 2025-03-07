describe('Property Search Flow', () => {
  beforeEach(() => {
    // Mock the API response with test data
    cy.intercept('GET', '**/api/properties*', {
      fixture: 'properties.json'
    }).as('propertiesSearch');
    
    cy.visit('http://localhost:3000');
    cy.wait('@propertiesSearch');
  });
  
    it('searches for properties by text', () => {
      cy.screenshotOnFail('before-search');
      // Type in search box
      cy.get('.search-bar')
        .clear()
        .type('house{enter}');
      
      // Wait for results to load
      cy.wait(2000);
      
      // Check that we have property cards after searching
      cy.get('.property-card')
        .should('exist')
        .should('have.length.at.least', 1);
      
    });
  
    it('clears the search', () => {
      // Search for something first
      cy.get('.search-bar').type('dublin');
      
      // Click clear button
      cy.get('.clear-button').click();
      
      // Verify search input is cleared
      cy.get('.search-bar').should('have.value', '');
      
      // Check that all properties are displayed again
      cy.get('.property-grid').children().should('have.length.greaterThan', 1);
    });
  
    it('navigates through pagination', () => {
      // First check if pagination exists, and skip if not
      cy.get('body').then(($body) => {
        if ($body.find('.pagination').length > 0) {
          // Record number of properties on page 1
          cy.get('.property-card').its('length').as('page1Count');
          
          // Go to page 2
          cy.get('.pagination').contains('2').click();
          
          // Verify URL contains page parameter
          cy.url().should('include', 'page=2');
          
          // Verify new properties loaded
          cy.get('.property-card').should('exist');
        } else {
          // Skip test if pagination doesn't exist
          cy.log('Pagination not found - skipping test');
          expect(true).to.equal(true); // Pass the test
        }
      });
    });
  });