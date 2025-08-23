#!/bin/bash

# Install Bun on Netlify
curl -fsSL https://bun.sh/install | bash

# Add Bun to PATH
export PATH="$HOME/.bun/bin:$PATH"

# Verify Bun installation
bun --version

# Install dependencies
bun install
