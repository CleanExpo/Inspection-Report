import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Administration from '../../components/Administration';

// Mock the AdminDetailsForm component
jest.mock('../../components/AdminDetailsForm', () => {
  return function MockAdminDetailsForm() {
    return <div data-testid="admin-details-form">Mock Admin Details Form</div>;
  };
});

describe('Administration', () => {
  it('renders the administration section title', () => {
    render(<Administration />);
    expect(screen.getByText('Administration Section')).toBeInTheDocument();
  });

  it('renders the AdminDetailsForm component', () => {
    render(<Administration />);
    expect(screen.getByTestId('admin-details-form')).toBeInTheDocument();
  });

  it('applies correct styling classes', () => {
    const { container } = render(<Administration />);
    
    // Check for outer padding
    expect(container.firstChild).toHaveClass('p-6');
    
    // Check for form container styling
    expect(container.querySelector('.bg-white.rounded-lg.shadow-lg')).toBeInTheDocument();
  });
});
