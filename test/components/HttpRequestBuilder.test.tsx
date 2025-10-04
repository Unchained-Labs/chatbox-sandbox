import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import HttpRequestBuilder from '../../src/components/HttpRequestBuilder';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('HttpRequestBuilder', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<HttpRequestBuilder />);
    expect(screen.getByText('Headers')).toBeInTheDocument();
    expect(screen.getByText('Add Header')).toBeInTheDocument();
  });

  it('renders with presets when provided', () => {
    const presets = [
      {
        name: 'Test Preset',
        method: 'POST',
        url: 'https://preset.com/api',
        headers: [{ key: 'X-Preset-Header', value: 'PresetValue', enabled: true }],
        body: '{"preset": true}',
      },
    ];
    render(<HttpRequestBuilder presets={presets} />);
    expect(screen.getByText('Test Preset')).toBeInTheDocument();
  });

  it('renders with baseUrl when provided', () => {
    render(<HttpRequestBuilder baseUrl="https://api.example.com" />);
    expect(screen.getByDisplayValue('https://api.example.com')).toBeInTheDocument();
  });
});