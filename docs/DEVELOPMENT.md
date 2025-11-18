# Development Guide

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Google Chrome or Edge (latest version)
- Claude API key for testing
- Git

### Initial Setup

```bash
# Clone repository
git clone https://github.com/alexcsaky/MarginMuse.git
cd MarginMuse

# Install dependencies
npm install

# Load extension in Chrome
# 1. Open chrome://extensions/
# 2. Enable "Developer mode"
# 3. Click "Load unpacked"
# 4. Select the MarginMuse directory
```

## Development Workflow

### 1. Making Changes

Edit files in `src/` directory:
- Content scripts: `src/content/`
- Background worker: `src/background/`
- Settings popup: `src/popup/`
- Utilities: `src/utils/`

### 2. Testing Changes

After editing code:
1. Go to `chrome://extensions/`
2. Find Margin Muse
3. Click reload icon (🔄)
4. Reload any open Google Docs tabs
5. Test your changes

**Hot reload not available in MVP** - manual reload required.

### 3. Debugging

#### Content Script Debugging
```bash
# In Google Docs:
1. Right-click anywhere → Inspect
2. Console tab shows content script logs
3. Look for [MarginMuse] prefixed messages
```

#### Background Worker Debugging
```bash
# In chrome://extensions/:
1. Find Margin Muse
2. Click "service worker" link
3. DevTools opens with background worker context
```

#### Popup Debugging
```bash
# With popup open:
1. Right-click popup → Inspect
2. Separate DevTools window opens
```

### 4. Console Logging

Use consistent prefixes:
```javascript
console.log('[MarginMuse] Initializing...');
console.warn('[MarginMuse] Strategy failed:', error);
console.error('[MarginMuse] Critical error:', error);
```

### 5. Git Workflow

```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Make changes and commit
git add .
git commit -m "feat: add your feature description"

# Push to GitHub
git push origin feature/your-feature-name

# Create pull request on GitHub
```

#### Commit Message Convention

```
feat: add new feature
fix: bug fix
docs: documentation changes
style: formatting, missing semicolons, etc.
refactor: code restructuring
test: add tests
chore: maintenance tasks
```

## Code Style Guidelines

### JavaScript

```javascript
// Use ES6+ features
const foo = 'bar';
const { apiKey } = await StorageManager.getSettings();

// Async/await over promises
async function doSomething() {
  const result = await apiCall();
  return result;
}

// Clear function names (verbs)
function extractText() { }
function handleTextChange() { }

// Clear variable names (nouns)
const currentText = '...';
const feedbackArray = [];

// JSDoc for public methods
/**
 * Extract text from Google Docs
 * @returns {string|null} Extracted text or null
 */
extractText() { }

// Error handling
try {
  const result = await riskyOperation();
} catch (error) {
  console.error('[MarginMuse] Operation failed:', error);
  throw new APIError(500, error.message);
}
```

### HTML/CSS

```css
/* Use BEM naming convention */
.mm-sidebar { }
.mm-sidebar__header { }
.mm-sidebar__header--collapsed { }

/* Prefix all classes with mm- */
.mm-card { }
.mm-button { }

/* Use CSS variables for colors */
:root {
  --mm-primary: #1967D2;
  --mm-background: #FFFFFF;
  --mm-text: #202124;
}
```

### File Organization

```javascript
// Order of elements in files:
// 1. Imports
import Foo from './foo.js';

// 2. Constants
const MAX_RETRIES = 3;

// 3. Class definition
class MyClass {
  constructor() { }

  // Public methods first
  publicMethod() { }

  // Private methods after (prefix with _)
  _privateMethod() { }
}

// 4. Exports
export default MyClass;
```

## Testing

### Manual Testing Checklist

Before committing significant changes:

**Basic Functionality:**
- [ ] Extension loads without errors
- [ ] Detects Google Docs correctly
- [ ] Sidebar appears
- [ ] Settings popup opens
- [ ] API key can be saved
- [ ] Feedback appears after 50 words
- [ ] Dismiss button works
- [ ] Resolve button works

