/**
 * Margin Muse - Sidebar UI
 *
 * Manages the sidebar interface including:
 * - Shadow DOM injection for style isolation
 * - Feedback card rendering with categories
 * - Loading, error, and success states
 * - User interactions (dismiss, resolve)
 * - Collapse/expand functionality
 */

/**
 * Sidebar UI Manager
 * Creates and manages the feedback sidebar in Google Docs
 */
class MarginMuseSidebar {
  constructor() {
    this.container = null;
    this.shadowRoot = null;
    this.isCollapsed = false;

    console.log('[MarginMuse] Sidebar initialized');
  }

  /**
   * Inject sidebar into Google Docs with Shadow DOM
   */
  inject() {
    console.log('[MarginMuse] Injecting sidebar...');

    // Create container element
    this.container = document.createElement('div');
    this.container.id = 'margin-muse-sidebar';
    this.container.style.cssText = `
      position: fixed;
      top: 0;
      right: 0;
      width: 360px;
      height: 100vh;
      z-index: 9999;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;

    // Attach Shadow DOM for style isolation
    this.shadowRoot = this.container.attachShadow({ mode: 'open' });

    // Inject styles and initial HTML
    this.shadowRoot.innerHTML = `
      <style>${this.getStyles()}</style>
      ${this.getInitialHTML()}
    `;

    // Attach to document body
    document.body.appendChild(this.container);

    // Setup event listeners
    this.setupEventListeners();

    console.log('[MarginMuse] Sidebar injected successfully');
  }

  /**
   * Get complete CSS styles for sidebar
   * @returns {string} CSS styles
   */
  getStyles() {
    return `
      * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
      }

      .mm-sidebar {
        width: 100%;
        height: 100%;
        background: #FFFFFF;
        border-left: 1px solid #E0E0E0;
        display: flex;
        flex-direction: column;
        box-shadow: -2px 0 8px rgba(0,0,0,0.1);
        transition: transform 0.3s ease;
      }

      .mm-sidebar.collapsed {
        transform: translateX(312px);
      }

