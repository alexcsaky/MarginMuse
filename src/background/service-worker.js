/**
 * Margin Muse - Background Service Worker
 *
 * Minimal background script for Manifest V3.
 * Handles extension lifecycle events only.
 *
 * Note: In MVP, most logic is in content script to avoid
 * MV3 service worker limitations (ephemeral, can be killed).
 */

// Extension installation
chrome.runtime.onInstalled.addListener((details) => {
  console.log('[MarginMuse] Extension installed:', details.reason);

  if (details.reason === 'install') {
    // First-time installation
    console.log('[MarginMuse] First-time installation');
    // Could open onboarding page (future)
  } else if (details.reason === 'update') {
    // Extension updated
    console.log('[MarginMuse] Extension updated to version:', chrome.runtime.getManifest().version);
  }
});

// Handle messages from content script or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('[MarginMuse] Message received:', request);

  if (request.action === 'openSettings') {
    // Open settings popup
    chrome.runtime.openOptionsPage();
    sendResponse({ success: true });
  }

  return true; // Keep message channel open for async response
});

console.log('[MarginMuse] Service worker initialized');
