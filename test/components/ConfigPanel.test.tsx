import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import ConfigPanel from '../../src/components/ConfigPanel';

describe('ConfigPanel', () => {
  const mockOnSave = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<ConfigPanel onSave={mockOnSave} />);
    expect(screen.getByText('LLM Provider')).toBeInTheDocument();
    expect(screen.getByText('API URL')).toBeInTheDocument();
  });

  it('renders with saved configs when provided', () => {
    const savedConfigs = [
      {
        id: 'test-config',
        name: 'Test Configuration',
        provider: {
          id: 'openai',
          name: 'OpenAI',
          apiUrl: 'https://api.openai.com/v1/chat/completions',
          apiKey: 'test-key',
          requestFormat: 'openai' as const,
        },
        systemPrompt: 'Test prompt',
        temperature: 0.7,
        maxTokens: 1000,
      },
    ];

    render(<ConfigPanel onSave={mockOnSave} savedConfigs={savedConfigs} />);
    expect(screen.getByText('LLM Provider')).toBeInTheDocument();
  });

  it('shows HTTP Builder tab', () => {
    render(<ConfigPanel onSave={mockOnSave} />);
    expect(screen.getByText('HTTP Builder')).toBeInTheDocument();
  });
});