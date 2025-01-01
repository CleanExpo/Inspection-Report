import { CircuitBreaker, withRetry, ApiErrorResponse, errorHandler } from './errorHandler';

interface RequestConfig extends RequestInit {
  retryConfig?: {
    maxRetries?: number;
    initialDelay?: number;
    maxDelay?: number;
    backoffFactor?: number;
  };
  circuitBreakerConfig?: {
    failureThreshold?: number;
    resetTimeout?: number;
  };
}

interface BatchRequest {
  endpoint: string;
  method?: string;
  body?: any;
}

class ApiClient {
  private static instance: ApiClient;
  private circuitBreaker: CircuitBreaker;
  private cache: Map<string, { data: any; timestamp: number }>;
  private readonly cacheDuration: number = 5 * 60 * 1000; // 5 minutes

  private constructor() {
    this.circuitBreaker = new CircuitBreaker();
    this.cache = new Map();
  }

  public static getInstance(): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient();
    }
    return ApiClient.instance;
  }

  private getCacheKey(endpoint: string, config?: RequestConfig): string {
    return `${config?.method || 'GET'}-${endpoint}-${JSON.stringify(config?.body || '')}`;
  }

  private isCacheValid(timestamp: number): boolean {
    return Date.now() - timestamp < this.cacheDuration;
  }

  private async makeRequest(endpoint: string, config?: RequestConfig): Promise<any> {
    const cacheKey = this.getCacheKey(endpoint, config);

    // Check cache for GET requests
    if ((!config?.method || config.method === 'GET') && !config?.body) {
      const cachedData = this.cache.get(cacheKey);
      if (cachedData && this.isCacheValid(cachedData.timestamp)) {
        return cachedData.data;
      }
    }

    // Optimize payload size
    if (config?.body) {
      config.body = JSON.stringify(this.optimizePayload(config.body));
    }

    const operation = async () => {
      const response = await fetch(endpoint, {
        ...config,
        headers: {
          'Content-Type': 'application/json',
          ...config?.headers,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new ApiErrorResponse(response.status, errorData.error);
      }

      const data = await response.json();

      // Cache successful GET responses
      if ((!config?.method || config.method === 'GET') && !config?.body) {
        this.cache.set(cacheKey, {
          data,
          timestamp: Date.now(),
        });
      }

      return data;
    };

    return this.circuitBreaker.execute(async () => {
      return await withRetry(operation, config?.retryConfig);
    });
  }

  private optimizePayload(data: any): any {
    // Remove undefined and null values
    if (typeof data === 'object' && data !== null) {
      return Object.fromEntries(
        Object.entries(data).filter(([_, value]) => value != null)
      );
    }
    return data;
  }

  public async get<T>(endpoint: string, config?: RequestConfig): Promise<T> {
    return this.makeRequest(endpoint, { ...config, method: 'GET' });
  }

  public async post<T>(endpoint: string, data: any, config?: RequestConfig): Promise<T> {
    return this.makeRequest(endpoint, {
      ...config,
      method: 'POST',
      body: data,
    });
  }

  public async put<T>(endpoint: string, data: any, config?: RequestConfig): Promise<T> {
    return this.makeRequest(endpoint, {
      ...config,
      method: 'PUT',
      body: data,
    });
  }

  public async delete<T>(endpoint: string, config?: RequestConfig): Promise<T> {
    return this.makeRequest(endpoint, { ...config, method: 'DELETE' });
  }

  public async batch(requests: BatchRequest[]): Promise<any[]> {
    // Group requests by endpoint to optimize network calls
    const groupedRequests = requests.reduce((groups, request) => {
      const key = request.endpoint;
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(request);
      return groups;
    }, {} as Record<string, BatchRequest[]>);

    // Process each group in parallel
    const results = await Promise.all(
      Object.values(groupedRequests).map(async (group) => {
        const endpoint = group[0].endpoint;
        const batchedData = group.map((request) => ({
          method: request.method || 'GET',
          body: request.body,
        }));

        return this.post(endpoint + '/batch', batchedData);
      })
    );

    // Flatten results
    return results.flat();
  }

  public clearCache(): void {
    this.cache.clear();
  }

  public resetCircuitBreaker(): void {
    this.circuitBreaker = new CircuitBreaker();
  }
}

export const apiClient = ApiClient.getInstance();
