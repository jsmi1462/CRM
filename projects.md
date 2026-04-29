# PubMetric CRM Platform

## Project Scope & Vision

This project is a local CRM platform designed specifically for **PubMetric**. It targets a user who is familiar with Large Language Models (LLLMs) but has little interest in complex technology. The primary goal is to make lead tracking **SUPER SIMPLE**, intuitive, and frictionless.

### Core Design Principles
- **Warm, Clean, Cozy UI:** The interface should feel approachable and uncluttered, avoiding developer-centric jargon or complex dashboards.
- **Seamless Outreach:** Making it effortless to reach out to new contacts is a top priority.
- **Doctor-to-Doctor Focus:** Supports both B2B and B2C workflows, specifically tailored for medical professionals connecting with other medical professionals.

### Key Features
- **Lead Management:** Track names, emails, phone numbers, last contact date, and response status.
- **LLM Integration:** Leverage LLMs to assist with drafting, summarizing, or organizing contact data without requiring the user to understand the underlying tech.
- **Local-First Architecture:** Runs locally to ensure privacy and speed.

### Delivery & Onboarding
- **Audience:** Designed to be sent from a son to a father (or similar non-technical user).
- **Setup Instructions:** Must be excruciatingly clear, step-by-step, and easy to understand. No technical prerequisites should be assumed.
- **Configuration Validation:** Includes clear guidelines and unit tests to automatically check for configuration issues during setup, ensuring a smooth first-run experience.

## Recommended Technical Stack & Architecture

### Core Technologies
- **Framework:** Tauri (Rust backend + Web frontend)
- **Language:** TypeScript (Frontend), Rust (Backend)
- **Database:** SQLite (Local, encrypted at rest)
- **UI/UX:** Tailwind CSS + Shadcn/UI (for warm, clean, cozy design)
- **State Management:** Zustand
- **Charting:** Recharts or Chart.js
- **Task Management:** dnd-kit (for Trello-like Kanban boards)

### Architecture Rationale
1. **Privacy & Storage:** Data resides entirely in a local SQLite database. Tauri's Rust backend handles file I/O securely, ensuring zero data leaves the machine unless explicitly synced.
2. **Distribution:** Packages into a single, lightweight native executable (~5-10MB). Ideal for direct delivery ("son to father") with zero terminal or environment setup required.
3. **UI/UX Capabilities:** React ecosystem allows for highly customizable, cozy interfaces. Drag-and-drop Kanban views and separate metrics dashboards can be implemented cleanly.
4. **LLM Security:** API keys and sensitive configurations are managed securely in the Rust backend, abstracting complexity from the frontend and protecting credentials.
5. **Performance:** Native execution ensures instant load times and smooth interactions, critical for a professional medical workflow.

### Next Steps
- Initialize Tauri project with React + TypeScript template.
- Design cozy UI mockups focusing on warmth and simplicity.
- Implement local SQLite schema for leads, contacts, and metrics.
- Build Kanban board and metrics dashboard views.
- Package and test distribution installer.

## Development Progress
### Phase 1: Project Initialization & Environment Setup
- [x] Initialize Tauri project with React + TypeScript template (`package.json` created)
- [ ] Configure Tailwind CSS and Shadcn/UI for the "warm, cozy" design system
- [ ] Set up project structure (`src-tauri`, `src`, `packages`)
- [ ] Establish linting, formatting, and pre-commit hooks

### Phase 2: Core Architecture & State Management
- [ ] Implement Zustand store for global state (leads, contacts, settings)
- [ ] Set up Tauri commands for secure backend communication
- [ ] Create configuration validation module (checks for LLM API keys, DB path, etc.)
- [ ] Write unit tests for configuration validation and state logic

### Phase 3: Database & Data Layer
- [ ] Initialize SQLite database with encrypted storage
- [ ] Define schema: `leads`, `contacts`, `interactions`, `metrics`
- [ ] Implement Tauri commands for CRUD operations
- [ ] Write integration tests for database operations

### Phase 4: UI/UX Foundation & Kanban Board
- [ ] Design cozy, uncluttered layout (sidebar, main area, metrics toggle)
- [ ] Implement drag-and-drop Kanban board using `dnd-kit`
- [ ] Build lead cards with essential fields (name, email, phone, last contacted, status)
- [ ] Add seamless outreach buttons (email, SMS, call placeholders)

### Phase 5: Metrics & Analytics Dashboard
- [ ] Create separate tab/window for metrics
- [ ] Integrate Recharts/Chart.js for visualizations
- [ ] Implement data aggregation logic (conversion rates, contact frequency, response times)
- [ ] Ensure metrics update in real-time as leads move through the Kanban board

### Phase 6: LLM Integration & Automation
- [ ] Securely store LLM API keys in Tauri's secure storage
- [ ] Implement backend functions for drafting emails, summarizing responses, and tagging leads
- [ ] Add UI prompts for LLM-assisted actions (e.g., "Draft follow-up", "Summarize call notes")
- [ ] Test LLM integration with mock data and real API calls

### Phase 7: Configuration, Validation & Onboarding
- [ ] Build a guided first-run setup wizard
- [ ] Implement automated configuration checks (DB accessibility, API key validity, permissions)
- [ ] Generate clear, step-by-step setup instructions for non-technical users
- [ ] Package installer with built-in validation feedback

### Phase 8: Testing, Polish & Distribution
- [ ] Run comprehensive unit and integration tests
- [ ] Perform UI/UX polish (animations, transitions, cozy micro-interactions)
- [ ] Build native installers (Windows `.exe`, macOS `.dmg`, Linux `.deb`)
- [ ] Create distribution package with setup guide and validation script
- [ ] Final review against "son to father" simplicity requirement

## Iteration Process
1. **Start with Phase 1**: We will implement the foundational setup first.
2. **Review & Validate**: After each phase, we will run tests, review the UI/UX, and ensure it aligns with the "warm, clean, cozy" vision.
3. **Iterate**: Adjust based on feedback before moving to the next phase.
4. **Focus on Simplicity**: Every step prioritizes zero-config setup, local privacy, and intuitive doctor-to-doctor workflows.
