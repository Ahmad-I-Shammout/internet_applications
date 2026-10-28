---
name: antigravity_rules
description: Essential execution rules, slash command behaviors, and scoping limits for Antigravity AI agents in this project.
---

# Antigravity Execution Rules

Make sure to follow these rules at all times:

## 1. PowerShell Command Execution
- **Append Exit**: ALWAYS append `; exit` to the end of every single command string to terminate the PowerShell process and return output immediately (e.g., `dir ; exit`).
- **Close Stdin**: ALWAYS close stdin using `$null |` for potentially interactive or blocking commands (e.g., `$null | npm install ; exit`).
- **Quotes**: ALWAYS use outer double quotes and inner single quotes for inline Node.js scripts or complex command arguments (e.g., `$null | node -e "console.log('hello')" ; exit`).

## 2. Git & Background Tasks
- **No Git**: NEVER run Git commands. Do not execute any git commands under any circumstances unless they were read commands.

## 3. Planning & Scope
- **Fast Mode**: ALWAYS operate in fast mode to minimize quota usage. Implement changes immediately without stopping to generate planning artifacts unless requested.
- **Slash Plan Override**: If the user explicitly includes `/plan` in their prompt, switch to planning mode for that command, then immediately revert to fast mode.
- **Directory Scope**: ALWAYS limit actions to the current root project directory and subfolders. NEVER access outside files unless the user includes `/full-access`.
- **Strict Scope Rule**: NEVER implement features, routes, or UI components not explicitly requested by the user. Ask for approval first.
- **No Unprompted Restorations or Fixes**: NEVER re-add code, features, or UI elements that the user has deleted. If you believe something is a mistake or was accidentally removed, you are strictly REQUIRED to suggest the fix in the conversation and wait for the user's explicit approval before editing it.
## 4. Slash Commands
All slash commands are active for the SINGLE prompt they are sent in only:
- `/chat`: NEVER edit any code for that prompt. Only answer the question asked in chat.
- `/explain`: Implement requested changes first, then thoroughly explain them in chat.
- `/styles`: Only change styles/CSS/layout. NEVER modify logic, APIs, or data flows.
- `/plan`: Switch to planning mode for that specific command only.
- `/comments`: Add explanatory comments directly into the highlighted code files/blocks.
- `/find`: Locate codes related to the user's question and add 2 commented boundary lines (`// ########################`) around the code without commenting out the code itself.
- `/full-access`: Permit access outside the project directory for that prompt.
- `/chat-find`: Locate relevant codes, add boundary lines (like `/find`), and thoroughly explain in chat without making other functional changes.
