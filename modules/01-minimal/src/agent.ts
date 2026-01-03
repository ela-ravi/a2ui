import { UISchema, Interaction } from './types';

export class Agent {
  private userName: string | null = null;

  generateUI(): UISchema {
    if (this.userName === null) {
      return {
        type: 'ui',
        components: [
          { type: 'text', id: 'greeting', content: 'What is your name?' },
          { type: 'input', id: 'name-input', placeholder: 'Enter name' },
          { type: 'button', id: 'submit-btn', label: 'Submit', action: 'submit-name' }
        ]
      };
    }

    return {
      type: 'ui',
      components: [
        { type: 'text', id: 'response', content: `Hello, ${this.userName}!` },
        { type: 'button', id: 'reset-btn', label: 'Start Over', action: 'reset' }
      ]
    };
  }

  handleInteraction(interaction: Interaction): UISchema {
    if (interaction.action === 'click') {
      const buttonId = interaction.componentId;

      if (buttonId === 'submit-btn') {
        this.userName = interaction.values['name-input'] || 'Guest';
      } else if (buttonId === 'reset-btn') {
        this.userName = null;
      }
    }

    return this.generateUI();
  }
}
