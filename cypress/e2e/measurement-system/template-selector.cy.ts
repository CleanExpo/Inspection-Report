describe('TemplateSelector Component', () => {
  beforeEach(() => {
    cy.visit('/docs/playground');
    // Ensure we're on the template selection view
    cy.findByRole('tab', { name: /template selection/i }).click();
  });

  it('displays available templates', () => {
    // Check for template names
    cy.findByText(/basic room template/i).should('exist');
    cy.findByText(/detailed floor template/i).should('exist');
  });

  it('shows template details', () => {
    // Check for template information
    cy.findByText(/grid spacing/i).should('exist');
    cy.findByText(/reference values/i).should('exist');
    cy.findByText(/points/i).should('exist');
  });

  it('allows template selection', () => {
    // Click on a template
    cy.findByText(/basic room template/i).click();
    
    // Verify selection state
    cy.findByText(/basic room template/i)
      .parent()
      .should('have.class', /selected|active/);
  });

  it('displays template measurement points', () => {
    // Select a template
    cy.findByText(/basic room template/i).click();
    
    // Check for point information
    cy.findByText(/corner 114/i).should('exist');
    cy.findByText(/corner 228/i).should('exist');
  });

  it('shows reference values correctly', () => {
    // Select a template
    cy.findByText(/basic room template/i).click();
    
    // Check for reference value display
    cy.findByText(/dry/i).should('exist');
    cy.findByText(/warning/i).should('exist');
    cy.findByText(/critical/i).should('exist');
    
    // Check for numeric values
    cy.findByText(/\d+/).should('exist'); // Reference values
  });

  it('displays grid spacing information', () => {
    // Select a template
    cy.findByText(/basic room template/i).click();
    
    // Check for grid spacing value
    cy.findByText(/grid spacing/i)
      .parent()
      .findByText(/\d+(\.\d+)?/).should('exist');
  });

  it('shows template creation date', () => {
    // Select a template
    cy.findByText(/basic room template/i).click();
    
    // Check for date information
    const dateRegex = /[A-Z][a-z]{2} \d{1,2}, \d{4}/;
    cy.contains(dateRegex).should('exist');
  });

  it('handles template switching', () => {
    // Select first template
    cy.findByText(/basic room template/i).click();
    
    // Switch to second template
    cy.findByText(/detailed floor template/i).click();
    
    // Verify second template is selected
    cy.findByText(/detailed floor template/i)
      .parent()
      .should('have.class', /selected|active/);
  });

  it('maintains selection state', () => {
    // Select a template
    cy.findByText(/basic room template/i).click();
    
    // Switch tabs and return
    cy.findByRole('tab', { name: /history view/i }).click();
    cy.findByRole('tab', { name: /template selection/i }).click();
    
    // Verify selection is maintained
    cy.findByText(/basic room template/i)
      .parent()
      .should('have.class', /selected|active/);
  });

  it('displays template description', () => {
    // Select a template
    cy.findByText(/basic room template/i).click();
    
    // Check for description
    cy.findByText(/standard room measurement points/i).should('exist');
  });
});
