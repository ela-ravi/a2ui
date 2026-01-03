import { UISchema, Interaction } from './types';

interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

const SYSTEM_PROMPT = `You are a UI agent. Respond ONLY with valid JSON. No markdown, no explanation, no code blocks.

Schema:
{"type":"ui","components":[...]}

Component types:
- {"type":"text","id":"unique-id","content":"Hello"}
- {"type":"input","id":"unique-id","placeholder":"Enter value"}
- {"type":"button","id":"unique-id","label":"Submit","action":"submit"}
- {"type":"select","id":"unique-id","label":"Select an option","options":["Option 1", "Option 2", "Option 3"]}
- {"type":"checkbox","id":"unique-id","label":"Select an option","options":["Option 1", "Option 2", "Option 3"]}
- {"type":"radio","id":"unique-id","label":"Select an option","options":["Option 1", "Option 2", "Option 3"]}

IMPORTANT RULES:
// 1. EVERY response MUST include at least one button
1. EVERY response MUST include ui element for users to interact with.
2. If there's an input, there MUST be a button to submit it
3. Output raw JSON only, no \`\`\` blocks
4. Each id must be unique
5. Labels should be concise and descriptive.

Example for asking name:
{"type":"ui","components":[{"type":"text","id":"t1","content":"What is your name?"},{"type":"input","id":"name","placeholder":"Enter your name"},{"type":"button","id":"submit","label":"Submit","action":"submit-name"}]}

Start by greeting and asking the user's name.`;

const OLLAMA_URL = 'http://localhost:11434/api/chat';
const MODEL = 'llama3.1:8b';

export class Agent {
  private messages: Message[] = [];

  constructor() {
    this.messages = [{ role: 'system', content: SYSTEM_PROMPT }];
  }

  async generateUI(): Promise<UISchema> {
    // Add initial user message to trigger LLM response
    this.messages.push({ role: 'user', content: 'Start the conversation.' });
    return this.callLLM();
  }

  async handleInteraction(interaction: Interaction): Promise<UISchema> {
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

  private async callLLM(): Promise<UISchema> {
    const response = await fetch(OLLAMA_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: MODEL,
        messages: this.messages,
        stream: false
      })
    });

    if (!response.ok) {
      throw new Error(`Ollama error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.message.content;

    this.messages.push({ role: 'assistant', content });

    return this.parseUISchema(content);
  }

  private parseUISchema(content: string): UISchema {
    // Try to extract JSON from the response
    let jsonStr = content.trim();

    // Handle markdown code blocks
    const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1].trim();
    }

    const schema = JSON.parse(jsonStr) as UISchema;

    if (schema.type !== 'ui' || !Array.isArray(schema.components)) {
      throw new Error('Invalid UI schema from LLM');
    }

    return schema;
  }
}
