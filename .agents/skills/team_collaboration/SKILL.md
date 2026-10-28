---
name: team_collaboration
description: Rules and guidelines for ensuring consistent styling, structure, and UI integrity when working alongside a 5-person team.
---

# Team Collaboration & UI Consistency

When writing or modifying code in this project, you are operating in a fast-paced environment with a 5-person development team. To prevent merge conflicts and UI breakage, strictly adhere to the following:

## 1. Component Organization
- **Shared Components:** Any component used across multiple features or pages MUST be placed in `src/components/shared/`.
- **Shadcn UI:** All atomic UI elements installed via Shadcn MUST be placed in `src/components/ui/`.

## 2. Styling Consistency & Global Design Tokens (Auto-Update CSS Variables)
- **NEVER use arbitrary inline values:** You must never, ever put inline colors or arbitrary values (e.g., `bg-[#333333]`, `text-[15px]`, `w-[321px]`, or `shadow-[0_4px_10px_black]`) directly inside React components.
- **AUTOMATICALLY add to `globals.css`:** Whenever you need a new color, size, shadow, or border for a task, you MUST automatically open and edit `src/app/globals.css`. Add the new property as a CSS variable (inside `:root`, `.dark`, and `@theme inline`), and then reference that variable in your component using standard Tailwind utility classes.
- **Tailwind Only:** Use Tailwind CSS for all styling, exclusively referencing the variables you defined in `globals.css` to ensure easy global theme editing for the entire team.
- **Responsive Design:** Ensure all components are mobile-responsive by default using standard Tailwind breakpoints (`sm:`, `md:`, `lg:`, `xl:`).

## 3. Structural Consistency
- Follow the feature-driven architecture strictly. Do not introduce new global state managers, new routing structures, or new data fetching patterns without explicit instructions.
- Ensure that you use the pre-configured Axios instance (`src/lib/api-client.ts`) for all API requests to maintain uniform interceptors and authentication.

## 4. Avoiding UI Breakage
- Do **not** radically refactor or delete existing elements in `src/app/layout.tsx` unless explicitly asked. (Note: You *are* expected and required to automatically append new variables to `src/app/globals.css` as mentioned above, just don't delete the existing foundational CSS structure).
- When modifying shared components inside `src/components/shared/` or `src/components/ui/`, carefully review all usage instances to ensure your changes are backwards-compatible and will not ruin existing pages.

## 5. Internationalization & Text Content
- **Centralized Messages:** All main content, page titles, descriptions, and significant text blocks MUST be stored in the `messages/ar.json` file.
- **No Inline Text:** NEVER hardcode these main text elements inline inside the React components. Instead, automatically append them to `messages/ar.json` and use the appropriate translation hook (e.g., `useTranslations` from `next-intl`) in your component.
- **Exceptions:** You may use inline text ONLY for very minor elements like input placeholders, small UI labels, or simple button text. Everything else must go into the i18n messages file.
