// UI Component Types

export interface TextComponent {
  type: 'text';
  id: string;
  content: string;
}

export interface InputComponent {
  type: 'input';
  id: string;
  placeholder?: string;
  label?: string;
}

export interface ButtonComponent {
  type: 'button';
  id: string;
  label: string;
  action: string;
}

export interface SelectComponent {
  type: 'select';
  id: string;
  label: string;
  options: string[];
}

export interface CheckboxComponent {
  type: 'checkbox';
  id: string;
  label: string;
  options: string[];
}

export interface RadioComponent {
  type: 'radio';
  id: string;
  label: string;
  options: string[];
}

export type UIComponent = TextComponent | InputComponent | ButtonComponent | SelectComponent | CheckboxComponent | RadioComponent;

// UI Schema
export interface UISchema {
  type: 'ui';
  components: UIComponent[];
}

// Interaction from Renderer to Agent
export interface Interaction {
  type: 'interaction';
  componentId: string;
  action: 'click';
  values: Record<string, string>;
}
