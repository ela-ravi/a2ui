import { Agent } from './agent';
import { Renderer } from './renderer';
import { Interaction } from './types';

const container = document.getElementById('app')!;
const agent = new Agent();

let isLoading = false;

function showLoading() {
  isLoading = true;
  container.innerHTML = '<p class="loading">Thinking...</p>';
}

function showError(error: Error) {
  container.innerHTML = `<p class="error">Error: ${error.message}</p>
    <p class="hint">Make sure Ollama is running: ollama serve</p>`;
}

const renderer = new Renderer(container, async (interaction: Interaction) => {
  if (isLoading) return;

  showLoading();
  try {
    const newUI = await agent.handleInteraction(interaction);
    isLoading = false;
    renderer.render(newUI);
  } catch (error) {
    isLoading = false;
    showError(error as Error);
  }
});

// Initial render
async function init() {
  showLoading();
  try {
    const initialUI = await agent.generateUI();
    isLoading = false;
    renderer.render(initialUI);
  } catch (error) {
    isLoading = false;
    showError(error as Error);
  }
}

init();
