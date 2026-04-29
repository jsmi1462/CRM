#!/bin/bash
set -e

# ─── Config ────────────────────────────────────────────────────────────────────
GIST_ID="291e9b8760d13312ccab20b864bbc2ac"
REPO_OWNER="jsmi1462"
REPO_NAME="CRM"
APP_NAME="PubMetric CRM"
# ───────────────────────────────────────────────────────────────────────────────

# Load Cargo so `tauri build` can find Rust
if [ -f "$HOME/.cargo/env" ]; then
    source "$HOME/.cargo/env"
fi

# ─── GitHub token (required for uploading release and updating Gist) ───────────
GITHUB_TOKEN="${GITHUB_TOKEN:-$(cat "$HOME/.config/pubmetric/github-token" 2>/dev/null)}"
if [ -z "$GITHUB_TOKEN" ]; then
    echo "Error: No GitHub token found."
    echo ""
    echo "One-time setup:"
    echo "  1. Go to https://github.com/settings/tokens/new"
    echo "  2. Give it a name like 'PubMetric Releases'"
    echo "  3. Check the 'repo' scope (and 'gist' scope)"
    echo "  4. Click 'Generate token' and copy the value"
    echo "  5. Run this to save it:"
    echo ""
    echo "     mkdir -p ~/.config/pubmetric && echo 'YOUR_TOKEN_HERE' > ~/.config/pubmetric/github-token && chmod 600 ~/.config/pubmetric/github-token"
    echo ""
    exit 1
fi

# ─── Read version from tauri.conf.json ─────────────────────────────────────────
VERSION=$(node -e "console.log(require('./src-tauri/tauri.conf.json').version)")
echo "Building ${APP_NAME} v${VERSION}..."

# ─── Build ─────────────────────────────────────────────────────────────────────
npm run tauri build

# ─── Create and sign the update bundle ────────────────────────────────────────
BUNDLE_DIR="src-tauri/target/release/bundle/macos"
TAR_FILE="${BUNDLE_DIR}/${APP_NAME}.app.tar.gz"
SIG_FILE="${TAR_FILE}.sig"

# Tauri sometimes creates the .tar.gz automatically; if not, create it manually.
if [ ! -f "${TAR_FILE}" ]; then
    echo "Creating update bundle..."
    tar czf "${TAR_FILE}" -C "${BUNDLE_DIR}" "${APP_NAME}.app"
fi

# Always re-sign to ensure the .sig matches this build.
echo "Signing update bundle..."
npx tauri signer sign -f "src-tauri/updater.key" -p "" "${TAR_FILE}"

# ─── Detect architecture ───────────────────────────────────────────────────────
ARCH=$(uname -m)
PLATFORM="darwin-aarch64"
[ "$ARCH" = "x86_64" ] && PLATFORM="darwin-x86_64"

TAG="v${VERSION}"

echo ""
echo "Publishing ${TAG} to GitHub..."

# ─── Create GitHub release (skip if already exists) ───────────────────────────
EXISTING_ID=$(curl -sf \
    -H "Authorization: token ${GITHUB_TOKEN}" \
    "https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/releases/tags/${TAG}" \
    | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])" 2>/dev/null || echo "")

if [ -n "$EXISTING_ID" ]; then
    RELEASE_ID="$EXISTING_ID"
    echo "Release ${TAG} already exists (id: ${RELEASE_ID}), uploading new assets..."
    # Delete any existing asset with the same name so we can re-upload
    EXISTING_ASSET_ID=$(curl -sf \
        -H "Authorization: token ${GITHUB_TOKEN}" \
        "https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/releases/${RELEASE_ID}/assets" \
        | python3 -c "
import sys, json, urllib.parse
assets = json.load(sys.stdin)
for a in assets:
    if a['name'] == urllib.parse.quote('${APP_NAME}.app.tar.gz').replace('%', '%25') or a['name'] == '${APP_NAME}.app.tar.gz':
        print(a['id'])
        break
" 2>/dev/null || echo "")
    if [ -n "$EXISTING_ASSET_ID" ]; then
        curl -sf -X DELETE \
            -H "Authorization: token ${GITHUB_TOKEN}" \
            "https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/releases/assets/${EXISTING_ASSET_ID}" > /dev/null
    fi
else
    echo "Creating release ${TAG}..."
    RELEASE_RESPONSE=$(curl -sf -X POST \
        -H "Authorization: token ${GITHUB_TOKEN}" \
        -H "Content-Type: application/json" \
        "https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/releases" \
        -d "{
            \"tag_name\": \"${TAG}\",
            \"name\": \"${TAG}\",
            \"body\": \"${APP_NAME} ${TAG}\",
            \"draft\": false,
            \"prerelease\": false,
            \"make_latest\": \"true\"
        }")
    RELEASE_ID=$(echo "$RELEASE_RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])")
fi

# ─── Upload the .tar.gz ────────────────────────────────────────────────────────
echo "Uploading update bundle..."
UPLOAD_RESPONSE=$(curl -sf -X POST \
    -H "Authorization: token ${GITHUB_TOKEN}" \
    -H "Content-Type: application/octet-stream" \
    --data-binary @"${TAR_FILE}" \
    "https://uploads.github.com/repos/${REPO_OWNER}/${REPO_NAME}/releases/${RELEASE_ID}/assets?name=${APP_NAME}.app.tar.gz")

DOWNLOAD_URL=$(echo "$UPLOAD_RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin)['browser_download_url'])")

# ─── Build updater manifest ────────────────────────────────────────────────────
SIGNATURE=$(cat "${SIG_FILE}")
PUB_DATE=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

MANIFEST=$(python3 -c "
import json
manifest = {
    'version': '${VERSION}',
    'notes': '${APP_NAME} ${TAG}',
    'pub_date': '${PUB_DATE}',
    'platforms': {
        '${PLATFORM}': {
            'signature': '''${SIGNATURE}''',
            'url': '${DOWNLOAD_URL}'
        }
    }
}
print(json.dumps(manifest, indent=2))
")

# ─── Update the Gist ───────────────────────────────────────────────────────────
echo "Updating updater manifest..."
PAYLOAD=$(python3 -c "
import json, sys

manifest_content = json.loads(sys.stdin.read())
payload = {
    'files': {
        'gistfile1.txt': {
            'content': json.dumps(manifest_content, indent=2)
        }
    }
}
print(json.dumps(payload))
" <<< "${MANIFEST}")

curl -sf -X PATCH \
    -H "Authorization: token ${GITHUB_TOKEN}" \
    -H "Content-Type: application/json" \
    "https://api.github.com/gists/${GIST_ID}" \
    -d "${PAYLOAD}" > /dev/null

echo ""
echo "Done! ${APP_NAME} ${TAG} is live."
echo "Dad's app will prompt for the update next time he opens it."
echo ""
echo "DMG for new installs: src-tauri/target/release/bundle/dmg/${APP_NAME}_${VERSION}_aarch64.dmg"
