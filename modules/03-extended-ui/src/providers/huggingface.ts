import { LLMProvider, Message, LLMResponse, ProviderConfig } from './types';

export class HuggingFaceProvider implements LLMProvider {
  name = 'HuggingFace';
  id = 'huggingface';
  requiresApiKey = true;
  private apiKey: string;
  private model: string;

  constructor(config: ProviderConfig) {
    if (!config.apiKey) {
      throw new Error('HuggingFace API key is required');
    }
    this.apiKey = config.apiKey;
    this.model = config.model || 'meta-llama/Llama-3.1-8B-Instruct';
  }

  private getApiUrl(): string {
    return `https://api-inference.huggingface.co/models/${this.model}/v1/chat/completions`;
  }

  async chat(messages: Message[]): Promise<LLMResponse> {
    const response = await fetch(this.getApiUrl(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages,
        max_tokens: 2048,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(`HuggingFace error: ${error.error || response.status}`);
    }

    const data = await response.json();
    return { content: data.choices[0].message.content };
  }
}
