/**
 * Margin Muse - Google Docs Text Extractor
 *
 * Handles extraction of text from Google Docs DOM using multiple fallback strategies.
 * Google Docs' DOM structure can change, so we implement multiple extraction methods.
 */

/**
 * GoogleDocsTextExtractor
 * Extracts text from Google Docs using multiple strategies
 */
class GoogleDocsTextExtractor {
  constructor() {
    console.log('[MarginMuse] TextExtractor initialized');

    // Define extraction strategies in priority order
    this.strategies = [
      this.strategy_2024_kix,
      this.strategy_contenteditable,
      this.strategy_innerText
    ];
  }

  /**
   * Extract all text from Google Doc
   * Tries multiple strategies until one succeeds
   * @returns {string|null} Full document text or null if all strategies failed
   */
  extractText() {
    console.log('[MarginMuse] Extracting text...');

    for (const strategy of this.strategies) {
      try {
        const text = strategy.call(this);

        // Validate extraction
        if (text && text.trim().length > 0) {
          console.log(`[MarginMuse] Text extracted successfully using ${strategy.name}`);
          console.log(`[MarginMuse] Extracted ${text.split(/\s+/).length} words`);
          return text;
        }
      } catch (error) {
        console.warn(`[MarginMuse] Strategy ${strategy.name} failed:`, error.message);
        // Continue to next strategy
      }
    }

    // All strategies failed
    console.error('[MarginMuse] All text extraction strategies failed');
    return null;
  }

  /**
   * Strategy 1: Current Google Docs structure (as of 2024-2025)
   * Uses the .kix-* class hierarchy
   * @returns {string} Extracted text
   * @throws {Error} If DOM elements not found
   */
  strategy_2024_kix() {
    // Find the main editor container
    const editorContainer = document.querySelector('.kix-appview-editor-container');
    if (!editorContainer) {
      throw new Error('Editor container (.kix-appview-editor-container) not found');
    }

    // Find all line views
    const lines = editorContainer.querySelectorAll('.kix-lineview');
    if (lines.length === 0) {
      throw new Error('No line views (.kix-lineview) found');
    }

    console.log(`[MarginMuse] Found ${lines.length} line views`);

    // Extract text from each line
    const textLines = Array.from(lines).map(line => {
      // Try to get text from word nodes first (most reliable)
      const wordNodes = line.querySelectorAll('.kix-wordhtmlgenerator-word-node');
      if (wordNodes.length > 0) {
        return Array.from(wordNodes)
          .map(node => node.textContent || '')
          .join('');
      }

      // Fallback to line's text content
      return line.textContent || '';
    });

    // Join lines with newlines, filter empty lines
    const fullText = textLines
      .filter(line => line.trim().length > 0)
      .join('\n');

    if (fullText.length === 0) {
      throw new Error('Extracted text is empty');
    }

    return fullText;
  }

  /**
   * Strategy 2: Generic contenteditable fallback
   * Works if Google changes class names but keeps contenteditable
   * @returns {string} Extracted text
   * @throws {Error} If contenteditable element not found
   */
  strategy_contenteditable() {
    // Find any contenteditable element in the page
    const editableElements = document.querySelectorAll('[contenteditable="true"]');

    if (editableElements.length === 0) {
      throw new Error('No contenteditable elements found');
    }

    console.log(`[MarginMuse] Found ${editableElements.length} contenteditable elements`);

    // Try to find the main editor (usually the largest one)
    let mainEditor = null;
    let maxLength = 0;

    for (const element of editableElements) {
      const text = element.innerText || element.textContent || '';
      if (text.length > maxLength) {
        maxLength = text.length;
        mainEditor = element;
      }
    }

    if (!mainEditor) {
      throw new Error('Could not determine main editor');
    }

    // Use innerText to preserve line breaks
    const text = mainEditor.innerText || mainEditor.textContent || '';

    if (text.trim().length === 0) {
      throw new Error('Extracted text is empty');
    }

    return text;
  }

  /**
   * Strategy 3: Last resort - grab any text from editor area
   * Uses broader selectors and innerText
   * @returns {string} Extracted text
   * @throws {Error} If no text found
   */
  strategy_innerText() {
    // Try various editor container selectors
    const selectors = [
      '.kix-appview-editor',
      '.docs-editor-container',
      '.docs-texteventtarget-iframe',
      '[role="textbox"]',
      '#docs-editor'
    ];

    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element) {
        const text = element.innerText || element.textContent || '';

        if (text.trim().length > 0) {
          console.log(`[MarginMuse] Extracted text using selector: ${selector}`);
          return text;
        }
      }
    }

    throw new Error('No editor element found with any known selector');
  }

  /**
   * Extract last N words from text
   * @param {string} text - Full text
   * @param {number} wordCount - Number of words to extract
   * @returns {string} Last N words
   */
  extractLastWords(text, wordCount) {
    if (!text || text.trim().length === 0) {
      return '';
    }

    // Split on whitespace (spaces, newlines, tabs)
    const words = text.trim().split(/\s+/);

    // Get last N words
    const startIndex = Math.max(0, words.length - wordCount);
    const lastWords = words.slice(startIndex);

    return lastWords.join(' ');
  }

  /**
   * Extract context window for better AI feedback
   * Provides more context than just the focus words
   *
   * @param {string} text - Full text
   * @param {number} contextWords - Total context window (default 150)
   * @param {number} focusWords - Words to focus on (default 50)
   * @returns {{context: string, focus: string}} Context and focus text
   */
  extractWithContext(text, contextWords = 150, focusWords = 50) {
    if (!text || text.trim().length === 0) {
      return { context: '', focus: '' };
    }

    // Split into words
    const words = text.trim().split(/\s+/);

    // If document is shorter than context window, return all as context
    if (words.length <= contextWords) {
      const allText = words.join(' ');
      return {
        context: allText,
        focus: this.extractLastWords(allText, Math.min(focusWords, words.length))
      };
    }

    // Extract last contextWords words
    const contextStartIndex = Math.max(0, words.length - contextWords);
    const contextArray = words.slice(contextStartIndex);
    const context = contextArray.join(' ');

    // Extract last focusWords words
    const focusStartIndex = Math.max(0, words.length - focusWords);
    const focusArray = words.slice(focusStartIndex);
    const focus = focusArray.join(' ');

    return { context, focus };
  }

  /**
   * Get word count from text
   * @param {string} text
   * @returns {number} Word count
   */
  getWordCount(text) {
    if (!text || text.trim().length === 0) {
      return 0;
    }
    return text.trim().split(/\s+/).length;
  }

  /**
   * Validate that extraction is working
   * Useful for debugging
   * @returns {boolean} True if extraction works
   */
  testExtraction() {
    try {
      const text = this.extractText();
      if (text && text.length > 0) {
        console.log('[MarginMuse] ✅ Text extraction test PASSED');
        console.log(`[MarginMuse] Sample: "${text.substring(0, 100)}..."`);
        return true;
      }
      console.error('[MarginMuse] ❌ Text extraction test FAILED - no text extracted');
      return false;
    } catch (error) {
      console.error('[MarginMuse] ❌ Text extraction test FAILED:', error);
      return false;
    }
  }
}

// Export for use in content script
// Note: Since we're not using a module bundler yet, this will be available globally
if (typeof window !== 'undefined') {
  window.GoogleDocsTextExtractor = GoogleDocsTextExtractor;
}
