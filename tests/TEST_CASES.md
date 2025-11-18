# Test Cases

Manual test cases for Margin Muse MVP.

## Setup Tests

### TC-001: Extension Installation
**Objective:** Verify extension can be installed in Chrome

**Steps:**
1. Open Chrome
2. Navigate to `chrome://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked"
5. Select MarginMuse directory

**Expected:**
- Extension loads without errors
- Margin Muse appears in extensions list
- Extension icon appears in toolbar

**Status:** ⏳ Pending

---

### TC-002: First-Time API Key Setup
**Objective:** Verify API key can be configured

**Steps:**
1. Click Margin Muse extension icon
2. Enter valid Claude API key in settings
3. Click Save
4. Reopen settings popup

**Expected:**
- API key field accepts input
- Save button works
- API key persists (appears in popup on reopen)
- No errors in console

**Status:** ⏳ Pending

---

## Basic Functionality Tests

### TC-003: Google Docs Detection
**Objective:** Verify extension activates in Google Docs

**Steps:**
1. Open any Google Doc
2. Wait for page to load fully

**Expected:**
- Margin Muse sidebar appears on right side
- No console errors
- Document remains editable

**Status:** ⏳ Pending

---

### TC-004: Text Extraction - New Document
**Objective:** Verify text can be extracted from blank document

**Steps:**
1. Create new Google Doc
2. Type "Hello world"
3. Check console for extraction logs

**Expected:**
- `[MarginMuse] Text extracted` log appears
- Text extraction succeeds
- No errors

**Status:** ⏳ Pending

---

### TC-005: Text Extraction - Existing Document
**Objective:** Verify text extraction works on document with content

**Steps:**
1. Open Google Doc with 500+ words of existing content
2. Wait for sidebar to appear
3. Check console logs

**Expected:**
- Text extraction succeeds
- Full text captured (verify in console)
- No performance issues

**Status:** ⏳ Pending

---

### TC-006: Word Counter - Basic
**Objective:** Verify word counter tracks correctly

**Steps:**
1. Open new Google Doc
2. Type exactly 25 words
3. Check sidebar status (should not trigger)
4. Type 25 more words (total: 50)
5. Observe feedback trigger

**Expected:**
- No feedback after 25 words
- Feedback appears after 50 words
- Word counter resets after feedback

**Status:** ⏳ Pending

---

### TC-007: Feedback Generation
**Objective:** Verify feedback is generated and displayed

**Steps:**
1. Open new Google Doc with API key configured
2. Write 50 words about any topic
3. Wait for API response

**Expected:**
- Sidebar shows "Analyzing..." state
- Within 10 seconds, feedback appears
- 1-5 feedback cards displayed
- Each card has category icon, comment, and action buttons

**Status:** ⏳ Pending

---

### TC-008: Dismiss Comment
**Objective:** Verify dismiss button removes comment

**Steps:**
1. Trigger feedback (write 50 words)
2. Click "Dismiss" on one comment
3. Observe sidebar

**Expected:**
- Comment immediately disappears
- Other comments remain
- No console errors

**Status:** ⏳ Pending

---

### TC-009: Resolve Comment
**Objective:** Verify resolve button marks comment as resolved

**Steps:**
1. Trigger feedback
2. Click "Resolve" on one comment
3. Observe comment state

**Expected:**
- Comment is marked resolved (greyed out, strikethrough)
- Comment remains visible
- "Resolve" button changes to "Unresolve"

**Status:** ⏳ Pending

---

### TC-010: Unresolve Comment
**Objective:** Verify resolved comments can be unresolved

**Steps:**
1. Trigger feedback and resolve a comment
2. Click "Unresolve" on resolved comment

**Expected:**
- Comment returns to active state
- Visual styling returns to normal
- Button changes back to "Resolve"

**Status:** ⏳ Pending

---

## Persona Tests

### TC-011: Kind Teacher Persona
**Objective:** Verify Kind Teacher provides encouraging feedback

**Steps:**
1. Set persona to "Kind Teacher" in settings
2. Write 50 words with some obvious flaws
3. Review feedback tone

**Expected:**
- Feedback is supportive and encouraging
- Starts with something positive
- Suggestions framed gently
- No harsh criticism

**Status:** ⏳ Pending

---

### TC-012: Oxford Professor Persona
**Objective:** Verify Oxford Professor provides rigorous feedback

**Steps:**
1. Set persona to "Oxford Professor"
2. Write 50 words with unsupported claims
3. Review feedback tone

**Expected:**
- Feedback is demanding and precise
- Asks for evidence and substantiation
- Academic vocabulary
- Constructively critical

**Status:** ⏳ Pending

---

### TC-013: Socrates Persona
**Objective:** Verify Socrates uses questioning approach

**Steps:**
1. Set persona to "Socrates"
2. Write 50 words making assumptions
3. Review feedback style

**Expected:**
- Feedback is primarily questions
- Probing and thought-provoking
- Challenges assumptions
- Encourages self-discovery

**Status:** ⏳ Pending

---

## Writing Goals Tests

### TC-014: Goals - Write Concisely
**Objective:** Verify writing goals influence feedback

**Steps:**
1. Set goal: "Write more concisely, avoid wordiness"
2. Write 50 verbose, wordy sentences
3. Review feedback

**Expected:**
- Feedback specifically addresses wordiness
- Suggestions for conciseness
- Comments reference the goal

**Status:** ⏳ Pending

---

### TC-015: Goals - Technical Writing
**Objective:** Verify goals work for different writing styles

**Steps:**
1. Set goal: "Technical documentation for developers"
2. Write 50 words of technical content
3. Review feedback

**Expected:**
- Feedback appropriate for technical writing
- Focus on clarity and precision
- Developer-oriented suggestions

**Status:** ⏳ Pending

---

## Error Handling Tests

### TC-016: Invalid API Key
**Objective:** Verify clear error for invalid API key

**Steps:**
1. Enter invalid API key in settings (e.g., "invalid-key")
2. Write 50 words to trigger analysis

**Expected:**
- Error message appears in sidebar
- Title: "Invalid API Key"
- Clear message about checking settings
- "Open Settings" action button

**Status:** ⏳ Pending

---

### TC-017: Network Disconnection
**Objective:** Verify error handling for network failure

**Steps:**
1. Write 50 words (trigger analysis)
2. Immediately disconnect internet
3. Wait for timeout

**Expected:**
- Error message about connection failure
- Suggestion to check internet connection
- Option to retry (future)

**Status:** ⏳ Pending

---

### TC-018: Rate Limit
**Objective:** Verify handling of API rate limits

**Steps:**
1. Rapidly trigger multiple analyses (write 50 words, wait, repeat 60x in 1 minute)
2. Observe behavior when rate limit hit

**Expected:**
- Error message: "Rate limit reached"
- Guidance to wait before analyzing more
- "Learn More" link to API docs

**Status:** ⏳ Pending

---

### TC-019: API Timeout
**Objective:** Verify handling of slow API response

**Steps:**
1. Write 50 words
2. Wait 10+ seconds for response

**Expected:**
- "Analyzing..." state for first 10 seconds
- "Still working..." message after 10 seconds
- Eventually shows result or timeout error

**Status:** ⏳ Pending

---

## Edge Case Tests

### TC-020: Very Long Document
**Objective:** Verify performance with large documents

**Steps:**
1. Open Google Doc with 50+ pages (10,000+ words)
2. Scroll to end
3. Write 50 words
4. Observe performance

**Expected:**
- Text extraction completes in <100ms
- No noticeable lag in typing
- Feedback still appears within 10 seconds

**Status:** ⏳ Pending

---

### TC-021: Rapid Typing
**Objective:** Verify handling of very fast typing

**Steps:**
1. Type 50 words as fast as possible
2. Immediately continue typing
3. Observe behavior

**Expected:**
- Analysis triggers at 50-word mark
- No duplicate API calls
- Subsequent typing tracked correctly

**Status:** ⏳ Pending

---

### TC-022: Copy-Paste Large Block
**Objective:** Verify handling of large paste operations

**Steps:**
1. Copy 200 words from another source
2. Paste into Google Doc
3. Observe feedback trigger

**Expected:**
- Feedback triggers (200 words > 50 threshold)
- Analysis uses last 50 words
- Word counter resets

**Status:** ⏳ Pending

---

### TC-023: Delete Text After Threshold
**Objective:** Verify word counting handles deletions

**Steps:**
1. Write 40 words
2. Delete 10 words
3. Write 20 more words (net: 50)
4. Observe trigger

**Expected:**
- Feedback triggers at net 50 words
- NET counting works correctly
- No incorrect triggers

**Status:** ⏳ Pending

---

### TC-024: Multiple Google Docs Tabs
**Objective:** Verify state isolation between documents

**Steps:**
1. Open Document A, write 25 words
2. Open Document B (new tab), write 25 words
3. Return to Document A, write 25 more words (total: 50)
4. Observe feedback

**Expected:**
- Document A triggers at 50 words
- Document B still at 25 words (separate state)
- No state collision between tabs

**Status:** ⏳ Pending

---

### TC-025: Empty Document
**Objective:** Verify handling of empty document

**Steps:**
1. Open completely blank Google Doc
2. Wait for sidebar
3. Observe state

**Expected:**
- Sidebar appears
- Shows "ready" or "write to get feedback" state
- No errors

**Status:** ⏳ Pending

---

### TC-026: Special Characters
**Objective:** Verify text extraction handles special characters

**Steps:**
1. Write 50 words including: emojis 😀, symbols ©®™, accents café
2. Trigger feedback

**Expected:**
- All characters extracted correctly
- No encoding errors
- Feedback generated successfully

**Status:** ⏳ Pending

---

### TC-027: Formatted Text
**Objective:** Verify extraction handles formatting

**Steps:**
1. Write 50 words with:
   - **Bold text**
   - *Italic text*
   - Bulleted lists
   - Numbered lists
2. Trigger feedback

**Expected:**
- Plain text extracted (formatting removed)
- Structure preserved (line breaks)
- Feedback generated successfully

**Status:** ⏳ Pending

---

### TC-028: Sidebar Collapse
**Objective:** Verify sidebar can be collapsed

**Steps:**
1. Open Google Doc
2. Click collapse button (◀) in sidebar header
3. Click expand button

**Expected:**
- Sidebar collapses to narrow strip
- Content hidden
- Button changes to expand (▶)
- Clicking again expands sidebar

**Status:** ⏳ Pending

---

## Browser Compatibility Tests

### TC-029: Chrome Latest Version
**Objective:** Verify compatibility with latest Chrome

**Steps:**
1. Update Chrome to latest version
2. Load extension
3. Run basic functionality tests

**Expected:**
- All features work
- No console errors
- UI renders correctly

**Status:** ⏳ Pending

---

### TC-030: Edge Latest Version
**Objective:** Verify compatibility with Microsoft Edge

**Steps:**
1. Open Edge browser
2. Load extension in `edge://extensions/`
3. Run basic functionality tests

