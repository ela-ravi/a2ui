import { UISchema, Interaction, AgentResponse } from './types';
import { LLMProvider, Message, createProviderFromSettings } from './providers';

const SYSTEM_PROMPT = `You are a UI demo agent for A2UI - comparing traditional chatbot vs structured UI responses.

PURPOSE: Show the difference between how a traditional chatbot responds (plain text) vs how A2UI responds (structured UI components).

Respond ONLY with valid JSON containing BOTH formats:
{
  "text": "Your natural language response here (like a traditional chatbot would say)",
  "ui": {"type":"ui","components":[...]}
}

The "text" field: Write a friendly, conversational response like a normal chatbot.
The "ui" field: Create a structured UI with interactive components.

Available UI Components (17 total):
- {"type":"text","id":"id","content":"Hello"}
- {"type":"heading","id":"id","content":"Title","level":1}
- {"type":"input","id":"id","placeholder":"Enter value","label":"Name"}
- {"type":"textarea","id":"id","placeholder":"Enter text","label":"Description","rows":4}
- {"type":"button","id":"id","label":"Submit","action":"submit"}
- {"type":"select","id":"id","label":"Choose","options":["A","B","C"]}
- {"type":"checkbox","id":"id","label":"Select multiple","options":["A","B","C"]}
- {"type":"radio","id":"id","label":"Select one","options":["A","B","C"]}
- {"type":"toggle","id":"id","label":"Enable feature","checked":false}
- {"type":"slider","id":"id","label":"Volume","min":0,"max":100,"value":50,"step":1}
- {"type":"datetime","id":"id","label":"Pick date","inputType":"date"}
- {"type":"image","id":"id","src":"https://picsum.photos/200","alt":"description"}
- {"type":"link","id":"id","href":"https://example.com","label":"Click here"}
- {"type":"divider","id":"id"}
- {"type":"progress","id":"id","value":50,"max":100,"label":"Loading"}
- {"type":"list","id":"id","items":["Item 1","Item 2"],"ordered":false}
- {"type":"alert","id":"id","content":"Message","variant":"info|warning|error|success"}

RULES:
1. Always return BOTH "text" and "ui" fields
2. The "text" should be what a traditional chatbot would say
3. The "ui" must include at least one button for interaction
4. Output raw JSON only, no code blocks
5. Each component id must be unique

Start by welcoming the user and asking their name - show how a chatbot would ask vs how A2UI presents it.`;

export class Agent {
  private messages: Message[] = [];
  private provider: LLMProvider | null = null;

  constructor() {
    this.messages = [{ role: 'system', content: SYSTEM_PROMPT }];
  }

  private getProvider(): LLMProvider {
    if (!this.provider) {
      this.provider = createProviderFromSettings();
    }
    return this.provider;
  }

  // Refresh provider (call after settings change)
  refreshProvider(): void {
    this.provider = null;
  }

  async generateUI(): Promise<AgentResponse> {
    this.messages.push({ role: 'user', content: 'Start the conversation.' });
    return this.callLLM();
  }

  async handleInteraction(interaction: Interaction): Promise<AgentResponse> {
    const userMessage = this.formatInteraction(interaction);
    this.messages.push({ role: 'user', content: userMessage });
    return this.callLLM();
  }

  private formatInteraction(interaction: Interaction): string {
    const values = Object.entries(interaction.values)
      .map(([id, value]) => `${id}: "${value}"`)
      .join(', ');
    return `User clicked button "${interaction.componentId}". Input values: {${values}}`;
  }

  private async callLLM(): Promise<AgentResponse> {
    const provider = this.getProvider();
    const response = await provider.chat(this.messages);
    const content = response.content;

    this.messages.push({ role: 'assistant', content });

    return this.parseResponse(content);
  }

  private parseResponse(content: string): AgentResponse {
    let jsonStr = content.trim();

    // Handle markdown code blocks
    const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1].trim();
    }

    let parsed;
    try {
      parsed = JSON.parse(jsonStr);
    } catch (e) {
      console.error('LLM response (not valid JSON):', content);
      throw new Error('LLM response was not valid JSON. Check console for details.');
    }

    // Validate response structure
    if (!parsed.text || !parsed.ui) {
      console.error('LLM response (missing fields):', parsed);
      throw new Error('Invalid response: missing text or ui field');
    }

    if (parsed.ui.type !== 'ui' || !Array.isArray(parsed.ui.components)) {
      console.error('LLM response (invalid ui schema):', parsed);
      throw new Error('Invalid UI schema from LLM');
    }

    return {
      text: parsed.text,
      ui: parsed.ui as UISchema
    };
  }
}
