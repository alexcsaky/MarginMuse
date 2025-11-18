/**
 * Margin Muse - Settings Popup
 *
 * Handles the settings popup UI including:
 * - Loading saved settings
 * - Saving user input
 * - Displaying status messages
 *
 * TODO Phase 1:
 * - Load settings from chrome.storage
 * - Implement save functionality
 * - Add validation
 * - Show success/error messages
 */

console.log('[MarginMuse] Popup loaded');

// DOM elements
const apiKeyInput = document.getElementById('api-key');
const personaSelect = document.getElementById('persona');
const goalsTextarea = document.getElementById('goals');
const saveBtn = document.getElementById('save-btn');
const statusDiv = document.getElementById('status');

/**
 * Load settings from storage
 * TODO: Implement
 */
async function loadSettings() {
  console.log('[MarginMuse] Loading settings...');
  // TODO: Load from chrome.storage.local
  // TODO: Populate form fields
}

/**
 * Save settings to storage
 * TODO: Implement
 */
async function saveSettings() {
  console.log('[MarginMuse] Saving settings...');

  const apiKey = apiKeyInput.value.trim();
  const persona = personaSelect.value;
  const goals = goalsTextarea.value.trim();

  // TODO: Validate inputs
  // TODO: Save to chrome.storage.local
  // TODO: Show success message
  // TODO: Handle errors

  showStatus('Settings saved!', 'success');
}

/**
 * Show status message
 * @param {string} message
 * @param {string} type - 'success' | 'error'
 */
function showStatus(message, type) {
  statusDiv.textContent = message;
  statusDiv.className = `status ${type}`;
  statusDiv.style.display = 'block';

  // Hide after 3 seconds
  setTimeout(() => {
    statusDiv.style.display = 'none';
  }, 3000);
}

// Event listeners
saveBtn.addEventListener('click', saveSettings);

// Load settings on popup open
loadSettings();
