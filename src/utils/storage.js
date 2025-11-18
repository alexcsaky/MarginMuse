/**
 * Margin Muse - Storage Manager
 *
 * Wrapper around Chrome Storage API for settings management.
 * Provides type-safe getters and setters with defaults.
 */

/**
 * Chrome Storage wrapper for Margin Muse settings
 * All methods are static - no need to instantiate
 */
class StorageManager {
  // Storage keys (prefixed with mm_ to avoid conflicts)
  static KEYS = {
    API_KEY: 'mm_api_key',
    PERSONA: 'mm_persona',
    GOALS: 'mm_goals'
  };

  // Default values
  static DEFAULTS = {
    persona: 'Kind Teacher',
    goals: ''
  };

  // Valid persona options
  static VALID_PERSONAS = ['Kind Teacher', 'Oxford Professor', 'Socrates'];

  /**
   * Get all settings from storage
   * Returns defaults for any missing values
   * @returns {Promise<Object>} Settings object
   */
  static async getSettings() {
    try {
      return new Promise((resolve) => {
        chrome.storage.local.get(
          [this.KEYS.API_KEY, this.KEYS.PERSONA, this.KEYS.GOALS],
          (result) => {
            // Check for errors
            if (chrome.runtime.lastError) {
              console.error('[MarginMuse] Storage error:', chrome.runtime.lastError);
              resolve(this._getDefaultSettings());
              return;
            }

            // Return settings with defaults for missing values
            const settings = {
              apiKey: result[this.KEYS.API_KEY] || '',
              persona: result[this.KEYS.PERSONA] || this.DEFAULTS.persona,
              goals: result[this.KEYS.GOALS] || this.DEFAULTS.goals
            };

            console.log('[MarginMuse] Settings loaded:', {
              hasApiKey: !!settings.apiKey,
              persona: settings.persona,
              hasGoals: !!settings.goals
            });

            resolve(settings);
          }
        );
      });
    } catch (error) {
      console.error('[MarginMuse] Error getting settings:', error);
      return this._getDefaultSettings();
    }
  }

  /**
   * Get default settings (fallback)
   * @returns {Object} Default settings
   * @private
   */
  static _getDefaultSettings() {
    return {
      apiKey: '',
      persona: this.DEFAULTS.persona,
      goals: this.DEFAULTS.goals
    };
  }

  /**
   * Save API key to storage
   * @param {string} apiKey - Claude API key
   * @returns {Promise<void>}
   */
  static async saveAPIKey(apiKey) {
    if (typeof apiKey !== 'string') {
      throw new Error('API key must be a string');
    }

    try {
      await this._setStorageValue(this.KEYS.API_KEY, apiKey.trim());
      console.log('[MarginMuse] API key saved');
    } catch (error) {
      console.error('[MarginMuse] Error saving API key:', error);
      throw error;
    }
  }

  /**
   * Save persona to storage
   * @param {string} persona - Persona name
   * @returns {Promise<void>}
   */
  static async savePersona(persona) {
    // Validate persona
    if (!this.VALID_PERSONAS.includes(persona)) {
      console.warn(`[MarginMuse] Invalid persona "${persona}", using default`);
      persona = this.DEFAULTS.persona;
    }

    try {
      await this._setStorageValue(this.KEYS.PERSONA, persona);
      console.log(`[MarginMuse] Persona saved: ${persona}`);
    } catch (error) {
      console.error('[MarginMuse] Error saving persona:', error);
      throw error;
    }
  }

  /**
   * Save writing goals to storage
   * @param {string} goals - User's writing goals
   * @returns {Promise<void>}
   */
  static async saveGoals(goals) {
    if (typeof goals !== 'string') {
      throw new Error('Goals must be a string');
    }

    try {
      await this._setStorageValue(this.KEYS.GOALS, goals.trim());
      console.log('[MarginMuse] Writing goals saved');
    } catch (error) {
      console.error('[MarginMuse] Error saving goals:', error);
      throw error;
    }
  }

