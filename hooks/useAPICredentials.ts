import { useState, useCallback } from 'react';
import { APICredential, NewAPICredential } from '../services/apiCredentialService';

interface UseAPICredentialsReturn {
  isLoading: boolean;
  error: string | null;
  credentials: APICredential[];
  saveCredential: (credential: NewAPICredential) => Promise<APICredential | null>;
  testCredential: (id: string) => Promise<boolean>;
  deleteCredential: (id: string) => Promise<boolean>;
  updateCredentialStatus: (id: string, status: APICredential['status']) => Promise<boolean>;
}

export function useAPICredentials(): UseAPICredentialsReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [credentials, setCredentials] = useState<APICredential[]>([]);

  const saveCredential = useCallback(async (credential: NewAPICredential): Promise<APICredential | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const response: Response = await fetch('/api/credentials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credential),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save credential');
      }

      const data: { message: string; credential: APICredential } = await response.json();
      if (!data.credential) {
        throw new Error('No credential data received');
      }
      setCredentials((prev) => [...prev, data.credential]);
      return data.credential;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save credential';
      setError(errorMessage);
      console.error('Error saving credential:', errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const testCredential = useCallback(async (id: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const response: Response = await fetch(`/api/credentials/test?id=${id}`, {
        method: 'POST',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to test credential');
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Test failed');
      }

      const result: { success: boolean } = await response.json();
      
      // Update credential status in local state
      setCredentials((prev) =>
        prev.map((cred) =>
          cred.id === id
            ? { 
                ...cred, 
                status: result.success ? 'active' : 'error', 
                lastTested: new Date().toISOString()
              }
            : cred
        )
      );

      return result.success || false;
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to test credential');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteCredential = useCallback(async (id: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const response: Response = await fetch(`/api/credentials?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete credential');
      }

      setCredentials((prev) => prev.filter((cred) => cred.id !== id));
      return true;
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to delete credential');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateCredentialStatus = useCallback(
    async (id: string, status: APICredential['status']): Promise<boolean> => {
      setIsLoading(true);
      setError(null);
      try {
      const response: Response = await fetch(`/api/credentials?id=${id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to update credential status');
        }

        setCredentials((prev) =>
          prev.map((cred) => (cred.id === id ? { ...cred, status } : cred))
        );
        return true;
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to update credential status');
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return {
    isLoading,
    error,
    credentials,
    saveCredential,
    testCredential,
    deleteCredential,
    updateCredentialStatus,
  };
}
