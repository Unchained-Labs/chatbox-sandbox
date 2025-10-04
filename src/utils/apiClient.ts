import { LLMProvider } from '../types';
import { HunterAuthService } from './hunterAuth';

export class ApiClient {
  private provider: LLMProvider;
  private hunterAuth?: HunterAuthService;

  constructor(provider: LLMProvider) {
    this.provider = provider;
    if (provider.requestFormat === 'hunter') {
      this.hunterAuth = new HunterAuthService(provider);
    }
  }

  async sendMessage(
    messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>,
    options?: {
      temperature?: number;
      maxTokens?: number;
    }
  ): Promise<string> {
    // Handle Hunter API with seamless authentication
    if (this.provider.requestFormat === 'hunter' && this.hunterAuth) {
      const lastUserMessage = messages.filter(m => m.role === 'user').pop();
      if (!lastUserMessage) {
        throw new Error('No user message found for Hunter API');
      }
      return await this.hunterAuth.sendMessage(lastUserMessage.content);
    }

    const requestBody = this.formatRequest(messages, options);

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...this.provider.customHeaders,
    };

    // Add API key based on provider format
    if (this.provider.requestFormat === 'openai') {
      headers['Authorization'] = `Bearer ${this.provider.apiKey}`;
    } else if (this.provider.requestFormat === 'anthropic') {
      headers['x-api-key'] = this.provider.apiKey;
      headers['anthropic-version'] = '2023-06-01';
    } else if (this.provider.requestFormat === 'google') {
      // Google API key is passed as query parameter, not header
      // The URL should already include the key
    } else if (this.provider.requestFormat === 'cohere') {
      headers['Authorization'] = `Bearer ${this.provider.apiKey}`;
    } else if (this.provider.requestFormat === 'replicate') {
      headers['Authorization'] = `Token ${this.provider.apiKey}`;
    } else {
      // Custom format - assume Bearer token unless specified in custom headers
      if (!headers['Authorization'] && !headers['authorization']) {
        headers['Authorization'] = `Bearer ${this.provider.apiKey}`;
      }
    }

