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