**Expected:**
- Extension loads successfully
- All features work identically to Chrome
- No Edge-specific issues

**Status:** ⏳ Pending

---

## Regression Tests

Run before each release to ensure no regressions:

- [ ] TC-001: Installation
- [ ] TC-003: Google Docs detection
- [ ] TC-006: Word counter
- [ ] TC-007: Feedback generation
- [ ] TC-008: Dismiss comment
- [ ] TC-009: Resolve comment
- [ ] TC-011: Kind Teacher persona
- [ ] TC-016: Invalid API key error
- [ ] TC-020: Long document performance
- [ ] TC-024: Multiple tabs isolation

---

## Test Session Template

```markdown
## Test Session: [DATE]

**Tester:** [Name]
**Chrome Version:** [Version]
**Extension Version:** [Version]
**OS:** [Operating System]

### Tests Executed

| Test ID | Test Name | Result | Notes |
|---------|-----------|--------|-------|
| TC-001  | Installation | ✅ Pass | - |
| TC-003  | Detection | ❌ Fail | Sidebar not appearing |
| TC-007  | Feedback | ✅ Pass | Slight delay (~8s) |

### Bugs Found

**Bug #1: Sidebar not appearing**
- **Steps:** Open Google Doc → No sidebar
- **Expected:** Sidebar appears
- **Actual:** No sidebar, console error: "..."
- **Severity:** Critical

### Notes
- Overall impression: [Comments]
- Performance: [Observations]
- Suggestions: [Ideas]
```

---

## Future Test Automation

### Unit Tests (Jest)
```javascript
// Example unit test
describe('TextExtractor', () => {
  it('should extract text using strategy_2024_kix', () => {
    const extractor = new GoogleDocsTextExtractor();
    const text = extractor.strategy_2024_kix();
    expect(text).toBeTruthy();
  });
});
```

### Integration Tests (Puppeteer)
```javascript
// Example integration test
describe('End-to-End', () => {
  it('should generate feedback after 50 words', async () => {
    await page.goto('https://docs.google.com/document/...');
    await page.type('.editor', 'Test text... (50 words)');
    await page.waitForSelector('.mm-card');
    const cards = await page.$$('.mm-card');
    expect(cards.length).toBeGreaterThan(0);
  });
});
```

---

Last updated: 2025-11-18
