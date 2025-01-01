import { NextApiResponse } from 'next';

export interface RateLimitConfig {
  tokensPerInterval: number;
  interval: number; // in milliseconds
  burstLimit?: number;
}

export interface RateLimiterBucket {
  tokens: number;
  lastRefill: number;
}

export class RateLimiter {
  private buckets: Map<string, RateLimiterBucket>;
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.buckets = new Map();
    this.config = {
      tokensPerInterval: config.tokensPerInterval,
      interval: config.interval,
      burstLimit: config.burstLimit || config.tokensPerInterval
    };
  }

  private refillTokens(bucket: RateLimiterBucket): void {
    const now = Date.now();
    const timePassed = now - bucket.lastRefill;
    const tokensToAdd = Math.floor(
      (timePassed * this.config.tokensPerInterval) / this.config.interval
    );

    if (tokensToAdd > 0) {
      bucket.tokens = Math.min(
        bucket.tokens + tokensToAdd,
        this.config.burstLimit!
      );
      bucket.lastRefill = now;
    }
  }

  public tryConsume(clientId: string, tokens: number = 1): boolean {
    let bucket = this.buckets.get(clientId);
    
    if (!bucket) {
      bucket = {
        tokens: this.config.burstLimit!,
        lastRefill: Date.now()
      };
      this.buckets.set(clientId, bucket);
    }

    this.refillTokens(bucket);

    if (bucket.tokens >= tokens) {
      bucket.tokens -= tokens;
      return true;
    }

    return false;
  }

  public getRemainingTokens(clientId: string): number {
    const bucket = this.buckets.get(clientId);
    if (!bucket) {
      return this.config.burstLimit!;
    }

    this.refillTokens(bucket);
    return bucket.tokens;
  }

  public addRateLimitHeaders(res: NextApiResponse, clientId: string): void {
    const remaining = this.getRemainingTokens(clientId);
    const resetTime = new Date(Date.now() + this.config.interval).toUTCString();

    res.setHeader('X-RateLimit-Limit', this.config.tokensPerInterval.toString());
    res.setHeader('X-RateLimit-Remaining', remaining.toString());
    res.setHeader('X-RateLimit-Reset', resetTime);
  }
}
