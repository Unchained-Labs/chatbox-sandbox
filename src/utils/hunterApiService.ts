import {
  NonceResponse,
  SiweResponse,
  TokenGateInfo,
  WhitelistStatus,
  WorkerStatus,
  AdminStatus,
  KnowledgeResponse,
  TokenExpirationInfo,
  Message,
} from '../types';

// Use environment variable for backend URL
const BACKEND_URL =
  (import.meta as any).env?.VITE_BACKEND_API_URL || 'http://localhost:8000';

/**
 * Decode JWT token to extract payload information
 */
const decodeJwtToken = (token: string) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(function (c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join('')
    );

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding JWT token:', error);
    return null;
  }
};

/**
 * Get token expiration information from stored JWT
 */
export const getTokenExpirationInfo = (): TokenExpirationInfo | null => {
  const token = localStorage.getItem('jwt');
  if (!token) return null;

  const decoded = decodeJwtToken(token);
  if (!decoded || !decoded.exp) return null;

  const expirationTime = decoded.exp * 1000; // Convert to milliseconds
  const now = Date.now();
  const remainingTime = expirationTime - now;

  return {
    expiresAt: new Date(expirationTime),
    remainingMinutes: Math.floor(remainingTime / (1000 * 60)),
    remainingHours: Math.floor(remainingTime / (1000 * 60 * 60)),
    isExpired: remainingTime <= 0,
  };
};

/**
 * Get nonce for SIWE authentication
 */
export const getNonce = async (
  address: string,
  apiUrl?: string
): Promise<NonceResponse> => {
  try {
    const baseUrl = apiUrl || BACKEND_URL;
    const url = `${baseUrl}/auth/nonce`;

    console.log('🔍 Getting nonce from:', url, 'for address:', address);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ address }),
    });

    console.log(
      '📡 Nonce response status:',
      response.status,
      response.statusText
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        '❌ Nonce request failed:',
        response.status,
        response.statusText,
        errorText
      );
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    const data: NonceResponse = await response.json();
    console.log('✅ Nonce response data:', data);
    return data;
  } catch (error) {
    console.error('💥 Error getting nonce:', error);
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error(
        `Network error: Unable to connect to ${apiUrl || BACKEND_URL}. Please check your internet connection and API URL.`
      );
    }
    throw error;
  }
};

/**
 * Verify SIWE message and get JWT token
 */
export const verifySiweMessage = async (
  address: string,
  message: string,
  signature: string,
  apiUrl?: string
): Promise<{ jwt: string }> => {
  try {
    const baseUrl = apiUrl || BACKEND_URL;
    const response = await fetch(`${baseUrl}/auth/siwe`, {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        address,
        message,
        signature,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      const errorMessage = errorData.detail || 'Authentication failed';

      // Check for insufficient balance error
      if (
        response.status === 403 &&
        errorMessage.startsWith('INSUFFICIENT_BALANCE:')
      ) {
        throw new Error('INSUFFICIENT_BALANCE');
      }

      // Handle rate limiting
      if (response.status === 429) {
        throw new Error('RATE_LIMITED');
      }

      throw new Error(errorMessage);
    }

    const data: SiweResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Error verifying SIWE message:', error);
    throw error;
  }
};

/**
 * Create a new chat room
 */
export const createRoom = async (
  name: string,
  apiUrl?: string
): Promise<void> => {
  try {
    const baseUrl = apiUrl || BACKEND_URL;
    const response = await fetch(`${baseUrl}/rooms`, {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('jwt')}`,
      },
      body: JSON.stringify({ name }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.error('Error creating room:', error);
    throw error;
  }
};

/**
 * Get chat history for a room
 */
export const getRoomHistory = async (
  roomName: string,
  apiUrl?: string
): Promise<Message[]> => {
  try {
    const baseUrl = apiUrl || BACKEND_URL;
    // First try to get the room history
    const response = await fetch(`${baseUrl}/rooms/${roomName}/history`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('jwt')}`,
      },
    });

    if (response.status === 404) {
      // Room doesn't exist, create it first
      console.log("Room doesn't exist, creating it...");
      await createRoom(roomName, apiUrl);
      return []; // Return empty history for new room
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.map((msg: any) => ({
      id: Date.now() + Math.random().toString(),
      content: msg.content,
      role: msg.role === 'user' ? 'user' : 'assistant',
      timestamp: new Date(msg.timestamp || Date.now()),
    }));
  } catch (error) {
    console.error('Error getting room history:', error);
    throw error;
  }
};

/**
 * Get agent reply for a message in a room
 */
