import { LLMProvider, Message, LLMResponse, ProviderConfig } from './types';

const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';

export class OpenAIProvider implements LLMProvider {
  name = 'OpenAI';
  id = 'openai';
  requiresApiKey = true;
  private apiKey: string;
  private model: string;

  constructor(config: ProviderConfig) {
    if (!config.apiKey) {
      throw new Error('OpenAI API key is required');
    }
    this.apiKey = config.apiKey;
    this.model = config.model || 'gpt-4o-mini';
  }

  async chat(messages: Message[]): Promise<LLMResponse> {
    const response = await fetch(OPENAI_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(`OpenAI error: ${error.error?.message || response.status}`);
    }

    const data = await response.json();
    return { content: data.choices[0].message.content };
  }
}
