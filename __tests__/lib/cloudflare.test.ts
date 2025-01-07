import { CloudflareClient, CloudflareEnvConfig } from '../../lib/cloudflare';

describe('CloudflareClient', () => {
  const mockConfig: CloudflareEnvConfig = {
    CLOUDFLARE_API_TOKEN: 'test-token',
    CLOUDFLARE_ZONE_ID: '12345678901234567890123456789012',
    CLOUDFLARE_ACCOUNT_ID: '12345678901234567890123456789012',
  };

  let client: CloudflareClient;
  let fetchMock: jest.Mock;

  beforeEach(() => {
    fetchMock = jest.fn();
    global.fetch = fetchMock;
    client = new CloudflareClient(mockConfig);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('constructor', () => {
    it('should throw error for invalid token', () => {
      expect(() => new CloudflareClient({
        ...mockConfig,
        CLOUDFLARE_API_TOKEN: ''
      })).toThrow('Invalid Cloudflare configuration');
    });

    it('should throw error for invalid zone ID', () => {
      expect(() => new CloudflareClient({
        ...mockConfig,
        CLOUDFLARE_ZONE_ID: 'invalid'
      })).toThrow('Invalid Cloudflare configuration');
    });
  });

  describe('setupCDN', () => {
    beforeEach(() => {
      fetchMock.mockImplementation(() => Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ result: {} })
      }));
    });

    it('should configure SSL settings', async () => {
      await client.setupCDN();

      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining('/settings/ssl'),
        expect.objectContaining({
          method: 'PATCH',
          body: expect.stringContaining('strict')
        })
      );
    });

    it('should configure cache rules', async () => {
      await client.setupCDN();

      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining('/cache/rules'),
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('bypass_cache')
        })
      );
    });

    it('should handle API errors', async () => {
      fetchMock.mockImplementationOnce(() => Promise.resolve({
        ok: false,
        json: () => Promise.resolve({
          errors: [{ message: 'API Error' }]
        })
      }));

      await expect(client.setupCDN()).rejects.toThrow('API Error');
    });
  });

  describe('verifySetup', () => {
    it('should verify all configurations', async () => {
      fetchMock
        .mockImplementationOnce(() => Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ result: { value: 'strict' } })
        }))
        .mockImplementationOnce(() => Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ result: { rules: [{}] } })
        }))
        .mockImplementationOnce(() => Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ result: { value: {} } })
        }))
        .mockImplementationOnce(() => Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ result: [{}] })
        }));

      const result = await client.verifySetup();

      expect(result).toEqual({
        ssl: true,
        cacheRules: true,
        securityHeaders: true,
        rateLimits: true
      });
    });

    it('should handle missing configurations', async () => {
      fetchMock.mockImplementation(() => Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ result: {} })
      }));

      const result = await client.verifySetup();

      expect(result).toEqual({
        ssl: false,
        cacheRules: false,
        securityHeaders: false,
        rateLimits: false
      });
    });
  });

  describe('purgeCache', () => {
    it('should purge specific URLs', async () => {
      const urls = ['https://example.com/file1', 'https://example.com/file2'];
      await client.purgeCache(urls);

      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining('/purge_cache'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ files: urls })
        })
      );
    });

    it('should purge everything when no URLs provided', async () => {
      await client.purgeCache();

      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining('/purge_cache'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ purge_everything: true })
        })
      );
    });
  });
});
