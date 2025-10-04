import { useState } from 'react';
import { Send, Plus, Trash2, Copy, Check } from 'lucide-react';

interface HttpRequestBuilderProps {
  baseUrl?: string;
  presets?: Array<{
    name: string;
    method: string;
    url: string;
    headers: HttpHeader[];
    body?: string;
  }>;
}

interface HttpHeader {
  key: string;
  value: string;
  enabled: boolean;
}

interface HttpRequest {
  method: string;
  url: string;
  headers: HttpHeader[];
  body: string;
}

export default function HttpRequestBuilder({
  baseUrl = '',
  presets = [],
}: HttpRequestBuilderProps) {
  const [request, setRequest] = useState<HttpRequest>({
    method: 'GET',
    url: baseUrl,
    headers: [
      { key: 'Content-Type', value: 'application/json', enabled: true },
      {
        key: 'Authorization',
        value: 'Bearer YOUR_API_KEY_HERE',
        enabled: false,
      },
    ],
    body: '',
  });

  const [response, setResponse] = useState<{
    status: number;
    statusText: string;
    headers: Record<string, string>;
    data: any;
    error?: string;
  } | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const addHeader = () => {
    setRequest(prev => ({
      ...prev,
      headers: [...prev.headers, { key: '', value: '', enabled: true }],
    }));
  };

  const addCommonHeader = (key: string, value: string) => {
    setRequest(prev => ({
      ...prev,
      headers: [...prev.headers, { key, value, enabled: true }],
    }));
  };

  const removeHeader = (index: number) => {
    setRequest(prev => ({
      ...prev,
      headers: prev.headers.filter((_, i) => i !== index),
    }));
  };

  const updateHeader = (
    index: number,
    field: 'key' | 'value' | 'enabled',
    value: string | boolean
  ) => {
    setRequest(prev => ({
      ...prev,
      headers: prev.headers.map((header, i) =>
        i === index ? { ...header, [field]: value } : header
      ),
    }));
  };

  const sendRequest = async () => {
    setIsLoading(true);
    setResponse(null);

    try {
      const headers: Record<string, string> = {};
      request.headers
        .filter(h => h.enabled && h.key.trim())
        .forEach(h => {
          headers[h.key.trim()] = h.value.trim();
        });

      const fetchOptions: RequestInit = {
        method: request.method,
        headers,
      };

      if (
        request.method !== 'GET' &&
        request.method !== 'HEAD' &&
        request.body.trim()
      ) {
        fetchOptions.body = request.body.trim();
      }

      const res = await fetch(request.url, fetchOptions);

      const responseHeaders: Record<string, string> = {};
      res.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });

      let responseData: any;
      const contentType = res.headers.get('content-type');

      if (contentType?.includes('application/json')) {
        responseData = await res.json();
      } else {
        responseData = await res.text();
      }

      setResponse({
        status: res.status,
        statusText: res.statusText,
        headers: responseHeaders,
        data: responseData,
      });
    } catch (error) {
      setResponse({
        status: 0,
        statusText: 'Network Error',
        headers: {},
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyResponse = async () => {
    if (response) {
      const responseText = JSON.stringify(response, null, 2);
      await navigator.clipboard.writeText(responseText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatJson = (data: any) => {
    if (typeof data === 'string') {
      try {
        return JSON.stringify(JSON.parse(data), null, 2);
      } catch {
        return data;
      }
    }
    return JSON.stringify(data, null, 2);
  };

  const loadPreset = (preset: any) => {
    setRequest({
      method: preset.method,
      url: preset.url,
      headers: preset.headers,
      body: preset.body || '',
    });
  };

  return (
    <div className="h-full flex flex-col max-w-full overflow-hidden">
      {/* Presets - Fixed at top */}
      {presets.length > 0 && (
        <div className="flex-shrink-0 mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Quick Presets
          </label>
          <div className="flex flex-wrap gap-2">
            {presets.map((preset, index) => (
              <button
                key={index}
                onClick={() => loadPreset(preset)}
                className="px-3 py-1 text-xs bg-chain-blue-600 hover:bg-chain-blue-700 text-white rounded transition-colors whitespace-nowrap"
              >
                {preset.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Request Configuration - Fixed height */}
      <div className="flex-shrink-0 space-y-4 mb-4">
        {/* Method and URL */}
        <div className="flex gap-2 min-w-0">
          <select
            value={request.method}
            onChange={e =>
              setRequest(prev => ({ ...prev, method: e.target.value }))
            }
            className="input-field w-32 flex-shrink-0"
          >
            <option value="GET">GET</option>
            <option value="POST">POST</option>
            <option value="PUT">PUT</option>
            <option value="PATCH">PATCH</option>
            <option value="DELETE">DELETE</option>
            <option value="HEAD">HEAD</option>
            <option value="OPTIONS">OPTIONS</option>
          </select>
          <input
            type="url"
            value={request.url}
            onChange={e =>
              setRequest(prev => ({ ...prev, url: e.target.value }))
            }
            className="input-field flex-1 min-w-0"
            placeholder="https://api.example.com/endpoint"
          />
          <button
            onClick={sendRequest}
            disabled={isLoading || !request.url.trim()}
            className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
          >
            <Send className="w-4 h-4" />
            {isLoading ? 'Sending...' : 'Send'}
          </button>
        </div>

        {/* Headers */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-300">
              Headers
            </label>
            <button
              onClick={addHeader}
              className="text-teal-400 hover:text-teal-300 text-sm flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              Add Header
            </button>
          </div>

          {/* Common Headers */}
          <div className="mb-3">
            <div className="text-xs text-gray-400 mb-2">
              Quick add common headers:
            </div>
            <div className="flex flex-wrap gap-1">
              <button
                onClick={() =>
                  addCommonHeader('Authorization', 'Bearer YOUR_TOKEN')
                }
                className="px-2 py-1 text-xs bg-dark-blue-700 hover:bg-dark-blue-600 text-gray-300 rounded transition-colors"
              >
                Bearer Token
              </button>
              <button
                onClick={() => addCommonHeader('X-API-Key', 'YOUR_API_KEY')}
                className="px-2 py-1 text-xs bg-dark-blue-700 hover:bg-dark-blue-600 text-gray-300 rounded transition-colors"
              >
                API Key
              </button>
              <button
                onClick={() =>
                  addCommonHeader('User-Agent', 'Chatbox-Sandbox/1.0')
                }
                className="px-2 py-1 text-xs bg-dark-blue-700 hover:bg-dark-blue-600 text-gray-300 rounded transition-colors"
              >
                User-Agent
              </button>
              <button
                onClick={() => addCommonHeader('Accept', 'application/json')}
                className="px-2 py-1 text-xs bg-dark-blue-700 hover:bg-dark-blue-600 text-gray-300 rounded transition-colors"
              >
                Accept JSON
              </button>
            </div>
          </div>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {request.headers.map((header, index) => (
              <div key={index} className="flex gap-2 items-center min-w-0">
                <input
                  type="checkbox"
                  checked={header.enabled}
                  onChange={e =>
                    updateHeader(index, 'enabled', e.target.checked)
                  }
                  className="w-4 h-4 text-teal-600 bg-dark-blue-800 border-dark-blue-600 rounded focus:ring-teal-500 flex-shrink-0"
                />
                <input
                  type="text"
                  value={header.key}
                  onChange={e => updateHeader(index, 'key', e.target.value)}
                  className="input-field flex-1 min-w-0"
                  placeholder="Header name"
                  disabled={!header.enabled}
                />
                <input
                  type="text"
                  value={header.value}
                  onChange={e => updateHeader(index, 'value', e.target.value)}
                  className="input-field flex-1 min-w-0"
                  placeholder="Header value"
                  disabled={!header.enabled}
                />
                <button
                  onClick={() => removeHeader(index)}
                  className="p-2 text-red-400 hover:text-red-300 flex-shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Request Body */}
        {(request.method === 'POST' ||
          request.method === 'PUT' ||
          request.method === 'PATCH') && (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Request Body
            </label>
            <textarea
              value={request.body}
              onChange={e =>
                setRequest(prev => ({ ...prev, body: e.target.value }))
              }
              className="input-field w-full h-24 resize-none font-mono text-sm"
              placeholder='{"key": "value"}'
            />
          </div>
        )}
      </div>

      {/* Response - Flexible height */}
      {response && (
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex items-center justify-between mb-2 flex-shrink-0">
            <h3 className="text-lg font-semibold text-white">Response</h3>
            <button
              onClick={copyResponse}
              className="btn-secondary flex items-center gap-2 text-sm"
            >
              {copied ? (
                <Check className="w-4 h-4" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>

          <div className="bg-dark-blue-800 rounded-lg border border-dark-blue-700 overflow-hidden flex-1 flex flex-col min-h-0">
            {/* Status */}
            <div className="px-4 py-2 border-b border-dark-blue-700 bg-dark-blue-900 flex-shrink-0">
              <span
                className={`font-semibold ${
                  response.status >= 200 && response.status < 300
                    ? 'text-green-400'
                    : response.status >= 400
                      ? 'text-red-400'
                      : 'text-yellow-400'
                }`}
              >
                {response.status} {response.statusText}
              </span>
              {response.error && (
                <span className="text-red-400 ml-2">• {response.error}</span>
              )}
            </div>

            {/* Response Headers */}
            <div className="px-4 py-2 border-b border-dark-blue-700 flex-shrink-0">
              <h4 className="text-sm font-medium text-gray-300 mb-2">
                Headers
              </h4>
              <div className="space-y-1 max-h-20 overflow-y-auto">
                {Object.entries(response.headers).map(([key, value]) => (
                  <div key={key} className="text-xs text-gray-400">
                    <span className="text-gray-300">{key}:</span> {value}
                  </div>
                ))}
              </div>
            </div>

            {/* Response Body - Scrollable */}
            <div className="px-4 py-2 flex-1 min-h-0 flex flex-col">
              <h4 className="text-sm font-medium text-gray-300 mb-2 flex-shrink-0">
                Body
              </h4>
              <pre className="text-xs text-gray-300 whitespace-pre-wrap overflow-auto flex-1 min-h-0 max-w-full">
                {formatJson(response.data)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
