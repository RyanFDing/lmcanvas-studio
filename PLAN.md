# lmcanvas-studio — Project Plan

A local-first, **Figma-style infinite canvas** for branching AI conversations, powered by the Claude Code CLI as its backend. Inspired by [local-lmcanvas](https://github.com/max-lee-dev/local-lmcanvas), but with a real design-tool UX layered on top.

---

## 1. Vision

Take the good bones of local-lmcanvas — a tree of AI messages on a canvas, branch from any node, fully local, no API keys — and make it *feel* like Figma:

- Infinite pannable/zoomable canvas
- A proper toolbar, layers panel, and inspector
- Frames/sections to organize conversations
- Multi-select, alignment guides, snapping
- Command palette + rich keyboard shortcuts
- Undo/redo, minimap, export

The AI part stays identical in spirit: it shells out to the local `claude` binary and streams responses — no cloud, no API key.

---

## 2. What we keep from local-lmcanvas

| Feature | Keep? | Notes |
|---|---|---|
| Tree-structured message nodes | ✅ | Core data model |
| Branch from a node | ✅ | Plus: branch from highlighted text |
| Claude Code CLI backend (stream JSON) | ✅ | Reuse the spawn + parse approach |
| Local storage (`~/.lmcanvas-studio/`) | ✅ | Own folder so it doesn't clash |
| Keyboard shortcuts | ✅ | Expand significantly |
| Electron desktop shell | ✅ | Same distribution story (.dmg/.exe/.AppImage) |

---

## 3. Figma-like features to add (tiered)

**Tier 1 — MVP canvas UX (must-have)**
- Infinite canvas: pan (space-drag / scroll), zoom (cmd+scroll), zoom-to-fit
- Node select (click), multi-select (marquee + shift-click)
- Drag to move; snapping + alignment guides
- Toolbar: Select / Hand / Text / Frame / Comment tools
- Right-side **Inspector** (edit selected node: color, size, model, role)
- Left-side **Layers panel** (tree of frames + nodes)
- Minimap + zoom controls
- Undo / redo history
- Context menus (right-click node / canvas)

**Tier 2 — organization & polish**
- **Frames / sections** to group related conversation branches
- Sticky notes & freeform text labels (non-AI annotations)
- Connectors/arrows styling (branch edges as Figma-like arrows)
- Command palette (cmd+K)
- Node theming / color labels
- Export canvas or subtree to PNG/SVG/Markdown

**Tier 3 — advanced (later)**
- Comments/threads pinned to nodes
- Local multiplayer-style presence (deferred; app is local-first)
- Templates / reusable prompt components
- Search across all conversations

---

## 4. Tech stack

| Layer | Choice | Why |
|---|---|---|
| Desktop shell | **Electron** | Matches original; mature packaging |
| Runtime / package mgr | **Bun** | Fast; matches original |
| Language | **TypeScript** | Safety on a growing codebase |
| UI framework | **React** | Ecosystem + original parity |
| Canvas engine | **⚠️ DECISION — see §4.1** | Biggest architectural fork |
| State | **zustand** | Simple, matches original |
| Styling | **Tailwind CSS** | Fast iteration on a dense UI |
| UI primitives | **Radix UI** | Accessible menus, dialogs, panels |
| AI backend | **spawn `claude` CLI** | No API key; local |

### 4.1 The one big decision: canvas engine

**Option A — xyflow (React Flow) + custom Figma-style UI (recommended)**
- Purpose-built for node+edge graphs → matches the branching tree model perfectly.
- Lighter; we build the Figma "chrome" (toolbar, inspector, layers, frames-as-groups) on top.
- Closest to the original repo, so we preserve its strengths.
- Trade-off: we implement more of the Figma UX ourselves.

**Option B — tldraw SDK**
- A Figma-like infinite canvas out of the box: shapes, frames, arrows, tools, multiplayer.
- Most "Figma-feel" for the least UI work.
- Trade-off: conversation nodes become custom shapes; the branching-graph/edge semantics fight the freeform model a bit; heavier, more opinionated.

**Recommendation:** **Option A** — xyflow as the graph engine, with a Figma-style UI layer we control. It fits branching conversations natively and keeps parity with the original. Option B is the pick if "looks and feels exactly like Figma" matters more than clean tree semantics.

---

## 5. Architecture

```
┌─────────────────────────── Electron ───────────────────────────┐
│  Main process (Node)                                            │
│   • spawns `claude` CLI, parses streaming JSON                  │
│   • reads/writes local storage (~/.lmcanvas-studio/*.json)     │
│   • IPC bridge to renderer                                      │
│                                                                 │
│  Renderer (React)                                               │
│   • Canvas (xyflow): nodes = messages, edges = branches         │
│   • Panels: Toolbar / Layers / Inspector / Minimap              │
│   • zustand store: canvas state + conversation tree             │
│   • Command palette, shortcuts, undo/redo                       │
└─────────────────────────────────────────────────────────────────┘
```

## 6. Data model (draft)

```ts
type MessageNode = {
  id: string;
  parentId: string | null;   // tree structure
  role: "user" | "assistant";
  content: string;
  model?: string;
  position: { x: number; y: number };
  frameId?: string;          // which frame/section it belongs to
  style?: { color?: string };
  createdAt: number;
};

type Frame = { id: string; title: string; rect: {x,y,w,h}; color?: string };
type Edge  = { id: string; source: string; target: string };
type Canvas = { id: string; name: string; nodes: MessageNode[]; frames: Frame[]; edges: Edge[] };
```

Persistence: one JSON file per canvas in `~/.lmcanvas-studio/canvases/`.

---

## 7. Milestones (small, checkpointed)

- **M0 — Scaffold**: Electron + Vite + React + TS boots to a window. ✅ DONE
- **M1 — Canvas basics**: xyflow infinite canvas, pan/zoom, draggable message nodes. ✅ DONE
- **M2 — AI wired up**: prompt → main spawns `claude` (stream-json) → streamed reply into a node. ✅ DONE — pure `parseLine` parser unit-tested against real CLI output; browser preview uses a mock stream.
- **M3 — Branching + storage**: branch from node/highlighted text; autosave/load canvas to `~/.lmcanvas-studio/`. ✅ DONE — composer branches from selected node; text-selection seeds a branch; zustand store + debounced persist; auto-follow new replies.
- **M4 — Figma UX (visual)**: top bar, layers panel, inspector, floating toolbar pill, Figma UI3 dark theme. ✅ DONE — verified region-by-region against Figma.
- **M4+ — Figma UX Tier 1 (remaining)**: multi-select align, snapping guides, undo/redo. ✅ DONE — undo/redo (⌘Z/⌘⇧Z + palette, verified), object-snapping helper lines on drag, align selection (left/center/right/top/middle/bottom) wired to inspector row, delete key, Figma-style left-drag marquee (panOnDrag→middle/right, scroll pans). Note: align/snapping verified by build; multi-select drag gesture couldn't be driven via screenshot automation.
- **M5 — Figma UX Tier 2**: frames, sticky notes, command palette (⌘K), export. ✅ DONE — resizable frame nodes (NodeResizer), FigJam sticky notes, ⌘K/Actions palette (New thread, Add sticky, Add frame, Export to Markdown, Fit to screen), Markdown export of the conversation tree. Theming still TODO.
- **M6 — Packaging**: `npm run dist` → installers for Mac/Win/Linux. ✅ DONE — electron-builder configured (dmg/nsis/AppImage); `npm run pack` (--dir) verified: produces a valid 259 MB `lmcanvas-studio.app` bundle with app.asar. `npm run dist` builds the signed-less installers. Custom app icon still TODO (uses default Electron icon).

---

## 8. Open questions / risks

- **Canvas engine** (§4.1) — needs your call before M1.
- Claude Code CLI must be installed & authenticated on the user's machine (same constraint as original).
- Parsing the `claude` JSON stream format — verify current CLI output shape early (M2 risk).
- Frames-as-groups in xyflow need custom logic (M5).

---

## 9. Directory structure (target)

```
lmcanvas-studio/
├─ PLAN.md
├─ package.json
├─ electron/          # main process: CLI spawn, storage, IPC
├─ src/
│  ├─ canvas/         # xyflow setup, custom nodes/edges
│  ├─ panels/         # toolbar, inspector, layers, minimap
│  ├─ store/          # zustand
│  ├─ ai/             # claude stream client (renderer side)
│  └─ shortcuts/      # keybindings, command palette
└─ docs/
```
