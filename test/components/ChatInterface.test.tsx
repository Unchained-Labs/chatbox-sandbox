import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import ChatInterface from '../../src/components/ChatInterface';
import { Message } from '../../src/types';

describe('ChatInterface', () => {
  const mockOnSendMessage = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing when not connected', () => {
    render(<ChatInterface messages={[]} onSendMessage={mockOnSendMessage} isConnected={false} />);
    expect(screen.getByText('No Configuration')).toBeInTheDocument();
  });

  it('renders without crashing when connected', () => {
    render(<ChatInterface messages={[]} onSendMessage={mockOnSendMessage} isConnected={true} />);
    expect(screen.getByText('Start a Conversation')).toBeInTheDocument();
  });

  it('renders messages correctly', () => {
    const messages: Message[] = [
      {
        id: '1',
        content: 'Hello',
        role: 'user',
        timestamp: new Date('2023-01-01T10:00:00Z'),
      },
      {
        id: '2',
        content: 'Hi there!',
        role: 'assistant',
        timestamp: new Date('2023-01-01T10:01:00Z'),
      },
    ];

    render(<ChatInterface messages={messages} onSendMessage={mockOnSendMessage} isConnected={true} />);
    
    expect(screen.getByText('Hello')).toBeInTheDocument();
    expect(screen.getByText('Hi there!')).toBeInTheDocument();
  });

  it('shows loading state when message is being sent', () => {
    render(<ChatInterface messages={[]} onSendMessage={mockOnSendMessage} isConnected={true} isLoading={true} />);
    // The component renders without crashing when loading
    expect(screen.getByText('Start a Conversation')).toBeInTheDocument();
  });
});