import { useState, useEffect } from 'react';
import { LLMProvider, SavedConfiguration } from '../types';
import { createApiClient } from '../utils/apiClient';
import HttpRequestBuilder from './HttpRequestBuilder';
import {
  Plus,
  Trash2,
  Save,
  TestTube,
  Upload,
  Bookmark,
  Settings,
  Globe,
} from 'lucide-react';

interface ConfigPanelProps {
  onSave: (provider: LLMProvider, systemPrompt?: string) => void;
}

const PRESET_PROVIDERS: Partial<LLMProvider>[] = [
  {
    id: 'hunter',
    name: '⭐ Hunter API',
    apiUrl: 'https://sandbox.drpxbt.xyz',
    requestFormat: 'hunter',
  },
  {
    id: 'openai',
    name: 'OpenAI',
    apiUrl: 'https://api.openai.com/v1/chat/completions',
    requestFormat: 'openai',
    model: 'gpt-3.5-turbo',
  },
  {
    id: 'anthropic',
    name: 'Anthropic Claude',
    apiUrl: 'https://api.anthropic.com/v1/messages',
    requestFormat: 'anthropic',
    model: 'claude-3-sonnet-20240229',
  },
  {
    id: 'google',
    name: 'Google Gemini',
    apiUrl:
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
    requestFormat: 'google',
    model: 'gemini-pro',
  },
  {
    id: 'cohere',
    name: 'Cohere',
    apiUrl: 'https://api.cohere.ai/v1/chat',
    requestFormat: 'cohere',
    model: 'command',
  },
  {
    id: 'mistral',
    name: 'Mistral AI',
    apiUrl: 'https://api.mistral.ai/v1/chat/completions',
    requestFormat: 'openai', // Uses OpenAI format
    model: 'mistral-small',
  },
  {
    id: 'groq',
    name: 'Groq',
    apiUrl: 'https://api.groq.com/openai/v1/chat/completions',
    requestFormat: 'openai', // Uses OpenAI format
    model: 'llama3-8b-8192',
  },
  {
    id: 'together',
    name: 'Together AI',
    apiUrl: 'https://api.together.xyz/v1/chat/completions',
    requestFormat: 'openai', // Uses OpenAI format
    model: 'meta-llama/Llama-2-7b-chat-hf',
  },
  {
    id: 'replicate',
    name: 'Replicate',
    apiUrl: 'https://api.replicate.com/v1/predictions',
    requestFormat: 'replicate',
    model: 'meta/llama-2-7b-chat',
  },
  {
    id: 'custom',
    name: 'Custom Endpoint',
    apiUrl: '',
    requestFormat: 'custom',
  },
];

const getAvailableModels = (providerId: string): string[] => {
  switch (providerId) {
    case 'openai':
      return [
        'gpt-3.5-turbo',
        'gpt-3.5-turbo-16k',
        'gpt-4',
        'gpt-4-turbo',
        'gpt-4o',
      ];
    case 'anthropic':
      return [
        'claude-3-haiku-20240307',
        'claude-3-sonnet-20240229',
        'claude-3-opus-20240229',
        'claude-3-5-sonnet-20241022',
      ];
    case 'google':
      return [
        'gemini-pro',
        'gemini-pro-vision',
        'gemini-1.5-pro',
        'gemini-1.5-flash',
      ];
    case 'cohere':
      return [
        'command',
        'command-light',
        'command-nightly',
        'command-light-nightly',
      ];
    case 'mistral':
      return [
        'mistral-tiny',
        'mistral-small',
        'mistral-medium',
        'mistral-large',
      ];
    case 'groq':
      return [
        'llama3-8b-8192',
        'llama3-70b-8192',
        'mixtral-8x7b-32768',
        'gemma-7b-it',
      ];
    case 'together':
      return [
        'meta-llama/Llama-2-7b-chat-hf',
        'meta-llama/Llama-2-13b-chat-hf',
        'meta-llama/Llama-2-70b-chat-hf',
        'mistralai/Mistral-7B-Instruct-v0.1',
      ];
    case 'replicate':
      return [
        'meta/llama-2-7b-chat',
        'meta/llama-2-13b-chat',
        'meta/llama-2-70b-chat',
        'mistralai/mistral-7b-instruct-v0.1',
      ];
    default:
      return [];
  }
};

