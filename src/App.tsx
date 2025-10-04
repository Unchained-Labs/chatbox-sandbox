import { useState } from 'react';
import { Message, LLMProvider, ChatConfig } from './types';
import ConfigPanel from './components/ConfigPanel';
import ChatInterface from './components/ChatInterface';
import { createApiClient } from './utils/apiClient';
import { Settings } from 'lucide-react';

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [config, setConfig] = useState<ChatConfig | null>(null);
  const [isConfigOpen, setIsConfigOpen] = useState(true);

  const handleConfigSave = (provider: LLMProvider, systemPrompt?: string) => {
    setConfig({
      provider,
      systemPrompt,
      temperature: 0.7,
      maxTokens: 1000,
    });
    setIsConfigOpen(false);
  };

  const handleNewChat = () => {
    setMessages([]);
  };

  const handleSendMessage = async (content: string) => {
    if (!config) {
      alert('Please configure your LLM provider first');
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      role: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);

    try {
      const apiClient = createApiClient(config.provider);

      const messagesToSend = [
        ...(config.systemPrompt
          ? [{ role: 'system' as const, content: config.systemPrompt }]
          : []),
        ...messages.map(m => ({ role: m.role, content: m.content })),
        { role: 'user' as const, content },
      ];

      const response = await apiClient.sendMessage(messagesToSend, {
        temperature: config.temperature,
        maxTokens: config.maxTokens,
      });

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response,
        role: 'assistant',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);

      let errorContent = 'Sorry, there was an error processing your message.';

      if (error instanceof Error) {
        // Check for specific authentication errors
        if (
          error.message.includes('authentication failed') ||
          error.message.includes('Authentication failed')
        ) {
          errorContent =
            '🔐 **Authentication Error**: ' +
            error.message +
            '\n\nPlease check your API key or wallet private key and try again.';
        } else if (
          error.message.includes('401') ||
          error.message.includes('Unauthorized')
        ) {
          errorContent =
            '🔐 **Unauthorized**: Invalid API credentials. Please check your API key or wallet private key.';
        } else if (
          error.message.includes('403') ||
          error.message.includes('Forbidden')
        ) {
          errorContent =
            "🚫 **Access Forbidden**: You don't have permission to access this resource. Please check your API key permissions.";
        } else if (
          error.message.includes('429') ||
          error.message.includes('rate limit')
        ) {
          errorContent =
            '⏱️ **Rate Limited**: Too many requests. Please wait a moment and try again.';
        } else if (
          error.message.includes('500') ||
          error.message.includes('Internal Server Error')
        ) {
          errorContent =
            '🔧 **Server Error**: The API server is experiencing issues. Please try again later.';
        } else if (
          error.message.includes('Network error') ||
          error.message.includes('fetch')
        ) {
          errorContent =
            '🌐 **Network Error**: Unable to connect to the API. Please check your internet connection and API URL.';
        } else {
          errorContent = `❌ **Error**: ${error.message}`;
        }
      }

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: errorContent,
        role: 'assistant',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  return (
    <div className="h-screen bg-dark-blue-950 flex flex-col">
      {/* App Header */}
      <header className="flex-shrink-0 bg-dark-blue-900 border-b border-dark-blue-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsConfigOpen(!isConfigOpen)}
              className="p-2 hover:bg-dark-blue-800 rounded-lg transition-colors"
            >
              <Settings className="w-5 h-5 text-teal-400" />
            </button>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <img
                src="/logo_unchained_labs.png"
                alt="Unchained Labs"
                className="w-9 h-9"
              />
              Chatbox Sandbox
            </h1>
          </div>
          <div className="flex items-center gap-2">
            {config && (
              <span className="text-sm text-gray-400">
                Connected to: {config.provider.name}
              </span>
            )}
            <button onClick={handleNewChat} className="btn-secondary text-sm">
              New Chat
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex min-h-0">
        {/* Left Panel - Configuration */}
        <div
          className={`${
            isConfigOpen ? 'w-[614px]' : 'w-0'
          } transition-all duration-300 overflow-hidden bg-dark-blue-900 border-r border-dark-blue-700`}
        >
          <div className="h-full overflow-y-auto">
            <ConfigPanel onSave={handleConfigSave} />
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 min-h-0">
          <ChatInterface
            messages={messages}
            onSendMessage={handleSendMessage}
            isConnected={!!config}
          />
        </div>
      </div>

      {/* App Footer */}
      <footer className="flex-shrink-0 bg-dark-blue-900 border-t border-dark-blue-700 p-3">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <img
                src="/logo_unchained_labs.png"
                alt="Unchained Labs"
                className="w-4 h-4"
              />
              <span>Chatbox Sandbox v1.0.0</span>
            </div>
            <span>•</span>
            <span>Configure your LLM providers and start chatting</span>
          </div>
          <div className="flex items-center gap-4">
            <span>Powered by React + Vite + TailwindCSS</span>
            <span>•</span>
            <span>Hunter API Integration</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
