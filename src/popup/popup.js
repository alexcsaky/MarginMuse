/**
 * Margin Muse - Settings Popup
 *
 * Handles the settings popup UI including:
 * - Loading saved settings
 * - Saving user input with validation
 * - Displaying status messages
 */

console.log('[MarginMuse] Popup loaded');

// DOM elements
const apiKeyInput = document.getElementById('api-key');
const personaSelect = document.getElementById('persona');
const goalsTextarea = document.getElementById('goals');
const saveBtn = document.getElementById('save-btn');
const statusDiv = document.getElementById('status');

/**
 * Load settings from storage and populate form
 */
async function loadSettings() {
  console.log('[MarginMuse] Loading settings...');

  try {
    // Get settings from StorageManager
    const settings = await StorageManager.getSettings();

    // Populate form fields
    apiKeyInput.value = settings.apiKey || '';
    personaSelect.value = settings.persona || 'Kind Teacher';
    goalsTextarea.value = settings.goals || '';

    console.log('[MarginMuse] Settings loaded successfully');

    // Show API key status
    if (settings.apiKey) {
      showStatus('Settings loaded', 'success');
      // Auto-hide after 1 second
      setTimeout(() => {
        statusDiv.style.display = 'none';
      }, 1000);
    }

  } catch (error) {
    console.error('[MarginMuse] Error loading settings:', error);
    showStatus('Error loading settings', 'error');
  }
}

/**
 * Save settings to storage with validation
 */
async function saveSettings() {
  console.log('[MarginMuse] Saving settings...');

  // Disable save button while saving
  saveBtn.disabled = true;
  saveBtn.textContent = 'Saving...';

  try {
    // Get form values
    const apiKey = apiKeyInput.value.trim();
    const persona = personaSelect.value;
    const goals = goalsTextarea.value.trim();

    // Validate API key format (basic check)
    if (apiKey && !apiKey.startsWith('sk-ant-')) {
      showStatus('⚠️ API key should start with "sk-ant-"', 'error');
      saveBtn.disabled = false;
      saveBtn.textContent = 'Save Settings';
      return;
    }

    // Validate persona
    const validPersonas = ['Kind Teacher', 'Oxford Professor', 'Socrates'];
    if (!validPersonas.includes(persona)) {
      showStatus('Invalid persona selected', 'error');
      saveBtn.disabled = false;
      saveBtn.textContent = 'Save Settings';
      return;
    }

    // Save all settings
    await StorageManager.saveAllSettings({
      apiKey: apiKey,
      persona: persona,
      goals: goals
    });

    console.log('[MarginMuse] Settings saved successfully');
    showStatus('✓ Settings saved successfully!', 'success');

    // If API key was provided, optionally test it
    if (apiKey && apiKey.length > 0) {
      // Note: We could add API key validation here in the future
      // For now, just save it and let the user test it in Google Docs
    }

  } catch (error) {
    console.error('[MarginMuse] Error saving settings:', error);
    showStatus(`Error saving: ${error.message}`, 'error');
  } finally {
    // Re-enable save button
    saveBtn.disabled = false;
    saveBtn.textContent = 'Save Settings';
  }
}

/**
 * Show status message
 * @param {string} message - Message to display
 * @param {string} type - 'success' | 'error'
 */
function showStatus(message, type) {
  statusDiv.textContent = message;
  statusDiv.className = `status ${type}`;
  statusDiv.style.display = 'block';

  // Auto-hide after 3 seconds for success, 5 seconds for errors
  const hideDelay = type === 'success' ? 3000 : 5000;
  setTimeout(() => {
    statusDiv.style.display = 'none';
  }, hideDelay);
}

/**
 * Clear all settings (for testing/reset)
 * Currently hidden, but useful for debugging
 */
async function clearAllSettings() {
  if (confirm('Are you sure you want to clear all settings? This cannot be undone.')) {
    try {
      await StorageManager.clearAllSettings();
      // Reset form
      apiKeyInput.value = '';
      personaSelect.value = 'Kind Teacher';
      goalsTextarea.value = '';
      showStatus('All settings cleared', 'success');
    } catch (error) {
      showStatus('Error clearing settings', 'error');
    }
  }
}

/**
 * Handle Enter key in API key input (save on Enter)
 */
function handleKeyPress(event) {
  if (event.key === 'Enter') {
    event.preventDefault();
    saveSettings();
  }
}

/**
 * Show/hide API key (toggle password visibility)
 */
function toggleAPIKeyVisibility() {
  if (apiKeyInput.type === 'password') {
    apiKeyInput.type = 'text';
  } else {
    apiKeyInput.type = 'password';
  }
}

// Event listeners
saveBtn.addEventListener('click', saveSettings);
apiKeyInput.addEventListener('keypress', handleKeyPress);

// Add storage change listener (updates UI if settings change in another tab)
StorageManager.onStorageChange((changes) => {
  console.log('[MarginMuse] Settings changed in another context:', changes);
  // Reload settings to stay in sync
  loadSettings();
});

// Load settings when popup opens
document.addEventListener('DOMContentLoaded', () => {
  loadSettings();
});

// Also load immediately if DOM is already ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadSettings);
} else {
  loadSettings();
}

console.log('[MarginMuse] Popup initialized');