  /**
   * Save all settings at once
   * @param {Object} settings - {apiKey, persona, goals}
   * @returns {Promise<void>}
   */
  static async saveAllSettings(settings) {
    const promises = [];

    if (settings.apiKey !== undefined) {
      promises.push(this.saveAPIKey(settings.apiKey));
    }

    if (settings.persona !== undefined) {
      promises.push(this.savePersona(settings.persona));
    }

    if (settings.goals !== undefined) {
      promises.push(this.saveGoals(settings.goals));
    }

    await Promise.all(promises);
    console.log('[MarginMuse] All settings saved');
  }

  /**
   * Check if API key is configured
   * @returns {Promise<boolean>} True if API key exists and is not empty
   */
  static async hasAPIKey() {
    const settings = await this.getSettings();
    const hasKey = !!(settings.apiKey && settings.apiKey.length > 0);

    console.log(`[MarginMuse] Has API key: ${hasKey}`);
    return hasKey;
  }

  /**
   * Get just the API key
   * @returns {Promise<string>} API key or empty string
   */
  static async getAPIKey() {
    const settings = await this.getSettings();
    return settings.apiKey;
  }

  /**
   * Get just the persona
   * @returns {Promise<string>} Persona name
   */
  static async getPersona() {
    const settings = await this.getSettings();
    return settings.persona;
  }

  /**
   * Get just the writing goals
   * @returns {Promise<string>} Writing goals
   */
  static async getGoals() {
    const settings = await this.getSettings();
    return settings.goals;
  }

  /**
   * Clear all settings (useful for testing/reset)
   * @returns {Promise<void>}
   */
  static async clearAllSettings() {
    return new Promise((resolve, reject) => {
      chrome.storage.local.remove(
        [this.KEYS.API_KEY, this.KEYS.PERSONA, this.KEYS.GOALS],
        () => {
          if (chrome.runtime.lastError) {
            console.error('[MarginMuse] Error clearing settings:', chrome.runtime.lastError);
            reject(chrome.runtime.lastError);
          } else {
            console.log('[MarginMuse] All settings cleared');
            resolve();
          }
        }
      );
    });
  }

  /**
   * Listen for storage changes
   * @param {Function} callback - Called when settings change: callback(changes, areaName)
   */
  static onStorageChange(callback) {
    chrome.storage.onChanged.addListener((changes, areaName) => {
      if (areaName === 'local') {
        // Filter to only our keys
        const relevantChanges = {};
        for (const key of Object.values(this.KEYS)) {
          if (changes[key]) {
            relevantChanges[key] = changes[key];
          }
        }

        if (Object.keys(relevantChanges).length > 0) {
          console.log('[MarginMuse] Settings changed:', relevantChanges);
          callback(relevantChanges, areaName);
        }
      }
    });
  }

  /**
   * Helper to set a storage value with Promise wrapper
   * @param {string} key - Storage key
   * @param {*} value - Value to store
   * @returns {Promise<void>}
   * @private
   */
  static _setStorageValue(key, value) {
    return new Promise((resolve, reject) => {
      chrome.storage.local.set({ [key]: value }, () => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve();
        }
      });
    });
  }

  /**
   * Get storage usage information
   * @returns {Promise<Object>} {bytesInUse, quota}
   */
  static async getStorageInfo() {
    return new Promise((resolve) => {
      chrome.storage.local.getBytesInUse(null, (bytesInUse) => {
        resolve({
          bytesInUse,
          quota: chrome.storage.local.QUOTA_BYTES || 10485760, // 10MB default
          percentUsed: ((bytesInUse / (chrome.storage.local.QUOTA_BYTES || 10485760)) * 100).toFixed(2)
        });
      });
    });
  }

  /**
   * Log storage info to console (debugging)
   */
  static async logStorageInfo() {
    const info = await this.getStorageInfo();
    console.log('[MarginMuse] Storage info:', info);
  }
}

// Export for use in other scripts
// Note: Since we're not using a module bundler yet, this will be available globally
if (typeof window !== 'undefined') {
  window.StorageManager = StorageManager;
}
