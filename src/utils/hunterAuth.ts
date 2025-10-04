import { LLMProvider } from '../types';
import {
  getNonce,
  verifySiweMessage,
  getTokenExpirationInfo,
} from './hunterApiService';
import { ethers } from 'ethers';

export interface HunterAuthResult {
  jwt: string;
  expiresAt: Date;
}

export class HunterAuthService {
  private provider: LLMProvider;
  private jwtToken: string | null = null;
  private tokenExpiry: Date | null = null;

  constructor(provider: LLMProvider) {
    this.provider = provider;
    // Try to load existing token from localStorage
    this.loadStoredToken();
  }

  private loadStoredToken(): void {
    const storedToken = localStorage.getItem('jwt');
    if (storedToken) {
      const tokenInfo = getTokenExpirationInfo();
      if (tokenInfo && !tokenInfo.isExpired) {
        this.jwtToken = storedToken;
        this.tokenExpiry = tokenInfo.expiresAt;
      } else {
        // Token is expired, remove it
        localStorage.removeItem('jwt');
      }
    }
  }

  private storeToken(token: string): void {
    this.jwtToken = token;
    localStorage.setItem('jwt', token);
  }

  async authenticate(): Promise<HunterAuthResult> {
    if (this.jwtToken && this.tokenExpiry && new Date() < this.tokenExpiry) {
      return { jwt: this.jwtToken, expiresAt: this.tokenExpiry };
    }

    try {
      // Step 1: Get nonce using the API service
      const nonceData = await getNonce(
        this.getWalletAddress(),
        this.provider.apiUrl
      );

      // Step 2: Create SIWE message
      const message = this.createSiweMessage(nonceData.nonce);

      // Step 3: Sign message (simplified - in real implementation you'd use proper wallet signing)
      const signature = await this.signMessage(message);

      // Step 4: Authenticate with SIWE using the API service
      const authResult = await verifySiweMessage(
        this.getWalletAddress(),
        message,
        signature,
        this.provider.apiUrl
      );

      this.jwtToken = authResult.jwt;
      this.tokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
      this.storeToken(authResult.jwt);

      return { jwt: this.jwtToken, expiresAt: this.tokenExpiry };
    } catch (error) {
      console.error('Hunter authentication failed:', error);

      // Handle specific error cases
      if (error instanceof Error) {
        if (error.message === 'INSUFFICIENT_BALANCE') {
          throw new Error(
            'Authentication failed: Insufficient balance. Please ensure your wallet has enough tokens.'
          );
        } else if (error.message === 'RATE_LIMITED') {
          throw new Error(
            'Authentication failed: Rate limited. Please wait a moment and try again.'
          );
        } else if (error.message.includes('401')) {
          throw new Error(
            'Authentication failed: Invalid wallet private key or signature. Please check your private key.'
          );
        } else if (error.message.includes('403')) {
          throw new Error(
            'Authentication failed: Access denied. Please check your wallet permissions.'
          );
        }
      }

      throw new Error(
        `Hunter authentication failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  private getWalletAddress(): string {
    if (!this.provider.walletPrivateKey) {
      throw new Error(
        'Wallet private key is required for Hunter authentication'
      );
    }

    try {
      // Create wallet from private key using ethers.js
      // ethers.js handles both formats: with or without 0x prefix
      const wallet = new ethers.Wallet(this.provider.walletPrivateKey);
      console.log('🔑 Derived wallet address:', wallet.address);
      return wallet.address;
    } catch (error) {
      console.error(
        '❌ Error deriving wallet address from private key:',
        error
      );
      throw new Error(
        "Invalid wallet private key. Please check your private key format and ensure it's a valid Ethereum private key."
      );
    }
  }

  private createSiweMessage(nonce: string): string {
    // Use sensible defaults based on the API URL
    const domain = new URL(this.provider.apiUrl).hostname;
    const uri = this.provider.apiUrl;
    const chainId = 8453; // Base Mainnet - always the same
    const address = this.getWalletAddress();
    const issuedAt = new Date().toISOString();

    return `${domain} wants you to sign in with your Ethereum account:
${address}

Sign in with Ethereum to Hunter Terminal

URI: ${uri}
Version: 1
Chain ID: ${chainId}
Nonce: ${nonce}
Issued At: ${issuedAt}`;
  }

  private async signMessage(message: string): Promise<string> {
    if (!this.provider.walletPrivateKey) {
      throw new Error('Wallet private key is required for signing');
    }

    try {
      // Create wallet from private key and sign the message
      // ethers.js handles both formats: with or without 0x prefix
      const wallet = new ethers.Wallet(this.provider.walletPrivateKey);
      const signature = await wallet.signMessage(message);
      console.log(
        '✍️ Signed SIWE message with signature:',
        signature.slice(0, 10) + '...'
      );
      return signature;
    } catch (error) {
      console.error('❌ Error signing message:', error);
      throw new Error(
        "Failed to sign message. Please check your private key format and ensure it's a valid Ethereum private key."
      );
    }
  }

  async sendMessage(prompt: string): Promise<string> {
    const authResult = await this.authenticate();
    const roomName = 'cli'; // Always use 'cli' room as default

    // Try to send the message first
    let response = await fetch(
      `${this.provider.apiUrl}/rooms/${roomName}/chat`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authResult.jwt}`,
        },
        body: JSON.stringify({ prompt }),
      }
    );

