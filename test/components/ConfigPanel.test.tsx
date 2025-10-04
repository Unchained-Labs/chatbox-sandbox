import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ConfigPanel from '../../src/components/ConfigPanel';

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

describe('ConfigPanel', () => {
  const mockOnSave = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);
  });

  it('renders with default configuration', () => {
    render(<ConfigPanel onSave={mockOnSave} />);
    
    expect(screen.getByText('Configuration')).toBeInTheDocument();
    expect(screen.getByText('HTTP Builder')).toBeInTheDocument();
    expect(screen.getByDisplayValue('⭐ Hunter API')).toBeInTheDocument();
  });

  it('switches between configuration and HTTP builder tabs', async () => {
    const user = userEvent.setup();
    render(<ConfigPanel onSave={mockOnSave} />);
    
    const httpBuilderTab = screen.getByText('HTTP Builder');
    await user.click(httpBuilderTab);
    
    expect(screen.getByText('Quick Presets')).toBeInTheDocument();
  });

  it('changes provider when selected', async () => {
    const user = userEvent.setup();
    render(<ConfigPanel onSave={mockOnSave} />);
    
    const providerSelect = screen.getByDisplayValue('⭐ Hunter API');
    await user.selectOptions(providerSelect, 'openai');
    
    expect(screen.getByDisplayValue('OpenAI')).toBeInTheDocument();
  });

  it('updates API URL when changed', async () => {
    const user = userEvent.setup();
    render(<ConfigPanel onSave={mockOnSave} />);
    
    const urlInput = screen.getByPlaceholderText('https://api.example.com/v1/chat/completions');
    await user.type(urlInput, 'https://api.openai.com/v1/chat/completions');
    
    expect(urlInput).toHaveValue('https://api.openai.com/v1/chat/completions');
  });

  it('shows API key field for non-Hunter providers', async () => {
    const user = userEvent.setup();
    render(<ConfigPanel onSave={mockOnSave} />);
    
    const providerSelect = screen.getByDisplayValue('⭐ Hunter API');
    await user.selectOptions(providerSelect, 'openai');
    
    expect(screen.getByLabelText('API Key')).toBeInTheDocument();
  });

  it('shows wallet private key field for Hunter provider', () => {
    render(<ConfigPanel onSave={mockOnSave} />);
    
    expect(screen.getByLabelText('Wallet Private Key')).toBeInTheDocument();
  });

  it('adds custom header when Add Header is clicked', async () => {
    const user = userEvent.setup();
    render(<ConfigPanel onSave={mockOnSave} />);
    
    const addHeaderButton = screen.getByText('Add Header');
    await user.click(addHeaderButton);
    
    const headerInputs = screen.getAllByPlaceholderText('Header name');
    expect(headerInputs).toHaveLength(1);
  });

  it('removes custom header when trash button is clicked', async () => {
    const user = userEvent.setup();
    render(<ConfigPanel onSave={mockOnSave} />);
    
    // Add a header first
    const addHeaderButton = screen.getByText('Add Header');
    await user.click(addHeaderButton);
    
    // Then remove it
    const trashButton = screen.getByRole('button', { name: /trash/i });
    await user.click(trashButton);
    
    const headerInputs = screen.queryAllByPlaceholderText('Header name');
    expect(headerInputs).toHaveLength(0);
  });

  it('updates system prompt when changed', async () => {
    const user = userEvent.setup();
    render(<ConfigPanel onSave={mockOnSave} />);
    
    const systemPromptTextarea = screen.getByPlaceholderText('You are a helpful assistant...');
    await user.type(systemPromptTextarea, 'You are a test assistant');
    
    expect(systemPromptTextarea).toHaveValue('You are a test assistant');
  });

  it('saves configuration when Use Now is clicked', async () => {
    const user = userEvent.setup();
    render(<ConfigPanel onSave={mockOnSave} />);
    
    const useNowButton = screen.getByText('Use Now');
    await user.click(useNowButton);
    
    expect(mockOnSave).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'hunter',
        name: '⭐ Hunter API',
        apiUrl: 'https://sandbox.drpxbt.xyz',
        requestFormat: 'hunter',
      }),
      ''
    );
  });

  it('shows save dialog when Save As is clicked', async () => {
    const user = userEvent.setup();
    render(<ConfigPanel onSave={mockOnSave} />);
    
    const saveAsButton = screen.getByText('Save As...');
    await user.click(saveAsButton);
    
    expect(screen.getByText('Save Configuration')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter configuration name')).toBeInTheDocument();
  });

  it('saves configuration with name when Save is clicked in dialog', async () => {
    const user = userEvent.setup();
    render(<ConfigPanel onSave={mockOnSave} />);
    
    // Open save dialog
    const saveAsButton = screen.getByText('Save As...');
    await user.click(saveAsButton);
    
    // Enter configuration name
    const nameInput = screen.getByPlaceholderText('Enter configuration name');
    await user.type(nameInput, 'Test Config');
    
    // Click save
    const saveButton = screen.getByText('Save');
    await user.click(saveButton);
    
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      'chatbox-saved-configs',
      expect.stringContaining('Test Config')
    );
  });

  it('loads saved configurations from localStorage', () => {
    const savedConfigs = [
      {
        id: '1',
        name: 'Test Config',
        provider: {
          id: 'openai',
          name: 'OpenAI',
          apiUrl: 'https://api.openai.com/v1/chat/completions',
          apiKey: 'test-key',
          requestFormat: 'openai',
        },
        systemPrompt: 'Test prompt',
        createdAt: new Date().toISOString(),
      },
    ];
    
    mockLocalStorage.getItem.mockReturnValue(JSON.stringify(savedConfigs));
    
    render(<ConfigPanel onSave={mockOnSave} />);
    
    expect(screen.getByText('Test Config')).toBeInTheDocument();
  });

  it('loads configuration when load button is clicked', async () => {
    const user = userEvent.setup();
    const savedConfigs = [
      {
        id: '1',
        name: 'Test Config',
        provider: {
          id: 'openai',
          name: 'OpenAI',
          apiUrl: 'https://api.openai.com/v1/chat/completions',
          apiKey: 'test-key',
          requestFormat: 'openai',
        },
        systemPrompt: 'Test prompt',
        createdAt: new Date().toISOString(),
      },
    ];
    
    mockLocalStorage.getItem.mockReturnValue(JSON.stringify(savedConfigs));
    
    render(<ConfigPanel onSave={mockOnSave} />);
    
    const loadButton = screen.getByRole('button', { name: /load configuration/i });
    await user.click(loadButton);
    
    expect(screen.getByDisplayValue('OpenAI')).toBeInTheDocument();
    expect(screen.getByDisplayValue('https://api.openai.com/v1/chat/completions')).toBeInTheDocument();
  });

  it('deletes configuration when delete button is clicked', async () => {
    const user = userEvent.setup();
    const savedConfigs = [
      {
        id: '1',
        name: 'Test Config',
        provider: {
          id: 'openai',
          name: 'OpenAI',
          apiUrl: 'https://api.openai.com/v1/chat/completions',
          apiKey: 'test-key',
          requestFormat: 'openai',
        },
        systemPrompt: 'Test prompt',
        createdAt: new Date().toISOString(),
      },
    ];
    
    mockLocalStorage.getItem.mockReturnValue(JSON.stringify(savedConfigs));
    window.confirm = vi.fn().mockReturnValue(true);
    
    render(<ConfigPanel onSave={mockOnSave} />);
    
    const deleteButton = screen.getByRole('button', { name: /delete configuration/i });
    await user.click(deleteButton);
    
    expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete this configuration?');
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      'chatbox-saved-configs',
      '[]'
    );
  });

  it('shows model selection for providers with known models', async () => {
    const user = userEvent.setup();
    render(<ConfigPanel onSave={mockOnSave} />);
    
    const providerSelect = screen.getByDisplayValue('⭐ Hunter API');
    await user.selectOptions(providerSelect, 'openai');
    
    expect(screen.getByLabelText('Model')).toBeInTheDocument();
    expect(screen.getByText('gpt-3.5-turbo')).toBeInTheDocument();
  });

  it('disables buttons when required fields are missing', () => {
    render(<ConfigPanel onSave={mockOnSave} />);
    
    const useNowButton = screen.getByText('Use Now');
    expect(useNowButton).toBeDisabled();
  });

  it('enables buttons when required fields are filled', async () => {
    const user = userEvent.setup();
    render(<ConfigPanel onSave={mockOnSave} />);
    
    const walletKeyInput = screen.getByPlaceholderText('Enter your wallet private key for SIWE authentication');
    await user.type(walletKeyInput, 'test-private-key');
    
    const useNowButton = screen.getByText('Use Now');
    expect(useNowButton).not.toBeDisabled();
  });
});
