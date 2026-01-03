# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A2UI (Agent-to-UI) is a system where an AI agent generates structured UI schemas and a renderer displays them in the browser. The agent and renderer communicate in-memory via function calls.

## Commands

```bash
# Run a specific module (from module directory)
cd modules/01-minimal && npm run dev

# Type check a module
cd modules/01-minimal && npx tsc --noEmit

# Install dependencies (from root)
npm install
```

## Architecture

This is a modular monorepo using npm workspaces. Each module in `modules/` represents increasing complexity of the A2UI system.

### Core Loop

```
Agent.generateUI() → UISchema → Renderer.render() → DOM
                                        ↓
Agent.handleInteraction() ← Interaction ← User clicks button
```

### Key Types (from types.ts)

- **UISchema**: Contains array of UIComponents
- **UIComponent**: Union of TextComponent | InputComponent | ButtonComponent
- **Interaction**: Sent from Renderer to Agent on button click, includes all input values

### Module Structure

Each module is self-contained with:
- `src/types.ts` - Schema and interaction types
- `src/agent.ts` - Agent class: generates UI, handles interactions
- `src/renderer.ts` - Renderer class: parses schema, renders to DOM
- `src/main.ts` - Wires agent and renderer together

### Adding New Modules

Create `modules/NN-name/` with its own `package.json`, `tsconfig.json`, and `src/` directory. Modules build on previous complexity (01-minimal → 02-layout → etc).
