import { LLMProvider, Message, LLMResponse, ProviderConfig } from './types';

export class GeminiProvider implements LLMProvider {
  name = 'Google Gemini';
  id = 'gemini';
  requiresApiKey = true;
  private apiKey: string;
  private model: string;

  constructor(config: ProviderConfig) {
    if (!config.apiKey) {
      throw new Error('Gemini API key is required');
    }
    this.apiKey = config.apiKey;
    this.model = config.model || 'gemini-2.0-flash';
  }

  private getApiUrl(): string {
    return `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`;
  }

  // List available models (for debugging)
  async listModels(): Promise<string[]> {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${this.apiKey}`
    );
    const data = await response.json();
    return data.models?.map((m: { name: string }) => m.name) || [];
  }

  async chat(messages: Message[]): Promise<LLMResponse> {
    // Convert to Gemini format
    const systemInstruction = messages.find(m => m.role === 'system');
    const contents = messages
      .filter(m => m.role !== 'system')
      .map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      }));

    const body: Record<string, unknown> = { contents };

    if (systemInstruction) {
      body.systemInstruction = {
        parts: [{ text: systemInstruction.content }],
      };
    }

    const response = await fetch(this.getApiUrl(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(`Gemini error: ${error.error?.message || response.status}`);
    }

    const data = await response.json();
    return { content: data.candidates[0].content.parts[0].text };
  }
}