      /* Header */
      .mm-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 16px;
        border-bottom: 1px solid #E0E0E0;
        background: #F8F9FA;
        flex-shrink: 0;
      }

      .mm-logo {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .mm-icon {
        font-size: 20px;
      }

      .mm-title {
        font-size: 16px;
        font-weight: 600;
        color: #202124;
      }

      .mm-collapse {
        background: none;
        border: none;
        cursor: pointer;
        font-size: 18px;
        color: #5F6368;
        padding: 4px 8px;
        border-radius: 4px;
        transition: background 0.2s;
      }

      .mm-collapse:hover {
        background: #E8EAED;
      }

      /* Content area */
      .mm-content {
        flex: 1;
        overflow-y: auto;
        padding: 16px;
      }

      .mm-content::-webkit-scrollbar {
        width: 8px;
      }

      .mm-content::-webkit-scrollbar-track {
        background: #F8F9FA;
      }

      .mm-content::-webkit-scrollbar-thumb {
        background: #DADCE0;
        border-radius: 4px;
      }

      .mm-content::-webkit-scrollbar-thumb:hover {
        background: #BDC1C6;
      }

      .mm-status {
        margin-bottom: 16px;
      }

      .mm-comments {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      /* Loading state */
      .mm-loading {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 16px;
        background: #E8F0FE;
        border-radius: 8px;
        color: #1967D2;
        font-size: 14px;
      }

      .mm-spinner {
        width: 20px;
        height: 20px;
        border: 2px solid #E8F0FE;
        border-top-color: #1967D2;
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
      }

      @keyframes spin {
        to { transform: rotate(360deg); }
      }

      /* Error state */
      .mm-error {
        padding: 16px;
        background: #FCE8E6;
        border-left: 4px solid #D93025;
        border-radius: 4px;
        margin-bottom: 16px;
      }

      .mm-error-title {
        font-weight: 600;
        color: #D93025;
        margin-bottom: 8px;
        font-size: 14px;
      }

      .mm-error-message {
        color: #5F6368;
        font-size: 13px;
        line-height: 1.5;
        margin-bottom: 12px;
      }

      .mm-error-action {
        background: #D93025;
        color: white;
        border: none;
        padding: 8px 16px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 13px;
        font-weight: 500;
        transition: background 0.2s;
      }

      .mm-error-action:hover {
        background: #B31412;
      }

      /* Feedback card */
      .mm-card {
        background: #FFFFFF;
        border: 1px solid #E0E0E0;
        border-radius: 8px;
        padding: 16px;
        box-shadow: 0 1px 3px rgba(0,0,0,0.08);
        transition: box-shadow 0.2s;
      }

      .mm-card:hover {
        box-shadow: 0 2px 6px rgba(0,0,0,0.12);
      }

      .mm-card.resolved {
        opacity: 0.6;
        background: #F8F9FA;
      }

      .mm-card-header {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 12px;
      }

      .mm-card-icon {
        font-size: 18px;
      }

      .mm-card-category {
        font-weight: 600;
        font-size: 12px;
        color: #5F6368;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .mm-card-comment {
        color: #202124;
        font-size: 14px;
        line-height: 1.6;
        margin-bottom: 12px;
        white-space: pre-wrap;
        word-wrap: break-word;
      }

      .mm-card.resolved .mm-card-comment {
        text-decoration: line-through;
      }

      .mm-card-actions {
        display: flex;
        gap: 8px;
        justify-content: flex-end;
      }

      .mm-btn {
        padding: 6px 12px;
        border-radius: 4px;
        border: 1px solid #DADCE0;
        background: white;
        cursor: pointer;
        font-size: 13px;
        color: #5F6368;
        font-weight: 500;
        transition: all 0.2s;
      }

      .mm-btn:hover {
        background: #F8F9FA;
        border-color: #5F6368;
      }

      .mm-btn-resolve {
        background: #E8F0FE;
        color: #1967D2;
        border-color: #D2E3FC;
      }

      .mm-btn-resolve:hover {
        background: #D2E3FC;
      }

      /* Empty state */
      .mm-empty {
        text-align: center;
        padding: 48px 24px;
        color: #5F6368;
      }

      .mm-empty-icon {
        font-size: 48px;
        margin-bottom: 16px;
        opacity: 0.5;
      }

      .mm-empty-title {
        font-size: 16px;
        font-weight: 500;
        margin-bottom: 8px;
      }

      .mm-empty-message {
        font-size: 14px;
        line-height: 1.5;
      }

      /* Configuration needed state */
      .mm-config-needed {
        padding: 24px;
        text-align: center;
      }

      .mm-config-icon {
        font-size: 48px;
        margin-bottom: 16px;
      }

      .mm-config-title {
        font-size: 16px;
        font-weight: 600;
        color: #202124;
        margin-bottom: 8px;
      }

      .mm-config-message {
        font-size: 14px;
        color: #5F6368;
        line-height: 1.5;
        margin-bottom: 16px;
      }

      .mm-config-action {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 6px;
        cursor: pointer;
        font-size: 14px;
        font-weight: 600;
        transition: transform 0.2s;
      }

      .mm-config-action:hover {
        transform: translateY(-1px);
      }
    `;
  }

  /**
   * Get initial HTML structure
   * @returns {string} HTML string
   */
  getInitialHTML() {
    return `
      <div class="mm-sidebar">
        <div class="mm-header">
          <div class="mm-logo">
            <span class="mm-icon">📝</span>
            <span class="mm-title">Margin Muse</span>
          </div>
          <button class="mm-collapse" title="Collapse sidebar">
            <span>◀</span>
          </button>
        </div>
        <div class="mm-content">
          <div class="mm-status"></div>
          <div class="mm-comments"></div>
        </div>
      </div>
    `;
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    const collapseBtn = this.shadowRoot.querySelector('.mm-collapse');
    if (collapseBtn) {
      collapseBtn.addEventListener('click', () => this.toggleCollapse());
    }
  }

  /**
   * Toggle sidebar collapse/expand
   */
  toggleCollapse() {
    const sidebar = this.shadowRoot.querySelector('.mm-sidebar');
    const collapseBtn = this.shadowRoot.querySelector('.mm-collapse span');

    this.isCollapsed = !this.isCollapsed;

    if (this.isCollapsed) {
      sidebar.classList.add('collapsed');
      collapseBtn.textContent = '▶';
      this.container.style.width = '48px';
    } else {
      sidebar.classList.remove('collapsed');
      collapseBtn.textContent = '◀';
      this.container.style.width = '360px';
    }

    console.log(`[MarginMuse] Sidebar ${this.isCollapsed ? 'collapsed' : 'expanded'}`);
  }

  /**
   * Show loading state
   * @param {string} message - Loading message to display
   */
  showLoading(message = 'Analyzing your writing...') {
    console.log('[MarginMuse] Showing loading state');

    const statusDiv = this.shadowRoot.querySelector('.mm-status');
    statusDiv.innerHTML = `
      <div class="mm-loading">
        <div class="mm-spinner"></div>
        <span>${this.escapeHTML(message)}</span>
      </div>
    `;
  }

  /**
   * Clear loading state
   */
  clearLoading() {
    const statusDiv = this.shadowRoot.querySelector('.mm-status');
    statusDiv.innerHTML = '';
  }

  /**
   * Show error message
   * @param {Object} error - {title, message, action, actionType, actionURL}
   */
  showError(error) {
    console.log('[MarginMuse] Showing error:', error);

    this.clearLoading();

    const actionHTML = error.action
      ? `<button class="mm-error-action" data-action="${error.actionType}" data-url="${error.actionURL || ''}">${this.escapeHTML(error.action)}</button>`
      : '';

    const statusDiv = this.shadowRoot.querySelector('.mm-status');
    statusDiv.innerHTML = `
      <div class="mm-error">
        <div class="mm-error-title">${this.escapeHTML(error.title)}</div>
        <div class="mm-error-message">${this.escapeHTML(error.message)}</div>
        ${actionHTML}
      </div>
    `;

    // Setup error action handler
    if (error.action) {
      const actionBtn = statusDiv.querySelector('.mm-error-action');
      actionBtn.addEventListener('click', () => {
        if (error.actionType === 'openSettings') {
          chrome.runtime.sendMessage({ action: 'openSettings' });
        } else if (error.actionType === 'openURL' && error.actionURL) {
          window.open(error.actionURL, '_blank');
        }
      });
    }
  }

  /**
   * Display feedback comments
   * @param {Array} comments - Array of comment objects
   */
  displayFeedback(comments) {
    console.log('[MarginMuse] Displaying feedback:', comments.length, 'comments');

    this.clearLoading();

    const commentsDiv = this.shadowRoot.querySelector('.mm-comments');

    if (!comments || comments.length === 0) {
      commentsDiv.innerHTML = `
        <div class="mm-empty">
          <div class="mm-empty-icon">✨</div>
          <div class="mm-empty-title">Looking good!</div>
          <div class="mm-empty-message">Keep writing to receive more feedback.</div>
        </div>
      `;
      return;
    }

    // Render comment cards
    commentsDiv.innerHTML = comments
      .map(comment => this.createCommentCard(comment))
      .join('');

    // Attach event listeners
    this.attachCommentListeners();
  }

  /**
   * Create HTML for a single comment card
   * @param {Object} comment - {id, category, comment, status}
   * @returns {string} HTML string
   */
  createCommentCard(comment) {
    const icons = {
      'Structure': '📐',
      'Style': '✍️',
      'Critical Thinking': '💭',
      'Technical': '📝',
      'General': '💡'
    };

    const icon = icons[comment.category] || icons['General'];
    const resolvedClass = comment.status === 'resolved' ? 'resolved' : '';
    const resolveText = comment.status === 'resolved' ? 'Unresolve' : 'Resolve';

    return `
      <div class="mm-card ${resolvedClass}" data-id="${comment.id}">
        <div class="mm-card-header">
          <span class="mm-card-icon">${icon}</span>
          <span class="mm-card-category">${this.escapeHTML(comment.category)}</span>
        </div>
        <div class="mm-card-comment">${this.escapeHTML(comment.comment)}</div>
        <div class="mm-card-actions">
          <button class="mm-btn mm-btn-dismiss" data-id="${comment.id}">Dismiss</button>
          <button class="mm-btn mm-btn-resolve" data-id="${comment.id}">${resolveText}</button>
        </div>
      </div>
    `;
  }

  /**
   * Attach event listeners to comment cards
   */
  attachCommentListeners() {
    // Dismiss buttons
    this.shadowRoot.querySelectorAll('.mm-btn-dismiss').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const commentId = e.target.dataset.id;
        if (this.onDismiss) {
          this.onDismiss(commentId);
        }
      });
    });

    // Resolve buttons
    this.shadowRoot.querySelectorAll('.mm-btn-resolve').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const commentId = e.target.dataset.id;
        if (this.onResolve) {
          this.onResolve(commentId);
        }
      });
    });
  }

  /**
   * Show configuration needed state
   */
  showConfigurationNeeded() {
    console.log('[MarginMuse] Showing configuration needed');

    const statusDiv = this.shadowRoot.querySelector('.mm-status');
    statusDiv.innerHTML = `
      <div class="mm-config-needed">
        <div class="mm-config-icon">⚙️</div>
        <div class="mm-config-title">Configuration Required</div>
        <div class="mm-config-message">
          Please add your Claude API key in settings to start receiving writing feedback.
        </div>
        <button class="mm-config-action">Open Settings</button>
      </div>
    `;

    // Setup action handler
    const actionBtn = statusDiv.querySelector('.mm-config-action');
    actionBtn.addEventListener('click', () => {
      chrome.runtime.sendMessage({ action: 'openSettings' });
    });
  }

  /**
   * Escape HTML to prevent XSS
   * @param {string} text - Text to escape
   * @returns {string} Escaped HTML
   */
  escapeHTML(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Remove sidebar from DOM
   */
  remove() {
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
      console.log('[MarginMuse] Sidebar removed');
    }
  }

  /**
   * Dismiss comment handler (to be overridden by content script)
   * @param {string} commentId
   */
  onDismiss(commentId) {
    console.log('[MarginMuse] Dismiss:', commentId);
  }

  /**
   * Resolve comment handler (to be overridden by content script)
   * @param {string} commentId
   */
  onResolve(commentId) {
    console.log('[MarginMuse] Resolve:', commentId);
  }
}

// Export for use in content script
if (typeof window !== 'undefined') {
  window.MarginMuseSidebar = MarginMuseSidebar;
}