export default function ConfigPanel({ onSave }: ConfigPanelProps) {
  const [selectedProvider, setSelectedProvider] = useState<string>('hunter');
  const [provider, setProvider] = useState<LLMProvider>({
    id: 'hunter',
    name: '⭐ Hunter API',
    apiUrl: 'https://sandbox.drpxbt.xyz',
    apiKey: '',
    requestFormat: 'hunter',
    customHeaders: {},
  });
  const [systemPrompt, setSystemPrompt] = useState('');
  const [customHeaders, setCustomHeaders] = useState<
    Array<{ key: string; value: string }>
  >([]);
  const [isTesting, setIsTesting] = useState(false);
  const [savedConfigs, setSavedConfigs] = useState<SavedConfiguration[]>([]);
  const [configName, setConfigName] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [activeTab, setActiveTab] = useState<'config' | 'http'>('config');

  // Load saved configurations on component mount
  useEffect(() => {
    const saved = localStorage.getItem('chatbox-saved-configs');
    if (saved) {
      try {
        const configs = JSON.parse(saved).map((config: any) => ({
          ...config,
          createdAt: new Date(config.createdAt),
          lastUsed: config.lastUsed ? new Date(config.lastUsed) : undefined,
        }));
        setSavedConfigs(configs);
      } catch (error) {
        console.error('Failed to load saved configurations:', error);
      }
    }
  }, []);

  const handleProviderChange = (providerId: string) => {
    setSelectedProvider(providerId);
    const preset = PRESET_PROVIDERS.find(p => p.id === providerId);
    if (preset) {
      setProvider({
        ...preset,
        apiKey: provider.apiKey, // Keep existing API key
        customHeaders: provider.customHeaders, // Keep existing headers
      } as LLMProvider);
    }
  };

  const handleSave = () => {
    const finalProvider: LLMProvider = {
      ...provider,
      customHeaders: customHeaders.reduce(
        (acc, header) => {
          if (header.key && header.value) {
            acc[header.key] = header.value;
          }
          return acc;
        },
        {} as Record<string, string>
      ),
    };
    onSave(finalProvider, systemPrompt);
  };

  const handleSaveConfiguration = () => {
    if (!configName.trim()) {
      alert('Please enter a name for this configuration');
      return;
    }

    const finalProvider: LLMProvider = {
      ...provider,
      customHeaders: customHeaders.reduce(
        (acc, header) => {
          if (header.key && header.value) {
            acc[header.key] = header.value;
          }
          return acc;
        },
        {} as Record<string, string>
      ),
    };

    const newConfig: SavedConfiguration = {
      id: Date.now().toString(),
      name: configName.trim(),
      provider: finalProvider,
      systemPrompt,
      createdAt: new Date(),
    };

    const updatedConfigs = [...savedConfigs, newConfig];
    setSavedConfigs(updatedConfigs);
    localStorage.setItem(
      'chatbox-saved-configs',
      JSON.stringify(updatedConfigs)
    );
    setConfigName('');
    setShowSaveDialog(false);
    alert('Configuration saved successfully!');
  };

  const handleLoadConfiguration = (config: SavedConfiguration) => {
    setProvider(config.provider);
    setSystemPrompt(config.systemPrompt || '');
    setCustomHeaders(
      Object.entries(config.provider.customHeaders || {}).map(
        ([key, value]) => ({
          key,
          value,
        })
      )
    );
    setSelectedProvider(config.provider.id);

    // Update last used
    const updatedConfigs = savedConfigs.map(c =>
      c.id === config.id ? { ...c, lastUsed: new Date() } : c
    );
    setSavedConfigs(updatedConfigs);
    localStorage.setItem(
      'chatbox-saved-configs',
      JSON.stringify(updatedConfigs)
    );
  };

  const handleDeleteConfiguration = (configId: string) => {
    if (confirm('Are you sure you want to delete this configuration?')) {
      const updatedConfigs = savedConfigs.filter(c => c.id !== configId);
      setSavedConfigs(updatedConfigs);
      localStorage.setItem(
        'chatbox-saved-configs',
        JSON.stringify(updatedConfigs)
      );
    }
  };

  const getProviderPresets = (provider: LLMProvider) => {
    const baseUrl = provider.apiUrl;

    switch (provider.requestFormat) {
      case 'openai':
        return [
          {
            name: 'Chat Completion',
            method: 'POST',
            url: `${baseUrl}/v1/chat/completions`,
            headers: [
              { key: 'Content-Type', value: 'application/json', enabled: true },
              {
                key: 'Authorization',
                value: 'Bearer YOUR_OPENAI_API_KEY',
                enabled: true,
              },
            ],
            body: JSON.stringify(
              {
                model: 'gpt-3.5-turbo',
                messages: [
                  { role: 'user', content: 'Hello, this is a test message' },
                ],
                temperature: 0.7,
                max_tokens: 100,
              },
              null,
              2
            ),
          },
        ];

      case 'anthropic':
        return [
          {
            name: 'Claude Message',
            method: 'POST',
            url: `${baseUrl}/v1/messages`,
            headers: [
              { key: 'Content-Type', value: 'application/json', enabled: true },
              {
                key: 'x-api-key',
                value: 'YOUR_ANTHROPIC_API_KEY',
                enabled: true,
              },
              { key: 'anthropic-version', value: '2023-06-01', enabled: true },
            ],
            body: JSON.stringify(
              {
                model: 'claude-3-sonnet-20240229',
                max_tokens: 100,
                messages: [
                  { role: 'user', content: 'Hello, this is a test message' },
                ],
              },
              null,
              2
            ),
          },
        ];

      case 'google':
        return [
          {
            name: 'Gemini Generate',
            method: 'POST',
            url: `${baseUrl}?key=YOUR_GOOGLE_API_KEY`,
            headers: [
              { key: 'Content-Type', value: 'application/json', enabled: true },
            ],
            body: JSON.stringify(
              {
                contents: [
                  {
                    parts: [{ text: 'Hello, this is a test message' }],
                  },
                ],
              },
              null,
              2
            ),
          },
        ];

      case 'cohere':
        return [
          {
            name: 'Cohere Chat',
            method: 'POST',
            url: `${baseUrl}`,
            headers: [
              { key: 'Content-Type', value: 'application/json', enabled: true },
              {
                key: 'Authorization',
                value: 'Bearer YOUR_COHERE_API_KEY',
                enabled: true,
              },
            ],
            body: JSON.stringify(
              {
                model: 'command',
                message: 'Hello, this is a test message',
                chat_history: [],
              },
              null,
              2
            ),
          },
        ];

      case 'replicate':
        return [
          {
            name: 'Replicate Prediction',
            method: 'POST',
            url: `${baseUrl}`,
            headers: [
              { key: 'Content-Type', value: 'application/json', enabled: true },
              {
                key: 'Authorization',
                value: 'Token YOUR_REPLICATE_API_TOKEN',
                enabled: true,
              },
            ],
            body: JSON.stringify(
              {
                version: 'YOUR_MODEL_VERSION',
                input: {
                  prompt: 'Hello, this is a test message',
                },
              },
              null,
              2
            ),
          },
        ];

      case 'hunter':
        return [
          {
            name: '🔐 Test SIWE Auth',
            method: 'POST',
            url: `${baseUrl}/auth/nonce`,
            headers: [
              { key: 'Content-Type', value: 'application/json', enabled: true },
            ],
            body: JSON.stringify({ address: 'YOUR_WALLET_ADDRESS' }, null, 2),
          },
          {
            name: '💬 Test Chat (Full Flow)',
            method: 'POST',
            url: `${baseUrl}/rooms/cli/chat`,
            headers: [
              { key: 'Content-Type', value: 'application/json', enabled: true },
              {
                key: 'Authorization',
                value: 'Bearer YOUR_JWT_TOKEN',
                enabled: true,
              },
            ],
            body: JSON.stringify(
              { prompt: 'Hello, this is a test message' },
              null,
              2
            ),
          },
        ];

      case 'custom':
        return [
          {
            name: 'Test Endpoint',
            method: 'POST',
            url: baseUrl,
            headers: [
              { key: 'Content-Type', value: 'application/json', enabled: true },
              {
                key: 'Authorization',
                value: 'Bearer YOUR_API_KEY',
                enabled: true,
              },
            ],
            body: JSON.stringify(
              {
                message: 'Hello, this is a test message',
              },
              null,
              2
            ),
          },
        ];

      default:
        return [];
    }
  };

  const handleTestConnection = async () => {
    if (!provider.apiUrl) {
      alert('Please provide API URL first');
      return;
    }

    // Check provider-specific requirements
    if (provider.requestFormat === 'hunter') {
      if (!provider.walletPrivateKey) {
        alert('Please provide wallet private key for Hunter API');
        return;
      }
    } else if (!provider.apiKey) {
      alert('Please provide API Key first');
      return;
    }

    setIsTesting(true);
    try {
      const finalProvider: LLMProvider = {
        ...provider,
        customHeaders: customHeaders.reduce(
          (acc, header) => {
            if (header.key && header.value) {
              acc[header.key] = header.value;
            }
            return acc;
          },
          {} as Record<string, string>
        ),
      };

      const apiClient = createApiClient(finalProvider);
      const success = await apiClient.testConnection();

      if (success) {
        alert('Connection test successful!');
      } else {
        alert('Connection test failed. Please check your configuration.');
      }
    } catch (error) {
      console.error('Connection test error:', error);
      alert(
        `Connection test failed: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    } finally {
      setIsTesting(false);
    }
  };

  const addCustomHeader = () => {
    setCustomHeaders([...customHeaders, { key: '', value: '' }]);
  };

  const removeCustomHeader = (index: number) => {
    setCustomHeaders(customHeaders.filter((_, i) => i !== index));
  };

  const updateCustomHeader = (
    index: number,
    field: 'key' | 'value',
    value: string
  ) => {
    const updated = [...customHeaders];
    updated[index][field] = value;
    setCustomHeaders(updated);
  };

  return (
    <div className="flex flex-col">
      {/* Tab Navigation */}
      <div className="flex border-b border-dark-blue-700">
        <button
          onClick={() => setActiveTab('config')}
          className={`flex-1 px-4 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
            activeTab === 'config'
              ? 'text-teal-400 border-b-2 border-teal-400 bg-dark-blue-800'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          <Settings className="w-4 h-4" />
          Configuration
        </button>
        <button
          onClick={() => setActiveTab('http')}
          className={`flex-1 px-4 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
            activeTab === 'http'
              ? 'text-teal-400 border-b-2 border-teal-400 bg-dark-blue-800'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          <Globe className="w-4 h-4" />
          HTTP Builder
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'config' ? (
          <div className="p-4 space-y-6">
            {/* Provider Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                LLM Provider
              </label>
              <select
                value={selectedProvider}
                onChange={e => handleProviderChange(e.target.value)}
                className="input-field w-full"
              >
                {PRESET_PROVIDERS.map(preset => (
                  <option key={preset.id} value={preset.id}>
                    {preset.name}
                  </option>
                ))}
              </select>
            </div>

            {/* API URL */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                API URL
              </label>
              <input
                type="url"
                value={provider.apiUrl}
                onChange={e =>
                  setProvider({ ...provider, apiUrl: e.target.value })
                }
                className="input-field w-full"
                placeholder="https://api.example.com/v1/chat/completions"
              />
            </div>

            {/* API Key (for non-Hunter providers) */}
            {provider.requestFormat !== 'hunter' && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  API Key
                </label>
                <input
                  type="password"
                  value={provider.apiKey}
                  onChange={e =>
                    setProvider({ ...provider, apiKey: e.target.value })
                  }
                  className="input-field w-full"
                  placeholder="Enter your API key"
                />
              </div>
            )}

            {/* HTTP Builder Note */}
            <div className="p-3 bg-chain-blue-900/20 border border-chain-blue-700 rounded-lg">
              <p className="text-sm text-chain-blue-300">
                💡 Use the HTTP Builder tab to test API endpoints,
                authentication flows, and add custom headers for any provider.
              </p>
            </div>

            {/* Security Notice */}
            <div className="p-3 bg-blue-900/20 border border-blue-700 rounded-lg">
              <p className="text-sm text-blue-300">
                💡 <strong>Local Storage:</strong> Your API keys and
                configurations are stored locally in your browser. This is a
                client-side sandbox - no data is sent to our servers. Keep your
                browser secure and don't share your device.
              </p>
            </div>

            {/* Model (for providers with known models) */}
            {getAvailableModels(provider.id).length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Model
                </label>
                <select
                  value={provider.model || ''}
                  onChange={e =>
                    setProvider({ ...provider, model: e.target.value })
                  }
                  className="input-field w-full"
                >
                  <option value="">Select a model...</option>
                  {getAvailableModels(provider.id).map(model => (
                    <option key={model} value={model}>
                      {model}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Hunter-specific fields */}
            {provider.requestFormat === 'hunter' && (
              <>
                <div className="p-3 bg-teal-900/20 border border-teal-700 rounded-lg">
                  <p className="text-sm text-teal-300">
                    🚀 <strong>Seamless Workflow:</strong> Just enter your
                    wallet private key. The system will automatically handle
                    SIWE authentication, room creation, and chat messaging.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Wallet Private Key
                  </label>
                  <input
                    type="password"
                    value={provider.walletPrivateKey || ''}
                    onChange={e =>
                      setProvider({
                        ...provider,
                        walletPrivateKey: e.target.value,
                      })
                    }
                    className="input-field w-full"
                    placeholder="Enter your wallet private key for SIWE authentication"
                  />
                </div>
              </>
            )}

            {/* Custom Headers */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-300">
                  Custom Headers
                </label>
                <button
                  onClick={addCustomHeader}
                  className="text-teal-400 hover:text-teal-300 text-sm flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Add Header
                </button>
              </div>
              <div className="space-y-2">
                {customHeaders.map((header, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={header.key}
                      onChange={e =>
                        updateCustomHeader(index, 'key', e.target.value)
                      }
                      className="input-field flex-1"
                      placeholder="Header name"
                    />
                    <input
                      type="text"
                      value={header.value}
                      onChange={e =>
                        updateCustomHeader(index, 'value', e.target.value)
                      }
                      className="input-field flex-1"
                      placeholder="Header value"
                    />
                    <button
                      onClick={() => removeCustomHeader(index)}
                      className="p-2 text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* System Prompt */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                System Prompt (Optional)
              </label>
              <textarea
                value={systemPrompt}
                onChange={e => setSystemPrompt(e.target.value)}
                className="input-field w-full h-24 resize-none"
                placeholder="You are a helpful assistant..."
              />
            </div>

            {/* Saved Configurations */}
            {savedConfigs.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-300">
                    Saved Configurations
                  </label>
                  <button
                    onClick={() => setShowSaveDialog(true)}
                    className="text-teal-400 hover:text-teal-300 text-sm flex items-center gap-1"
                  >
                    <Bookmark className="w-4 h-4" />
                    Save Current
                  </button>
                </div>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {savedConfigs.map(config => (
                    <div
                      key={config.id}
                      className="flex items-center justify-between p-2 bg-dark-blue-800 rounded border border-dark-blue-600"
                    >
                      <div className="flex-1">
                        <div className="text-sm text-gray-200">
                          {config.name}
                        </div>
                        <div className="text-xs text-gray-400">
                          {config.provider.name} •{' '}
                          {config.createdAt.toLocaleDateString()}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleLoadConfiguration(config)}
                          className="p-1 text-teal-400 hover:text-teal-300"
                          title="Load configuration"
                        >
                          <Upload className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleDeleteConfiguration(config.id)}
                          className="p-1 text-red-400 hover:text-red-300"
                          title="Delete configuration"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Save Configuration Dialog */}
            {showSaveDialog && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-dark-blue-900 p-6 rounded-lg border border-dark-blue-700 w-96">
                  <h3 className="text-lg font-semibold text-white mb-4">
                    Save Configuration
                  </h3>
                  <input
                    type="text"
                    value={configName}
                    onChange={e => setConfigName(e.target.value)}
                    className="input-field w-full mb-4"
                    placeholder="Enter configuration name"
                    autoFocus
                  />
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => {
                        setShowSaveDialog(false);
                        setConfigName('');
                      }}
                      className="btn-secondary"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveConfiguration}
                      className="btn-primary"
                    >
                      Save
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleTestConnection}
                disabled={
                  isTesting ||
                  !provider.apiUrl ||
                  (provider.requestFormat === 'hunter'
                    ? !provider.walletPrivateKey
                    : !provider.apiKey)
                }
                className="w-full btn-secondary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <TestTube className="w-4 h-4" />
                {isTesting ? 'Testing...' : 'Test Connection'}
              </button>

              <div className="flex gap-2">
                <button
                  onClick={() => setShowSaveDialog(true)}
                  disabled={
                    !provider.apiUrl ||
                    (provider.requestFormat === 'hunter'
                      ? !provider.walletPrivateKey
                      : !provider.apiKey)
                  }
                  className="flex-1 btn-secondary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Bookmark className="w-4 h-4" />
                  Save As...
                </button>
                <button
                  onClick={handleSave}
                  disabled={
                    !provider.apiUrl ||
                    (provider.requestFormat === 'hunter'
                      ? !provider.walletPrivateKey
                      : !provider.apiKey)
                  }
                  className="flex-1 btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="w-4 h-4" />
                  Use Now
                </button>
              </div>
            </div>

            {/* Configuration Status */}
            {provider.apiUrl &&
              (provider.requestFormat === 'hunter'
                ? provider.walletPrivateKey
                : provider.apiKey) && (
                <div className="p-3 bg-teal-900/20 border border-teal-700 rounded-lg">
                  <p className="text-sm text-teal-300">✓ Configuration ready</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {provider.name} • {provider.requestFormat} format
                  </p>
                </div>
              )}
          </div>
        ) : (
          <div className="h-full p-4">
            <HttpRequestBuilder
              baseUrl={provider.apiUrl}
              presets={getProviderPresets(provider)}
            />
          </div>
        )}
      </div>
    </div>
  );
}
