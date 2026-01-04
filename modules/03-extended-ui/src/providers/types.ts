// LLM Provider Types

export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LLMResponse {
  content: string;
}

export interface LLMProvider {
  name: string;
  id: string;
  requiresApiKey: boolean;
  chat(messages: Message[]): Promise<LLMResponse>;
}

export interface ProviderConfig {
  providerId: string;
  apiKey?: string;
  model?: string;
}

export type ProviderFactory = (config: ProviderConfig) => LLMProvider;

// Available provider IDs
export const PROVIDER_IDS = {
  OLLAMA: 'ollama',
  OPENAI: 'openai',
  ANTHROPIC: 'anthropic',
  GEMINI: 'gemini',
  HUGGINGFACE: 'huggingface',
  OPENROUTER: 'openrouter',
} as const;

export type ProviderId = typeof PROVIDER_IDS[keyof typeof PROVIDER_IDS];

export interface ProviderInfo {
  id: ProviderId;
  name: string;
  requiresApiKey: boolean;
  defaultModel: string;
  models: string[];
  devOnly?: boolean;
  browserSupport?: boolean; // false = CORS issues, requires proxy
}

export const PROVIDERS: ProviderInfo[] = [
  {
    id: 'ollama',
    name: 'Ollama (Local)',
    requiresApiKey: false,
    defaultModel: 'llama3.1:8b',
    models: ['llama3.1:8b', 'llama3.2', 'mistral', 'codellama'],
    devOnly: true,
    browserSupport: true,
  },
  {
    id: 'openai',
    name: 'OpenAI',
    requiresApiKey: true,
    defaultModel: 'gpt-4o-mini',
    models: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo'],
    browserSupport: true,
  },
  {
    id: 'anthropic',
    name: 'Anthropic (Claude)',
    requiresApiKey: true,
    defaultModel: 'claude-sonnet-4-20250514',
    models: ['claude-sonnet-4-20250514', 'claude-opus-4-20250514', 'claude-3-5-haiku-20241022'],
    browserSupport: true, // Requires special header
  },
  {
    id: 'gemini',
    name: 'Google Gemini',
    requiresApiKey: true,
    defaultModel: 'gemini-2.0-flash',
    models: ['gemini-2.0-flash', 'gemini-2.0-flash-lite', 'gemini-1.5-flash-8b'],
    browserSupport: true,
  },
  {
    id: 'huggingface',
    name: 'HuggingFace',
    requiresApiKey: true,
    defaultModel: 'meta-llama/Llama-3.1-8B-Instruct',
    models: ['meta-llama/Llama-3.1-8B-Instruct', 'mistralai/Mistral-7B-Instruct-v0.3', 'microsoft/Phi-3-mini-4k-instruct'],
    browserSupport: false, // CORS not supported
  },
  {
    id: 'openrouter',
    name: 'OpenRouter',
    requiresApiKey: true,
    defaultModel: 'openai/gpt-4o-mini',
    models: ['openai/gpt-4o-mini', 'anthropic/claude-3.5-sonnet', 'google/gemini-2.0-flash-001', 'meta-llama/llama-3.3-70b-instruct'],
    browserSupport: true,
  },
];
