import { describe, it, expect } from 'vitest';
import { Message, LLMProvider, ChatConfig } from '../../src/types';

describe('Types', () => {
  describe('Message', () => {
    it('creates a valid message object', () => {
      const message: Message = {
        id: '1',
        content: 'Hello world',
        role: 'user',
        timestamp: new Date('2023-01-01T10:00:00Z'),
      };

      expect(message.id).toBe('1');
      expect(message.content).toBe('Hello world');
      expect(message.role).toBe('user');
      expect(message.timestamp).toBeInstanceOf(Date);
    });

    it('accepts both user and assistant roles', () => {
      const userMessage: Message = {
        id: '1',
        content: 'Hello',
        role: 'user',
        timestamp: new Date(),
      };

      const assistantMessage: Message = {
        id: '2',
        content: 'Hi there!',
        role: 'assistant',
        timestamp: new Date(),
      };

      expect(userMessage.role).toBe('user');
      expect(assistantMessage.role).toBe('assistant');
    });
  });

  describe('LLMProvider', () => {
    it('creates a valid provider object', () => {
      const provider: LLMProvider = {
        id: 'openai',
        name: 'OpenAI',
        apiUrl: 'https://api.openai.com/v1/chat/completions',
        apiKey: 'test-key',
        requestFormat: 'openai',
        model: 'gpt-3.5-turbo',
        customHeaders: {
          'X-Custom': 'value',
        },
      };

      expect(provider.id).toBe('openai');
      expect(provider.name).toBe('OpenAI');
      expect(provider.apiUrl).toBe('https://api.openai.com/v1/chat/completions');
      expect(provider.requestFormat).toBe('openai');
      expect(provider.model).toBe('gpt-3.5-turbo');
      expect(provider.customHeaders).toEqual({ 'X-Custom': 'value' });
    });

    it('supports all request formats', () => {
      const formats: LLMProvider['requestFormat'][] = [
        'openai',
        'anthropic',
        'google',
        'cohere',
        'replicate',
        'hunter',
        'custom',
      ];

      formats.forEach((format) => {
        const provider: LLMProvider = {
          id: 'test',
          name: 'Test',
          apiUrl: 'https://test.com',
          apiKey: 'key',
          requestFormat: format,
        };

        expect(provider.requestFormat).toBe(format);
      });
    });

    it('supports Hunter-specific fields', () => {
      const hunterProvider: LLMProvider = {
        id: 'hunter',
        name: 'Hunter API',
        apiUrl: 'https://sandbox.drpxbt.xyz',
        apiKey: '',
        requestFormat: 'hunter',
        walletPrivateKey: '0x123...',
        domain: 'example.com',
        uri: 'https://example.com',
        chainId: 1,
        roomName: 'test-room',
      };

      expect(hunterProvider.walletPrivateKey).toBe('0x123...');
      expect(hunterProvider.domain).toBe('example.com');
      expect(hunterProvider.uri).toBe('https://example.com');
      expect(hunterProvider.chainId).toBe(1);
      expect(hunterProvider.roomName).toBe('test-room');
    });
  });

  describe('ChatConfig', () => {
    it('creates a valid chat config', () => {
      const provider: LLMProvider = {
        id: 'test',
        name: 'Test Provider',
        apiUrl: 'https://test.com',
        apiKey: 'key',
        requestFormat: 'openai',
      };

      const config: ChatConfig = {
        provider,
        systemPrompt: 'You are a helpful assistant',
        temperature: 0.7,
        maxTokens: 1000,
      };

      expect(config.provider).toBe(provider);
      expect(config.systemPrompt).toBe('You are a helpful assistant');
      expect(config.temperature).toBe(0.7);
      expect(config.maxTokens).toBe(1000);
    });

    it('allows optional fields', () => {
      const provider: LLMProvider = {
        id: 'test',
        name: 'Test Provider',
        apiUrl: 'https://test.com',
        apiKey: 'key',
        requestFormat: 'openai',
      };

      const config: ChatConfig = {
        provider,
      };

      expect(config.provider).toBe(provider);
      expect(config.systemPrompt).toBeUndefined();
      expect(config.temperature).toBeUndefined();
      expect(config.maxTokens).toBeUndefined();
    });
  });
});
