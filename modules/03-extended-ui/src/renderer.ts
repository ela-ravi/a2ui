import { UISchema, UIComponent, Interaction } from './types';

export class Renderer {
  private container: HTMLElement;
  private onInteract: (interaction: Interaction) => void;
  private onValueChange?: (values: Record<string, string>) => void;

  constructor(
    container: HTMLElement,
    onInteract: (interaction: Interaction) => void,
    onValueChange?: (values: Record<string, string>) => void
  ) {
    this.container = container;
    this.onInteract = onInteract;
    this.onValueChange = onValueChange;
  }

  private emitValueChange() {
    if (this.onValueChange) {
      this.onValueChange(this.getValues());
    }
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
      case 'textarea':
        return this.renderTextarea(component);
      case 'heading':
        return this.renderHeading(component);
      case 'image':
        return this.renderImage(component);
      case 'link':
        return this.renderLink(component);
      case 'divider':
        return this.renderDivider(component);
      case 'progress':
        return this.renderProgress(component);
      case 'list':
        return this.renderList(component);
      case 'alert':
        return this.renderAlert(component);
      case 'toggle':
        return this.renderToggle(component);
      case 'slider':
        return this.renderSlider(component);
      case 'datetime':
        return this.renderDatetime(component);
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

    input.addEventListener('input', () => this.emitValueChange());

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
    select.addEventListener('change', () => this.emitValueChange());
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
      checkbox.addEventListener('change', () => this.emitValueChange());

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
      radio.addEventListener('change', () => this.emitValueChange());

      const label = document.createElement('label');
      label.htmlFor = radio.id;
      label.textContent = opt;

      optWrapper.appendChild(radio);
      optWrapper.appendChild(label);
      wrapper.appendChild(optWrapper);
    }

