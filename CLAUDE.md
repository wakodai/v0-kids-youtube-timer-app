# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev       # Start development server
pnpm build     # Static export (writes to out/)
pnpm lint      # ESLint
pnpm test      # Vitest (run once)
pnpm test:watch # Vitest watch mode
```

> Note: `next.config.mjs` has `typescript.ignoreBuildErrors: true`, so TypeScript errors do not fail the build.

## Deployment

GitHub Pages. CI workflow is `.github/workflows/deploy.yml`.

- Trigger: push to `main`
- Pipeline: install → lint → test → build → upload-pages-artifact → deploy-pages
- Tests must pass before build & deploy (`needs: test`)
- `NEXT_PUBLIC_BASE_PATH=/<repo-name>` is injected at build time for project-page hosting
- `next.config.mjs` uses `output: "export"`; build output lives in `out/`

## Architecture

This is a single-page Next.js app — a **kids YouTube timer** that limits daily screen time using a medal system.

**Core concept:** The child earns 3 "medal" sessions per day. Each completed timer session consumes one medal (turns it gray). Once all 3 are consumed, the timer is disabled until midnight. State persists in `localStorage` and resets daily.

### Component tree

```
app/page.tsx
└── components/timer-app.tsx       ← All state lives here
    ├── components/timer-controls.tsx  ← Duration selector + Play/Pause/Reset buttons
    ├── components/timer-progress.tsx  ← MM:SS display + progress bar
    └── components/medal.tsx           ← SVG medal (gold = available, gray = consumed)
```

### Key state in `timer-app.tsx`
- `consumedMedals` (0–3): how many sessions used today; persisted to `localStorage`
- `isComplete`: true briefly after timer hits 0 (triggers medal consumption + alarm)
- `allMedalsConsumed`: disables all controls when `consumedMedals >= 3`
- Midnight auto-reset via `setTimeout` scheduled on mount

### Audio (`lib/audio.ts`)
Uses Web Audio API (no external files). iOS requires the `AudioContext` to be created/resumed inside a user gesture — `initAudio()` is called on the first `touchStart`/click.

`getAudioStatus()` returns one of `uninitialized | running | suspended | unsupported`. `SoundStatus` (`components/sound-status.tsx`) renders a colored chip the user can tap to play a short test tone and confirm audio is working. This is the workaround for iOS/iPadOS occasionally muting Web Audio output (silent switch, Low Power Mode, background tab, etc.).

### UI components
`components/ui/` contains shadcn/ui primitives. Do not modify these directly; add new shadcn components with `pnpm dlx shadcn@latest add <component>`.

### Secret reset
A nearly-invisible button in the bottom-right corner (`opacity-[0.02]`) calls `handleSecretReset`, which clears all state including medals — intended for parent override.
