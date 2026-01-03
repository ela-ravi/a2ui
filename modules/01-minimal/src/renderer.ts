import { UISchema, UIComponent, Interaction } from './types';

export class Renderer {
  private container: HTMLElement;
  private onInteract: (interaction: Interaction) => void;

  constructor(container: HTMLElement, onInteract: (interaction: Interaction) => void) {
    this.container = container;
    this.onInteract = onInteract;
  }

  render(schema: UISchema): void {
    this.container.innerHTML = '';

    for (const component of schema.components) {
      const element = this.renderComponent(component);
      this.container.appendChild(element);
    }
  }

  private renderComponent(component: UIComponent): HTMLElement {
    switch (component.type) {
      case 'text':
        return this.renderText(component);
      case 'input':
        return this.renderInput(component);
      case 'button':
        return this.renderButton(component);
    }
  }

  private renderText(component: { id: string; content: string }): HTMLElement {
    const el = document.createElement('p');
    el.id = component.id;
    el.textContent = component.content;
    return el;
  }

  private renderInput(component: { id: string; placeholder?: string; label?: string }): HTMLElement {
    const wrapper = document.createElement('div');

    if (component.label) {
      const label = document.createElement('label');
      label.htmlFor = component.id;
      label.textContent = component.label;
      wrapper.appendChild(label);
    }

    const input = document.createElement('input');
    input.type = 'text';
    input.id = component.id;
    if (component.placeholder) {
      input.placeholder = component.placeholder;
    }
    wrapper.appendChild(input);

    return wrapper;
  }

  private renderButton(component: { id: string; label: string; action: string }): HTMLElement {
    const button = document.createElement('button');
    button.id = component.id;
    button.textContent = component.label;
    button.dataset.action = component.action;

    button.addEventListener('click', () => {
      const values = this.collectInputValues();
      this.onInteract({
        type: 'interaction',
        componentId: component.id,
        action: 'click',
        values
      });
    });

    return button;
  }

  private collectInputValues(): Record<string, string> {
    const values: Record<string, string> = {};
    const inputs = this.container.querySelectorAll('input');
    inputs.forEach(input => {
      values[input.id] = input.value;
    });
    return values;
  }
}
