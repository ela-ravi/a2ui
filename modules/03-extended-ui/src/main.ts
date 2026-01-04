import { Agent } from './agent';
import { Renderer } from './renderer';
import { Interaction, AgentResponse } from './types';
import { SettingsPanel } from './settings';
import { SetupScreen } from './setup';
import { loadSettings, PROVIDERS, getAvailableProviders } from './providers';

// Check if setup is needed
function needsSetup(): boolean {
  const settings = loadSettings();
  const provider = PROVIDERS.find(p => p.id === settings.providerId);
  const available = getAvailableProviders();

  // Setup not completed yet
  if (!settings.setupComplete) {
    return true;
  }

  // No providers available
  if (available.length === 0) {
    return true;
  }

  // Provider requires API key but none provided
  if (provider?.requiresApiKey && !settings.apiKeys[settings.providerId]) {
    return true;
  }

  return false;
}

// Containers
const setupContainer = document.getElementById('setup-container')!;
const appContainer = document.getElementById('app-container')!;

// Show setup or app
function showSetup(): void {
  setupContainer.style.display = 'block';
  appContainer.classList.remove('visible');

  new SetupScreen(setupContainer, () => {
    // Setup complete, show app
    setupContainer.style.display = 'none';
    appContainer.classList.add('visible');
    initApp();
  });
}

function showApp(): void {
  setupContainer.style.display = 'none';
  appContainer.classList.add('visible');
  initApp();
}

// Main app initialization
function initApp(): void {
  // Elements
  const chatbotMessage = document.getElementById('chatbot-message')!;
  const chatbotInput = document.getElementById('chatbot-input') as HTMLTextAreaElement;
  const chatbotSubmit = document.getElementById('chatbot-submit') as HTMLButtonElement;
  const a2uiContainer = document.getElementById('a2ui-container')!;
  const settingsContainer = document.getElementById('settings-container')!;

  // Free-form input elements
  const freeformToggle = document.getElementById('a2ui-freeform-toggle') as HTMLInputElement;
  const freeformContainer = document.getElementById('a2ui-freeform-input')!;
  const freeformText = document.getElementById('a2ui-freeform-text') as HTMLTextAreaElement;

  const agent = new Agent();
  let isLoading = false;
  let isSyncing = false;

  // Settings panel
  new SettingsPanel(settingsContainer, () => {
    agent.refreshProvider();
  });

  // Free-form input toggle
  freeformToggle.addEventListener('change', () => {
    freeformContainer.classList.toggle('visible', freeformToggle.checked);
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
    freeformText.value = '';
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
    chatbotMessage.textContent = response.text;
    renderer.render(response.ui);
  }

  // Sync A2UI values to chatbot input
  function syncA2UIToChatbot(values: Record<string, string>) {
    if (isSyncing) return;
    isSyncing = true;

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

    for (const [key, _] of Object.entries(currentValues)) {
      newValues[key] = text.trim();
    }

    renderer.setValues(newValues);
    isSyncing = false;
  }

  // Handle interaction from A2UI
  async function handleA2UIInteraction(interaction: Interaction) {
    if (isLoading) return;

    // Include free-form text if provided
    if (freeformToggle.checked && freeformText.value.trim()) {
      interaction.values['freeform-input'] = freeformText.value.trim();
    }

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

    const a2uiValues = renderer.getValues();
    const chatbotText = chatbotInput.value.trim();

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

  // Create renderer
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
}

// Start
if (needsSetup()) {
  showSetup();
} else {
  showApp();
}
