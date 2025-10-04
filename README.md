# Chatbox Sandbox

A modern, configurable chatbot sandbox environment built with React, TypeScript, Vite, and TailwindCSS. This application allows you to easily connect to various LLM providers and test different chatbot configurations.

## Features

- **Multi-Provider Support**: Connect to OpenAI, Anthropic Claude, or any custom LLM endpoint
- **Custom Headers**: Add custom HTTP headers for authentication or API-specific requirements
- **Real-time Chat Interface**: Clean, modern chat UI with message history
- **Configuration Panel**: Easy-to-use configuration interface for API settings
- **Connection Testing**: Test your API configuration before starting a chat
- **Responsive Design**: Beautiful teal/chain blue/dark blue color scheme with responsive layout

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd chatbox-sandbox
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:3000`

## Usage

1. **Configure Your LLM Provider**:
   - Select a provider from the dropdown (OpenAI, Anthropic, or Custom)
   - Enter your API URL and API Key
   - Add any custom headers if needed
   - Optionally set a system prompt
   - Test the connection to ensure everything works

2. **Start Chatting**:
   - Once configured, the chat interface will become available
   - Type your messages and press Enter to send
   - Use Shift+Enter for multi-line messages

## Supported Providers

### OpenAI
- API URL: `https://api.openai.com/v1/chat/completions`
- Models: gpt-3.5-turbo, gpt-4, etc.
- Authentication: Bearer token

### Anthropic Claude
- API URL: `https://api.anthropic.com/v1/messages`
- Models: claude-3-sonnet-20240229, claude-3-haiku-20240307, etc.
- Authentication: x-api-key header

### Custom Endpoints
- Any HTTP endpoint that accepts JSON requests
- Flexible request/response format handling
- Custom headers support

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Project Structure

```
src/
├── components/          # React components
│   ├── ConfigPanel.tsx  # LLM configuration interface
│   └── ChatInterface.tsx # Chat UI component
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
│   └── apiClient.ts    # API client for LLM providers
├── App.tsx             # Main application component
├── main.tsx            # Application entry point
└── index.css           # Global styles and TailwindCSS
```

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for detailed information on how to get started.

### Quick Start for Contributors

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/your-username/chatbox-sandbox.git
   cd chatbox-sandbox
   ```
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Create a feature branch**:
   ```bash
   git checkout -b feat/your-feature-name
   ```
5. **Make your changes** and test them:
   ```bash
   npm run test:ci
   ```
6. **Submit a pull request**

### Development Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run test` - Run tests in watch mode
- `npm run test:run` - Run tests once
- `npm run test:coverage` - Run tests with coverage
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run format` - Format code with Prettier
- `npm run type-check` - Run TypeScript type checking
- `npm run test:ci` - Run all CI checks

### Code Quality

This project maintains high code quality standards:

- **TypeScript** for type safety
- **ESLint** for code quality
- **Prettier** for code formatting
- **Vitest** for testing
- **GitHub Actions** for CI/CD

## Security

For security-related issues, please see our [Security Policy](SECURITY.md).

**Important**: This is a client-side only application. All data (including API keys) is stored locally in your browser and never sent to our servers.

## Code of Conduct

This project follows a [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you agree to uphold this code.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with [React](https://reactjs.org/)
- Styled with [TailwindCSS](https://tailwindcss.com/)
- Bundled with [Vite](https://vitejs.dev/)
- Tested with [Vitest](https://vitest.dev/)

---

A configurable sandbox environment for plugging a chatbot UI into any API