export const getAgentReply = async (
  message: string,
  roomName: string,
  apiUrl?: string
): Promise<string> => {
  try {
    const baseUrl = apiUrl || BACKEND_URL;
    const response = await fetch(`${baseUrl}/rooms/${roomName}/chat`, {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('jwt')}`,
      },
      body: JSON.stringify({ prompt: message }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.response;
  } catch (error) {
    console.error('Error getting agent reply:', error);
    throw error;
  }
};

/**
 * Insert knowledge into the system
 */
export const insertKnowledge = async (
  knowledge: string,
  apiUrl?: string
): Promise<KnowledgeResponse> => {
  try {
    const baseUrl = apiUrl || BACKEND_URL;
    // First try to create the memory room
    try {
      await createRoom('memory', apiUrl);
    } catch {
      // If room creation fails, we assume it already exists
      console.log('Memory room might already exist, continuing...');
    }

    // Prepare the preprocessing prompt
    const preprocessingPrompt = `You are a data preprocessing assistant for a retrieval-augmented system.

Your task is to convert any input data — whether it's structured (CSV row or JSON object) or unstructured (plain text) — into a **single, self-contained, natural-language summary in ENGLISH**.

Instructions:
- If the input is a CSV or JSON, interpret the fields and generate an explanatory sentence that summarizes the data clearly and naturally.
- If the input is already plain text, rephrase it into a concise and meaningful summary without losing key information.
- Flatten nested structures.
- Include key entities, timestamps, amounts, statuses, and locations.
- Do not list raw fields or keys. Use natural phrasing.
- Avoid unnecessary verbosity. Focus on meaning.

Only return the final sentence or paragraph.

Input:
${knowledge}`;

    // First get the preprocessed version
    const preprocessedKnowledge = await getAgentReply(
      preprocessingPrompt,
      'memory',
      apiUrl
    );

    if (!preprocessedKnowledge) {
      throw new Error('Failed to preprocess knowledge');
    }

    // Now insert the preprocessed knowledge
    const response = await fetch(`${baseUrl}/knowledge/insert`, {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('jwt')}`,
      },
      body: JSON.stringify({
        text: preprocessedKnowledge,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to insert knowledge');
    }

    return await response.json();
  } catch (error: any) {
    console.error('Error inserting knowledge:', error);

    // Handle specific error cases
    if (error.message === 'INSUFFICIENT_BALANCE') {
      return {
        success: false,
        message: 'Your account balance is insufficient to perform this action.',
      };
    } else if (error.message === 'RATE_LIMITED') {
      return {
        success: false,
        message: 'Rate limited. Please wait a moment and try again.',
      };
    } else if (error.message.includes('403')) {
      return {
        success: false,
        message:
          'Your account is not authorized to modify the knowledge base. Only whitelisted addresses can add to memory.',
      };
    } else if (error.message.includes('401')) {
      return {
        success: false,
        message: 'Authentication error. Please try logging in again.',
      };
    }

    // Default error message for other cases
    return {
      success: false,
      message:
        'Failed to store information in the knowledge base. Please try again later.',
    };
  }
};

/**
 * Clean the knowledge base
 */
export const cleanKnowledge = async (
  apiUrl?: string
): Promise<KnowledgeResponse> => {
  try {
    const baseUrl = apiUrl || BACKEND_URL;
    const response = await fetch(`${baseUrl}/knowledge/clean`, {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('jwt')}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error cleaning knowledge:', error);
    throw error;
  }
};

/**
 * Get token gate information
 */
export const getTokenGateInfo = async (
  apiUrl?: string
): Promise<TokenGateInfo> => {
  try {
    const baseUrl = apiUrl || BACKEND_URL;
    const response = await fetch(`${baseUrl}/info/token-gate`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  } catch (error) {
    console.error('Error getting token gate info:', error);
    throw error;
  }
};

/**
 * Check if an address is whitelisted
 */
export const checkWhitelistStatus = async (
  address: string,
  apiUrl?: string
): Promise<WhitelistStatus> => {
  try {
    const baseUrl = apiUrl || BACKEND_URL;
    const response = await fetch(`${baseUrl}/info/whitelist/${address}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  } catch (error) {
    console.error('Error checking whitelist status:', error);
    throw error;
  }
};

/**
 * Check if an address is a worker
 */
export const checkWorkerStatus = async (
  address: string,
  apiUrl?: string
): Promise<WorkerStatus> => {
  try {
    const baseUrl = apiUrl || BACKEND_URL;
    const response = await fetch(`${baseUrl}/info/worker/${address}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  } catch (error) {
    console.error('Error checking worker status:', error);
    throw error;
  }
};

/**
 * Check if an address is admin
 */
export const checkAdminStatus = async (
  address: string,
  apiUrl?: string
): Promise<AdminStatus> => {
  try {
    const baseUrl = apiUrl || BACKEND_URL;
    const response = await fetch(`${baseUrl}/info/admin/${address}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  } catch (error) {
    console.error('Error checking admin status:', error);
    throw error;
  }
};

/**
 * Complete SIWE authentication flow
 */
export const siweAuth = async (params: {
  address: string;
  message: string;
  signature: string;
}): Promise<string> => {
  try {
    const response = await fetch(`${BACKEND_URL}/auth/siwe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const errorData = await response.json();
      const errorMessage = errorData.detail || 'Authentication failed';

      // Check for insufficient balance error
      if (
        response.status === 403 &&
        errorMessage.startsWith('INSUFFICIENT_BALANCE:')
      ) {
        throw new Error('INSUFFICIENT_BALANCE');
      }

      // Handle rate limiting
      if (response.status === 429) {
        throw new Error('RATE_LIMITED');
      }

      throw new Error(errorMessage);
    }

    const data: SiweResponse = await response.json();
    return data.jwt;
  } catch (error) {
    console.error('Error authenticating with SIWE:', error);
    throw error;
  }
};
