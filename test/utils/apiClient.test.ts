import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ApiClient } from '../../src/utils/apiClient';
import { LLMProvider } from '../../src/types';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock HunterAuthService
vi.mock('../../src/utils/hunterAuth', () => ({
  HunterAuthService: vi.fn().mockImplementation(() => ({
    sendMessage: vi.fn().mockResolvedValue('Mocked response'),
  })),
}));

describe('ApiClient', () => {
  const mockProvider: LLMProvider = {
    id: 'test',
    name: 'Test Provider',
    apiUrl: 'https://api.test.com',
    apiKey: 'test-key',
    requestFormat: 'openai',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockClear();
  });

  describe('OpenAI format', () => {
    it('sends message with OpenAI format', async () => {
      const mockResponse = {
        ok: true,
        json: () => Promise.resolve({
          choices: [{ message: { content: 'Test response' } }],
        }),
      };
      mockFetch.mockResolvedValueOnce(mockResponse);

      const client = new ApiClient(mockProvider);
      const result = await client.sendMessage([
        { role: 'user', content: 'Hello' },
      ]);

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.test.com',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Authorization': 'Bearer test-key',
          }),
          body: expect.stringContaining('"model":"gpt-3.5-turbo"'),
        })
      );
      expect(result).toBe('Test response');
    });

    it('handles OpenAI response errors', async () => {
      const mockResponse = {
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        json: () => Promise.resolve({
          error: { message: 'Invalid API key' },
        }),
      };
      mockFetch.mockResolvedValueOnce(mockResponse);

      const client = new ApiClient(mockProvider);
      
      await expect(client.sendMessage([
        { role: 'user', content: 'Hello' },
      ])).rejects.toThrow('Invalid API key');
    });
  });

  describe('Anthropic format', () => {
    const anthropicProvider: LLMProvider = {
      ...mockProvider,
      requestFormat: 'anthropic',
    };

    it('sends message with Anthropic format', async () => {
      const mockResponse = {
        ok: true,
        json: () => Promise.resolve({
          content: [{ text: 'Test response' }],
        }),
      };
      mockFetch.mockResolvedValueOnce(mockResponse);

      const client = new ApiClient(anthropicProvider);
      const result = await client.sendMessage([
        { role: 'user', content: 'Hello' },
      ]);

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.test.com',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'x-api-key': 'test-key',
            'anthropic-version': '2023-06-01',
          }),
        })
      );
      expect(result).toBe('Test response');
    });
  });

  describe('Google format', () => {
    const googleProvider: LLMProvider = {
      ...mockProvider,
      requestFormat: 'google',
    };

    it('sends message with Google format', async () => {
      const mockResponse = {
        ok: true,
        json: () => Promise.resolve({
          candidates: [{ content: { parts: [{ text: 'Test response' }] } }],
        }),
      };
      mockFetch.mockResolvedValueOnce(mockResponse);

      const client = new ApiClient(googleProvider);
      const result = await client.sendMessage([
        { role: 'user', content: 'Hello' },
      ]);

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.test.com',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      );
      expect(result).toBe('Test response');
    });
  });

  describe('Cohere format', () => {
    const cohereProvider: LLMProvider = {
      ...mockProvider,
      requestFormat: 'cohere',
    };

    it('sends message with Cohere format', async () => {
      const mockResponse = {
        ok: true,
        json: () => Promise.resolve({
          text: 'Test response',
        }),
      };
      mockFetch.mockResolvedValueOnce(mockResponse);

      const client = new ApiClient(cohereProvider);
      const result = await client.sendMessage([
        { role: 'user', content: 'Hello' },
      ]);

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.test.com',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Authorization': 'Bearer test-key',
          }),
        })
      );
      expect(result).toBe('Test response');
    });
  });

  describe('Replicate format', () => {
    const replicateProvider: LLMProvider = {
      ...mockProvider,
      requestFormat: 'replicate',
    };

    it('sends message with Replicate format', async () => {
      const mockResponse = {
        ok: true,
        json: () => Promise.resolve({
          output: 'Test response',
        }),
      };
      mockFetch.mockResolvedValueOnce(mockResponse);

      const client = new ApiClient(replicateProvider);
      const result = await client.sendMessage([
        { role: 'user', content: 'Hello' },
      ]);

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.test.com',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Authorization': 'Token test-key',
          }),
        })
      );
      expect(result).toBe('Test response');
    });
  });

  describe('Hunter format', () => {
    const hunterProvider: LLMProvider = {
      ...mockProvider,
      requestFormat: 'hunter',
      walletPrivateKey: 'test-private-key',
    };

    it('uses HunterAuthService for Hunter format', async () => {
      const client = new ApiClient(hunterProvider);
      const result = await client.sendMessage([
        { role: 'user', content: 'Hello' },
      ]);

      expect(result).toBe('Mocked response');
      expect(mockFetch).not.toHaveBeenCalled();
    });
  });

  describe('Custom headers', () => {
    it('includes custom headers in request', async () => {
      const providerWithHeaders: LLMProvider = {
        ...mockProvider,
        customHeaders: {
          'X-Custom-Header': 'custom-value',
          'Authorization': 'Custom auth',
        },
      };

      const mockResponse = {
        ok: true,
        json: () => Promise.resolve({
          choices: [{ message: { content: 'Test response' } }],
        }),
      };
      mockFetch.mockResolvedValueOnce(mockResponse);

      const client = new ApiClient(providerWithHeaders);
      await client.sendMessage([{ role: 'user', content: 'Hello' }]);

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.test.com',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'X-Custom-Header': 'custom-value',
            'Authorization': 'Custom auth',
          }),
        })
      );
    });
  });

  describe('Options', () => {
    it('includes temperature and maxTokens in request', async () => {
      const mockResponse = {
        ok: true,
        json: () => Promise.resolve({
          choices: [{ message: { content: 'Test response' } }],
        }),
      };
      mockFetch.mockResolvedValueOnce(mockResponse);

      const client = new ApiClient(mockProvider);
      await client.sendMessage(
        [{ role: 'user', content: 'Hello' }],
        { temperature: 0.8, maxTokens: 150 }
      );

      const requestBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(requestBody.temperature).toBe(0.8);
      expect(requestBody.max_tokens).toBe(150);
    });
  });

  describe('System messages', () => {
    it('includes system messages in request', async () => {
      const mockResponse = {
        ok: true,
        json: () => Promise.resolve({
          choices: [{ message: { content: 'Test response' } }],
        }),
      };
      mockFetch.mockResolvedValueOnce(mockResponse);

      const client = new ApiClient(mockProvider);
      await client.sendMessage([
        { role: 'system', content: 'You are a helpful assistant' },
        { role: 'user', content: 'Hello' },
      ]);

      const requestBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(requestBody.messages).toHaveLength(2);
      expect(requestBody.messages[0].role).toBe('system');
      expect(requestBody.messages[0].content).toBe('You are a helpful assistant');
    });
  });

  describe('Network errors', () => {
    it('handles network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const client = new ApiClient(mockProvider);
      
      await expect(client.sendMessage([
        { role: 'user', content: 'Hello' },
      ])).rejects.toThrow('Network error');
    });
  });

  describe('Test connection', () => {
    it('tests connection successfully', async () => {
      const mockResponse = {
        ok: true,
        json: () => Promise.resolve({ status: 'ok' }),
      };
      mockFetch.mockResolvedValueOnce(mockResponse);

      const client = new ApiClient(mockProvider);
      const result = await client.testConnection();

      expect(result).toBe(true);
    });

    it('handles connection test failure', async () => {
      const mockResponse = {
        ok: false,
        status: 401,
        json: () => Promise.resolve({ error: 'Unauthorized' }),
      };
      mockFetch.mockResolvedValueOnce(mockResponse);

      const client = new ApiClient(mockProvider);
      const result = await client.testConnection();

      expect(result).toBe(false);
    });
  });
});
