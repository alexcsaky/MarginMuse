# Testing Guide - Phase 1 & 2

Quick test guide for verifying the extension loads and settings work correctly.

## Prerequisites

- Google Chrome or Microsoft Edge (latest version)
- The MarginMuse repository cloned locally
- (Optional) Claude API key for full testing

---

## Step 1: Load Extension in Chrome

### 1.1 Open Chrome Extensions Page

1. Open Google Chrome
2. Navigate to: `chrome://extensions/`
3. Enable **"Developer mode"** (toggle in top-right corner)

### 1.2 Load Unpacked Extension

1. Click **"Load unpacked"** button
2. Navigate to your MarginMuse directory
3. Select the **entire `MarginMuse` folder** (not a subfolder)
4. Click **"Select Folder"** or **"Open"**

### 1.3 Verify Extension Loaded

You should see:
- ✅ **Margin Muse** appears in the extensions list
- ✅ Extension icon appears in Chrome toolbar (📝 or placeholder icon)
- ✅ No error messages in the extension card
- ✅ Status shows "Enabled"

**If you see errors:**
- Check that manifest.json is in the root directory
- Look for syntax errors in the error message
- Try reloading the extension (reload icon ↻)

---

## Step 2: Test Settings Popup

### 2.1 Open Settings Popup

1. Click the **Margin Muse icon** in Chrome toolbar
2. Settings popup should open (400px wide window)

**Expected UI:**
- Purple gradient header with "Margin Muse" title
- Three form fields:
  - API Key input (password field)
  - Persona dropdown (3 options)
  - Writing Goals textarea
- "Save Settings" button
- Footer with version and links

### 2.2 Test Settings Without API Key

1. Leave API key field **empty**
2. Select persona: **"Oxford Professor"**
3. Enter goals: **"Test goals - write more concisely"**
4. Click **"Save Settings"**

**Expected result:**
- ✅ Button changes to "Saving..." briefly
- ✅ Success message appears: "✓ Settings saved successfully!"
- ✅ Message auto-hides after 3 seconds
- ✅ No errors in console

### 2.3 Test API Key Validation

1. Enter invalid API key: **"invalid-key-123"**
2. Click **"Save Settings"**

**Expected result:**
- ⚠️ Error message: "⚠️ API key should start with 'sk-ant-'"
- ❌ Settings NOT saved (validation failed)

### 2.4 Test Valid API Key Format

1. Enter fake but valid-format key: **"sk-ant-test123"**
2. Click **"Save Settings"**

**Expected result:**
- ✅ Success message appears
- ✅ Settings saved

---

## Step 3: Test Storage Persistence

### 3.1 Verify Settings Persist

1. Close the settings popup
2. Click the Margin Muse icon again to reopen
3. Check if your settings are still there:
   - API key field should show: `sk-ant-test123`
   - Persona should be: "Oxford Professor"
   - Goals should be: "Test goals - write more concisely"

**Expected result:**
- ✅ All settings loaded correctly
- ✅ Brief "Settings loaded" success message (auto-hides after 1s)

### 3.2 Test Settings Across Browser Sessions

1. Close the settings popup
2. **Reload the extension:**
   - Go to `chrome://extensions/`
   - Find Margin Muse
   - Click reload icon (↻)
3. Click Margin Muse icon to open settings
4. Verify settings are still loaded

**Expected result:**
- ✅ Settings persist even after extension reload
- ✅ Chrome storage is working correctly

---

## Step 4: Check Console Logs

### 4.1 Open Chrome DevTools

With the settings popup open:
1. Right-click anywhere in the popup
2. Select **"Inspect"**
3. Go to **"Console"** tab

**Expected logs:**
```
[MarginMuse] Popup loaded
[MarginMuse] Popup initialized
[MarginMuse] Loading settings...
[MarginMuse] Settings loaded: {hasApiKey: true, persona: "Oxford Professor", hasGoals: true}
[MarginMuse] Settings loaded successfully
```

### 4.2 Test Save Logs

1. Change persona to "Socrates"
2. Click "Save Settings"
3. Check console for logs

**Expected logs:**
```
[MarginMuse] Saving settings...
[MarginMuse] Persona saved: Socrates
[MarginMuse] All settings saved
[MarginMuse] Settings saved successfully
```

---

## Step 5: Inspect Chrome Storage

### 5.1 View Stored Data

With the popup open in DevTools:
1. Go to **"Application"** tab (or "Storage" in some Chrome versions)
2. Expand **"Storage" → "Local Storage"**
3. Find the extension ID (looks like: `chrome-extension://abcdef...`)
4. Click on it to view stored data

