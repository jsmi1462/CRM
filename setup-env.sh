#!/bin/bash

echo "🚀 Setting up PubMetric CRM Development Environment..."

# 1. Install Rust (bypassing the profile modification step)
if ! command -v cargo &> /dev/null; then
    echo "🦀 Rust not found. Installing Rust..."
    # We use --no-modify-path to prevent the 'Permission denied' error on .bash_profile
    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y --no-modify-path
    
    echo "🔧 Setting up your shell path..."
    # Add to .zshrc (Mac default) if it's not already there
    if [ -f "$HOME/.zshrc" ] && ! grep -q ".cargo/env" "$HOME/.zshrc"; then
        echo -e '\n# Rust toolchain' >> "$HOME/.zshrc"
        echo 'source "$HOME/.cargo/env"' >> "$HOME/.zshrc"
        echo "✅ Added Rust to ~/.zshrc."
    fi

    # Load it into the current script session
    source "$HOME/.cargo/env"
else
    echo "✅ Rust is already installed."
fi

# 2. Ensure NPM dependencies are installed
echo "📦 Checking npm dependencies..."
npm install --silent

echo "----------------------------------------"
echo "🎉 Setup complete!"
echo "----------------------------------------"
echo "👉 To apply the changes to this terminal window, run:"
echo "    source ~/.zshrc"
echo ""
echo "👉 Then start the app with:"
echo "    npm run tauri dev"
