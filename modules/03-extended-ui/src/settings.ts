import {
  getAvailableProviders,
  loadSettings,
  saveSettings,
  StoredSettings,
  PROVIDERS,
  isProduction,
} from './providers';

export class SettingsPanel {
  private container: HTMLElement;
  private isOpen = false;
  private settings: StoredSettings;
  private onSave: () => void;

  constructor(container: HTMLElement, onSave: () => void) {
    this.container = container;
    this.onSave = onSave;
    this.settings = loadSettings();
    this.render();
  }

  private render(): void {
    const providers = getAvailableProviders();
    const currentProvider = PROVIDERS.find(p => p.id === this.settings.providerId);

    this.container.innerHTML = `
      <div class="settings-toggle">
        <button id="settings-btn" title="Settings">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#000000" stroke-width="2">
            <circle cx="12" cy="12" r="3"></circle>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
          </svg>
        </button>
        <span class="current-provider">${currentProvider?.name || 'Not configured'}</span>
      </div>
      <div class="settings-panel ${this.isOpen ? 'open' : ''}">
        <div class="settings-header">
          <h3>LLM Provider Settings</h3>
          <button id="settings-close">&times;</button>
        </div>
        <div class="settings-body">
          ${isProduction() ? '<p class="settings-note">Configure your API key to use the application.</p>' : ''}

          <div class="settings-field">
            <label for="provider-select">Provider</label>
            <select id="provider-select">
              ${providers.map(p => `
                <option value="${p.id}" ${p.id === this.settings.providerId ? 'selected' : ''}>
                  ${p.name}${p.devOnly ? ' (Dev only)' : ''}${p.browserSupport === false ? ' (No CORS)' : ''}
                </option>
              `).join('')}
            </select>
            <small id="cors-warning" class="cors-warning" style="${currentProvider?.browserSupport === false ? '' : 'display:none'}">
              This provider doesn't support browser requests (CORS). Use OpenAI, Gemini, or OpenRouter instead.
            </small>
          </div>

          <div class="settings-field" id="model-field">
            <label for="model-select">Model</label>
            <select id="model-select">
              ${currentProvider?.models.map(m => `
                <option value="${m}" ${m === (this.settings.model || currentProvider.defaultModel) ? 'selected' : ''}>
                  ${m}
                </option>
              `).join('')}
            </select>
          </div>

          <div class="settings-field" id="api-key-field" style="${!currentProvider?.requiresApiKey ? 'display:none' : ''}">
            <label for="api-key">API Key</label>
            <input type="password" id="api-key" placeholder="Enter your API key"
              value="${this.settings.apiKeys[this.settings.providerId] || ''}">
            <small>Your API key is stored locally in your browser and never sent to our servers.</small>
          </div>

          <button id="settings-save" class="settings-save-btn">Save Settings</button>
        </div>
      </div>
    `;

    this.attachListeners();
  }

  private attachListeners(): void {
    const toggleBtn = this.container.querySelector('#settings-btn');
    const closeBtn = this.container.querySelector('#settings-close');
    const saveBtn = this.container.querySelector('#settings-save');
    const providerSelect = this.container.querySelector('#provider-select') as HTMLSelectElement;
    const modelSelect = this.container.querySelector('#model-select') as HTMLSelectElement;
    const apiKeyInput = this.container.querySelector('#api-key') as HTMLInputElement;
    const apiKeyField = this.container.querySelector('#api-key-field') as HTMLElement;
    const modelField = this.container.querySelector('#model-field') as HTMLElement;

    toggleBtn?.addEventListener('click', () => {
      this.isOpen = !this.isOpen;
      this.container.querySelector('.settings-panel')?.classList.toggle('open', this.isOpen);
    });

    closeBtn?.addEventListener('click', () => {
      this.isOpen = false;
      this.container.querySelector('.settings-panel')?.classList.remove('open');
    });

    providerSelect?.addEventListener('change', () => {
      const providerId = providerSelect.value as StoredSettings['providerId'];
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
      const corsWarning = this.container.querySelector('#cors-warning') as HTMLElement;
      if (corsWarning) {
        corsWarning.style.display = provider?.browserSupport === false ? '' : 'none';
      }

      // Update API key input with saved value for this provider
      const newApiKeyInput = this.container.querySelector('#api-key') as HTMLInputElement;
      if (newApiKeyInput) {
        newApiKeyInput.value = this.settings.apiKeys[providerId] || '';
      }
    });

    saveBtn?.addEventListener('click', () => {
      const providerId = providerSelect.value as StoredSettings['providerId'];
      const model = modelSelect.value;
      const apiKey = apiKeyInput.value;

      // Save API key for the selected provider
      this.settings.apiKeys[providerId] = apiKey;
      this.settings.providerId = providerId;
      this.settings.model = model;

      saveSettings(this.settings);

      // Update display
      const currentProvider = PROVIDERS.find(p => p.id === providerId);
      const providerDisplay = this.container.querySelector('.current-provider');
      if (providerDisplay) {
        providerDisplay.textContent = currentProvider?.name || 'Not configured';
      }

      // Close panel and notify
      this.isOpen = false;
      this.container.querySelector('.settings-panel')?.classList.remove('open');
      this.onSave();
    });
  }

  toggle(): void {
    this.isOpen = !this.isOpen;
    this.container.querySelector('.settings-panel')?.classList.toggle('open', this.isOpen);
  }
}
