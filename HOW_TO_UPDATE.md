# How to Publish an Update for PubMetric CRM

Because we configured the auto-updater, releasing a new version to your dad (and anyone else) requires a specific set of steps. 

**Follow these steps exactly when you want to push a new update.**

### Step 1: Bump the Version
1. Open `tauri.conf.json` and change the `"version"` (e.g., `"0.2.0"` -> `"0.3.0"`).
2. Open `package.json` and change the `"version"` there to match.

### Step 2: Build the App
Do **not** run `npm run tauri build`. Instead, use the custom script which automatically loads your secret signing keys:

```bash
./build-release.sh
```

### Step 3: Get your Update Files
When the build finishes, go to this folder:
`src-tauri/target/release/bundle/macos/`

You will see three important files:
1. `PubMetric CRM_0.3.0_aarch64.dmg` -> Give this to **brand new users**.
2. `PubMetric CRM_0.3.0_aarch64.app.tar.gz` -> This is the **Updater Patch**.
3. `PubMetric CRM_0.3.0_aarch64.app.tar.gz.sig` -> This is the **Signature**.

### Step 4: Host the Updater Patch
Tauri needs to download the `.tar.gz` file (NOT the dmg) to apply the update.
1. Create a new Release on your GitHub repository (or use Google Drive/Dropbox).
2. Upload the **`.tar.gz`** file to it.
3. Copy the **Direct Download Link** for that `.tar.gz` file.

### Step 5: Update the Gist
1. Open the `.tar.gz.sig` file in a text editor and copy the random text inside it.
2. Go to your GitHub Gist.
3. Edit the Gist to look like this:

```json
{
  "version": "0.3.0",
  "notes": "Describe what is new in this update here!",
  "pub_date": "2026-05-01T12:00:00Z",
  "platforms": {
    "darwin-aarch64": {
      "signature": "PASTE_THE_CONTENTS_OF_YOUR_SIG_FILE_HERE",
      "url": "PASTE_THE_DIRECT_LINK_TO_THE_TAR_GZ_FILE_HERE"
    }
  }
}
```
4. Click Save.

**You are done.** The next time your dad opens the app, it will see the new version in the Gist, check the signature, download the `.tar.gz`, and update itself!
