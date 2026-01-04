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

// New components for module 03

export interface TextareaComponent {
  type: 'textarea';
  id: string;
  placeholder?: string;
  label?: string;
  rows?: number;
}

export interface HeadingComponent {
  type: 'heading';
  id: string;
  content: string;
  level: 1 | 2 | 3 | 4 | 5 | 6;
}

export interface ImageComponent {
  type: 'image';
  id: string;
  src: string;
  alt: string;
}

export interface LinkComponent {
  type: 'link';
  id: string;
  href: string;
  label: string;
}

export interface DividerComponent {
  type: 'divider';
  id: string;
}

export interface ProgressComponent {
  type: 'progress';
  id: string;
  value: number;
  max: number;
  label?: string;
}

export interface ListComponent {
  type: 'list';
  id: string;
  items: string[];
  ordered?: boolean;
}

export interface AlertComponent {
  type: 'alert';
  id: string;
  content: string;
  variant: 'info' | 'warning' | 'error' | 'success';
}

export interface ToggleComponent {
  type: 'toggle';
  id: string;
  label: string;
  checked?: boolean;
}

export interface SliderComponent {
  type: 'slider';
  id: string;
  label: string;
  min: number;
  max: number;
  value: number;
  step?: number;
}

export interface DatetimeComponent {
  type: 'datetime';
  id: string;
  label: string;
  inputType: 'date' | 'time' | 'datetime-local';
}

export type UIComponent =
  | TextComponent
  | InputComponent
  | ButtonComponent
  | SelectComponent
  | CheckboxComponent
  | RadioComponent
  | TextareaComponent
  | HeadingComponent
  | ImageComponent
  | LinkComponent
  | DividerComponent
  | ProgressComponent
  | ListComponent
  | AlertComponent
  | ToggleComponent
  | SliderComponent
  | DatetimeComponent;

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

// Agent response with both text and UI
export interface AgentResponse {
  text: string;      // Natural language response (traditional chatbot)
  ui: UISchema;      // Structured UI schema (A2UI)
}
