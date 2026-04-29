# PubMetric CRM Development Roadmap

> **Agent assignments:**
> - **Claude** — complex architecture, security-sensitive code, anything needing latest package/API knowledge
> - **Gemini** — UI generation, documentation, content writing, design-oriented tasks
> - **Aider** — mechanical code changes that follow established patterns (test files, boilerplate, repetitive edits)

## Phase 1: Project Initialization & Environment Setup
- [x] Initialize Tauri project with React + TypeScript template
- [x] Configure Tailwind CSS and Shadcn/UI for the "warm, cozy" design system
- [x] Set up project structure (`src-tauri`, `src`, `packages`)
- [x] Establish linting, formatting, and pre-commit hooks

## Phase 2: Core Architecture & State Management
- [x] Implement Zustand store for global state (leads, contacts, settings)
- [x] Set up Tauri commands for secure backend communication
- [x] Create configuration validation module (checks for LLM API keys, DB path, etc.)
- [x] Write unit tests for configuration validation and state logic

## Phase 3: Database & Data Layer
- [x] Initialize SQLite database with encrypted storage
- [x] Define schema: `leads`, `contacts`, `interactions`, `metrics`
- [x] Implement Tauri commands for CRUD operations
- [x] Write integration tests for database operations

## Phase 4: UI/UX Foundation
- [x] Design cozy, uncluttered layout (sidebar, main area, status tabs)
- [x] Build lead cards with essential fields (name, email, phone, last contacted, status)
- [x] Add seamless outreach buttons (email, call via shell plugin with auto log-contact)
- [x] Implement status-filtered card grid with search (replaced Kanban — simpler for non-technical users)

## Phase 5: Metrics & Analytics Dashboard
- [x] Add Metrics nav item and view skeleton — **Aider**
- [x] Install and wire up Recharts; create reusable `<Chart>` wrapper — **Aider**
- [x] Data aggregation logic: conversion rates, contact frequency, avg response time — **Claude**
- [x] Real-time metric updates via Zustand subscription — **Aider**

## Phase 6: LLM Integration & Automation
- [x] Securely store API key using `tauri-plugin-store` (encrypted on disk) — **Claude**
- [x] Rust commands for Claude API calls: draft follow-up email, summarize notes, suggest status — **Claude**
- [x] "Draft follow-up" and "Summarize notes" action buttons on LeadCard — **Gemini**
- [x] LLM response display modal (editable before copy/send) — **Gemini**
- [x] Unit tests for LLM command stubs with mocked responses — **Aider**

## Phase 7: Configuration, Validation & Onboarding
- [x] First-run detection: show setup wizard if no API key is stored — **Claude**
- [x] Setup wizard UI (2-step: paste API key → validate → done) — **Gemini**
- [x] Automated config checks on startup (key validity ping, DB accessibility) — **Aider**
- [x] Human-readable setup guide (`SETUP.md`) for non-technical users — **Gemini**

## Phase 8: Testing, Polish & Distribution
- [x] Expand test coverage: LeadCard interactions, modal flows, store edge cases — **Aider**
- [x] UI polish: loading skeletons, transition animations, micro-interactions — **Gemini**
- [x] Configure Tauri bundler for macOS `.dmg`, Windows `.exe`, Linux `.deb` — **Claude**
- [x] Write distribution `README` and drag-to-install instructions — **Gemini**
- [ ] Final "son to father" simplicity audit and smoke test — **Claude**

## Iteration Process
1. **Review & Validate**: After each phase, run tests and verify the UI feels warm and simple.
2. **Iterate**: Adjust based on feedback before moving to the next phase.
3. **Focus on Simplicity**: Every step prioritizes zero-config setup, local privacy, and intuitive doctor-to-doctor workflows.
