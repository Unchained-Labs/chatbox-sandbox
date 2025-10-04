import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../../src/App';

// Mock the components to avoid complex setup
vi.mock('../../src/components/ConfigPanel', () => ({
  default: ({ onSave }: any) => (
    <div data-testid="config-panel">
      <button onClick={() => onSave({ id: 'test', name: 'Test Provider' })}>
        Save Config
      </button>
    </div>
  ),
}));

vi.mock('../../src/components/ChatInterface', () => ({
  default: ({ messages, onSendMessage, isConnected }: any) => (
    <div data-testid="chat-interface">
      <div data-testid="connection-status">
        {isConnected ? 'Connected' : 'Not Connected'}
      </div>
      <div data-testid="messages">
        {messages.map((msg: any) => (
          <div key={msg.id}>{msg.content}</div>
        ))}
      </div>
      <button onClick={() => onSendMessage('Test message')}>
        Send Message
      </button>
    </div>
  ),
}));

describe('App Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the main app structure', () => {
    render(<App />);
    
    expect(screen.getByText('Chatbox Sandbox')).toBeInTheDocument();
    expect(screen.getByTestId('config-panel')).toBeInTheDocument();
    expect(screen.getByTestId('chat-interface')).toBeInTheDocument();
  });

  it('shows not connected status initially', () => {
    render(<App />);
    
    expect(screen.getByText('Not Connected')).toBeInTheDocument();
  });

  it('allows toggling configuration panel', () => {
    render(<App />);
    
    const settingsButton = screen.getByRole('button', { name: /settings/i });
    expect(settingsButton).toBeInTheDocument();
  });

  it('shows new chat button', () => {
    render(<App />);
    
    expect(screen.getByText('New Chat')).toBeInTheDocument();
  });
});
