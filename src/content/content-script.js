/**
 * Margin Muse - Main Content Script
 *
 * Entry point for extension functionality in Google Docs.
 * Orchestrates all components and handles the main workflow.
 */

console.log('[MarginMuse] Content script loaded');

/**
 * Main MarginMuse controller
 * Coordinates text extraction, analysis, and feedback display
 */
class MarginMuse {
  constructor() {
    this.extractor = null;
    this.stateManager = null;
    this.sidebar = null;
    this.apiClient = null;
    this.settings = null;

    this.observer = null;
    this.checkInterval = null;
    this.debounceTimer = null;

    console.log('[MarginMuse] Controller initialized');
  }

  /**
   * Initialize extension
   */
  async init() {
    console.log('[MarginMuse] Initializing...');

    // Check if we're in a Google Doc
    if (!this.isGoogleDoc()) {
      console.log('[MarginMuse] Not a Google Doc, skipping initialization');
      return;
    }

    console.log('[MarginMuse] Google Doc detected!');

    // Wait for document to be ready
    await this.waitForDocument();

    // Initialize components
    await this.initializeComponents();

    // Inject sidebar
    this.injectSidebar();

    // Check if API key is configured
    const hasApiKey = await StorageManager.hasAPIKey();
    if (!hasApiKey) {
      console.log('[MarginMuse] No API key configured');
      this.sidebar.showConfigurationNeeded();
      return;
    }

    // Start monitoring document
    this.startMonitoring();

    console.log('[MarginMuse] ✅ Initialization complete!');
  }

  /**
   * Check if current page is Google Docs
   * @returns {boolean}
   */
  isGoogleDoc() {
    return window.location.href.includes('docs.google.com/document/');
  }

  /**
   * Wait for Google Docs editor to be ready
   * @returns {Promise<void>}
   */
  async waitForDocument() {
    console.log('[MarginMuse] Waiting for document to be ready...');

    return new Promise((resolve) => {
      const checkEditor = () => {
        // Check for editor container
        const editor = document.querySelector('.kix-appview-editor-container');
        if (editor) {
          console.log('[MarginMuse] Document ready!');
          resolve();
        } else {
          setTimeout(checkEditor, 100);
        }
      };
      checkEditor();
    });
  }

  /**
   * Initialize all components
   */
  async initializeComponents() {
    console.log('[MarginMuse] Initializing components...');

    // Load settings
    this.settings = await StorageManager.getSettings();
    console.log('[MarginMuse] Settings loaded:', {
      hasApiKey: !!this.settings.apiKey,
      persona: this.settings.persona
    });

    // Initialize text extractor
    this.extractor = new GoogleDocsTextExtractor();

    // Initialize state manager
    const docId = DocumentStateManager.getDocumentId();
    this.stateManager = new DocumentStateManager(docId);

    // Initialize API client (if API key exists)
    if (this.settings.apiKey) {
      this.apiClient = new ClaudeAPIClient(this.settings.apiKey);
    }

    console.log('[MarginMuse] Components initialized');
  }

  /**
   * Inject sidebar into page
   */
  injectSidebar() {
    console.log('[MarginMuse] Injecting sidebar...');

    this.sidebar = new MarginMuseSidebar();
    this.sidebar.inject();

    // Set up event handlers
    this.sidebar.onDismiss = (commentId) => this.handleDismiss(commentId);
    this.sidebar.onResolve = (commentId) => this.handleResolve(commentId);

    console.log('[MarginMuse] Sidebar injected');
  }

  /**
   * Start monitoring document for text changes
   */
  startMonitoring() {
    console.log('[MarginMuse] Starting document monitoring...');

    const editorContainer = document.querySelector('.kix-appview-editor-container');
    if (!editorContainer) {
      console.error('[MarginMuse] Editor container not found, cannot monitor');
      return;
    }

    // Use MutationObserver for real-time changes
    this.observer = new MutationObserver(() => {
      this.handleTextChangeDebounced();
    });

    this.observer.observe(editorContainer, {
      characterData: true,
      subtree: true,
      childList: true
    });

    // Also check periodically as a fallback
    this.checkInterval = setInterval(() => {
      this.handleTextChange();
    }, 3000);

    console.log('[MarginMuse] Monitoring started');
  }

