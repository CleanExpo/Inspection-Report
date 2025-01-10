interface JobDetails {
  causeOfLoss?: string;
  claimType?: string;
  classification?: string;
  category?: string;
}

// Mock data for development
const mockJobDetails: Record<string, JobDetails> = {
  'JOB123': {
    causeOfLoss: 'Burst pipe in kitchen',
    claimType: 'Water',
    classification: 'Class 2 (Moderate Damage)',
    category: 'Category 2 (Grey Water)',
  }
};

export async function fetchJobDetails(jobNumber: string): Promise<JobDetails> {
  try {
    // For development, return mock data
    if (process.env.NODE_ENV === 'development') {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));
      return mockJobDetails[jobNumber] || {};
    }

    // In production, make actual API call
    const response = await fetch(`/api/jobs/${jobNumber}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch job details: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching job details:", error);
    // Return empty object if fetch fails - form will start with empty fields
    return {};
  }
}

export async function saveJobDetails(jobNumber: string, details: JobDetails): Promise<void> {
  try {
    // For development, log to console
    if (process.env.NODE_ENV === 'development') {
      console.log('Saving job details (mock):', { jobNumber, details });
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));
      mockJobDetails[jobNumber] = { ...mockJobDetails[jobNumber], ...details };
      return;
    }

    // In production, make actual API call
    const response = await fetch(`/api/jobs/${jobNumber}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(details),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to save job details: ${response.statusText}`);
    }
  } catch (error) {
    console.error("Error saving job details:", error);
    throw error;
  }
}
