import { Agent } from './agent';
import { Renderer } from './renderer';
import { Interaction, AgentResponse } from './types';
import { SettingsPanel } from './settings';
import { loadSettings, PROVIDERS } from './providers';

// Elements
const chatbotMessage = document.getElementById('chatbot-message')!;
const chatbotInput = document.getElementById('chatbot-input') as HTMLTextAreaElement;
const chatbotSubmit = document.getElementById('chatbot-submit') as HTMLButtonElement;
const a2uiContainer = document.getElementById('a2ui-container')!;
const settingsContainer = document.getElementById('settings-container')!;

const agent = new Agent();
let isLoading = false;
let isSyncing = false; // Prevent infinite sync loops

// Settings panel - refresh agent provider when settings change
new SettingsPanel(settingsContainer, () => {
  agent.refreshProvider();
});

function showLoading() {
  isLoading = true;
  chatbotMessage.innerHTML = '<p class="loading">Thinking...</p>';
  a2uiContainer.innerHTML = '<p class="loading">Thinking...</p>';
  chatbotInput.disabled = true;
  chatbotSubmit.disabled = true;
}

function hideLoading() {
  isLoading = false;
  chatbotInput.disabled = false;
  chatbotSubmit.disabled = false;
  chatbotInput.value = '';
}

function showError(error: Error) {
  const settings = loadSettings();
  const provider = PROVIDERS.find(p => p.id === settings.providerId);

  let hint = 'Check your provider settings and API key.';

  if (error.message === 'Failed to fetch') {
    if (settings.providerId === 'ollama') {
      hint = 'Make sure Ollama is running: ollama serve';
    } else if (provider?.requiresApiKey && !settings.apiKeys[settings.providerId]) {
      hint = `Please enter your ${provider.name} API key in settings.`;
    } else {
      hint = `Could not connect to ${provider?.name || 'provider'}. This may be a CORS issue - some APIs don't allow browser requests.`;
    }
  }

  const errorHtml = `<p class="error">Error: ${error.message}</p>
    <p class="hint">${hint}</p>`;
  chatbotMessage.innerHTML = errorHtml;
  a2uiContainer.innerHTML = errorHtml;
  hideLoading();
}

function renderResponse(response: AgentResponse) {
  // Render chatbot text on the left
  chatbotMessage.textContent = response.text;

  // Render A2UI on the right
  renderer.render(response.ui);
}

// Sync A2UI values to chatbot input
function syncA2UIToChatbot(values: Record<string, string>) {
  if (isSyncing) return;
  isSyncing = true;

  // Convert values to a readable format
  const entries = Object.entries(values).filter(([_, v]) => v);
  if (entries.length > 0) {
    const text = entries.map(([_, value]) => value).join(', ');
    chatbotInput.value = text;
  }

  isSyncing = false;
}

// Sync chatbot input to A2UI
function syncChatbotToA2UI(text: string) {
  if (isSyncing || !text.trim()) return;
  isSyncing = true;

  const currentValues = renderer.getValues();
  const newValues: Record<string, string> = {};

  // Try to match the text with A2UI input options
  const normalizedText = text.trim().toLowerCase();

  for (const [key, _] of Object.entries(currentValues)) {
    // For text inputs, just set the value directly
    newValues[key] = text.trim();
  }

  renderer.setValues(newValues);
  isSyncing = false;
}

// Handle interaction from A2UI
async function handleA2UIInteraction(interaction: Interaction) {
  if (isLoading) return;

  showLoading();
  try {
    const response = await agent.handleInteraction(interaction);
    hideLoading();
    renderResponse(response);
  } catch (error) {
    showError(error as Error);
  }
}

// Handle submit from chatbot
async function handleChatbotSubmit() {
  if (isLoading || !chatbotInput.value.trim()) return;

  // Get values - combine chatbot input with any A2UI selections
  const a2uiValues = renderer.getValues();
  const chatbotText = chatbotInput.value.trim();

  // Create a synthetic interaction
  const interaction: Interaction = {
    type: 'interaction',
    componentId: 'chatbot-submit',
    action: 'click',
    values: {
      ...a2uiValues,
      'chatbot-input': chatbotText
    }
  };

  showLoading();
  try {
    const response = await agent.handleInteraction(interaction);
    hideLoading();
    renderResponse(response);
  } catch (error) {
    showError(error as Error);
  }
}

// Create renderer with value change callback
const renderer = new Renderer(
  a2uiContainer,
  handleA2UIInteraction,
  syncA2UIToChatbot
);

// Event listeners
chatbotSubmit.addEventListener('click', handleChatbotSubmit);
chatbotInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    handleChatbotSubmit();
  }
});
chatbotInput.addEventListener('input', () => {
  syncChatbotToA2UI(chatbotInput.value);
});

// Initial render
async function init() {
  showLoading();
  try {
    const response = await agent.generateUI();
    hideLoading();
    renderResponse(response);
  } catch (error) {
    showError(error as Error);
  }
}

init();
