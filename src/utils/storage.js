/**
 * Margin Muse - Storage Manager
 *
 * Wrapper around Chrome Storage API for settings management.
 *
 * TODO Phase 1:
 * - Implement StorageManager class
 * - Implement getSettings()
 * - Implement save methods for each setting
 * - Add proper error handling
 */

/**
 * Chrome Storage wrapper for Margin Muse settings
 * TODO: Implement full class
 */
class StorageManager {
  static KEYS = {
    API_KEY: 'mm_api_key',
    PERSONA: 'mm_persona',
    GOALS: 'mm_goals'
  };

  static DEFAULTS = {
    persona: 'Kind Teacher',
    goals: ''
  };

  /**
   * Get all settings
   * @returns {Promise<Object>}
   *
   * TODO: Implement
   */
  static async getSettings() {
    // TODO: Use chrome.storage.local.get()
    // TODO: Return settings with defaults
    return {
      apiKey: '',
      persona: this.DEFAULTS.persona,
      goals: this.DEFAULTS.goals
    };
  }

  /**
   * Save API key
   * @param {string} apiKey
   *
   * TODO: Implement
   */
  static async saveAPIKey(apiKey) {
    // TODO: Use chrome.storage.local.set()
  }

  /**
   * Save persona
   * @param {string} persona
   *
   * TODO: Implement
   */
  static async savePersona(persona) {
    // TODO: Use chrome.storage.local.set()
  }

  /**
   * Save writing goals
   * @param {string} goals
   *
   * TODO: Implement
   */
  static async saveGoals(goals) {
    // TODO: Use chrome.storage.local.set()
  }

  /**
   * Check if API key is configured
   * @returns {Promise<boolean>}
   *
   * TODO: Implement
   */
  static async hasAPIKey() {
    const settings = await this.getSettings();
    return settings.apiKey && settings.apiKey.length > 0;
  }
}

// TODO: Export when implementing module system
// export default StorageManager;
