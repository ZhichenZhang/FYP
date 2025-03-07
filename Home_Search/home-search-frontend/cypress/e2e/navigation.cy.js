describe('Site Navigation', () => {
    beforeEach(() => {
      cy.visit('http://localhost:3000');
    });
  
    it('navigates between main sections', () => {
      // Go to favorites page
      cy.get('a').contains('Favorites').click();
      cy.url().should('include', '/favorites');
      
      // Go to properties page
      cy.get('a').contains('Properties').click();
      cy.url().should('include', '/properties');
      
      // Go to profile page
      cy.get('a').contains('My Profile').click();
      cy.url().should('include', '/profile');
      cy.contains('Name: Zhichen Zhang').should('be.visible');
    });
  
    it('uses back-to-top button', () => {
      // Scroll down to make back-to-top button appear
      cy.scrollTo('bottom');
      
      // Click back-to-top button
      cy.get('.back-to-top').should('be.visible').click();
      
      // Verify scroll position is at top
      cy.window().its('scrollY').should('equal', 0);
    });
  });