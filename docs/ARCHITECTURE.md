# Margin Muse - Technical Architecture

## System Overview

Margin Muse is a Chrome Manifest V3 extension that monitors Google Docs for text changes, extracts content, sends it to Claude API for analysis, and displays feedback in a sidebar.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     Browser Extension                        │
│                                                              │
│  ┌──────────────┐                                           │
│  │  Background  │  Minimal service worker                   │
│  │   Script     │  - Lifecycle management only              │
│  └──────────────┘  - Settings storage                       │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │          Content Script (Google Docs)                 │  │
│  │                                                        │  │
│  │  ┌─────────────────────────────────────────────────┐ │  │
│  │  │  MarginMuse Controller (content-script.js)      │ │  │
│  │  │  - Orchestrates all components                  │ │  │
│  │  │  - Handles async workflows                      │ │  │
│  │  └─────────────────────────────────────────────────┘ │  │
│  │                                                        │  │
│  │  ┌─────────────────┐  ┌──────────────────────────┐  │  │
│  │  │ TextExtractor   │  │  DocumentStateManager    │  │  │
│  │  │                 │  │                          │  │  │
│  │  │ • Strategy 1    │  │ • Word counter           │  │  │
│  │  │ • Strategy 2    │  │ • Comment tracking       │  │  │
│  │  │ • Strategy 3    │  │ • Pending call tracking  │  │  │
│  │  └─────────────────┘  └──────────────────────────┘  │  │
│  │                                                        │  │
│  │  ┌─────────────────┐  ┌──────────────────────────┐  │  │
│  │  │  ClaudeAPI      │  │  MarginMuseSidebar       │  │  │
│  │  │  Client         │  │                          │  │  │
│  │  │                 │  │ • Shadow DOM             │  │  │
│  │  │ • Retry logic   │  │ • Feedback cards         │  │  │
│  │  │ • Error types   │  │ • Loading states         │  │  │
│  │  │ • JSON parsing  │  │ • Error display          │  │  │
│  │  └─────────────────┘  └──────────────────────────┘  │  │
│  │                                                        │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │          Settings Popup (popup.html/js)               │  │
│  │  - API key input                                      │  │
│  │  - Persona selection                                  │  │
│  │  - Writing goals                                      │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
└──────────────────────┬───────────────────────────────────────┘
                       │
                ┌──────▼──────┐
                │   Claude    │
                │   API v1    │
                │  (External) │
                └─────────────┘
```

## Core Components

### 1. Content Script (`content-script.js`)

**Responsibilities:**
- Orchestrates all extension functionality
- Initializes components
- Handles async workflows
- Manages component communication

**Lifecycle:**
1. Detects Google Docs page
2. Waits for editor to load
3. Initializes state manager
4. Loads settings
5. Injects sidebar
6. Starts monitoring

**Key Methods:**
- `init()` - Entry point
- `isGoogleDoc()` - URL check
- `waitForDocument()` - DOM ready check
- `startMonitoring()` - Begin text observation
- `handleTextChange()` - Process text updates
- `triggerAnalysis()` - Initiate API call

### 2. Text Extractor (`text-extractor.js`)

**Responsibilities:**
- Extract text from Google Docs DOM
- Handle multiple DOM structure versions
- Provide context window extraction

**Strategies:**
1. **strategy_2024_kix**: Current Google Docs structure
   - Queries `.kix-appview-editor-container`
   - Extracts from `.kix-lineview` elements
   - Reads `.kix-wordhtmlgenerator-word-node` content

2. **strategy_contenteditable**: Generic fallback
   - Finds `[contenteditable="true"]`
   - Uses `innerText` for line breaks

3. **strategy_innerText**: Last resort
   - Gets any editor canvas
   - Extracts all text content

**Key Methods:**
- `extractText()` - Get full document text
- `extractLastWords(text, count)` - Get last N words
- `extractWithContext(text, contextWords, focusWords)` - Get context + focus

**Error Handling:**
- Returns `null` if all strategies fail
- Logs which strategy succeeded
- Provides clear error messages

### 3. Document State Manager (`state-manager.js`)

**Responsibilities:**
- Per-document state isolation
- Word counting logic
- Comment lifecycle management

**State Structure:**
```javascript
{
  documentId: "extracted-from-url",
  wordCount: 0,                    // NET words since last analysis
  lastFullText: "",                // Previous full text
  lastAnalyzedText: "",            // Text from last analysis
  pendingAPICall: false,           // Prevent concurrent calls
  activeComments: [],              // All comments
  commentIdCounter: 0              // Unique ID generator
}
```

**Word Counting Algorithm:**
```javascript
// NET counting: only count additions, account for deletions
oldWords = lastFullText.split(/\s+/)
newWords = currentFullText.split(/\s+/)
netNewWords = max(0, newWords.length - oldWords.length)
wordCount += netNewWords
```

**Comment Object:**
```javascript
{
  id: "comment-{docId}-{counter}",
  category: "Structure|Style|Critical Thinking|Technical",
  comment: "Feedback text...",
  status: "active|resolved|dismissed",
  timestamp: 1234567890
}
```

### 4. Claude API Client (`api-client.js`)

**Responsibilities:**
- Communicate with Claude API
- Retry logic with exponential backoff
- Error categorization
- Response parsing

**Configuration:**
- Model: `claude-sonnet-4-5-20250929`
- Max tokens: 1500
- Temperature: 0.7
- Max retries: 3

**Retry Logic:**
```javascript
Attempt 1: Immediate
Attempt 2: Wait 1s (2^0 * 1000ms)
Attempt 3: Wait 2s (2^1 * 1000ms)
Attempt 4: Wait 4s (2^2 * 1000ms)

