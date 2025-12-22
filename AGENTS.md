# Agent Guidelines for logseq-plugin-vim-shortcuts

## Build/Lint/Test Commands

- **Build**: `npm run build` or `pnpm build` (builds with Vite and copies assets to dist/)
- **No linting configured** - ensure code follows TypeScript strict mode
- **No testing framework** - manually verify functionality in Logseq

## Code Style Guidelines

### Imports

- Group imports: external libraries first, then local imports with `@/` alias
- Use named imports for Logseq APIs: `import { ILSPluginUser } from "@logseq/libs/dist/LSPlugin"`
- Use `@/` alias for src directory imports

### Formatting

- 2-space indentation (configured in .editorconfig)
- Trim trailing whitespace, insert final newlines
- Use single quotes for strings unless containing single quotes

### Types & Naming

- **Variables/Functions**: camelCase (`getSettings`, `handleEnter`)
- **Files**: kebab-case (`command.vue`, `up.ts`)
- **Vue Components**: PascalCase (`Command.vue`)
- **TypeScript**: Use explicit types, avoid `any` except for Logseq APIs
- **Interfaces**: PascalCase with `I` prefix (`ILSPluginUser`)

### Vue.js Patterns

- Use Composition API with `<script setup>`
- Use Pinia stores for state management (`useCommandStore()`)
- Use `ref()` for reactive variables, `computed()` for derived state
- Template refs with `$` prefix (`$input`, `$commandInput`)

### Error Handling

- Use try/catch for async operations
- Log errors with `console.error`
- Use Logseq's `logseq.UI.showMsg()` for user notifications

### Async/Await

- Prefer async/await over Promises
- Use `await` for all Logseq API calls
- Handle rejections with `.catch(console.error)`

### Logseq Integration

- Register commands with `logseq.App.registerCommandPalette()`
- Use `@ts-ignore` for undocumented Logseq APIs
- Access settings via `logseq.settings`
- Use `logseq.Editor` for block operations

### Styling

- Use Tailwind CSS classes
- Component-scoped styles in `<style>` blocks
- Use Element Plus components with `el-` prefix
