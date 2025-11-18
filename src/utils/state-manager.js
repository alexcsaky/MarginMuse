/**
 * Margin Muse - Document State Manager
 *
 * Manages per-document state including:
 * - Word counting (NET counting - accounts for deletions)
 * - Comment tracking
 * - Pending API call status
 */

/**
 * Document State Manager
 * Manages per-document state for Margin Muse
 * Each Google Doc gets its own isolated state instance
 */
class DocumentStateManager {
  constructor(documentId) {
    this.documentId = documentId;
    this.state = {
      wordCount: 0,                // NET words since last analysis
      lastFullText: '',            // Previous full document text
      lastAnalyzedText: '',        // Text from last analysis (for reference)
      pendingAPICall: false,       // Prevent concurrent API calls
      activeComments: [],          // All comments (active, resolved, dismissed)
      commentIdCounter: 0          // Unique ID generator
    };

    console.log('[MarginMuse] StateManager initialized for doc:', documentId);
  }

  /**
   * Get document ID from URL
   * @returns {string} Document ID extracted from Google Docs URL
   */
  static getDocumentId() {
    const match = window.location.href.match(/\/document\/d\/([^/]+)/);
    return match ? match[1] : 'unknown';
  }

  /**
   * Update word count based on new text
   * Uses NET counting: only counts additions, accounts for deletions
   *
   * Algorithm:
   * - If user writes 60 words → +60, trigger at 50
   * - If user deletes 20, writes 30 → +10 net
   * - If user pastes 100 words → +100, trigger immediately
   *
   * @param {string} newText - Current full document text
   * @returns {number} Net new words added since last update
   */
  updateWordCount(newText) {
    if (!newText) {
      return 0;
    }

    // Split text into words (by whitespace)
    const oldWords = this.state.lastFullText.trim().split(/\s+/).filter(w => w.length > 0);
    const newWords = newText.trim().split(/\s+/).filter(w => w.length > 0);

    // Calculate NET difference
    const netNewWords = Math.max(0, newWords.length - oldWords.length);

    // Update word counter (accumulate)
    this.state.wordCount += netNewWords;

    // Update last full text
    this.state.lastFullText = newText;

    // Log for debugging
    if (netNewWords > 0) {
      console.log(`[MarginMuse] +${netNewWords} words (total: ${this.state.wordCount}/${50})`);
    }

    return netNewWords;
  }

  /**
   * Check if word threshold reached and ready to trigger analysis
   * @param {number} threshold - Word count threshold (default 50)
   * @returns {boolean} True if should trigger analysis
   */
  shouldTriggerAnalysis(threshold = 50) {
    const should = this.state.wordCount >= threshold && !this.state.pendingAPICall;

    if (should) {
      console.log(`[MarginMuse] Threshold reached! ${this.state.wordCount} >= ${threshold}`);
    }

    return should;
  }

  /**
   * Reset word counter (called after analysis triggered)
   */
  resetWordCount() {
    console.log(`[MarginMuse] Resetting word counter (was: ${this.state.wordCount})`);
    this.state.wordCount = 0;
  }

  /**
   * Mark API call as pending/completed
   * Prevents concurrent API calls
   * @param {boolean} pending - True if API call in progress
   */
  setAPICallPending(pending) {
    this.state.pendingAPICall = pending;
    console.log(`[MarginMuse] API call pending: ${pending}`);
  }

  /**
   * Add new comment to active comments
   * @param {Object} comment - {category, comment}
   * @returns {string} Comment ID
   */
  addComment(comment) {
    // Generate unique ID
    const id = `comment-${this.documentId}-${this.state.commentIdCounter++}`;

    // Create comment object
    const commentObj = {
      id,
      category: comment.category || 'General',
      comment: comment.comment || '',
      status: 'active',  // active | resolved | dismissed
      timestamp: Date.now()
    };

    // Add to array
    this.state.activeComments.push(commentObj);

    console.log(`[MarginMuse] Comment added: ${id} (${comment.category})`);

    return id;
  }

  /**
   * Add multiple comments at once
   * @param {Array} comments - Array of {category, comment} objects
   * @returns {Array} Array of comment IDs
   */
  addComments(comments) {
    if (!Array.isArray(comments)) {
      console.error('[MarginMuse] addComments: expected array');
      return [];
    }

    return comments.map(comment => this.addComment(comment));
  }

  /**
   * Update comment status
   * @param {string} commentId - Comment ID
   * @param {string} status - 'active' | 'resolved' | 'dismissed'
   */
  updateCommentStatus(commentId, status) {
    const comment = this.state.activeComments.find(c => c.id === commentId);

    if (comment) {
      const oldStatus = comment.status;
      comment.status = status;
      console.log(`[MarginMuse] Comment ${commentId} status: ${oldStatus} → ${status}`);
    } else {
      console.warn(`[MarginMuse] Comment not found: ${commentId}`);
    }
  }

  /**
   * Remove comment permanently
   * @param {string} commentId - Comment ID
   */
  removeComment(commentId) {
    const initialLength = this.state.activeComments.length;
    this.state.activeComments = this.state.activeComments.filter(c => c.id !== commentId);

    if (this.state.activeComments.length < initialLength) {
      console.log(`[MarginMuse] Comment removed: ${commentId}`);
    } else {
      console.warn(`[MarginMuse] Comment not found for removal: ${commentId}`);
    }
  }

  /**
   * Get all active comments (excludes dismissed)
   * @returns {Array} Active and resolved comments
   */
  getActiveComments() {
    return this.state.activeComments.filter(c => c.status !== 'dismissed');
  }

  /**
   * Get comments by status
   * @param {string} status - 'active' | 'resolved' | 'dismissed'
   * @returns {Array} Comments with specified status
   */
  getCommentsByStatus(status) {
    return this.state.activeComments.filter(c => c.status === status);
  }

  /**
   * Get total comment count
   * @returns {number} Total number of comments (all statuses)
   */
  getTotalCommentCount() {
    return this.state.activeComments.length;
  }

  /**
   * Clear all comments
   * Useful for testing or reset
   */
  clearAllComments() {
    const count = this.state.activeComments.length;
    this.state.activeComments = [];
    this.state.commentIdCounter = 0;
    console.log(`[MarginMuse] Cleared ${count} comments`);
  }

  /**
   * Get current state (for debugging)
   * @returns {Object} Current state
   */
  getState() {
    return {
      documentId: this.documentId,
      wordCount: this.state.wordCount,
      lastTextLength: this.state.lastFullText.length,
      pendingAPICall: this.state.pendingAPICall,
      commentCount: this.state.activeComments.length,
      activeCommentCount: this.getActiveComments().length
    };
  }

  /**
   * Log current state to console (debugging)
   */
  logState() {
    console.log('[MarginMuse] State:', this.getState());
  }
}

// Export for use in content script
// Note: Since we're not using a module bundler yet, this will be available globally
if (typeof window !== 'undefined') {
  window.DocumentStateManager = DocumentStateManager;
}
