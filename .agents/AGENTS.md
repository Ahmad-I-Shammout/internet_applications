# Project Rules

1. **Architecture:** This project uses a strict Feature-Based architecture. All business logic, data fetching, reusable feature components, and types belong in `src/features/[feature-name]/`.
2. **Routing:** `src/app/` is strictly for routing. Pages should only orchestrate View components exported from `src/features/`. Do not put data fetching, business logic, or complex UI layouts directly inside `src/app/`.
3. **Scaffolding Structure:** When adding a new feature, you MUST manually scaffold it inside `src/features/` containing the standard directories (`apis/`, `components/`, `hooks/`, `mappers/`, `types/`) where applicable.
4. **Component Organization:**
   - ALL shared, custom components MUST be placed strictly in `src/components/shared/`.
   - ALL Shadcn UI components MUST be placed strictly in `src/components/ui/`.
5. **Team Collaboration & Styling:** Maintain UI consistency. Define ALL custom colors, shadows, sizes, and borders in `src/app/globals.css` as CSS variables. Do not hardcode arbitrary values in components (refer to `team_collaboration` skill).
6. **Internationalization:** All main content (page titles, descriptions, large text) MUST be added to `messages/ar.json` and referenced via i18n hooks, not hardcoded inline. Small labels/placeholders are the only exceptions.
7. **Execution Rules:** Follow the specific instructions defined in the `antigravity_rules` skill for all commands and slash command handling.
