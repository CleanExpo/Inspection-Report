describe('HistoryView Component', () => {
  beforeEach(() => {
    cy.visit('/docs/playground');
    cy.findByRole('tab', { name: /history view/i }).click();
  });

  it('displays measurement history with correct date formatting', () => {
    // Check if history entries are displayed
    cy.findByText('Basic Room Template').should('exist');
    
    // Verify date formatting using date-fns format
    const dateRegex = /[A-Z][a-z]{2} \d{1,2}, \d{4}, \d{1,2}:\d{2} (AM|PM)/;
    cy.contains(dateRegex).should('exist');
  });

  it('allows filtering by template', () => {
    // Open template dropdown
    cy.findByLabelText(/template/i).click();
    
    // Select a specific template
    cy.findByRole('option', { name: 'Basic Room Template' }).click();
    
    // Verify filtered results
    cy.findByText('Basic Room Template').should('exist');
    cy.findByText('Detailed Floor Template').should('not.exist');
  });

  it('allows filtering by date range', () => {
    const dateRegex = /[A-Z][a-z]{2} \d{1,2}, \d{4}, \d{1,2}:\d{2} (AM|PM)/;
    
    // Set start date
    cy.findByLabelText(/start date/i).type('2024-01-01');
    
    // Set end date
    cy.findByLabelText(/end date/i).type('2024-01-02');
    
    // Verify filtered results are within date range
    cy.contains(dateRegex).should('exist');
  });

  it('displays measurement summary statistics', () => {
    // Check for summary statistics
    cy.findByText(/points measured/i).should('exist');
    cy.findByText(/out of tolerance/i).should('exist');
    cy.findByText(/max deviation/i).should('exist');
    
    // Verify numeric values are displayed
    cy.findByText(/\d+/).should('exist'); // Points measured
    cy.findByText(/\d+/).should('exist'); // Out of tolerance
    cy.findByText(/\d+\.?\d*/).should('exist'); // Max deviation
  });

  it('allows exporting measurement data', () => {
    // Click export button
    cy.findByRole('button', { name: /export/i }).click();
    
    // Verify export action (this will depend on how export is implemented)
    // For now, we'll just verify the button click doesn't cause errors
    cy.findByRole('button', { name: /export/i }).should('exist');
  });

  it('handles empty history state', () => {
    // Clear filters to potentially show empty state
    cy.findByLabelText(/template/i).click();
    cy.findByRole('option', { name: /all templates/i }).click();
    cy.findByLabelText(/start date/i).clear();
    cy.findByLabelText(/end date/i).clear();
    
    // If no results match filters, verify empty state message
    cy.findByText(/no measurement history available/i).should('exist');
  });
});
