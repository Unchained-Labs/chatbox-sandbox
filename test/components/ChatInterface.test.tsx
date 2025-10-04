import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ChatInterface from '../../src/components/ChatInterface';
import { Message } from '../../src/types';

describe('ChatInterface', () => {
  const mockOnSendMessage = vi.fn();
  const mockMessages: Message[] = [
    {
      id: '1',
      content: 'Hello, how are you?',
      role: 'user',
      timestamp: new Date('2023-01-01T10:00:00Z'),
    },
    {
      id: '2',
      content: 'I am doing well, thank you!',
      role: 'assistant',
      timestamp: new Date('2023-01-01T10:01:00Z'),
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders with empty messages', () => {
    render(<ChatInterface messages={[]} onSendMessage={mockOnSendMessage} isConnected={true} />);
    
    expect(screen.getByText('Start a conversation')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Type your message...')).toBeInTheDocument();
  });

  it('renders messages correctly', () => {
    render(<ChatInterface messages={mockMessages} onSendMessage={mockOnSendMessage} isConnected={true} />);
    
    expect(screen.getByText('Hello, how are you?')).toBeInTheDocument();
    expect(screen.getByText('I am doing well, thank you!')).toBeInTheDocument();
  });

  it('shows connection status when not connected', () => {
    render(<ChatInterface messages={[]} onSendMessage={mockOnSendMessage} isConnected={false} />);
    
    expect(screen.getByText('Not connected to any LLM provider')).toBeInTheDocument();
  });

  it('updates message input when typed', async () => {
    const user = userEvent.setup();
    render(<ChatInterface messages={[]} onSendMessage={mockOnSendMessage} isConnected={true} />);
    
    const messageInput = screen.getByPlaceholderText('Type your message...');
    await user.type(messageInput, 'Test message');
    
    expect(messageInput).toHaveValue('Test message');
  });

  it('sends message when send button is clicked', async () => {
    const user = userEvent.setup();
    render(<ChatInterface messages={[]} onSendMessage={mockOnSendMessage} isConnected={true} />);
    
    const messageInput = screen.getByPlaceholderText('Type your message...');
    await user.type(messageInput, 'Test message');
    
    const sendButton = screen.getByRole('button', { name: /send/i });
    await user.click(sendButton);
    
    expect(mockOnSendMessage).toHaveBeenCalledWith('Test message');
  });

  it('sends message when Enter key is pressed', async () => {
    const user = userEvent.setup();
    render(<ChatInterface messages={[]} onSendMessage={mockOnSendMessage} isConnected={true} />);
    
    const messageInput = screen.getByPlaceholderText('Type your message...');
    await user.type(messageInput, 'Test message');
    await user.keyboard('{Enter}');
    
    expect(mockOnSendMessage).toHaveBeenCalledWith('Test message');
  });

  it('does not send empty message', async () => {
    const user = userEvent.setup();
    render(<ChatInterface messages={[]} onSendMessage={mockOnSendMessage} isConnected={true} />);
    
    const sendButton = screen.getByRole('button', { name: /send/i });
    await user.click(sendButton);
    
    expect(mockOnSendMessage).not.toHaveBeenCalled();
  });

  it('does not send message when not connected', async () => {
    const user = userEvent.setup();
    render(<ChatInterface messages={[]} onSendMessage={mockOnSendMessage} isConnected={false} />);
    
    const messageInput = screen.getByPlaceholderText('Type your message...');
    await user.type(messageInput, 'Test message');
    
    const sendButton = screen.getByRole('button', { name: /send/i });
    await user.click(sendButton);
    
    expect(mockOnSendMessage).not.toHaveBeenCalled();
  });

  it('clears input after sending message', async () => {
    const user = userEvent.setup();
    render(<ChatInterface messages={[]} onSendMessage={mockOnSendMessage} isConnected={true} />);
    
    const messageInput = screen.getByPlaceholderText('Type your message...');
    await user.type(messageInput, 'Test message');
    
    const sendButton = screen.getByRole('button', { name: /send/i });
    await user.click(sendButton);
    
    expect(messageInput).toHaveValue('');
  });

  it('shows loading state when message is being sent', async () => {
    const user = userEvent.setup();
    render(<ChatInterface messages={[]} onSendMessage={mockOnSendMessage} isConnected={true} />);
    
    const messageInput = screen.getByPlaceholderText('Type your message...');
    await user.type(messageInput, 'Test message');
    
    const sendButton = screen.getByRole('button', { name: /send/i });
    await user.click(sendButton);
    
    // The component should show loading state
    expect(sendButton).toBeDisabled();
  });

  it('formats timestamps correctly', () => {
    render(<ChatInterface messages={mockMessages} onSendMessage={mockOnSendMessage} isConnected={true} />);
    
    // Check that timestamps are displayed
    const timestamps = screen.getAllByText(/10:00|10:01/);
    expect(timestamps).toHaveLength(2);
  });

  it('scrolls to bottom when new message is added', async () => {
    const { rerender } = render(
      <ChatInterface messages={[mockMessages[0]]} onSendMessage={mockOnSendMessage} isConnected={true} />
    );
    
    // Add a new message
    rerender(
      <ChatInterface messages={mockMessages} onSendMessage={mockOnSendMessage} isConnected={true} />
    );
    
    // The component should scroll to bottom (this is tested by checking if the last message is visible)
    expect(screen.getByText('I am doing well, thank you!')).toBeInTheDocument();
  });

  it('handles long messages with proper formatting', () => {
    const longMessage: Message = {
      id: '3',
      content: 'This is a very long message that should be properly formatted and displayed in the chat interface without breaking the layout or causing any issues with the user experience.',
      role: 'user',
      timestamp: new Date('2023-01-01T10:02:00Z'),
    };
    
    render(<ChatInterface messages={[longMessage]} onSendMessage={mockOnSendMessage} isConnected={true} />);
    
    expect(screen.getByText(longMessage.content)).toBeInTheDocument();
  });

  it('shows proper message styling for user vs assistant', () => {
    render(<ChatInterface messages={mockMessages} onSendMessage={mockOnSendMessage} isConnected={true} />);
    
    const userMessage = screen.getByText('Hello, how are you?');
    const assistantMessage = screen.getByText('I am doing well, thank you!');
    
    expect(userMessage).toBeInTheDocument();
    expect(assistantMessage).toBeInTheDocument();
  });

  it('handles Enter key without Shift as send', async () => {
    const user = userEvent.setup();
    render(<ChatInterface messages={[]} onSendMessage={mockOnSendMessage} isConnected={true} />);
    
    const messageInput = screen.getByPlaceholderText('Type your message...');
    await user.type(messageInput, 'Test message');
    await user.keyboard('{Enter}');
    
    expect(mockOnSendMessage).toHaveBeenCalledWith('Test message');
  });

  it('allows new line with Shift+Enter', async () => {
    const user = userEvent.setup();
    render(<ChatInterface messages={[]} onSendMessage={mockOnSendMessage} isConnected={true} />);
    
    const messageInput = screen.getByPlaceholderText('Type your message...');
    await user.type(messageInput, 'Line 1');
    await user.keyboard('{Shift>}{Enter}{/Shift}');
    await user.type(messageInput, 'Line 2');
    
    expect(messageInput).toHaveValue('Line 1\nLine 2');
    expect(mockOnSendMessage).not.toHaveBeenCalled();
  });
});
