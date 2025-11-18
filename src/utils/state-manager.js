/**
 * Margin Muse - Document State Manager
 *
 * Manages per-document state including:
 * - Word counting (NET counting)
 * - Comment tracking
 * - Pending API call status
 *
 * TODO Phase 1:
 * - Implement DocumentStateManager class
 * - Implement NET word counting algorithm
 * - Implement comment management
 * - Implement state isolation per document
 */

/**
 * Document State Manager
 * Manages per-document state for Margin Muse
 *
 * TODO: Implement full class based on architecture spec
 */
class DocumentStateManager {
  constructor(documentId) {
    this.documentId = documentId;
    this.state = {
      wordCount: 0,
      lastFullText: '',
      lastAnalyzedText: '',
      pendingAPICall: false,
      activeComments: [],
      commentIdCounter: 0
    };

    console.log('[MarginMuse] StateManager initialized for doc:', documentId);
  }

  /**
   * Get document ID from URL
   * @returns {string} Document ID
   */
  static getDocumentId() {
    const match = window.location.href.match(/\/document\/d\/([^/]+)/);
    return match ? match[1] : 'unknown';
  }

  /**
   * Update word count based on new text
   * Uses NET counting: only counts additions, accounts for deletions
   *
   * @param {string} newText - Current full document text
   * @returns {number} Net new words since last count
   *
   * TODO: Implement NET word counting algorithm
   */
  updateWordCount(newText) {
    // TODO: Split old and new text into words
    // TODO: Calculate net difference (newWords.length - oldWords.length)
    // TODO: Only add positive difference
    // TODO: Update lastFullText
    // TODO: Return net new words
    return 0;
  }

  /**
   * Check if word threshold reached
   * @param {number} threshold - Word count threshold (default 50)
   * @returns {boolean}
   */
  shouldTriggerAnalysis(threshold = 50) {
    return this.state.wordCount >= threshold && !this.state.pendingAPICall;
  }

  /**
   * Reset word counter (after analysis triggered)
   */
  resetWordCount() {
    this.state.wordCount = 0;
  }

  /**
   * Mark API call as pending
   * @param {boolean} pending
   */
  setAPICallPending(pending) {
    this.state.pendingAPICall = pending;
  }

  /**
   * Add new comment to active comments
   * @param {Object} comment - {category, comment}
   * @returns {string} Comment ID
   *
   * TODO: Implement
   */
  addComment(comment) {
    // TODO: Generate unique ID
    // TODO: Add to activeComments array
    // TODO: Return ID
    return '';
  }

  /**
   * Update comment status
   * @param {string} commentId
   * @param {string} status - 'resolved' | 'dismissed'
   *
   * TODO: Implement
   */
  updateCommentStatus(commentId, status) {
    // TODO: Find comment by ID
    // TODO: Update status
  }

  /**
   * Remove comment
   * @param {string} commentId
   *
   * TODO: Implement
   */
  removeComment(commentId) {
    // TODO: Filter out comment from array
  }

  /**
   * Get all active comments (not dismissed)
   * @returns {Array}
   */
  getActiveComments() {
    return this.state.activeComments.filter(c => c.status !== 'dismissed');
  }
}

// TODO: Export when implementing module system
// export default DocumentStateManager;
