export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

export interface LLMProvider {
  id: string;
  name: string;
  apiUrl: string;
  apiKey: string;
  model?: string;
  customHeaders?: Record<string, string>;
  requestFormat:
    | 'openai'
    | 'anthropic'
    | 'google'
    | 'cohere'
    | 'replicate'
    | 'hunter'
    | 'custom';
  customPrompt?: string;
  // Hunter-specific fields
  walletPrivateKey?: string;
  domain?: string;
  uri?: string;
  chainId?: number;
  roomName?: string;
}

export interface ChatConfig {
  provider: LLMProvider;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface ApiRequest {
  messages: Array<{
    role: 'user' | 'assistant' | 'system';
    content: string;
  }>;
  model?: string;
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
}

export interface ApiResponse {
  choices: Array<{
    message: {
      role: 'assistant';
      content: string;
    };
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface SavedConfiguration {
  id: string;
  name: string;
  provider: LLMProvider;
  systemPrompt?: string;
  createdAt: Date;
  lastUsed?: Date;
}

// Hunter API specific interfaces
export interface NonceResponse {
  nonce: string;
}

export interface SiweResponse {
  jwt: string;
}

export interface VerifySiweResponse {
  token: string;
}

export interface BalanceResponse {
  eth: string;
  gate_token: string;
}

export interface TokenGateInfo {
  contract_address: `0x${string}`;
  minimum_balance: number;
  symbol: string;
}

export interface WhitelistStatus {
  address: string;
  is_whitelisted: boolean;
}

export interface WorkerStatus {
  address: string;
  is_worker: boolean;
}

export interface AdminStatus {
  address: string;
  is_admin: boolean;
}

export interface KnowledgeResponse {
  success: boolean;
  message: string;
}

export interface TokenExpirationInfo {
  expiresAt: Date;
  remainingMinutes: number;
  remainingHours: number;
  isExpired: boolean;
}