    return wrapper;
  }

  // New render methods for module 03

  private renderTextarea(component: { id: string; placeholder?: string; label?: string; rows?: number }): HTMLElement {
    const wrapper = document.createElement('div');

    if (component.label) {
      const label = document.createElement('label');
      label.htmlFor = component.id;
      label.textContent = component.label;
      wrapper.appendChild(label);
    }

    const textarea = document.createElement('textarea');
    textarea.id = component.id;
    textarea.rows = component.rows || 4;
    if (component.placeholder) {
      textarea.placeholder = component.placeholder;
    }
    textarea.addEventListener('input', () => this.emitValueChange());
    wrapper.appendChild(textarea);

    return wrapper;
  }

  private renderHeading(component: { id: string; content: string; level: number }): HTMLElement {
    const level = Math.min(Math.max(component.level, 1), 6);
    const el = document.createElement(`h${level}`);
    el.id = component.id;
    el.textContent = component.content;
    return el;
  }

  private renderImage(component: { id: string; src: string; alt: string }): HTMLElement {
    const img = document.createElement('img');
    img.id = component.id;
    img.src = component.src;
    img.alt = component.alt;
    return img;
  }

  private renderLink(component: { id: string; href: string; label: string }): HTMLElement {
    const link = document.createElement('a');
    link.id = component.id;
    link.href = component.href;
    link.textContent = component.label;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    return link;
  }

  private renderDivider(component: { id: string }): HTMLElement {
    const hr = document.createElement('hr');
    hr.id = component.id;
    return hr;
  }

  private renderProgress(component: { id: string; value: number; max: number; label?: string }): HTMLElement {
    const wrapper = document.createElement('div');
    wrapper.className = 'progress-wrapper';

    if (component.label) {
      const label = document.createElement('label');
      label.htmlFor = component.id;
      label.textContent = component.label;
      wrapper.appendChild(label);
    }

    const progress = document.createElement('progress');
    progress.id = component.id;
    progress.value = component.value;
    progress.max = component.max;
    wrapper.appendChild(progress);

    return wrapper;
  }

  private renderList(component: { id: string; items: string[]; ordered?: boolean }): HTMLElement {
    const list = document.createElement(component.ordered ? 'ol' : 'ul');
    list.id = component.id;

    for (const item of component.items) {
      const li = document.createElement('li');
      li.textContent = item;
      list.appendChild(li);
    }

    return list;
  }

  private renderAlert(component: { id: string; content: string; variant: string }): HTMLElement {
    const alert = document.createElement('div');
    alert.id = component.id;
    alert.className = `alert alert-${component.variant}`;
    alert.textContent = component.content;
    alert.setAttribute('role', 'alert');
    return alert;
  }

  private renderToggle(component: { id: string; label: string; checked?: boolean }): HTMLElement {
    const wrapper = document.createElement('div');
    wrapper.className = 'toggle-wrapper';

    const input = document.createElement('input');
    input.type = 'checkbox';
    input.id = component.id;
    input.className = 'toggle';
    input.checked = component.checked || false;
    input.addEventListener('change', () => this.emitValueChange());

    const label = document.createElement('label');
    label.htmlFor = component.id;
    label.textContent = component.label;

    wrapper.appendChild(input);
    wrapper.appendChild(label);

    return wrapper;
  }

  private renderSlider(component: { id: string; label: string; min: number; max: number; value: number; step?: number }): HTMLElement {
    const wrapper = document.createElement('div');
    wrapper.className = 'slider-wrapper';

    const label = document.createElement('label');
    label.htmlFor = component.id;
    label.textContent = component.label;
    wrapper.appendChild(label);

    const slider = document.createElement('input');
    slider.type = 'range';
    slider.id = component.id;
    slider.min = String(component.min);
    slider.max = String(component.max);
    slider.value = String(component.value);
    if (component.step) {
      slider.step = String(component.step);
    }

    const valueDisplay = document.createElement('span');
    valueDisplay.className = 'slider-value';
    valueDisplay.textContent = String(component.value);

    slider.addEventListener('input', () => {
      valueDisplay.textContent = slider.value;
      this.emitValueChange();
    });

    wrapper.appendChild(slider);
    wrapper.appendChild(valueDisplay);

    return wrapper;
  }

  private renderDatetime(component: { id: string; label: string; inputType: string }): HTMLElement {
    const wrapper = document.createElement('div');

    const label = document.createElement('label');
    label.htmlFor = component.id;
    label.textContent = component.label;
    wrapper.appendChild(label);

    const input = document.createElement('input');
    input.type = component.inputType;
    input.id = component.id;
    input.addEventListener('change', () => this.emitValueChange());
    wrapper.appendChild(input);

    return wrapper;
  }

  // Public method to get current values
  getValues(): Record<string, string> {
    return this.collectInputValues();
  }

  // Public method to set values from outside (for syncing)
  setValues(values: Record<string, string>) {
    // Text inputs
    this.container.querySelectorAll('input[type="text"]').forEach(input => {
      const inp = input as HTMLInputElement;
      if (values[inp.id] !== undefined) {
        inp.value = values[inp.id];
      }
    });

    // Textareas
    this.container.querySelectorAll('textarea').forEach(textarea => {
      if (values[textarea.id] !== undefined) {
        textarea.value = values[textarea.id];
      }
    });

    // Select elements
    this.container.querySelectorAll('select').forEach(select => {
      if (values[select.id] !== undefined) {
        select.value = values[select.id];
      }
    });

    // Radio buttons - try to match by value (case-insensitive)
    const radioGroups = new Set<string>();
    this.container.querySelectorAll('input[type="radio"]').forEach(radio => {
      const r = radio as HTMLInputElement;
      radioGroups.add(r.name);
    });
    radioGroups.forEach(name => {
      const value = values[name];
      if (value !== undefined) {
        const radios = this.container.querySelectorAll(`input[type="radio"][name="${name}"]`);
        radios.forEach(radio => {
          const r = radio as HTMLInputElement;
          r.checked = r.value.toLowerCase() === value.toLowerCase();
        });
      }
    });

    // Sliders
    this.container.querySelectorAll('input[type="range"]').forEach(slider => {
      const s = slider as HTMLInputElement;
      if (values[s.id] !== undefined) {
        s.value = values[s.id];
        // Update display
        const display = s.parentElement?.querySelector('.slider-value');
        if (display) display.textContent = values[s.id];
      }
    });

    // Toggles
    this.container.querySelectorAll('input.toggle').forEach(toggle => {
      const t = toggle as HTMLInputElement;
      if (values[t.id] !== undefined) {
        t.checked = values[t.id] === 'true';
      }
    });

    // Datetime inputs
    this.container.querySelectorAll('input[type="date"], input[type="time"], input[type="datetime-local"]').forEach(dt => {
      const d = dt as HTMLInputElement;
      if (values[d.id] !== undefined) {
        d.value = values[d.id];
      }
    });
  }

  private collectInputValues(): Record<string, string> {
    const values: Record<string, string> = {};

    // Text inputs
    const inputs = this.container.querySelectorAll('input[type="text"]');
    inputs.forEach(input => {
      values[(input as HTMLInputElement).id] = (input as HTMLInputElement).value;
    });

    // Textareas
    const textareas = this.container.querySelectorAll('textarea');
    textareas.forEach(textarea => {
      values[textarea.id] = textarea.value;
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
      // Skip toggle switches (they have class 'toggle')
      if (c.className === 'toggle') return;
      if (!checkboxGroups.has(c.name)) {
        checkboxGroups.set(c.name, []);
      }
      checkboxGroups.get(c.name)!.push(c.value);
    });
    checkboxGroups.forEach((vals, name) => {
      values[name] = vals.join(', ');
    });

    // Toggle switches
    const toggles = this.container.querySelectorAll('input.toggle');
    toggles.forEach(toggle => {
      const t = toggle as HTMLInputElement;
      values[t.id] = t.checked ? 'true' : 'false';
    });

    // Sliders (range inputs)
    const sliders = this.container.querySelectorAll('input[type="range"]');
    sliders.forEach(slider => {
      values[(slider as HTMLInputElement).id] = (slider as HTMLInputElement).value;
    });

    // Datetime inputs
    const datetimes = this.container.querySelectorAll('input[type="date"], input[type="time"], input[type="datetime-local"]');
    datetimes.forEach(dt => {
      values[(dt as HTMLInputElement).id] = (dt as HTMLInputElement).value;
    });

    return values;
  }
}
