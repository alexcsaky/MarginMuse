/**
 * Margin Muse - Claude API Client
 *
 * Handles communication with Claude API including:
 * - Request formatting with proper headers
 * - Exponential backoff retry logic
 * - Multi-strategy response parsing
 * - Comprehensive error handling
 */

/**
 * Claude API Client
 * Manages all interactions with the Claude API
 */
class ClaudeAPIClient {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseURL = 'https://api.anthropic.com/v1/messages';
    this.model = 'claude-sonnet-4-5-20250929'; // Correct Sonnet 4.5 model
    this.maxRetries = 3;

    console.log('[MarginMuse] API Client initialized with model:', this.model);
  }

  /**
   * Generate feedback for text with retry logic
   * @param {string} prompt - Full prompt with persona and text
   * @returns {Promise<Array>} Array of feedback objects
   * @throws {APIError} If all retries fail or non-retryable error
   */
  async generateFeedback(prompt) {
    console.log('[MarginMuse] Generating feedback...');

    let lastError;

    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      try {
        // Make API call
        const responseText = await this.makeAPICall(prompt);

        // Parse response into feedback array
        const feedback = this.parseFeedback(responseText);

        console.log(`[MarginMuse] ✅ Feedback generated: ${feedback.length} comments`);
        return feedback;

      } catch (error) {
        lastError = error;

        // Check if we should retry
        const shouldRetry = this._shouldRetryError(error, attempt);

        if (!shouldRetry) {
          console.error('[MarginMuse] Non-retryable error, aborting:', error.message);
          throw error;
        }

        // Calculate exponential backoff delay: 1s, 2s, 4s
        const delay = Math.pow(2, attempt) * 1000;
        console.warn(`[MarginMuse] Retry ${attempt + 1}/${this.maxRetries} after ${delay}ms due to:`, error.message);

        // Wait before retrying
        await this.sleep(delay);
      }
    }

    // All retries exhausted
    console.error('[MarginMuse] ❌ All retries exhausted');
    throw lastError;
  }

  /**
   * Make API call to Claude
   * @param {string} prompt - Full prompt text
   * @returns {Promise<string>} Response text from Claude
   * @throws {APIError} On HTTP errors or network failures
   */
  async makeAPICall(prompt) {
    if (!this.apiKey) {
      throw new APIError(401, 'API key not configured', 'missing_api_key');
    }

    try {
      const response = await fetch(this.baseURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: this.model,
          max_tokens: 1500,
          temperature: 0.7,
          messages: [{
            role: 'user',
            content: prompt
          }]
        })
      });

      // Handle HTTP errors
      if (!response.ok) {
        await this._handleHTTPError(response);
      }

      // Parse response JSON
      const data = await response.json();

      // Extract text from response
      if (!data.content || !data.content[0] || !data.content[0].text) {
        throw new APIError(500, 'Invalid response structure from Claude API', 'invalid_response');
      }

      const responseText = data.content[0].text;
      console.log(`[MarginMuse] API response received: ${responseText.length} characters`);

      return responseText;

    } catch (error) {
      // If it's already an APIError, re-throw
      if (error instanceof APIError) {
        throw error;
      }

      // Handle network errors
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new APIError(0, 'Network error: Unable to reach Claude API', 'network_error');
      }

      // Handle JSON parse errors
      if (error instanceof SyntaxError) {
        throw new APIError(500, 'Invalid JSON response from API', 'parse_error');
      }

      // Unknown error
      throw new APIError(500, `Unexpected error: ${error.message}`, 'unknown_error');
    }
  }

  /**
   * Handle HTTP error responses
   * @param {Response} response - Fetch response object
   * @throws {APIError} With appropriate error details
   * @private
   */
  async _handleHTTPError(response) {
    let errorBody;
    try {
      errorBody = await response.json();
    } catch (e) {
      errorBody = { error: { message: response.statusText } };
    }

    const errorMessage = errorBody.error?.message || response.statusText;
    const errorType = errorBody.error?.type || 'unknown_error';

    throw new APIError(response.status, errorMessage, errorType);
  }

  /**
   * Determine if error should trigger a retry
   * @param {Error} error - Error that occurred
   * @param {number} attempt - Current attempt number (0-indexed)
   * @returns {boolean} True if should retry
   * @private
   */
  _shouldRetryError(error, attempt) {
    // No more retries available
    if (attempt >= this.maxRetries - 1) {
      return false;
    }

    // Not an APIError - don't retry
    if (!(error instanceof APIError)) {
      return false;
    }

    // Retry on rate limits (429)
    if (error.status === 429) {
      return true;
    }

    // Retry on server errors (500, 502, 503, 529)
    if (error.status >= 500) {
      return true;
    }

    // Retry on network errors
    if (error.status === 0 && error.type === 'network_error') {
      return true;
    }

    // Don't retry client errors (400-499 except 429)
    return false;
  }

  /**
   * Parse Claude's response into feedback array
   * Uses multiple strategies to handle different response formats
   * @param {string} responseText - Raw response from Claude
   * @returns {Array} Array of validated feedback objects
   */
  parseFeedback(responseText) {
    console.log('[MarginMuse] Parsing feedback response...');

    // Strategy 1: Direct JSON parse
    try {
      const parsed = JSON.parse(responseText);
      if (Array.isArray(parsed)) {
        console.log('[MarginMuse] ✅ Parsed with Strategy 1: Direct JSON');
        return this.validateFeedback(parsed);
      }
    } catch (e) {
      // Continue to next strategy
    }

    // Strategy 2: Extract from markdown code block
    const codeBlockMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (codeBlockMatch) {
      try {
        const parsed = JSON.parse(codeBlockMatch[1]);
        if (Array.isArray(parsed)) {
          console.log('[MarginMuse] ✅ Parsed with Strategy 2: Markdown code block');
          return this.validateFeedback(parsed);
        }
      } catch (e) {
        // Continue to next strategy
      }
    }

    // Strategy 3: Find JSON array anywhere in response
    const arrayMatch = responseText.match(/\[\s*\{[\s\S]*?\}\s*\]/);
    if (arrayMatch) {
      try {
        const parsed = JSON.parse(arrayMatch[0]);
        if (Array.isArray(parsed)) {
          console.log('[MarginMuse] ✅ Parsed with Strategy 3: JSON array extraction');
          return this.validateFeedback(parsed);
        }
      } catch (e) {
        // Continue to fallback
      }
    }

    // Strategy 4: Fallback - treat entire response as single comment
    console.warn('[MarginMuse] ⚠️ Using Strategy 4: Fallback (treating as single comment)');
    return [{
      category: 'General',
      comment: responseText.trim()
    }];
  }

  /**
   * Validate and clean feedback array
   * Ensures all feedback items have required fields and valid categories
   * @param {Array} feedback - Raw feedback array
   * @returns {Array} Validated and cleaned feedback array
   */
  validateFeedback(feedback) {
    const validCategories = ['Structure', 'Style', 'Critical Thinking', 'Technical', 'General'];

    const validated = feedback
      // Filter out invalid items
      .filter(item => item && typeof item === 'object')
      .filter(item => item.comment && item.comment.trim().length > 0)
      // Clean and normalize
      .map(item => ({
        category: validCategories.includes(item.category) ? item.category : 'General',
        comment: item.comment.trim()
      }))
      // Limit to 5 comments max
      .slice(0, 5);

    console.log(`[MarginMuse] Validated ${validated.length} feedback items`);

    if (validated.length === 0) {
      console.warn('[MarginMuse] ⚠️ No valid feedback items after validation');
    }

    return validated;
  }

  /**
   * Test API key validity
   * Makes a minimal API call to check authentication
   * @returns {Promise<boolean>} True if API key is valid
   */
  async testConnection() {
    console.log('[MarginMuse] Testing API connection...');

    try {
      const responseText = await this.makeAPICall('Test connection. Respond with just "OK".');
      console.log('[MarginMuse] ✅ API connection test passed');
      return true;
    } catch (error) {
      if (error instanceof APIError && error.status === 401) {
        console.error('[MarginMuse] ❌ API connection test failed: Invalid API key');
        throw new APIError(401, 'Invalid API key', 'invalid_api_key');
      }
      console.error('[MarginMuse] ❌ API connection test failed:', error.message);
      throw error;
    }
  }

  /**
   * Sleep utility for retry delays
   * @param {number} ms - Milliseconds to sleep
   * @returns {Promise<void>}
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Custom error class for API errors
 * Provides user-friendly error messages and categorization
 */