**Edge Cases:**
- [ ] Empty document
- [ ] Very long document (50+ pages)
- [ ] Rapid typing
- [ ] Copy/paste large blocks
- [ ] Delete text after threshold reached
- [ ] Multiple Google Docs tabs
- [ ] Invalid API key error
- [ ] Network disconnection during API call

### Test Documents

Use documents in `tests/` directory:
- `test-cases.md` - List of test scenarios
- Create test Google Docs for manual testing

### Logging Test Results

```markdown
## Test Session: 2025-11-18

### Environment
- Chrome version: 119.0.6045.105
- Extension version: 0.1.0
- OS: macOS 14.0

### Tests
✅ Basic initialization
✅ Text extraction
❌ Word counter (bug found - counts duplicates)
✅ API call successful
...

### Bugs Found
1. Word counter counts duplicates when copy/pasting
   - Steps to reproduce: ...
   - Expected: ...
   - Actual: ...
```

## Common Development Tasks

### Adding a New Persona

1. Edit `src/utils/prompts.js`:
```javascript
export const PERSONA_TEMPLATES = {
  // ... existing personas
  'New Persona': {
    systemPrompt: `Your persona instructions...`,
    exampleFeedback: "Example output..."
  }
};
```

2. Edit `src/popup/popup.html`:
```html
<select id="persona">
  <!-- ... existing options -->
  <option value="New Persona">New Persona</option>
</select>
```

3. Test thoroughly with different writing samples

### Modifying Word Count Threshold

Edit `src/utils/state-manager.js`:
```javascript
shouldTriggerAnalysis(threshold = 50) {  // Change 50 to new value
  return this.state.wordCount >= threshold && !this.state.pendingAPICall;
}
```

### Adding a New Feedback Category

1. Update prompts to include new category
2. Update category icons in `sidebar.js`:
```javascript
const icons = {
  'Structure': '📐',
  'Style': '✍️',
  'Critical Thinking': '💭',
  'Technical': '📝',
  'New Category': '🆕',  // Add here
  'General': '💡'
};
```

### Debugging Text Extraction Issues

If text extraction fails:

1. Inspect Google Docs DOM:
```javascript
// In Chrome DevTools console (on Google Docs page):
document.querySelector('.kix-appview-editor-container')
document.querySelectorAll('.kix-lineview')
```

2. Try different selectors
3. Add new strategy to `text-extractor.js`
4. Test fallback behavior

### Debugging API Issues

Enable verbose logging:
```javascript
// In api-client.js, add detailed logs:
console.log('[MarginMuse] API Request:', {
  model: this.model,
  prompt: prompt.substring(0, 100) + '...',
  timestamp: Date.now()
});

console.log('[MarginMuse] API Response:', {
  status: response.status,
  responseLength: responseText.length,
  timestamp: Date.now()
});
```

## Performance Optimization

### Measuring Performance

```javascript
// Measure text extraction time
console.time('TextExtraction');
const text = extractor.extractText();
console.timeEnd('TextExtraction');

// Measure word counting
console.time('WordCount');
stateManager.updateWordCount(text);
console.timeEnd('WordCount');
```

### Common Bottlenecks

1. **MutationObserver firing too often**
   - Solution: Debounce the handler
   ```javascript
   let debounceTimer;
   observer.observe(element, {
     callback: () => {
       clearTimeout(debounceTimer);
       debounceTimer = setTimeout(handleTextChange, 300);
     }
   });
   ```

2. **Text extraction on large documents**
   - Current: ~5-10ms for 50 pages (acceptable)
   - If slower: Cache results, only extract changed sections

3. **API call latency**
   - Typical: 2-5 seconds
   - Can't optimize (external service)
   - Show loading indicator immediately

## Troubleshooting

### Extension not loading
```bash
# Check manifest syntax
jq . manifest.json

# Check for JavaScript errors
# Look in chrome://extensions/ for error messages
```

