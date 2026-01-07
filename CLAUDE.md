# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Initial setup (install deps, generate Prisma client, run migrations)
npm run setup

# Development server (with Turbopack)
npm run dev

# Run tests
npm test

# Run a single test file
npx vitest path/to/test.ts

# Lint
npm run lint

# Build for production
npm run build

# Reset database
npm run db:reset
```

## Architecture

UIGen is an AI-powered React component generator with live preview. Users describe components in a chat interface, and Claude generates React/Tailwind code that renders in real-time.

### Core Data Flow

1. **Chat Interface** (`src/components/chat/`) sends messages to `/api/chat`
2. **Chat API Route** (`src/app/api/chat/route.ts`) uses Vercel AI SDK with Claude to process requests
3. Claude uses **tools** (`str_replace_editor`, `file_manager`) to create/modify files in a **VirtualFileSystem**
4. **FileSystemContext** (`src/lib/contexts/file-system-context.tsx`) receives tool calls and updates the in-memory file system
5. **PreviewFrame** (`src/components/preview/PreviewFrame.tsx`) transforms JSX via Babel and renders in an iframe using blob URLs and import maps

### Key Abstractions

- **VirtualFileSystem** (`src/lib/file-system.ts`): In-memory file system that stores generated components. Supports serialize/deserialize for persistence. No files are written to disk.

- **JSX Transformer** (`src/lib/transform/jsx-transformer.ts`): Uses `@babel/standalone` to transform JSX/TSX to ES modules. Creates blob URLs for each file and builds an import map. Third-party packages are loaded from esm.sh.

- **AI Tools** (`src/lib/tools/`):
  - `str-replace.ts`: File creation and string replacement operations (view, create, str_replace, insert)
  - `file-manager.ts`: Rename and delete operations

- **Contexts**:
  - `FileSystemProvider`: Wraps the virtual file system, handles tool calls from AI
  - `ChatProvider`: Wraps Vercel AI SDK's `useChat`, passes file system state to API

### Database

SQLite via Prisma. Schema in `prisma/schema.prisma`:
- `User`: Authentication (email/password with bcrypt, JWT sessions)
- `Project`: Stores messages (JSON array) and file system data (JSON serialized)

Prisma client is generated to `src/generated/prisma/`.

### Authentication

JWT-based sessions stored in httpOnly cookies. Auth logic in `src/lib/auth.ts`. Anonymous users can use the app; their work is tracked client-side and can be saved upon registration.

### Mock Provider

When `ANTHROPIC_API_KEY` is not set, `src/lib/provider.ts` uses a `MockLanguageModel` that returns static component code. This allows running the app without an API key for development/demo purposes.

### Generated Component Requirements

- Entry point must be `/App.jsx` with a default export
- Components use Tailwind CSS for styling (loaded via CDN in preview iframe)
- Local imports use `@/` alias (e.g., `@/components/Button`)
- No HTML files - everything is rendered through the virtual file system

## Code Style

- Use comments sparingly, only when the logic is complicated
