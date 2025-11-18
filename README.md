# Margin Muse

AI-powered writing feedback for Google Docs in the style of a thoughtful university tutor.

## Overview

Margin Muse is a Chrome extension that provides real-time, constructive writing feedback as you draft in Google Docs. Unlike tools that rewrite your work, Margin Muse acts as a coach—offering insights to help you improve your craft.

### Key Features (MVP)

- **Real-time Feedback**: Get constructive comments every 50 words
- **Multiple Teaching Personas**: Choose from Kind Teacher, Oxford Professor, or Socrates
- **Personalized Goals**: Set your writing objectives for tailored feedback
- **Privacy-First**: Your text only goes to Claude API, nothing stored on external servers
- **Clean Interface**: Minimalist sidebar that doesn't distract from your writing

## Getting Started

### Prerequisites

- Google Chrome or Edge browser (Manifest V3 support)
- [Claude API key](https://console.anthropic.com/) from Anthropic

### Installation (Development)

1. **Clone the repository**
   ```bash
   git clone https://github.com/alexcsaky/MarginMuse.git
   cd MarginMuse
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Load extension in Chrome**
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top right)
   - Click "Load unpacked"
   - Select the `MarginMuse` directory

4. **Configure your API key**
   - Click the Margin Muse icon in your Chrome toolbar
   - Enter your Claude API key
   - Select your preferred persona
   - (Optional) Add your writing goals

5. **Start writing**
   - Open any Google Doc
   - The Margin Muse sidebar will appear automatically
   - Start writing—feedback appears every 50 words!

### Getting a Claude API Key

1. Visit [console.anthropic.com](https://console.anthropic.com/)
2. Sign up or log in
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key (you won't be able to see it again!)
6. Paste into Margin Muse settings

**Cost Estimate**: Writing 2,000 words/day (~40 analyses) costs approximately $0.04-0.08/day or ~$2.50/month with Claude Sonnet 4.5.

## Project Structure

```
MarginMuse/
├── manifest.json              # Chrome extension manifest
├── package.json               # Node dependencies
├── src/
│   ├── background/
│   │   └── service-worker.js  # Extension lifecycle management
│   ├── content/
│   │   ├── content-script.js  # Main controller
│   │   ├── text-extractor.js  # Google Docs DOM handling
│   │   ├── word-counter.js    # Word tracking logic (TBD)
│   │   ├── api-client.js      # Claude API integration
│   │   └── sidebar/
│   │       ├── sidebar.js     # UI management
│   │       ├── sidebar.html   # Sidebar template (TBD)
│   │       └── sidebar.css    # Styles
│   ├── popup/
│   │   ├── popup.html         # Settings popup
│   │   ├── popup.js           # Settings logic
│   │   └── popup.css          # Popup styles
│   └── utils/
│       ├── storage.js         # Chrome storage wrapper
│       ├── prompts.js         # Persona templates
│       └── state-manager.js   # Per-document state
├── icons/                      # Extension icons
├── docs/                       # Technical documentation
└── tests/                      # Test cases
```

## Development

### Build Commands

```bash
# Development mode (watch for changes)
npm run dev

# Production build
npm run build

# Run linter
npm run lint
```

### Testing

Load the extension in Chrome's developer mode and test with:
- New blank documents
- Existing documents with content
- Long documents (50+ pages)
- Different personas
- Error scenarios (invalid API key, network issues)

See `tests/` directory for detailed test cases.

## Architecture

### Core Components

1. **Text Extraction** (`text-extractor.js`)
   - Multiple fallback strategies for Google Docs DOM
   - Handles different document structures
   - Extracts context window (150 words) for better feedback

2. **State Management** (`state-manager.js`)
   - Per-document state isolation
   - NET word counting (accounts for deletions)
   - Comment tracking and status management

3. **API Client** (`api-client.js`)
   - Robust error handling
   - Exponential backoff retry logic
   - Multi-strategy JSON parsing

4. **Sidebar UI** (`sidebar/sidebar.js`)
   - Shadow DOM for style isolation
   - Loading, error, and success states
   - Dismiss/resolve comment actions

### Data Flow

```
User types → Text extraction → Word counter → 50 words?
    ↓
Build prompt (persona + goals + text) → Claude API
    ↓
Parse response → Add to state → Display in sidebar
    ↓
User dismisses/resolves → Update state → Refresh UI
```

## Technical Decisions

### Key Specifications

- **Model**: `claude-sonnet-4-5-20250929` (Claude Sonnet 4.5)
- **Context Window**: 150 words (100 context + 50 focus)
- **Word Counting**: NET words (total - deletions)
- **Trigger Threshold**: 50 net new words
- **Max Feedback Items**: 5 per analysis
- **Feedback Categories**: Structure, Style, Critical Thinking, Technical

### Deferred to Post-MVP

- Document text highlighting
- Feedback history/export
- Manual trigger option
- Context awareness across sessions
- Support for non-Google Docs platforms

## Privacy & Security

- **No data collection**: No telemetry or analytics
- **Local storage only**: Settings stored in browser
- **API key security**: Stored in Chrome's encrypted storage
- **Minimal permissions**: Only `storage` and `docs.google.com`

Your writing is sent to Claude API for analysis but not stored on any external servers.

## Known Limitations

- Google Docs DOM structure may change (multiple fallback strategies implemented)
- Feedback focuses on last 50 words written (not full document review)
- No support for collaborative editing (feedback is per-user)
- Requires active internet connection for API calls

## Troubleshooting

### Extension not appearing in Google Docs
- Refresh the page
- Check if extension is enabled in `chrome://extensions/`
- Try closing and reopening the document

### "Invalid API Key" error
- Verify your API key in settings
- Ensure you copied the entire key (no spaces)
- Check your Claude API account is active

### No feedback appearing
- Check you've written at least 50 words since last feedback
- Look for error messages in the sidebar
- Open Chrome DevTools console for detailed logs

### Text extraction failed
- Google Docs structure may have changed
- Try refreshing the page
- Report the issue on GitHub with error details

## Contributing

This is currently in MVP development. Contributions welcome after initial release!

## Roadmap

### Phase 1: MVP (Current)
- ✅ Repository structure
- ⏳ Text extraction with fallbacks
- ⏳ Claude API integration
- ⏳ Sidebar UI
- ⏳ Settings popup
- ⏳ Three personas

### Phase 2: Enhanced UX
- Onboarding tutorial
- Feedback intensity control
- Per-document settings
- Cost estimator

### Phase 3: Intelligence
- Context awareness
- Learning from user behavior
- Custom persona creation

### Phase 4: Platform Expansion
- Notion support
- Medium support
- WordPress support

## License

MIT License - See LICENSE file for details

## Support

- Documentation: See `docs/` directory
- Issues: [GitHub Issues](https://github.com/alexcsaky/MarginMuse/issues)
- API Documentation: [Anthropic Claude API](https://docs.anthropic.com/)

---

Built with Claude Sonnet 4.5 🤖 | For writers who value craft over automation ✍️
