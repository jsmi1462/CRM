# PubMetric CRM Development Roadmap

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
- [ ] Create separate tab/window for metrics
- [ ] Integrate Recharts/Chart.js for visualizations
- [ ] Implement data aggregation logic (conversion rates, contact frequency, response times)
- [ ] Ensure metrics update in real-time as leads move through the Kanban board

## Phase 6: LLM Integration & Automation
- [ ] Securely store LLM API keys in Tauri's secure storage
- [ ] Implement backend functions for drafting emails, summarizing responses, and tagging leads
- [ ] Add UI prompts for LLM-assisted actions (e.g., "Draft follow-up", "Summarize call notes")
- [ ] Test LLM integration with mock data and real API calls

## Phase 7: Configuration, Validation & Onboarding
- [ ] Build a guided first-run setup wizard
- [ ] Implement automated configuration checks (DB accessibility, API key validity, permissions)
- [ ] Generate clear, step-by-step setup instructions for non-technical users
- [ ] Package installer with built-in validation feedback

## Phase 8: Testing, Polish & Distribution
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
