# Contributing to Chatbox Sandbox

Thank you for your interest in contributing to Chatbox Sandbox! This document provides guidelines and information for contributors.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Making Changes](#making-changes)
- [Testing](#testing)
- [Submitting Changes](#submitting-changes)
- [Issue Guidelines](#issue-guidelines)
- [Pull Request Guidelines](#pull-request-guidelines)

## Code of Conduct

This project adheres to a code of conduct. By participating, you are expected to uphold this code. Please report unacceptable behavior to the project maintainers.

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/your-username/chatbox-sandbox.git
   cd chatbox-sandbox
   ```
3. **Add the upstream remote**:
   ```bash
   git remote add upstream https://github.com/Unchained-Labs/chatbox-sandbox.git
   ```

## Development Setup

### Prerequisites

- Node.js 18.x or 20.x
- npm or yarn

### Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start the development server**:
   ```bash
   npm run dev
   ```

3. **Open your browser** to `http://localhost:5173`

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run test` - Run tests in watch mode
- `npm run test:run` - Run tests once
- `npm run test:coverage` - Run tests with coverage
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting
- `npm run type-check` - Run TypeScript type checking
- `npm run test:ci` - Run all CI checks

## Making Changes

### Branch Naming

Use descriptive branch names with prefixes:

- `feat/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation changes
- `refactor/` - Code refactoring
- `test/` - Test improvements
- `chore/` - Maintenance tasks

Examples:
- `feat/add-new-llm-provider`
- `fix/header-scrolling-issue`
- `docs/update-readme`

### Commit Messages

Follow the conventional commit format:

```
type(scope): description

[optional body]

[optional footer]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

Examples:
```
feat(components): add new LLM provider support

Add support for Anthropic Claude API with proper authentication
and request formatting.

Closes #123
```

## Testing

### Running Tests

```bash
# Run all tests
npm run test:run

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test
```

### Writing Tests

- Write tests for new features and bug fixes
- Aim for good test coverage (minimum 80%)
- Use descriptive test names
- Test both happy path and edge cases
- Mock external dependencies

### Test Structure

```
test/
├── components/          # Component tests
├── utils/              # Utility function tests
├── integration/        # Integration tests
└── setup.ts           # Test setup and mocks
```

## Submitting Changes

### Before Submitting

1. **Ensure all tests pass**:
   ```bash
   npm run test:ci
   ```

2. **Check code formatting**:
   ```bash
   npm run format:check
   ```

3. **Run linting**:
   ```bash
   npm run lint
   ```

4. **Update documentation** if needed

### Pull Request Process

1. **Create a pull request** from your fork to the main repository
2. **Fill out the PR template** completely
3. **Link related issues** using keywords like "Closes #123"
4. **Request review** from maintainers
5. **Address feedback** promptly

### PR Requirements

- [ ] All tests pass
- [ ] Code is properly formatted
- [ ] No linting errors
- [ ] TypeScript types are correct
- [ ] Documentation is updated
- [ ] Commit messages follow conventional format
- [ ] PR description is clear and complete

## Issue Guidelines

### Before Creating an Issue

1. **Search existing issues** to avoid duplicates
2. **Check if it's already fixed** in the latest version
3. **Gather relevant information** (browser, OS, steps to reproduce)

### Issue Templates

Use the appropriate issue template:
- **Bug Report** - For bugs and unexpected behavior
- **Feature Request** - For new features or enhancements
- **Documentation** - For documentation improvements

### Good Issue Examples

**Bug Report:**
```
**Describe the bug**
A clear description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

**Expected behavior**
What you expected to happen.

**Screenshots**
If applicable, add screenshots.

**Environment:**
- OS: [e.g. macOS, Windows, Linux]
- Browser: [e.g. Chrome, Firefox, Safari]
- Version: [e.g. 1.0.0]
```

## Pull Request Guidelines

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tests pass locally
- [ ] New tests added for new functionality
- [ ] Manual testing completed

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No breaking changes (or clearly documented)
```

### Review Process

1. **Automated checks** must pass (CI/CD)
2. **Code review** by maintainers
3. **Testing** in different environments
4. **Documentation review** if applicable
5. **Approval** and merge

## Development Guidelines

### Code Style

- Use TypeScript for type safety
- Follow ESLint and Prettier configurations
- Use meaningful variable and function names
- Add comments for complex logic
- Keep functions small and focused

### Component Guidelines

- Use functional components with hooks
- Implement proper error boundaries
- Handle loading and error states
- Make components accessible
- Use semantic HTML

### API Integration

- Handle network errors gracefully
- Implement proper loading states
- Validate API responses
- Use appropriate HTTP methods
- Implement retry logic where needed

## Getting Help

- **GitHub Discussions** - For questions and general discussion
- **GitHub Issues** - For bug reports and feature requests
- **Discord** - For real-time chat (if available)

## Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes
- GitHub contributors page

Thank you for contributing to Chatbox Sandbox! 🚀