    // If room doesn't exist (404), try to create it and retry
    if (response.status === 404) {
      console.log('🔄 Room not found, creating room and retrying...');
      try {
        await this.ensureRoomExists(roomName, authResult.jwt);

        // Retry the message after creating the room
        response = await fetch(
          `${this.provider.apiUrl}/rooms/${roomName}/chat`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${authResult.jwt}`,
            },
            body: JSON.stringify({ prompt }),
          }
        );
      } catch (roomError) {
        console.warn(
          '⚠️ Room creation failed, but continuing with original error:',
          roomError
        );
        // Continue with the original 404 error
      }
    }

    if (!response.ok) {
      let errorMessage = `Hunter API request failed: ${response.statusText}`;

      if (response.status === 401) {
        errorMessage = `Authentication expired: Please check your wallet private key and try again.`;
        // Clear stored token on auth failure
        localStorage.removeItem('jwt');
        this.jwtToken = null;
        this.tokenExpiry = null;
      } else if (response.status === 404) {
        errorMessage = `Room not found: The chat room '${roomName}' doesn't exist and couldn't be created.`;
      } else if (response.status === 403) {
        errorMessage = `Access denied: You don't have permission to access this room.`;
      } else if (response.status === 429) {
        errorMessage = `Rate limited: Too many requests. Please wait a moment and try again.`;
      } else if (response.status >= 500) {
        errorMessage = `Server error: The Hunter API is experiencing issues. Please try again later.`;
      }

      throw new Error(errorMessage);
    }

    const data = await response.json();

    // Extract response based on Hunter API format
    if (data.response) {
      return data.response;
    }
    if (data.message) {
      return data.message;
    }
    if (data.content) {
      return typeof data.content === 'string'
        ? data.content
        : data.content[0]?.text || '';
    }
    if (data.text) {
      return data.text;
    }

    throw new Error('Unable to extract response from Hunter API');
  }

  private async ensureRoomExists(roomName: string, jwt: string): Promise<void> {
    try {
      console.log('🏠 Creating room:', roomName);

      // Try to create the room (this will succeed if it exists or create it if it doesn't)
      const response = await fetch(`${this.provider.apiUrl}/rooms`, {
        method: 'POST',
        headers: {
          accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${jwt}`,
        },
        body: JSON.stringify({ name: roomName }),
      });

      if (response.status === 409) {
        console.log('✅ Room already exists:', roomName);
        return; // Room already exists, that's fine
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to create room: ${response.status} ${response.statusText} - ${errorText}`
        );
      }

      console.log('✅ Room created successfully:', roomName);
    } catch (error) {
      console.error('❌ Room creation failed:', error);
      throw error; // Re-throw so the caller can handle it
    }
  }
}