### Changes not appearing
```bash
# Hard reload extension
1. chrome://extensions/
2. Click reload button
3. Force refresh Google Docs (Cmd+Shift+R / Ctrl+Shift+R)
```

### "Module not found" errors
```bash
# Manifest V3 doesn't support ES6 modules in content scripts by default
# Solution: Use webpack or avoid import/export in content scripts
```

### Content script not injecting
```bash
# Check URL pattern in manifest.json
"matches": ["https://docs.google.com/document/*"]

# Ensure run_at is appropriate
"run_at": "document_idle"  # Waits for page load
```

### API key not persisting
```bash
# Check Chrome storage
# In DevTools console:
chrome.storage.local.get(['mm_api_key'], (result) => {
  console.log('API Key:', result.mm_api_key);
});
```

## Code Review Checklist

Before submitting PR:

**Code Quality:**
- [ ] No console.errors (except in error handlers)
- [ ] No hardcoded values (use constants)
- [ ] Clear variable and function names
- [ ] Comments for complex logic
- [ ] Error handling for async operations

**Functionality:**
- [ ] Feature works as intended
- [ ] No regression (existing features still work)
- [ ] Edge cases handled
- [ ] Error states have user-friendly messages

**Performance:**
- [ ] No unnecessary API calls
- [ ] Debouncing/throttling where appropriate
- [ ] No memory leaks (event listeners cleaned up)

**Security:**
- [ ] No API key in logs
- [ ] User input sanitized (escapeHTML)
- [ ] No eval() or innerHTML with user data

**Documentation:**
- [ ] README updated if needed
- [ ] JSDoc comments for public APIs
- [ ] ARCHITECTURE.md updated for architectural changes

## Environment Variables

For local development with different API endpoints (future):

```javascript
// config.js
export const CONFIG = {
  API_BASE_URL: process.env.API_BASE_URL || 'https://api.anthropic.com/v1',
  MODEL: process.env.MODEL || 'claude-sonnet-4-5-20250929',
  DEBUG: process.env.DEBUG === 'true'
};
```

Not needed for MVP (no build process yet).

## Browser Compatibility

### Supported Browsers
- ✅ Chrome 88+ (Manifest V3 support)
- ✅ Edge 88+ (Chromium-based)
- ⏳ Firefox (future - requires manifest adaptation)
- ❌ Safari (no Manifest V3 support yet)

### Testing on Different Browsers

```bash
# Edge
1. Open edge://extensions/
2. Enable Developer mode
3. Load unpacked extension
4. Test

# Firefox (future)
1. Convert manifest.json to Firefox format
2. Open about:debugging
3. Load temporary add-on
```

## Release Process (Future)

### Version Numbering
Semantic versioning: `MAJOR.MINOR.PATCH`
- `0.1.0` - MVP release
- `0.1.1` - Bug fix
- `0.2.0` - New feature
- `1.0.0` - Stable release

### Release Checklist
1. [ ] All tests pass
2. [ ] CHANGELOG updated
3. [ ] Version bumped in manifest.json and package.json
4. [ ] README updated
5. [ ] Create git tag
6. [ ] Build production bundle
7. [ ] Test production build
8. [ ] Submit to Chrome Web Store

## Resources

### Documentation
- [Chrome Extension Docs](https://developer.chrome.com/docs/extensions/)
- [Manifest V3 Migration](https://developer.chrome.com/docs/extensions/mv3/intro/)
- [Claude API Docs](https://docs.anthropic.com/)
- [Google Docs API](https://developers.google.com/docs/api) (future)

### Tools
- [Chrome Extension Source Viewer](https://chrome.google.com/webstore/detail/chrome-extension-source-v/jifpbeccnghkjeaalbbjmodiffmgedin)
- [Extension Reloader](https://chrome.google.com/webstore/detail/extensions-reloader/fimgfedafeadlieiabdeeaodndnlbhid)

### Community
- [r/chrome_extensions](https://reddit.com/r/chrome_extensions)
- [Chrome Extensions Discord](https://discord.gg/chrome-extensions)

---

Happy coding! 🚀