  /**
   * Handle text changes with debouncing to avoid excessive checks
   */
  handleTextChangeDebounced() {
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      this.handleTextChange();
    }, 500);
  }

  /**
   * Handle text changes in document
   */
  async handleTextChange() {
    try {
      // Extract current text
      const currentText = this.extractor.extractText();
      if (!currentText) {
        return;
      }

      // Update word count
      const newWords = this.stateManager.updateWordCount(currentText);

      // Check if should trigger analysis
      if (this.stateManager.shouldTriggerAnalysis(50)) {
        await this.triggerAnalysis(currentText);
      }
    } catch (error) {
      console.error('[MarginMuse] Error handling text change:', error);
    }
  }

  /**
   * Trigger feedback analysis
   * @param {string} fullText - Full document text
   */
  async triggerAnalysis(fullText) {
    console.log('[MarginMuse] 🚀 Triggering analysis...');

    // Mark as pending
    this.stateManager.setAPICallPending(true);
    this.stateManager.resetWordCount();

    // Show loading state
    this.sidebar.showLoading('Analyzing your writing...');

    try {
      // Extract context and focus text
      const { context, focus } = this.extractor.extractWithContext(fullText, 150, 50);

      console.log('[MarginMuse] Context:', context.substring(0, 50) + '...');
      console.log('[MarginMuse] Focus:', focus.substring(0, 50) + '...');

      // Build prompt
      const prompt = buildPrompt(
        this.settings.persona,
        context,
        focus,
        this.settings.goals
      );

      console.log('[MarginMuse] Calling Claude API...');

      // Call Claude API
      const feedback = await this.apiClient.generateFeedback(prompt);

      console.log('[MarginMuse] ✅ Received', feedback.length, 'feedback items');

      // Add comments to state
      this.stateManager.addComments(feedback);

      // Display feedback
      const allComments = this.stateManager.getActiveComments();
      this.sidebar.displayFeedback(allComments);

    } catch (error) {
      console.error('[MarginMuse] ❌ Analysis failed:', error);

      if (error instanceof APIError) {
        const errorMessage = error.getUserMessage();
        this.sidebar.showError(errorMessage);
      } else {
        this.sidebar.showError({
          title: 'Unexpected Error',
          message: 'Something went wrong. Please try again.',
          action: null,
          actionType: null,
          actionURL: null
        });
      }
    } finally {
      this.stateManager.setAPICallPending(false);
    }
  }

  /**
   * Handle comment dismiss
   * @param {string} commentId
   */
  handleDismiss(commentId) {
    console.log('[MarginMuse] Dismissing comment:', commentId);

    this.stateManager.removeComment(commentId);
    const allComments = this.stateManager.getActiveComments();
    this.sidebar.displayFeedback(allComments);
  }

  /**
   * Handle comment resolve/unresolve
   * @param {string} commentId
   */
  handleResolve(commentId) {
    console.log('[MarginMuse] Toggling resolved for comment:', commentId);

    const comments = this.stateManager.getActiveComments();
    const comment = comments.find(c => c.id === commentId);

    if (comment) {
      const newStatus = comment.status === 'resolved' ? 'active' : 'resolved';
      this.stateManager.updateCommentStatus(commentId, newStatus);
      this.sidebar.displayFeedback(this.stateManager.getActiveComments());
    }
  }

  /**
   * Cleanup on page unload
   */
  destroy() {
    console.log('[MarginMuse] Cleaning up...');

    if (this.observer) {
      this.observer.disconnect();
    }
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
    if (this.sidebar) {
      this.sidebar.remove();
    }
  }
}

// Helper function to build prompt (uses prompts.js buildPrompt)
function buildPrompt(personaName, contextText, focusText, goals) {
  // Get persona template
  const PERSONA_TEMPLATES = {
    'Kind Teacher': {
      systemPrompt: `You are a supportive and encouraging writing teacher. Your goal is to build the writer's confidence whilst gently pointing out areas for improvement.

STYLE GUIDELINES:
- Always start with something positive
- Use phrases like "I really like..." and "One thing to consider..."
- Frame suggestions as opportunities rather than corrections
- Be warm, specific, and constructive
- Avoid harsh criticism; focus on growth

Your feedback should help the writer feel motivated to improve while clearly understanding what to work on.`
    },
    'Oxford Professor': {
      systemPrompt: `You are a rigorous Oxford academic with high standards for intellectual work. Your feedback is precise, demanding, and focused on the quality of argumentation and evidence.

STYLE GUIDELINES:
- Expect substantiation for all claims
- Demand engagement with counterarguments
- Require clear logical progression
- Use academic vocabulary naturally
- Don't soften criticism, but remain constructive
- Focus on intellectual rigor and depth

Your feedback should push the writer toward scholarly excellence.`
    },
    'Socrates': {
      systemPrompt: `You are Socrates, employing the Socratic method through questioning. Rather than telling the writer what to change, ask probing questions that encourage them to think more deeply.

STYLE GUIDELINES:
- Use questions like "What do you mean by this?"
- Ask "What assumptions underlie this statement?"
- Probe with "What would someone who disagrees say?"
- Challenge definitions and concepts
- Lead through inquiry, not instruction
- Help the writer discover improvements themselves

Your feedback should spark critical examination and self-discovery.`
    }
  };

  const persona = PERSONA_TEMPLATES[personaName];
  if (!persona) {
    throw new Error(`Unknown persona: ${personaName}`);
  }

  return `${persona.systemPrompt}

USER'S WRITING GOALS:
${goals || 'No specific goals provided. Provide general writing feedback.'}

CONTEXT (for understanding):
"${contextText}"

TEXT TO ANALYZE (last ~50 words - focus your feedback here):
"${focusText}"

INSTRUCTIONS:
Provide 1-5 specific, actionable feedback points about the TEXT TO ANALYZE section. For each point:
1. Identify which category it belongs to: Structure, Style, Critical Thinking, or Technical
2. Provide specific, constructive feedback
3. Reference exact phrases from the text when relevant

Respond ONLY with a JSON array in this exact format:
[
  {
    "category": "Structure",
    "comment": "Your specific feedback here..."
  },
  {
    "category": "Style",
    "comment": "Another specific feedback point..."
  }
]

Valid categories: "Structure", "Style", "Critical Thinking", "Technical"

Focus on craft-based improvements. Be constructive and specific. Do NOT rewrite the text.`;
}

// Initialize when ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    const marginMuse = new MarginMuse();
    marginMuse.init();
  });
} else {
  const marginMuse = new MarginMuse();
  marginMuse.init();
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  if (window.marginMuse) {
    window.marginMuse.destroy();
  }
});

console.log('[MarginMuse] Content script ready');