class APIError extends Error {
  /**
   * @param {number} status - HTTP status code (or 0 for network errors)
   * @param {string} message - Error message
   * @param {string} type - Error type identifier
   */
  constructor(status, message, type) {
    super(message);
    this.name = 'APIError';
    this.status = status;
    this.type = type;
  }

  /**
   * Get user-friendly error message for display
   * Returns object with title, message, and optional action
   * @returns {Object} {title, message, action, actionType, actionURL}
   */
  getUserMessage() {
    switch (this.status) {
      case 401:
        return {
          title: 'Invalid API Key',
          message: 'Your Claude API key appears to be invalid. Please check your settings and try again.',
          action: 'Open Settings',
          actionType: 'openSettings',
          actionURL: null
        };

      case 429:
        return {
          title: 'Rate Limit Reached',
          message: 'You\'ve reached the API rate limit. Please wait a moment before analyzing more text.',
          action: 'Learn More',
          actionType: 'openURL',
          actionURL: 'https://docs.anthropic.com/en/api/rate-limits'
        };

      case 500:
      case 502:
      case 503:
        return {
          title: 'Service Error',
          message: 'The Claude API encountered an error. Please try again in a few moments.',
          action: 'Check Status',
          actionType: 'openURL',
          actionURL: 'https://status.anthropic.com'
        };

      case 529:
        return {
          title: 'Service Overloaded',
          message: 'The Claude API is currently overloaded. Please try again shortly.',
          action: 'Check Status',
          actionType: 'openURL',
          actionURL: 'https://status.anthropic.com'
        };

      case 0:
        if (this.type === 'network_error') {
          return {
            title: 'Connection Error',
            message: 'Unable to reach the Claude API. Please check your internet connection and try again.',
            action: null,
            actionType: null,
            actionURL: null
          };
        }
        break;

      default:
        return {
          title: 'Unexpected Error',
          message: `An error occurred: ${this.message}`,
          action: null,
          actionType: null,
          actionURL: null
        };
    }

    // Fallback
    return {
      title: 'Error',
      message: this.message || 'An unknown error occurred',
      action: null,
      actionType: null,
      actionURL: null
    };
  }

  /**
   * Check if this is a retryable error
   * @returns {boolean}
   */
  isRetryable() {
    // Rate limits are retryable
    if (this.status === 429) return true;

    // Server errors are retryable
    if (this.status >= 500) return true;

    // Network errors are retryable
    if (this.status === 0 && this.type === 'network_error') return true;

    // Everything else is not retryable
    return false;
  }
}

// Export for use in content script
// Note: Since we're not using a module bundler yet, this will be available globally
if (typeof window !== 'undefined') {
  window.ClaudeAPIClient = ClaudeAPIClient;
  window.APIError = APIError;
}
