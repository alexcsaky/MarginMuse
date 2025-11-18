/**
 * Margin Muse - Claude API Client
 *
 * Handles communication with Claude API including:
 * - Request formatting
 * - Error handling with retry logic
 * - Response parsing (multiple strategies)
 *
 * TODO Phase 2:
 * - Implement ClaudeAPIClient class
 * - Implement generateFeedback() with retry logic
 * - Implement parseFeedback() with multiple strategies
 * - Implement APIError class
 * - Add comprehensive error handling
 */

/**
 * Claude API Client
 * TODO: Implement full class based on architecture spec
 */
class ClaudeAPIClient {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseURL = 'https://api.anthropic.com/v1/messages';
    this.model = 'claude-sonnet-4-5-20250929'; // ✅ Correct model name
    this.maxRetries = 3;

    console.log('[MarginMuse] API Client initialized');
  }

  /**
   * Generate feedback for text
   * @param {string} prompt - Full prompt with persona and text
   * @returns {Promise<Array>} Array of feedback objects
   *
   * TODO: Implement with retry logic
   */
  async generateFeedback(prompt) {
    console.log('[MarginMuse] Generating feedback...');
    // TODO: Implement retry loop with exponential backoff
    // TODO: Handle different error types
    // TODO: Return parsed feedback array
    return [];
  }

  /**
   * Make API call to Claude
   * @param {string} prompt
   * @returns {Promise<string>} Response text
   *
   * TODO: Implement
   */
  async makeAPICall(prompt) {
    // TODO: Construct request with headers
    // TODO: Make fetch call
    // TODO: Handle HTTP errors
    // TODO: Return response text
  }

  /**
   * Parse Claude's response into feedback array
   * @param {string} responseText
   * @returns {Array} Feedback objects
   *
   * TODO: Implement multi-strategy parsing
   */
  parseFeedback(responseText) {
    // TODO: Strategy 1: Direct JSON parse
    // TODO: Strategy 2: Extract from markdown code block
    // TODO: Strategy 3: Find JSON array anywhere
    // TODO: Strategy 4: Fallback to single comment
    return [];
  }

  /**
   * Validate and clean feedback array
   * @param {Array} feedback
   * @returns {Array}
   *
   * TODO: Implement
   */
  validateFeedback(feedback) {
    // TODO: Filter invalid items
    // TODO: Ensure valid categories
    // TODO: Limit to 5 items
    return [];
  }

  /**
   * Sleep utility for retry delays
   * @param {number} ms
   * @returns {Promise}
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Test API key validity
   * @returns {Promise<boolean>}
   *
   * TODO: Implement
   */
  async testConnection() {
    // TODO: Make test API call
    // TODO: Return success/failure
    return false;
  }
}

/**
 * Custom error class for API errors
 * TODO: Implement
 */
class APIError extends Error {
  constructor(status, message, type) {
    super(message);
    this.name = 'APIError';
    this.status = status;
    this.type = type;
  }

  /**
   * Get user-friendly error message
   * @returns {Object} {title, message, action}
   *
   * TODO: Implement for all error types
   */
  getUserMessage() {
    // TODO: Return appropriate message based on status
    return {
      title: 'Error',
      message: 'An error occurred',
      action: null
    };
  }
}

// TODO: Export when implementing module system
// export { ClaudeAPIClient, APIError };