    try {
      const response = await fetch(this.provider.apiUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `API request failed: ${response.status} ${response.statusText}`;

        if (response.status === 401) {
          errorMessage = `Authentication failed: Invalid API key. Please check your API key and try again.`;
        } else if (response.status === 403) {
          errorMessage = `Access forbidden: You don't have permission to access this resource. Please check your API key permissions.`;
        } else if (response.status === 429) {
          errorMessage = `Rate limited: Too many requests. Please wait a moment and try again.`;
        } else if (response.status >= 500) {
          errorMessage = `Server error: The API server is experiencing issues. Please try again later.`;
        } else if (errorText) {
          errorMessage += ` - ${errorText}`;
        }

        throw new Error(errorMessage);
      }

      const data = await response.json();
      return this.extractResponse(data);
    } catch (error) {
      console.error('API request error:', error);
      throw error;
    }
  }

  private formatRequest(
    messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>,
    options?: {
      temperature?: number;
      maxTokens?: number;
    }
  ): any {
    const { temperature = 0.7, maxTokens = 1000 } = options || {};

    switch (this.provider.requestFormat) {
      case 'openai':
        return {
          model: this.provider.model || 'gpt-3.5-turbo',
          messages,
          temperature,
          max_tokens: maxTokens,
          stream: false,
        };

      case 'anthropic':
        // Convert OpenAI format to Anthropic format
        const systemMessage = messages.find(m => m.role === 'system');
        const conversationMessages = messages.filter(m => m.role !== 'system');

        return {
          model: this.provider.model || 'claude-3-sonnet-20240229',
          max_tokens: maxTokens,
          temperature,
          ...(systemMessage && { system: systemMessage.content }),
          messages: conversationMessages.map(msg => ({
            role: msg.role === 'assistant' ? 'assistant' : 'user',
            content: msg.content,
          })),
        };

      case 'google':
        // Google Gemini format
        const googleMessages = messages.filter(m => m.role !== 'system');
        return {
          contents: googleMessages.map(msg => ({
            role: msg.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: msg.content }],
          })),
        };

      case 'cohere':
        // Cohere format
        const cohereMessages = messages.filter(m => m.role !== 'system');
        const lastCohereMessage = cohereMessages.pop();
        return {
          model: this.provider.model || 'command',
          message: lastCohereMessage?.content || '',
          chat_history: cohereMessages.map(msg => ({
            role: msg.role === 'assistant' ? 'CHATBOT' : 'USER',
            message: msg.content,
          })),
        };

      case 'replicate':
        // Replicate format
        const lastReplicateMessage = messages
          .filter(m => m.role === 'user')
          .pop();
        return {
          version: this.provider.model || 'YOUR_MODEL_VERSION',
          input: {
            prompt: lastReplicateMessage?.content || '',
          },
        };

      case 'hunter':
        // Hunter API format - get the last user message
        const lastUserMessage = messages.filter(m => m.role === 'user').pop();
        if (!lastUserMessage) {
          throw new Error('No user message found for Hunter API');
        }

        return {
          prompt: lastUserMessage.content,
        };

      case 'custom':
        // For custom endpoints, use a flexible format
        return {
          model: this.provider.model,
          messages,
          temperature,
          max_tokens: maxTokens,
          ...(this.provider.customPrompt && {
            prompt: this.provider.customPrompt,
          }),
        };

      default:
        throw new Error(
          `Unsupported request format: ${this.provider.requestFormat}`
        );
    }
  }

  private extractResponse(data: any): string {
    switch (this.provider.requestFormat) {
      case 'openai':
        if (data.choices && data.choices[0] && data.choices[0].message) {
          return data.choices[0].message.content;
        }
        break;

      case 'anthropic':
        if (data.content && data.content[0] && data.content[0].text) {
          return data.content[0].text;
        }
        break;

      case 'google':
        // Google Gemini response format
        if (
          data.candidates &&
          data.candidates[0] &&
          data.candidates[0].content
        ) {
          return data.candidates[0].content.parts[0]?.text || '';
        }
        break;

      case 'cohere':
        // Cohere response format
        if (data.text) {
          return data.text;
        }
        if (data.message) {
          return data.message;
        }
        break;

      case 'replicate':
        // Replicate response format
        if (data.output) {
          return Array.isArray(data.output)
            ? data.output.join('')
            : data.output;
        }
        break;

      case 'hunter':
        // Hunter API response format - adjust based on actual API response
        if (data.response) {
          return data.response;
        }
        if (data.message) {
          return data.message;
        }
        if (data.content) {
          return typeof data.content === 'string'
            ? data.content
            : data.content[0]?.text || '';
        }
        if (data.text) {
          return data.text;
        }
        break;

      case 'custom':
        // Try common response formats
        if (data.choices && data.choices[0] && data.choices[0].message) {
          return data.choices[0].message.content;
        }
        if (data.content) {
          return typeof data.content === 'string'
            ? data.content
            : data.content[0]?.text || '';
        }
        if (data.response) {
          return data.response;
        }
        if (data.text) {
          return data.text;
        }
        break;
    }

    throw new Error('Unable to extract response from API data');
  }

  async testConnection(): Promise<boolean> {
    try {
      if (this.provider.requestFormat === 'hunter' && this.hunterAuth) {
        // For Hunter API, test the authentication flow
        await this.hunterAuth.authenticate();
        return true;
      } else {
        const testMessages = [
          { role: 'user' as const, content: 'Hello, this is a test message.' },
        ];

        await this.sendMessage(testMessages, { maxTokens: 10 });
        return true;
      }
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  }
}

// Utility function to create API client
export function createApiClient(provider: LLMProvider): ApiClient {
  return new ApiClient(provider);
}
