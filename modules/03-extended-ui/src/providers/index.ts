import { LLMProvider, ProviderConfig, PROVIDERS, ProviderId, ProviderInfo } from './types';
import { OllamaProvider } from './ollama';
import { OpenAIProvider } from './openai';
import { AnthropicProvider } from './anthropic';
import { GeminiProvider } from './gemini';
import { HuggingFaceProvider } from './huggingface';
import { OpenRouterProvider } from './openrouter';
import { getEnvConfig, isProviderEnabled } from './env';

export * from './types';

// Environment detection
export function isProduction(): boolean {
  return import.meta.env.PROD;
}

// Get available providers based on environment variables
export function getAvailableProviders(): ProviderInfo[] {
  const envConfig = getEnvConfig();

  return PROVIDERS.filter(p => {
    // Check if provider is enabled via environment
    if (!envConfig[p.id]?.enabled) {
      return false;
    }

    // In production, exclude dev-only providers
    if (p.devOnly && isProduction()) {
      return false;
    }

    return true;
  });
}

// Create a provider instance
export function createProvider(config: ProviderConfig): LLMProvider {
  const providerId = config.providerId as ProviderId;

  // Check if provider exists
  const providerInfo = PROVIDERS.find(p => p.id === providerId);
  if (!providerInfo) {
    throw new Error(`Unknown provider: ${providerId}`);
  }

  // Check if provider is enabled
  if (!isProviderEnabled(providerId)) {
    throw new Error(`Provider ${providerInfo.name} is not enabled.`);
  }

  // Check environment restrictions
  if (providerInfo.devOnly && isProduction()) {
    throw new Error(`Provider ${providerInfo.name} is not available in production`);
  }

  switch (providerId) {
    case 'ollama':
      return new OllamaProvider(config);
    case 'openai':
      return new OpenAIProvider(config);
    case 'anthropic':
      return new AnthropicProvider(config);
    case 'gemini':
      return new GeminiProvider(config);
    case 'huggingface':
      return new HuggingFaceProvider(config);
    case 'openrouter':
      return new OpenRouterProvider(config);
    default:
      throw new Error(`Provider not implemented: ${providerId}`);
  }
}

// Settings storage
const SETTINGS_KEY = 'a2ui-provider-settings';

export interface StoredSettings {
  providerId: ProviderId;
  model?: string;
  apiKeys: Record<ProviderId, string>;
}

export function getDefaultSettings(): StoredSettings {
  // Get first available provider as default
  const available = getAvailableProviders();
  const defaultProvider = available[0]?.id || 'ollama';

  return {
    providerId: defaultProvider,
    apiKeys: {
      ollama: '',
      openai: '',
      anthropic: '',
      gemini: '',
      huggingface: '',
      openrouter: '',
    },
  };
}

export function loadSettings(): StoredSettings {
  const defaults = getDefaultSettings();

  try {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as StoredSettings;

      // Merge with defaults
      const apiKeys = { ...defaults.apiKeys, ...parsed.apiKeys };

      // If stored provider is no longer available, use default
      const available = getAvailableProviders();
      const providerId = available.some(p => p.id === parsed.providerId)
        ? parsed.providerId
        : defaults.providerId;

      return {
        providerId,
        model: parsed.model,
        apiKeys,
      };
    }
  } catch {
    // Ignore parse errors
  }
  return defaults;
}

export function saveSettings(settings: StoredSettings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

// Create provider from stored settings
export function createProviderFromSettings(): LLMProvider {
  const settings = loadSettings();
  const providerInfo = PROVIDERS.find(p => p.id === settings.providerId);

  if (!providerInfo) {
    throw new Error('No provider configured');
  }

  // Check if API key is required but not provided
  if (providerInfo.requiresApiKey && !settings.apiKeys[settings.providerId]) {
    throw new Error(`Please enter your ${providerInfo.name} API key in settings.`);
  }

  return createProvider({
    providerId: settings.providerId,
    apiKey: settings.apiKeys[settings.providerId],
    model: settings.model || providerInfo.defaultModel,
  });
}
