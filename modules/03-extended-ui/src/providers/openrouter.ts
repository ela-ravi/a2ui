import { LLMProvider, Message, LLMResponse, ProviderConfig } from './types';

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

export class OpenRouterProvider implements LLMProvider {
  name = 'OpenRouter';
  id = 'openrouter';
  requiresApiKey = true;
  private apiKey: string;
  private model: string;

  constructor(config: ProviderConfig) {
    if (!config.apiKey) {
      throw new Error('OpenRouter API key is required');
    }
    this.apiKey = config.apiKey;
    this.model = config.model || 'openai/gpt-4o-mini';
  }

  async chat(messages: Message[]): Promise<LLMResponse> {
    const response = await fetch(OPENROUTER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
        'HTTP-Referer': window.location.origin,
        'X-Title': 'A2UI Demo',
      },
      body: JSON.stringify({
        model: this.model,
        messages,
        max_tokens: 1024,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(`OpenRouter error: ${error.error?.message || response.status}`);
    }

    const data = await response.json();
    return { content: data.choices[0].message.content };
  }
}