Retry on:
- 429 (Rate Limit)
- 500+ (Server errors)

Don't retry on:
- 401 (Invalid API key)
- 400-499 (Other client errors)
```

**JSON Parsing Strategies:**
1. Direct `JSON.parse(response)`
2. Extract from markdown code block: ` ```json ... ``` `
3. Find JSON array anywhere in response
4. Fallback: Treat entire response as single comment

**Error Types:**
- `APIError` with status codes
- User-friendly error messages
- Actionable next steps

### 5. Margin Muse Sidebar (`sidebar/sidebar.js`)

**Responsibilities:**
- UI rendering and management
- User interaction handling
- State display (loading, error, success)

**Shadow DOM Benefits:**
- Style isolation from Google Docs
- No CSS conflicts
- Clean encapsulation

**UI States:**
1. **Configuration needed**: No API key
2. **Loading**: API call in progress
3. **Success**: Feedback displayed
4. **Error**: API or extraction failure
5. **Empty**: No feedback (rare)

**Comment Card:**
```
┌────────────────────────────────────┐
│ 📐 Structure                        │
├────────────────────────────────────┤
│ Your feedback text here...         │
├────────────────────────────────────┤
│ [Dismiss]              [✓ Resolve] │
└────────────────────────────────────┘
```

**Event Handlers:**
- `onDismiss(commentId)` - Remove comment
- `onResolve(commentId)` - Toggle resolved state
- Collapse/expand sidebar

### 6. Storage Manager (`storage.js`)

**Responsibilities:**
- Abstract Chrome Storage API
- Provide typed getters/setters
- Handle defaults

**Stored Data:**
```javascript
{
  mm_api_key: "sk-ant-...",          // Chrome encrypted storage
  mm_persona: "Kind Teacher",        // Default: Kind Teacher
  mm_goals: "Write concisely..."     // Default: empty
}
```

**Key Methods:**
- `getSettings()` - Get all settings
- `saveAPIKey(key)` - Store API key
- `savePersona(persona)` - Store persona
- `saveGoals(goals)` - Store goals
- `hasAPIKey()` - Check if configured

### 7. Prompts (`prompts.js`)

**Responsibilities:**
- Store persona templates
- Build complete prompts

**Persona Templates:**
Each persona has:
- `systemPrompt` - Persona instructions
- `exampleFeedback` - Sample output (documentation only)

**Prompt Structure:**
```
{Persona system prompt}

