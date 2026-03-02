FROM mcr.microsoft.com/devcontainers/javascript-node:22-bookworm

# Install pnpm via corepack (lockfile v9 requires pnpm v9+)
RUN corepack enable && corepack prepare pnpm@latest --activate

# Install Claude Code CLI globally
RUN npm install -g @anthropic-ai/claude-code
