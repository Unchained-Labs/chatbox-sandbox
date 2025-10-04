import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../../src/App';

describe('App Integration', () => {
  it('renders the main app without crashing', () => {
    render(<App />);
    expect(screen.getByText('Chatbox Sandbox')).toBeInTheDocument();
  });

  it('shows the configuration panel by default', () => {
    render(<App />);
    expect(screen.getByText('LLM Provider')).toBeInTheDocument();
  });

  it('shows the footer with version information', () => {
    render(<App />);
    expect(screen.getByText('Chatbox Sandbox v1.0.0')).toBeInTheDocument();
  });
});
