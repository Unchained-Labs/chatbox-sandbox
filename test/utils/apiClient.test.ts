import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ApiClient } from '../../src/utils/apiClient';
import { LLMProvider } from '../../src/types';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('ApiClient', () => {
  let mockProvider: LLMProvider;

  beforeEach(() => {
    vi.clearAllMocks();
    mockProvider = {
      id: 'openai',
      name: 'OpenAI',
      apiUrl: 'https://api.openai.com/v1/chat/completions',
      apiKey: 'test-key',
      requestFormat: 'openai',
      model: 'gpt-3.5-turbo',
    };
  });

  describe('OpenAI format', () => {
    it('sends message successfully', async () => {
      const mockResponse = {
        choices: [{ message: { content: 'Hello!' } }],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
        text: () => Promise.resolve(JSON.stringify(mockResponse)),
      });

      const client = new ApiClient(mockProvider);
      const result = await client.sendMessage([
        { role: 'user', content: 'Hello' },
      ]);

      expect(result).toBe('Hello!');
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.openai.com/v1/chat/completions',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-key',
            'Content-Type': 'application/json',
          }),
        })
      );
    });

    it('handles OpenAI response errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: () => Promise.resolve({ error: { message: 'Invalid API key' } }),
        text: () => Promise.resolve(JSON.stringify({ error: { message: 'Invalid API key' } })),
      });

      const client = new ApiClient(mockProvider);
      
      await expect(client.sendMessage([
        { role: 'user', content: 'Hello' },
      ])).rejects.toThrow('Invalid API key');
    });
  });

  describe('Anthropic format', () => {
    beforeEach(() => {
      mockProvider = {
        id: 'anthropic',
        name: 'Anthropic',
        apiUrl: 'https://api.anthropic.com/v1/messages',
        apiKey: 'test-key',
        requestFormat: 'anthropic',
        model: 'claude-3-sonnet-20240229',
      };
    });

    it('sends message successfully', async () => {
      const mockResponse = {
        content: [{ text: 'Hello!' }],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
        text: () => Promise.resolve(JSON.stringify(mockResponse)),
      });

      const client = new ApiClient(mockProvider);
      const result = await client.sendMessage([
        { role: 'user', content: 'Hello' },
      ]);

      expect(result).toBe('Hello!');
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.anthropic.com/v1/messages',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'x-api-key': 'test-key',
            'Content-Type': 'application/json',
          }),
        })
      );
    });
  });

  describe('Custom headers', () => {
    it('includes custom headers in request', async () => {
      mockProvider.customHeaders = {
        'X-Custom-Header': 'custom-value',
      };

      const mockResponse = {
        choices: [{ message: { content: 'Hello!' } }],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
        text: () => Promise.resolve(JSON.stringify(mockResponse)),
      });

      const client = new ApiClient(mockProvider);
      await client.sendMessage([{ role: 'user', content: 'Hello' }]);

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.openai.com/v1/chat/completions',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-key',
            'Content-Type': 'application/json',
            'X-Custom-Header': 'custom-value',
          }),
        })
      );
    });
  });

  describe('Test connection', () => {
    it('tests connection successfully', async () => {
      const mockResponse = {
        choices: [{ message: { content: 'Test response' } }],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
        text: () => Promise.resolve(JSON.stringify(mockResponse)),
      });

      const client = new ApiClient(mockProvider);
      const result = await client.testConnection();

      expect(result).toBe(true);
    });

    it('handles connection test failure', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: () => Promise.resolve({ error: { message: 'Unauthorized' } }),
        text: () => Promise.resolve(JSON.stringify({ error: { message: 'Unauthorized' } })),
      });

      const client = new ApiClient(mockProvider);
      const result = await client.testConnection();

      expect(result).toBe(false);
    });
  });

  describe('Error handling', () => {
    it('handles network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const client = new ApiClient(mockProvider);
      
      await expect(client.sendMessage([
        { role: 'user', content: 'Hello' },
      ])).rejects.toThrow('Network error');
    });

    it('handles invalid JSON response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.reject(new Error('Invalid JSON')),
        text: () => Promise.resolve('Invalid JSON response'),
      });

      const client = new ApiClient(mockProvider);
      
      await expect(client.sendMessage([
        { role: 'user', content: 'Hello' },
      ])).rejects.toThrow('Invalid JSON');
    });
  });
});