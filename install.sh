#!/bin/sh
# Convenience installer for claude-prayer-status.
set -e

if ! command -v npm >/dev/null 2>&1; then
  echo "npm is required (Node.js >= 18). Install Node first." >&2
  exit 1
fi

echo "Installing claude-prayer-status globally…"
npm install -g claude-prayer-status

echo "Wiring it into Claude Code…"
claude-prayer-status install

echo "Done. Restart Claude Code to see the prayer line."
