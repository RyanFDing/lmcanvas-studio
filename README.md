# lmcanvas-studio

**A Figma-style canvas for thinking with AI.**

Chat apps make you think in a straight line. You ask something, get an answer, ask a follow-up, and twenty messages later the idea you wanted to come back to is buried. Want to try a different direction? Start a new chat and lose the context, or derail the one you have.

lmcanvas-studio lays the conversation out on an infinite canvas instead. Every message is a node. Fork from any node to try another direction while the original stays where it was. Highlight a phrase in a reply and branch from just that phrase. Group related threads into frames, leave sticky notes for yourself, and zoom out to see how all your ideas connect.

It runs entirely on your machine, on top of the Claude Code CLI you already have. There are no API keys to paste, no account, no database, and no telemetry.

---

## What it does

- **Branch anywhere.** Fork the conversation from any message, or select text in a reply to start a branch seeded with that phrase. Each branch carries its own history: Claude sees every message on the path back to the root and nothing from the branches beside it.
- **A real design-tool feel.** Pan, zoom, and fit to screen. A layers panel, an inspector, frames, FigJam-style sticky notes, snapping guides, multi-select alignment, and undo/redo.
- **⌘K command palette.** New thread, add a sticky, add a frame, export, fit to screen, undo, and redo, all from the keyboard.
- **Streaming replies.** Tokens appear in the node as Claude writes them.
- **Your data stays local.** Canvases autosave (debounced, 500 ms) as plain JSON in `~/.lmcanvas-studio/canvases/`, so you can open them, back them up, or `git` them.
- **Export to Markdown.** Turn a whole conversation tree into a document.
- **Desktop installers** for macOS (`.dmg`), Windows (`.exe`), and Linux (`.AppImage`).

## Speed

I benchmarked how long it takes before the first text shows up. The app was spawning `claude` with stdin left open as a pipe, and the CLI waits about 3 seconds for piped input before it starts, so every message paid that delay. Closing stdin (`stdio: ['ignore', 'pipe', 'pipe']`) fixed it:

| | Time to first token (median, 5 prompts) | Full reply |
|---|---|---|
| Before | 5.0 s | 11.9 s |
| After | **2.0 s** | **8.7 s** |

That's 59% faster to first token. Because the app streams, you start reading about 4× sooner than if it waited for the whole reply.

## How it works

```
┌──────────────────────── Electron ────────────────────────┐
│  Main process (Node)                                      │
│   • spawns `claude -p … --output-format stream-json       │
│     --include-partial-messages`                           │
│   • parses the JSONL stream line by line → text deltas    │
│   • reads/writes ~/.lmcanvas-studio/canvases/*.json       │
│                         │ IPC                             │
│  Renderer (React)       ▼                                 │
│   • React Flow canvas: nodes = messages, edges = branches │
│   • Zustand store: conversation tree + canvas state       │
│   • Toolbar · Layers · Inspector · ⌘K palette             │
└───────────────────────────────────────────────────────────┘
```

`claude -p` is stateless, so each branch rebuilds its own context. `src/renderer/src/canvas/conversation.ts` walks parent edges from the selected node up to the root, drops empty or failed replies, and folds that path into the prompt. Sibling branches never see each other, and a hand-drawn edge that would close a loop is ignored so context can't leak between branches.

The stream parser (`src/main/claudeStream.ts`) is a small pure function with no dependencies. It prefers incremental `text_delta` events, falls back to the full `assistant` message if no deltas arrived, and treats `result` as the end of the reply.

**Stack:** TypeScript · React · Electron · electron-vite · React Flow (`@xyflow/react`) · Zustand · lucide icons · electron-builder

## Getting started

You'll need [Claude Code](https://docs.anthropic.com/en/docs/claude-code) installed and logged in, so that `claude` is on your `PATH`.

```bash
git clone https://github.com/RyanFDing/Figma-chat-interface.git
cd Figma-chat-interface
npm install
npm run dev        # opens the app with hot reload
npm test           # branch-context tests (Node's built-in runner, no extra deps)
```

Build installers:

```bash
npm run dist       # .dmg / .exe / .AppImage into release/
```

## Shortcuts

| Keys | Action |
|---|---|
| ⌘K | Command palette |
| ⌘Z / ⌘⇧Z | Undo / redo |
| Delete | Remove selection |
| Scroll / space-drag | Pan |
| ⌘-scroll | Zoom |

## Roadmap

- Node color themes and a custom app icon
- Search across every canvas
- Comments pinned to nodes
- Reusable prompt templates

## Credits

Inspired by Max Lee's [local-lmcanvas](https://github.com/max-lee-dev/local-lmcanvas), which had the core idea: a tree of AI messages on a canvas, powered by the local Claude CLI. lmcanvas-studio rebuilds that idea with a full design-tool interface on top.
