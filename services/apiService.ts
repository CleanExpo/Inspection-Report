import { JobDetails } from "../types/job";

class ApiService {
  private baseUrl = "/api";

  async fetchJobDetails(jobNumber: string): Promise<JobDetails> {
    try {
      const response = await fetch(`${this.baseUrl}/jobs/${jobNumber}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching job details:", error);
      throw error;
    }
  }

  async updateJobDetails(jobNumber: string, details: Partial<JobDetails>): Promise<JobDetails> {
    try {
      const response = await fetch(`${this.baseUrl}/jobs/${jobNumber}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(details),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error updating job details:", error);
      throw error;
    }
  }

  async submitFinalReport(data: JobDetails): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/reports/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to submit report");
      }
    } catch (error) {
      console.error("Error submitting final report:", error);
      throw error;
    }
  }
}

export const apiService = new ApiService();
