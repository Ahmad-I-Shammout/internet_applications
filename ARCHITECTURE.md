# Project Architecture Guide

Welcome to the Base Project template! This project is meticulously designed for maximum scalability, strict separation of concerns, and reusable business logic.

## 1. Feature-Driven Architecture

To keep the codebase maintainable as the project grows, we strictly separate **Routing** from **Business Logic**.

### Routing Layer (`src/app/`)
This directory is purely responsible for handling Next.js routing, layouts, error boundaries, and loading states. 
- Pages in this directory should **not** contain data fetching, local state, or complex UI. 
- They should simply import and render orchestration components from the `features/` directory.

### Business Logic Layer (`src/features/`)
This is the core "brain" of the application. It contains all API hooks, interactive components, types, and logic, cleanly organized by feature domain (e.g., `auth`, `users`, `products`).

Every specific feature (e.g., `src/features/users/`) encapsulates its own responsibilities in standard subdirectories:
- `apis/` - Contains Axios calls & TanStack Query hooks.
- `components/` - UI components (Atomic and Orchestration Views) tied directly to the feature.
- `hooks/` - Custom React hooks for local state management.
- `mappers/` - Data transformation helpers.
- `types/` - TypeScript interfaces related to the feature.

## 2. Reusability and Component Organization

To keep our shared UI tidy, we enforce strict rules for component placement:

- **Shared Components:** All shared, custom components (e.g., specific layouts, generic modals, non-Shadcn buttons) MUST live inside `src/components/shared/`.
- **UI Components:** All atomic components installed via Shadcn MUST live inside `src/components/ui/`.
- **Global Configurations:** API clients and overarching logic belong in `src/lib/`.
- **Global Providers:** React Context providers should reside in `src/providers/`.

By strictly enforcing this structure, you ensure that business logic is fully isolated, making features highly portable, maintainable, and easy to collaborate on for the entire team.
