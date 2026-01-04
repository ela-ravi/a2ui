import { LLMProvider, Message, LLMResponse, ProviderConfig } from './types';

const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages';

export class AnthropicProvider implements LLMProvider {
  name = 'Anthropic (Claude)';
  id = 'anthropic';
  requiresApiKey = true;
  private apiKey: string;
  private model: string;

  constructor(config: ProviderConfig) {
    if (!config.apiKey) {
      throw new Error('Anthropic API key is required');
    }
    this.apiKey = config.apiKey;
    this.model = config.model || 'claude-sonnet-4-20250514';
  }

  async chat(messages: Message[]): Promise<LLMResponse> {
    // Anthropic uses a different format - separate system from messages
    const systemMessage = messages.find(m => m.role === 'system');
    const chatMessages = messages
      .filter(m => m.role !== 'system')
      .map(m => ({ role: m.role, content: m.content }));

    const response = await fetch(ANTHROPIC_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: this.model,
        max_tokens: 4096,
        system: systemMessage?.content || '',
        messages: chatMessages,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(`Anthropic error: ${error.error?.message || response.status}`);
    }

    const data = await response.json();
    return { content: data.content[0].text };
  }
}
