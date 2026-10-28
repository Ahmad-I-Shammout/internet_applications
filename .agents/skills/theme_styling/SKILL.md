---
name: theme_styling
description: Rules and guidelines for maintaining light and dark mode consistency using the primary teal and secondary navy themes.
---

# Theme Styling & Mode Consistency

This skill ensures that all components, pages, and layout updates maintain a cohesive visual identity across both **light** and **dark** modes.

## Color Palettes & Design Tokens

Always refer to the custom CSS variables configured in `src/app/globals.css`:

### 1. Light Mode (Default Root)
* **Background (`--background`):** `#EEF2F7` (Light blue-gray)
* **Surface (`--surface`):** `#F8FAFC` (Off-white surface for cards, headers, tables)
* **Surface 2 (`--surface-2`):** `#E4E9F0` (Slightly darker blue-gray for highlights and hovers)
* **Borders (`--border`):** `#E5E7EB` (Subtle gray)
* **Text Main (`--text-main`):** `#1E293B` (Slate-800)
* **Text Secondary (`--text-secondary`):** `#64748B` (Slate-600)
* **Brand/Primary Teal (`--primary-500`):** `#2E9F96` (Used for primary buttons, active highlights)

### 2. Dark Mode (`.dark`)
* **Background (`--background`):** `var(--secondary-900)` (Deep Navy `#09152A`)
* **Surface (`--surface` / `--card`):** `var(--secondary-800)` (Rich Navy `#0E203C`)
* **Surface 2 (`--surface-2`):** `var(--secondary-700)` (Medium Navy `#12284A`)
* **Borders (`--border`):** `rgba(92, 129, 187, 0.2)` (Translucent navy blue)
* **Text Main (`--text-main`):** `#F1F5F9` (Slate-50)
* **Text Secondary (`--text-secondary`):** `var(--secondary-200)` (Soft blue-gray `#B8CAE3`)
* **Input border (`--input`):** `rgba(46, 159, 150, 0.25)` (Translucent brand teal)
* **Brand/Primary Teal (`--brand` / `--primary-600`):** `var(--primary-600)` (`#247C78`, base brand teal background)
* **Brand Hover (`--brand-hover` / `--primary-500`):** `var(--primary-500)` (`#2E9F96`)

## Core Layout Styling Rules (Dark Mode Only)

To maintain dark mode aesthetics, apply the following teal accents specifically in dark mode:
1. **Inputs & Selects**:
   * Background: `dark:bg-primary-600` (matches the navbar).
   * Border: `dark:border-primary-500` (solid bright brand teal).
   * Text & Placeholders: `dark:text-white` and `dark:placeholder-primary-100`.
   * Icons: `dark:text-primary-100`.
2. **Top Navbar (Header)**:
   * Background: `dark:bg-primary-600` (solid teal).
   * Border: `dark:border-primary-500` (solid teal border).
   * Text & Icons: `dark:text-primary-100` and `dark:text-white`.
   * Button Hovers: `dark:hover:bg-primary-700` (darker teal hover).
3. **Sidebar**:
   * Background: `dark:bg-surface` (matches the top navbar's base surface token).
   * Selected Tab Highlights: `dark:bg-primary-500/20` (translucent teal background) with `dark:text-primary-300` and `dark:text-primary-400` icons.
   * Hover Highlights: `dark:hover:bg-primary-500/10` with `dark:hover:text-primary-300`.
4. **Primary Brand Buttons**:
   * In dark mode, base brand button color (`--brand`) resolves to `var(--primary-600)` with hover state `var(--brand-hover)` mapping to `var(--primary-500)`.

## Theme Variable Implementation Guidelines

* **Never Hardcode Hex Values:** Always use standard Tailwind CSS classes mapping to variables (e.g., `bg-surface`, `border-border`, `text-text-main`, `text-text-secondary`, `bg-brand`, `border-input`).
* **Always Pair Themes:** When editing layout components, verify styling behavior in both light and dark mode before wrapping up.
