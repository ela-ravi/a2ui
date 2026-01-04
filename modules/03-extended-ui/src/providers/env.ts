// Environment-based provider configuration
// Controls which providers are available in the UI
// Users provide their own API keys via the settings panel

export interface EnvConfig {
  providerId: string;
  enabled: boolean;
}

// Read provider enabled state from environment variables
export function getEnvConfig(): Record<string, EnvConfig> {
  return {
    ollama: {
      providerId: 'ollama',
      enabled: import.meta.env.VITE_OLLAMA_ENABLED === 'true',
    },
    openai: {
      providerId: 'openai',
      enabled: import.meta.env.VITE_OPENAI_ENABLED === 'true',
    },
    anthropic: {
      providerId: 'anthropic',
      enabled: import.meta.env.VITE_ANTHROPIC_ENABLED === 'true',
    },
    gemini: {
      providerId: 'gemini',
      enabled: import.meta.env.VITE_GEMINI_ENABLED === 'true',
    },
    huggingface: {
      providerId: 'huggingface',
      enabled: import.meta.env.VITE_HUGGINGFACE_ENABLED === 'true',
    },
    openrouter: {
      providerId: 'openrouter',
      enabled: import.meta.env.VITE_OPENROUTER_ENABLED === 'true',
    },
  };
}

// Check if a provider is enabled via environment
export function isProviderEnabled(providerId: string): boolean {
  const config = getEnvConfig();
  return config[providerId]?.enabled ?? false;
}
