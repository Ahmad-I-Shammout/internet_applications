---
name: shared_components
description: Essential guidelines and instructions for creating and utilizing reusable shared components (Button, Input, Typography) across the codebase.
---

# Shared Components & UI Consistency

To ensure the design system remains consistent, clean, and easily editable across the entire team, all development must utilize the shared components located in `src/components/shared/` instead of raw HTML elements.

## 1. Catalog of Shared Components

### Typography (`src/components/shared/typography.tsx`)
A flexible text wrapper component to render uniform headers, subtitles, body copy, captions, and details.
* **Usage**: Always wrap text (headings, paragraphs, spans) in `<Typography>` rather than using raw `<h1>`-`<h6>`, `<p>`, or `<span>` elements with arbitrary Tailwind sizes.
* **Props**:
  * `variant`: `'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'body' | 'body-sm' | 'caption' | 'detail'`
  * `color`: `'default' | 'muted' | 'brand' | 'white'`
  * `weight`: `'light' | 'normal' | 'medium' | 'semibold' | 'bold'`
  * `as`: Renders a custom HTML tag (e.g. `as="span"`). Defaults to appropriate semantic tags.
* **Example**:
  ```tsx
  import { Typography } from '@/components/shared/typography';
  
  <Typography variant="h2" weight="bold" color="default">
    تسجيل الدخول
  </Typography>
  ```

### Input (`src/components/shared/input.tsx`)
A text input wrapper providing consistent borders, rings, labels, helper icons, and error handling.
* **Usage**: Replace raw `<input>` elements. It is built to support logical positioning (RTL/LTR) automatically.
* **Props**:
  * `label`: String text displayed above the input.
  * `error`: String validation message that highlights the border red and displays below the input.
  * `startIcon`: React element placed on the start side (`start-3.5` logical property).
  * `endIcon`: React element placed on the end side (`end-3.5` logical property) for items like password visibility toggle buttons.
* **Example**:
  ```tsx
  import { Input } from '@/components/shared/input';
  import { User } from 'lucide-react';
  
  <Input
    label="اسم المستخدم"
    placeholder="أدخل اسم المستخدم"
    startIcon={<User className="w-4 h-4" />}
  />
  ```

### Button (`src/components/shared/button.tsx`)
The standard button component supporting layouts, loading spinners, and icons.
* **Usage**: Replace raw `<button>` elements.
* **Props**:
  * `variant`: `'primary' | 'secondary' | 'outline' | 'ghost' | 'brand'`
  * `size`: `'sm' | 'md' | 'lg'`
  * `isLoading`: Displays a loader spinner (`Loader2`) and disables user interactions.
  * `startIcon` / `endIcon`: Side icons beside the button text.
* **Example**:
  ```tsx
  import { Button } from '@/components/shared/button';
  
  <Button variant="brand" size="md" isLoading={isLoading}>
    تسجيل الدخول
  </Button>
  ```

## 2. Strict Class Merging Guidelines

* **Tailwind Merge**: Always import and use the `cn(...)` utility from `@/utils/cn` inside shared components to merge parent `className` props override, resolving styling conflicts (e.g., margins, paddings, borders).
* **Logical Properties**: Do **not** use physical coordinates (like `left-`, `right-`, `pl-`, `pr-`, `ml-`, `mr-`) for positioning icons or adding paddings. Always use logical properties (`start-`, `end-`, `ps-`, `pe-`, `ms-`, `me-`) so components automatically support bidirectional layouts (`dir="rtl"` and `dir="ltr"`).
* **Pre-defined Colors**: Exclusively use color classes representing design tokens from `globals.css` (e.g., `text-brand`, `bg-brand`, `border-border`) rather than hardcoding arbitrary inline values (like `text-[#03c]`).
