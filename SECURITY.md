# Security Policy

## Supported Versions

We release patches for security vulnerabilities in the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

We take security bugs seriously. We appreciate your efforts to responsibly disclose your findings, and will make every effort to acknowledge your contributions.

### How to Report

**Please do not report security vulnerabilities through public GitHub issues.**

Instead, please report them via one of the following methods:

1. **Email**: Send details to [rangonomics@gmail.com](mailto:rangonomics@gmail.com)
2. **GitHub Security Advisories**: Use GitHub's private vulnerability reporting feature
3. **Discord**: Contact project maintainers in our private Discord channel

### What to Include

When reporting a vulnerability, please include:

- **Description**: A clear description of the vulnerability
- **Steps to Reproduce**: Detailed steps to reproduce the issue
- **Impact**: Potential impact and severity assessment
- **Environment**: Browser, OS, and version information
- **Proof of Concept**: If applicable, a minimal proof of concept
- **Suggested Fix**: If you have ideas for how to fix the issue

### Response Timeline

- **Initial Response**: Within 48 hours
- **Status Update**: Within 7 days
- **Resolution**: Depends on severity and complexity

## Security Considerations

### Client-Side Application

This is a **client-side only** application that runs entirely in the browser. Key security considerations:

#### Data Storage
- **Local Storage**: API keys and configurations are stored locally in the browser
- **No Server Storage**: No data is sent to our servers
- **User Responsibility**: Users are responsible for securing their own devices

#### API Key Security
- **Local Only**: API keys never leave the user's browser
- **Direct Communication**: All API calls go directly from the user's browser to the LLM provider
- **No Proxy**: We don't proxy or store API communications

#### Best Practices for Users
- Use secure devices and browsers
- Don't share browser profiles or devices
- Be aware of browser sync settings
- Clear browser data when done
- Use strong, unique API keys
- Regularly rotate API keys

### Development Security

#### Dependencies
- Regular dependency updates
- Automated security scanning
- Minimal dependency footprint

#### Code Quality
- TypeScript for type safety
- ESLint for code quality
- Automated testing
- Code review process

#### CI/CD Security
- Automated security checks
- Dependency vulnerability scanning
- Secure build processes

## Security Features

### Authentication
- **SIWE (Sign-In with Ethereum)**: For Hunter API authentication
- **API Key Authentication**: For other LLM providers
- **No Password Storage**: No passwords are stored or transmitted

### Data Protection
- **Client-Side Only**: All processing happens in the browser
- **No Data Collection**: We don't collect user data
- **Local Storage**: All data stays on user's device

### Network Security
- **HTTPS Only**: All API communications use HTTPS
- **CORS Compliance**: Proper CORS headers for cross-origin requests
- **No Mixed Content**: All resources served over HTTPS

## Vulnerability Disclosure

### Public Disclosure
- Vulnerabilities will be disclosed publicly after they are fixed
- We will credit security researchers who responsibly disclose issues
- Disclosure timeline will be coordinated with the reporter

### Security Advisories
- Security advisories will be published for significant vulnerabilities
- Advisories will include:
  - Description of the vulnerability
  - Affected versions
  - Mitigation steps
  - Fix timeline

## Security Best Practices

### For Developers
- Follow secure coding practices
- Keep dependencies updated
- Use TypeScript for type safety
- Implement proper error handling
- Validate all inputs
- Use HTTPS for all communications

### For Users
- Keep your browser updated
- Use strong, unique API keys
- Don't share your browser or device
- Be cautious with browser extensions
- Clear browser data regularly
- Use secure networks

## Contact

For security-related questions or concerns:

- **Email**: [rangonomics@gmail.com](mailto:rangonomics@gmail.com)
- **GitHub**: Use private vulnerability reporting
- **Discord**: Contact project maintainers

## Acknowledgments

We thank the security researchers and community members who help keep this project secure through responsible disclosure.

## License

This security policy is part of the project and is subject to the same license terms as the main project.
