import {
  getAvailableProviders,
  saveSettings,
  StoredSettings,
  PROVIDERS,
} from './providers';

export class SetupScreen {
  private container: HTMLElement;
  private onComplete: () => void;

  constructor(container: HTMLElement, onComplete: () => void) {
    this.container = container;
    this.onComplete = onComplete;
    this.render();
  }

  private render(): void {
    const providers = getAvailableProviders();
    const cloudProviders = providers.filter(p => p.requiresApiKey);
    const localProviders = providers.filter(p => !p.requiresApiKey);

    this.container.innerHTML = `
      <div class="setup-screen">
        <div class="setup-card">
          <div class="setup-header">
            <h1>Welcome to A2UI Demo</h1>
            <p>Compare traditional chatbot responses with AI-generated structured interfaces</p>
          </div>

          <div class="setup-body">
            <h2>Get Started</h2>
            <p class="setup-description">Choose an LLM provider and enter your API key to begin.</p>

            <div class="setup-field">
              <label for="setup-provider">LLM Provider</label>
              <select id="setup-provider">
                ${localProviders.length > 0 ? `
                  <optgroup label="Local (No API key needed)">
                    ${localProviders.map(p => `
                      <option value="${p.id}">${p.name}</option>
                    `).join('')}
                  </optgroup>
                ` : ''}
                ${cloudProviders.length > 0 ? `
                  <optgroup label="Cloud Providers">
                    ${cloudProviders.map(p => `
                      <option value="${p.id}">${p.name}${p.browserSupport === false ? ' (No CORS)' : ''}</option>
                    `).join('')}
                  </optgroup>
                ` : ''}
              </select>
            </div>

            <div class="setup-field" id="setup-model-field">
              <label for="setup-model">Model</label>
              <select id="setup-model">
                ${providers[0]?.models.map(m => `
                  <option value="${m}">${m}</option>
                `).join('')}
              </select>
            </div>

            <div class="setup-field" id="setup-api-key-field" style="${!providers[0]?.requiresApiKey ? 'display:none' : ''}">
              <label for="setup-api-key">API Key</label>
              <input type="password" id="setup-api-key" placeholder="Enter your API key">
              <small>Your API key is stored locally in your browser and never sent to our servers.</small>
            </div>

            <div id="setup-cors-warning" class="setup-warning" style="display:none">
              This provider doesn't support browser requests (CORS). Consider using OpenAI, Gemini, or OpenRouter instead.
            </div>

            <button id="setup-start" class="setup-btn">Start Demo</button>

            <div class="setup-links">
              <p>Need an API key?</p>
              <ul>
                <li><a href="https://platform.openai.com/api-keys" target="_blank">OpenAI API Keys</a></li>
                <li><a href="https://aistudio.google.com/app/apikey" target="_blank">Google Gemini API Keys</a></li>
                <li><a href="https://console.anthropic.com/settings/keys" target="_blank">Anthropic API Keys</a></li>
                <li><a href="https://openrouter.ai/keys" target="_blank">OpenRouter API Keys</a></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    `;

    this.attachListeners();
  }

  private attachListeners(): void {
    const providerSelect = this.container.querySelector('#setup-provider') as HTMLSelectElement;
    const modelSelect = this.container.querySelector('#setup-model') as HTMLSelectElement;
    const apiKeyInput = this.container.querySelector('#setup-api-key') as HTMLInputElement;
    const apiKeyField = this.container.querySelector('#setup-api-key-field') as HTMLElement;
    const corsWarning = this.container.querySelector('#setup-cors-warning') as HTMLElement;
    const startBtn = this.container.querySelector('#setup-start') as HTMLButtonElement;

    providerSelect?.addEventListener('change', () => {
      const providerId = providerSelect.value;
      const provider = PROVIDERS.find(p => p.id === providerId);

      // Update model options
      if (provider && modelSelect) {
        modelSelect.innerHTML = provider.models.map(m => `
          <option value="${m}" ${m === provider.defaultModel ? 'selected' : ''}>
            ${m}
          </option>
        `).join('');
      }

      // Show/hide API key field
      if (apiKeyField) {
        apiKeyField.style.display = provider?.requiresApiKey ? '' : 'none';
      }

      // Show/hide CORS warning
      if (corsWarning) {
        corsWarning.style.display = provider?.browserSupport === false ? '' : 'none';
      }
    });

    startBtn?.addEventListener('click', () => {
      const providerId = providerSelect.value as StoredSettings['providerId'];
      const model = modelSelect.value;
      const apiKey = apiKeyInput.value;
      const provider = PROVIDERS.find(p => p.id === providerId);

      // Validate API key for cloud providers
      if (provider?.requiresApiKey && !apiKey.trim()) {
        alert('Please enter your API key to continue.');
        apiKeyInput.focus();
        return;
      }

      // Save settings
      const settings: StoredSettings = {
        providerId,
        model,
        apiKeys: {
          ollama: '',
          openai: providerId === 'openai' ? apiKey : '',
          anthropic: providerId === 'anthropic' ? apiKey : '',
          gemini: providerId === 'gemini' ? apiKey : '',
          huggingface: providerId === 'huggingface' ? apiKey : '',
          openrouter: providerId === 'openrouter' ? apiKey : '',
        },
        setupComplete: true,
      };

      saveSettings(settings);
      this.onComplete();
    });
  }
}
