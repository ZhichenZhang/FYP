describe('Favorites Management', () => {
    beforeEach(() => {
      // Clear localStorage to start clean
      cy.clearLocalStorage();
      cy.visit('http://localhost:3000');
      
      // Ensure properties loaded
      cy.get('.property-card', { timeout: 10000 }).should('exist');
    });
  
    it('adds and removes properties from favorites', () => {
      // Get first property address for later comparison
      cy.get('.property-card')
        .first()
        .find('.property-title')
        .invoke('text')
        .as('firstPropertyAddress');
      
      // Click favorite button on first property
      cy.get('.property-card')
        .first()
        .find('.favorite-button')
        .click();
      
      // Navigate to favorites page
      cy.get('a').contains('Favorites').click();
      
      // Verify we're on favorites page
      cy.url().should('include', '/favorites');
      
      // Verify the property is in favorites
      cy.get('@firstPropertyAddress').then(address => {
        cy.get('.property-card').should('exist');
        cy.get('.property-title').contains(address);
      });
      
      // Remove from favorites
      cy.get('.property-card')
        .first()
        .find('.favorite-button')
        .click();
      
      // Verify no properties in favorites
      cy.get('.property-card').should('not.exist');
      cy.contains('You haven\'t added any properties to your favorites yet').should('be.visible');
    });
  
    it('persists favorites after page reload', () => {
      // Add property to favorites
      cy.get('.property-card')
        .first()
        .find('.property-title')
        .invoke('text')
        .as('savedPropertyAddress');
      
      cy.get('.property-card')
        .first()
        .find('.favorite-button')
        .click();
      
      // Reload page
      cy.reload();
      
      // Navigate to favorites
      cy.get('a').contains('Favorites').click();
      
      // Verify property still in favorites
      cy.get('@savedPropertyAddress').then(address => {
        cy.get('.property-title').contains(address);
      });
    });
  });