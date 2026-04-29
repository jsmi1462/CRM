#!/bin/bash

# This script builds the app AND automatically signs it for the auto-updater.
# You don't have to remember any environment variables.

echo "🔑 Loading your private updater key..."
# Read the private key we generated earlier
export TAURI_SIGNING_PRIVATE_KEY=$(cat src-tauri/updater.key)
export TAURI_SIGNING_PRIVATE_KEY_PASSWORD=""

echo "📦 Building the release version of PubMetric CRM..."
npm run tauri build

echo ""
echo "✅ Build Complete!"
echo "--------------------------------------------------------"
echo "Your files are ready in: src-tauri/target/release/bundle/macos/"
echo "1. The .dmg is for new users."
echo "2. The .tar.gz is the update file you upload to the internet."
echo "3. The .tar.gz.sig contains the signature you paste into your Gist."
echo "--------------------------------------------------------"
