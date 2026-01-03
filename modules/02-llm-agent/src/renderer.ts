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
      case 'select':
        return this.renderSelect(component);
      case 'checkbox':
        return this.renderCheckbox(component);
      case 'radio':
        return this.renderRadio(component);
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

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const button = this.container.querySelector('button');
        if (button) {
          button.click();
        }
      }
    });

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

  private renderSelect(component: { id: string; label: string; options: string[] }): HTMLElement {
    const wrapper = document.createElement('div');

    const label = document.createElement('label');
    label.htmlFor = component.id;
    label.textContent = component.label;
    wrapper.appendChild(label);

    const select = document.createElement('select');
    select.id = component.id;
    for (const opt of component.options) {
      const option = document.createElement('option');
      option.value = opt;
      option.textContent = opt;
      select.appendChild(option);
    }
    wrapper.appendChild(select);

    return wrapper;
  }

  private renderCheckbox(component: { id: string; label: string; options: string[] }): HTMLElement {
    const wrapper = document.createElement('fieldset');
    wrapper.id = component.id;

    const legend = document.createElement('legend');
    legend.textContent = component.label;
    wrapper.appendChild(legend);

    for (const opt of component.options) {
      const optWrapper = document.createElement('div');
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.id = `${component.id}-${opt}`;
      checkbox.name = component.id;
      checkbox.value = opt;

      const label = document.createElement('label');
      label.htmlFor = checkbox.id;
      label.textContent = opt;

      optWrapper.appendChild(checkbox);
      optWrapper.appendChild(label);
      wrapper.appendChild(optWrapper);
    }

    return wrapper;
  }

  private renderRadio(component: { id: string; label: string; options: string[] }): HTMLElement {
    const wrapper = document.createElement('fieldset');
    wrapper.id = component.id;

    const legend = document.createElement('legend');
    legend.textContent = component.label;
    wrapper.appendChild(legend);

    for (const opt of component.options) {
      const optWrapper = document.createElement('div');
      const radio = document.createElement('input');
      radio.type = 'radio';
      radio.id = `${component.id}-${opt}`;
      radio.name = component.id;
      radio.value = opt;

      const label = document.createElement('label');
      label.htmlFor = radio.id;
      label.textContent = opt;

      optWrapper.appendChild(radio);
      optWrapper.appendChild(label);
      wrapper.appendChild(optWrapper);
    }

    return wrapper;
  }

  private collectInputValues(): Record<string, string> {
    const values: Record<string, string> = {};

    // Text inputs
    const inputs = this.container.querySelectorAll('input[type="text"]');
    inputs.forEach(input => {
      values[(input as HTMLInputElement).id] = (input as HTMLInputElement).value;
    });

    // Select elements
    const selects = this.container.querySelectorAll('select');
    selects.forEach(select => {
      values[select.id] = select.value;
    });

    // Radio buttons (get selected value per group)
    const radios = this.container.querySelectorAll('input[type="radio"]:checked');
    radios.forEach(radio => {
      const r = radio as HTMLInputElement;
      values[r.name] = r.value;
    });

    // Checkboxes (comma-separated values per group)
    const checkboxGroups = new Map<string, string[]>();
    const checkboxes = this.container.querySelectorAll('input[type="checkbox"]:checked');
    checkboxes.forEach(cb => {
      const c = cb as HTMLInputElement;
      if (!checkboxGroups.has(c.name)) {
        checkboxGroups.set(c.name, []);
      }
      checkboxGroups.get(c.name)!.push(c.value);
    });
    checkboxGroups.forEach((vals, name) => {
      values[name] = vals.join(', ');
    });

    return values;
  }
}
