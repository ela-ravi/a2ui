import { Agent } from './agent';
import { Renderer } from './renderer';
import { Interaction } from './types';

const container = document.getElementById('app')!;
const agent = new Agent();

const renderer = new Renderer(container, (interaction: Interaction) => {
  const newUI = agent.handleInteraction(interaction);
  renderer.render(newUI);
});

// Initial render
renderer.render(agent.generateUI());
