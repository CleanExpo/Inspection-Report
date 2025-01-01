import { render, screen } from '@testing-library/react';
import { SaveStatus } from '../components/SaveStatus';

describe('SaveStatus', () => {
  it('shows nothing when no save has occurred', () => {
    const { container } = render(
      <SaveStatus isSaving={false} lastSaved={null} error={null} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('shows saving indicator when saving', () => {
    render(<SaveStatus isSaving={true} lastSaved={null} error={null} />);
    expect(screen.getByText('Saving...')).toBeInTheDocument();
  });

  it('shows last saved time when save is complete', () => {
    const savedDate = new Date();
    render(
      <SaveStatus isSaving={false} lastSaved={savedDate} error={null} />
    );
    expect(screen.getByText(`Saved ${savedDate.toLocaleTimeString()}`)).toBeInTheDocument();
  });

  it('shows error message when save fails', () => {
    const error = new Error('Failed to save');
    render(
      <SaveStatus isSaving={false} lastSaved={null} error={error} />
    );
    expect(screen.getByText('Save failed')).toBeInTheDocument();
    expect(screen.getByTitle(error.message)).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(
      <SaveStatus
        isSaving={true}
        lastSaved={null}
        error={null}
        className="custom-class"
      />
    );
    expect(screen.getByText('Saving...').parentElement).toHaveClass('custom-class');
  });
});
