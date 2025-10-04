import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import HttpRequestBuilder from '../../src/components/HttpRequestBuilder';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('HttpRequestBuilder', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockClear();
  });

  it('renders with default state', () => {
    render(<HttpRequestBuilder />);
    
    expect(screen.getByDisplayValue('GET')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('https://api.example.com/endpoint')).toBeInTheDocument();
    expect(screen.getByText('Send')).toBeInTheDocument();
  });

  it('renders with baseUrl prop', () => {
    const baseUrl = 'https://api.example.com';
    render(<HttpRequestBuilder baseUrl={baseUrl} />);
    
    expect(screen.getByDisplayValue(baseUrl)).toBeInTheDocument();
  });

  it('renders presets when provided', () => {
    const presets = [
      {
        name: 'Test Preset',
        method: 'POST',
        url: 'https://api.example.com/test',
        headers: [{ key: 'Content-Type', value: 'application/json', enabled: true }],
        body: '{"test": "data"}',
      },
    ];

    render(<HttpRequestBuilder presets={presets} />);
    
    expect(screen.getByText('Quick Presets')).toBeInTheDocument();
    expect(screen.getByText('Test Preset')).toBeInTheDocument();
  });

  it('updates method when changed', async () => {
    const user = userEvent.setup();
    render(<HttpRequestBuilder />);
    
    const methodSelect = screen.getByDisplayValue('GET');
    await user.selectOptions(methodSelect, 'POST');
    
    expect(screen.getByDisplayValue('POST')).toBeInTheDocument();
  });

  it('updates URL when changed', async () => {
    const user = userEvent.setup();
    render(<HttpRequestBuilder />);
    
    const urlInput = screen.getByPlaceholderText('https://api.example.com/endpoint');
    await user.type(urlInput, 'https://api.example.com/test');
    
    expect(urlInput).toHaveValue('https://api.example.com/test');
  });

  it('adds new header when Add Header is clicked', async () => {
    const user = userEvent.setup();
    render(<HttpRequestBuilder />);
    
    const addHeaderButton = screen.getByText('Add Header');
    await user.click(addHeaderButton);
    
    // Should have 3 header rows now (2 default + 1 new)
    const headerRows = screen.getAllByRole('checkbox');
    expect(headerRows).toHaveLength(3);
  });

  it('removes header when trash button is clicked', async () => {
    const user = userEvent.setup();
    render(<HttpRequestBuilder />);
    
    const trashButtons = screen.getAllByRole('button', { name: /trash/i });
    const initialHeaderCount = screen.getAllByRole('checkbox').length;
    
    await user.click(trashButtons[0]);
    
    const finalHeaderCount = screen.getAllByRole('checkbox').length;
    expect(finalHeaderCount).toBe(initialHeaderCount - 1);
  });

  it('toggles header enabled state', async () => {
    const user = userEvent.setup();
    render(<HttpRequestBuilder />);
    
    const checkboxes = screen.getAllByRole('checkbox');
    const firstCheckbox = checkboxes[0];
    
    expect(firstCheckbox).toBeChecked();
    
    await user.click(firstCheckbox);
    expect(firstCheckbox).not.toBeChecked();
  });

  it('shows request body for POST method', async () => {
    const user = userEvent.setup();
    render(<HttpRequestBuilder />);
    
    const methodSelect = screen.getByDisplayValue('GET');
    await user.selectOptions(methodSelect, 'POST');
    
    expect(screen.getByText('Request Body')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('{"key": "value"}')).toBeInTheDocument();
  });

  it('sends request successfully', async () => {
    const mockResponse = {
      ok: true,
      status: 200,
      statusText: 'OK',
      headers: new Map([['content-type', 'application/json']]),
      json: () => Promise.resolve({ message: 'success' }),
    };
    
    mockFetch.mockResolvedValueOnce(mockResponse);
    
    const user = userEvent.setup();
    render(<HttpRequestBuilder baseUrl="https://api.example.com" />);
    
    const sendButton = screen.getByText('Send');
    await user.click(sendButton);
    
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com',
        expect.objectContaining({
          method: 'GET',
          headers: expect.any(Object),
        })
      );
    });
    
    await waitFor(() => {
      expect(screen.getByText('Response')).toBeInTheDocument();
      expect(screen.getByText('200 OK')).toBeInTheDocument();
    });
  });

  it('handles request errors', async () => {
    const mockError = new Error('Network error');
    mockFetch.mockRejectedValueOnce(mockError);
    
    const user = userEvent.setup();
    render(<HttpRequestBuilder baseUrl="https://api.example.com" />);
    
    const sendButton = screen.getByText('Send');
    await user.click(sendButton);
    
    await waitFor(() => {
      expect(screen.getByText('Response')).toBeInTheDocument();
      expect(screen.getByText('0 Network Error')).toBeInTheDocument();
      expect(screen.getByText('• Network error')).toBeInTheDocument();
    });
  });

  it('loads preset when clicked', async () => {
    const user = userEvent.setup();
    const presets = [
      {
        name: 'Test Preset',
        method: 'POST',
        url: 'https://api.example.com/test',
        headers: [{ key: 'Content-Type', value: 'application/json', enabled: true }],
        body: '{"test": "data"}',
      },
    ];

    render(<HttpRequestBuilder presets={presets} />);
    
    const presetButton = screen.getByText('Test Preset');
    await user.click(presetButton);
    
    expect(screen.getByDisplayValue('POST')).toBeInTheDocument();
    expect(screen.getByDisplayValue('https://api.example.com/test')).toBeInTheDocument();
    expect(screen.getByDisplayValue('{"test": "data"}')).toBeInTheDocument();
  });

  it('adds common headers when buttons are clicked', async () => {
    const user = userEvent.setup();
    render(<HttpRequestBuilder />);
    
    const bearerTokenButton = screen.getByText('Bearer Token');
    await user.click(bearerTokenButton);
    
    // Should have 3 header rows now (2 default + 1 new)
    const headerRows = screen.getAllByRole('checkbox');
    expect(headerRows).toHaveLength(3);
    
    // Check that the new header has the correct values
    const headerInputs = screen.getAllByDisplayValue('Authorization');
    expect(headerInputs).toHaveLength(1);
  });

  it('copies response when copy button is clicked', async () => {
    const mockResponse = {
      ok: true,
      status: 200,
      statusText: 'OK',
      headers: new Map([['content-type', 'application/json']]),
      json: () => Promise.resolve({ message: 'success' }),
    };
    
    mockFetch.mockResolvedValueOnce(mockResponse);
    
    const mockWriteText = vi.fn();
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: mockWriteText },
    });
    
    const user = userEvent.setup();
    render(<HttpRequestBuilder baseUrl="https://api.example.com" />);
    
    const sendButton = screen.getByText('Send');
    await user.click(sendButton);
    
    await waitFor(() => {
      expect(screen.getByText('Response')).toBeInTheDocument();
    });
    
    const copyButton = screen.getByText('Copy');
    await user.click(copyButton);
    
    expect(mockWriteText).toHaveBeenCalled();
    expect(screen.getByText('Copied!')).toBeInTheDocument();
  });
});