USER'S WRITING GOALS:
{User's goals or "No specific goals"}

CONTEXT (for understanding):
"{150 words of context}"

TEXT TO ANALYZE (last ~50 words - focus your feedback here):
"{50 words to focus on}"

INSTRUCTIONS:
{JSON format specification}
{Category definitions}
{Quality guidelines}
```

## Data Flow

### 1. Initialization Flow
```
Page load → Detect Google Docs → Wait for editor ready
    ↓
Get document ID → Initialize StateManager
    ↓
Load settings → Initialize APIClient
    ↓
Inject sidebar → Setup event handlers
    ↓
Start MutationObserver → Monitor text changes
```

### 2. Text Change Flow
```
User types → MutationObserver fires
    ↓
Extract current text → Update word count
    ↓
Threshold reached (50 words)? → Yes
    ↓
Mark pending → Reset counter → Show loading
    ↓
Extract context (150) + focus (50)
    ↓
Build prompt → Call Claude API
    ↓
Parse response → Add comments to state
    ↓
Display feedback → Clear loading
    ↓
Mark not pending
```

### 3. Comment Interaction Flow
```
User clicks "Dismiss"
    ↓
Remove from state → Refresh UI

User clicks "Resolve"
    ↓
Toggle status (active ↔ resolved) → Refresh UI
```

### 4. Error Flow
```
API call fails
    ↓
Identify error type (401, 429, 500, network)
    ↓
Get user-friendly message
    ↓
Display error in sidebar with action button
    ↓
Mark not pending (allow retry)
```

## Chrome Storage Schema

### Local Storage
```javascript
chrome.storage.local:
{
  "mm_api_key": "sk-ant-api03-...",      // Encrypted by Chrome
  "mm_persona": "Kind Teacher",
  "mm_goals": "Write more concisely and avoid jargon"
}
```

### Session Storage
Not used in MVP (all state is in-memory per tab).

## Security Considerations

### 1. API Key Storage
- Stored in `chrome.storage.local` (encrypted by browser)
- Never logged to console
- Never included in URLs
- Only sent in API request headers

### 2. Content Security
- Shadow DOM prevents CSS injection
- HTML escaped before rendering feedback
- No `eval()` or `innerHTML` with user content

### 3. Permissions
- Minimal: `storage` and `docs.google.com` only
- No `<all_urls>` permission
- No `tabs` permission (not needed)

### 4. Data Privacy
- No external servers except Claude API
- No telemetry or analytics
- No persistent storage of document content
- Settings stored locally only

## Performance Considerations

### 1. Text Extraction
- **Optimization**: Debounce MutationObserver (300ms)
- **Cost**: ~5ms per extraction on 50-page doc
- **Impact**: Negligible

### 2. Word Counting
- **Optimization**: Only count on text change, not continuously
- **Cost**: O(n) where n = document word count
- **Impact**: Low (<10ms for 10k words)

### 3. API Calls
- **Target latency**: 2-5 seconds
- **Max latency**: 10 seconds (show "Still working...")
- **Optimization**: Cancel pending calls on document close

### 4. UI Rendering
- **Optimization**: Shadow DOM reduces reflow impact
- **Cost**: <16ms per render (60fps)
- **Impact**: No perceived lag

## Error Handling Strategy

### Levels of Errors

1. **Recoverable (Retry)**
   - Network timeouts
   - Rate limits (429)
   - Server errors (500+)
   - Action: Exponential backoff retry

2. **User-Fixable**
   - Invalid API key (401)
   - Action: Show error + link to settings

3. **Informational**
   - API temporarily down (529)
   - Action: Show error + status page link

4. **Critical (Extension Broken)**
   - Google Docs structure changed
   - All extraction strategies failed
   - Action: Show error + GitHub issue link

### Error Messages

All errors have:
- **Title**: Short error name
- **Message**: User-friendly explanation
- **Action**: Button with next step (optional)
- **ActionType**: `openSettings`, `openURL`, or none

## Testing Strategy

### Unit Tests (Future)
- Text extraction strategies
- Word counting algorithm
- JSON parsing strategies
- State management

### Integration Tests (Manual - MVP)
- Full user flow: install → configure → write → feedback
- Error scenarios: invalid key, rate limit, network failure
- Edge cases: long docs, rapid typing, copy/paste

### Test Documents
Located in `tests/`:
- `test-blank.txt` - Empty document
- `test-short.txt` - Under 50 words
- `test-normal.txt` - Normal writing
- `test-long.txt` - 50+ pages

## Deployment

### Development
1. Load unpacked extension from project root
2. Chrome reads `manifest.json` directly
3. Edit code → Reload extension → Test

### Production (Future)
1. Run `npm run build`
2. Package extension as `.zip`
3. Submit to Chrome Web Store
4. Automated review + publish

## Known Technical Limitations

### 1. Google Docs DOM
- **Issue**: Structure changes without notice
- **Mitigation**: Multiple fallback strategies
- **Future**: Consider Google Docs API (requires OAuth)

### 2. Manifest V3 Service Worker
- **Issue**: Ephemeral, can be killed anytime
- **Mitigation**: All logic in content script
- **Impact**: Can't maintain long-term background state

### 3. Context Window
- **Issue**: 150 words may not capture full context
- **Limitation**: API token limits
- **Tradeoff**: Cost vs. quality

### 4. Word Counting
- **Issue**: Deletions and edits affect count
- **Mitigation**: NET counting (total - deletions)
- **Edge case**: Large paste may trigger immediately

## Future Architecture Improvements

### Phase 2
- Local caching of recent analyses
- Better context awareness (remember previous feedback)
- Performance monitoring and optimization

### Phase 3
- Offline mode with local models
- Backend API to abstract Claude costs
- User accounts and sync

### Phase 4
- WebSocket for real-time collaboration
- Plugin architecture for custom personas
- Advanced NLP for better text extraction

---

Last updated: 2025-11-18 | Version: 0.1.0 (MVP)
