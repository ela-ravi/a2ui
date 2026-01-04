import { LLMProvider, Message, LLMResponse, ProviderConfig } from './types';

const OLLAMA_URL = 'http://localhost:11434/api/chat';

export class OllamaProvider implements LLMProvider {
  name = 'Ollama (Local)';
  id = 'ollama';
  requiresApiKey = false;
  private model: string;

  constructor(config: ProviderConfig) {
    this.model = config.model || 'llama3.1:8b';
  }

  async chat(messages: Message[]): Promise<LLMResponse> {
    const response = await fetch(OLLAMA_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: this.model,
        messages,
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama error: ${response.status}`);
    }

    const data = await response.json();
    return { content: data.message.content };
  }
}
