<div align="center">

# 🗺️ Atlas

### The operating system where every team organizes, shares and scales knowledge.

[![Next.js](https://img.shields.io/badge/Next.js-Frontend-black?style=for-the-badge&logo=next.js)]()
[![NestJS](https://img.shields.io/badge/NestJS-Backend-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)]()
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)]()
[![Redis](https://img.shields.io/badge/Redis-Cache-DC382D?style=for-the-badge&logo=redis&logoColor=white)]()
[![Docker](https://img.shields.io/badge/Docker-Container-2496ED?style=for-the-badge&logo=docker&logoColor=white)]()
[![License](https://img.shields.io/badge/License-MIT-black?style=for-the-badge)]()

</div>

---

# Overview

Atlas is a modular workspace designed to become the central source of truth for teams.

Instead of spreading information across spreadsheets, documents, chats and disconnected tools, Atlas centralizes everything into one customizable platform.

Every workspace can be adapted to the team's workflow through configurable pages, templates, modules and structured data.

Whether managing projects, documentation, internal processes or operational data, Atlas provides a flexible environment where information is never lost.

---

# Core Philosophy

> Every company has knowledge.
>
> Most companies just don't know where it is.

Atlas exists to solve that problem.

---

# Features

## Modular Workspaces

Create independent workspaces for:

- Teams
- Departments
- Companies
- Projects

---

## Dynamic Pages

Build pages using modular blocks.

Examples:

- Documentation
- Procedures
- Wikis
- Internal manuals
- Reports

---

## Lists & Databases

Organize structured information through customizable collections.

Examples:

- Employees
- Clients
- Assets
- Suppliers
- Products
- Tickets

---

## Templates

Create reusable templates for:

- Projects
- Meetings
- Documentation
- Processes
- Checklists

---

## Knowledge Management

Centralize:

- Internal documentation
- SOPs
- Policies
- Technical documentation
- Team knowledge

---

## Permissions

Role-based access control.

- Administrators
- Managers
- Members
- Guests

---

## Search

Powerful global search across:

- Pages
- Documents
- Lists
- Modules
- Templates

---

## Real-Time Collaboration

- Live updates
- Collaborative editing
- Shared workspaces

---

## Notifications

Stay informed about:

- Mentions
- Changes
- Tasks
- Updates

---

# Tech Stack

## Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS
- Shadcn UI

---

## Backend

- NestJS
- REST API
- WebSockets

---

## Database

- PostgreSQL

---

## Cache

- Redis

---

## Authentication

- JWT
- Refresh Tokens

---

## Infrastructure

- Docker
- Docker Compose

---

# Architecture

```
                    Next.js Frontend
                           │
                    REST + WebSocket
                           │
                     NestJS Backend
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
        ▼                  ▼                  ▼
   PostgreSQL           Redis Cache       File Storage
        │
        ▼
 Business Data
```

---

# Modules

Atlas is built around independent modules.

Current and planned modules include:

- Knowledge Base
- Dynamic Pages
- Databases
- Templates
- Forms
- Projects
- Tasks
- Calendar
- Files
- Notes
- Dashboards
- Reports
- Analytics
- Team Directory
- Settings

Each module can evolve independently while remaining connected to the rest of the workspace.

---

# Use Cases

Atlas can be used as:

- Internal Wiki
- Company Knowledge Base
- Project Management Platform
- CRM
- Asset Manager
- HR Portal
- Operations Hub
- Documentation Platform
- Business Workspace

---

# Why Atlas?

Companies rarely lose information because it doesn't exist.

They lose it because it's fragmented.

Atlas centralizes organizational knowledge into a single platform designed to grow with the business.

---

# Roadmap

- AI Assistant
- Rich Text Editor
- Whiteboards
- Automations
- Workflows
- API Integrations
- Email Integration
- Mobile Application
- Plugin Marketplace
- Public APIs
- Graph Visualization
- Version History
- Offline Mode
- Internationalization
- Multi-tenant Architecture

---

# Running Locally

Clone the repository

```bash
git clone https://github.com/nathanscd/Atlas.git
```

Install dependencies

```bash
npm install
```

Run the development environment

```bash
docker compose up
```

---

# Future Vision

Atlas is being designed as more than a productivity application.

Its long-term vision is to become the operating system of modern organizations, providing a flexible foundation where teams can manage knowledge, structure information and build custom workflows without losing simplicity.

---

# Author

**Nathanael Secundo Cardoso**

Software Engineer passionate about backend architecture, scalable systems and modern web applications.

- LinkedIn
- Portfolio
- Email