**Expected storage keys:**
- `mm_api_key`: Your API key
- `mm_persona`: "Socrates"
- `mm_goals`: "Test goals - write more concisely"

### 5.2 Verify Storage Manager

In the Console tab, test StorageManager manually:

```javascript
// Get all settings
StorageManager.getSettings().then(console.log);

// Should output: {apiKey: "sk-ant-test123", persona: "Socrates", goals: "Test..."}

// Check if has API key
StorageManager.hasAPIKey().then(console.log);
// Should output: true

// Get storage info
StorageManager.getStorageInfo().then(console.log);
// Should output: {bytesInUse: ~200, quota: 10485760, percentUsed: "0.00"}
```

---

## Step 6: Test Edge Cases

### 6.1 Test Empty Fields

1. Clear all fields (delete API key, leave persona as default, clear goals)
2. Click "Save Settings"

**Expected result:**
- ✅ Settings save successfully (empty values are valid)
- ✅ Persona defaults to "Kind Teacher"

### 6.2 Test Long Goals Text

1. Enter very long text in Writing Goals (500+ characters)
2. Click "Save Settings"

**Expected result:**
- ✅ Saves successfully (no length limit in MVP)

### 6.3 Test Special Characters

1. Enter goals with special characters: `"Test & improve < writing > clarity"`
2. Click "Save Settings"
3. Reopen popup to verify

**Expected result:**
- ✅ Special characters preserved correctly

---

## Troubleshooting

### Extension Won't Load

**Problem:** Extension shows errors when loading

**Solutions:**
- Check that manifest.json is in the root directory
- Verify all file paths in manifest.json are correct
- Look for syntax errors in JavaScript files
- Try: Remove extension → Reload page → Load unpacked again

### Popup Won't Open

**Problem:** Clicking icon does nothing

**Solutions:**
- Check browser console (F12) for errors
- Verify popup.html path in manifest.json is correct
- Check that popup.html, popup.js, popup.css exist
- Try: Reload extension and click icon again

### Settings Won't Save

**Problem:** "Save Settings" button does nothing or shows error

**Solutions:**
- Open popup DevTools (right-click popup → Inspect)
- Check Console tab for error messages
- Verify StorageManager is loaded: Type `StorageManager` in console
- If undefined, check that storage.js is loaded in popup.html

### Settings Don't Persist

**Problem:** Settings reset after closing popup

**Solutions:**
- Check Chrome storage permissions in manifest.json
- Verify "storage" is in permissions array
- Check DevTools → Application → Local Storage for data
- Try: Clear storage and save again

### Console Shows "StorageManager is not defined"

**Problem:** StorageManager not available in popup

**Solutions:**
- Check that popup.html loads storage.js BEFORE popup.js
- Should see: `<script src="../utils/storage.js"></script>` before popup.js
- Verify file path is correct (../utils/storage.js)
- Try: Reload extension

---

## Success Criteria

If all tests pass, you should have:

✅ **Extension Loading:**
- Extension appears in chrome://extensions/
- No errors shown
- Icon appears in toolbar

✅ **Settings Popup:**
- Popup opens when clicking icon
- All UI elements render correctly
- Purple gradient header looks good

✅ **Save Functionality:**
- Can save settings
- Validation works (rejects invalid API keys)
- Success/error messages display
- Button shows loading state

✅ **Storage Persistence:**
- Settings persist after closing popup
- Settings persist after reloading extension
- Chrome storage contains correct keys

✅ **Console Logs:**
- All [MarginMuse] logs show correct flow
- No error messages
- StorageManager accessible in console

---

## Next Steps After Testing

Once all tests pass:

1. **If using a real Claude API key:**
   - We can test API integration in Phase 3
   - Settings are ready for real use

2. **If using fake API key:**
   - Settings functionality verified
   - Ready to build sidebar UI in Phase 3

3. **If any tests fail:**
   - Report errors/issues
   - We'll debug together
   - Fix before continuing to Phase 3

---

## Quick Debug Commands

Test in popup DevTools console:

```javascript
// Check if StorageManager loaded
typeof StorageManager
// Should output: "function"

// View all settings
StorageManager.getSettings().then(s => console.table(s))

// Test save
StorageManager.saveAPIKey('sk-ant-test').then(() => console.log('Saved!'))

// Clear all (for testing)
StorageManager.clearAllSettings().then(() => console.log('Cleared!'))

// Log storage info
StorageManager.logStorageInfo()
```

---

## Video/Screenshot Guide (Optional)

If you encounter issues, helpful to provide:
1. Screenshot of chrome://extensions/ page showing the extension
2. Screenshot of settings popup
3. Screenshot of Console errors (if any)
4. Screenshot of Application → Storage → Local Storage data

---

Good luck with testing! 🚀
