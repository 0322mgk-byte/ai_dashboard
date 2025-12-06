// AI Credits Dashboard - Background Service Worker

// Initialize storage on install
chrome.runtime.onInstalled.addListener(async (details) => {
  console.log('[AI Credits Dashboard] Extension installed/updated');

  if (details.reason === 'install') {
    // Initialize default storage structure
    const defaultData = {
      services: {},
      settings: {
        notifications: true,
        lowCreditThreshold: 100,
        refreshInterval: 300000 // 5 minutes
      }
    };

    await chrome.storage.local.set(defaultData);
    console.log('[AI Credits Dashboard] Default settings initialized');
  }
});

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('[AI Credits Dashboard] Message received:', message);

  if (message.type === 'CREDITS_UPDATED') {
    handleCreditsUpdate(message.data);
    sendResponse({ success: true });
  }

  if (message.type === 'GET_CREDITS') {
    getCredits().then(sendResponse);
    return true; // Keep channel open for async response
  }

  if (message.type === 'REFRESH_ALL') {
    refreshAllServices().then(sendResponse);
    return true;
  }
});

// Handle credits update
async function handleCreditsUpdate(data) {
  const { serviceId, credits } = data;

  try {
    const result = await chrome.storage.local.get(['services', 'settings']);
    const services = result.services || {};
    const settings = result.settings || {};

    const previousCredits = services[serviceId]?.credits;

    // Check for low credit notification (log only, no notification API)
    if (settings.notifications && credits < settings.lowCreditThreshold) {
      console.log(`[AI Credits Dashboard] Low credits alert: ${services[serviceId]?.name || serviceId} has ${credits} credits`);
    }

    // Notify about significant drops
    if (previousCredits && (previousCredits - credits) > 50) {
      console.log(`[AI Credits Dashboard] Significant credit drop detected for ${serviceId}`);
    }

  } catch (error) {
    console.error('[AI Credits Dashboard] Error handling credits update:', error);
  }
}

// Get all credits
async function getCredits() {
  try {
    const result = await chrome.storage.local.get(['services']);
    return result.services || {};
  } catch (error) {
    console.error('[AI Credits Dashboard] Error getting credits:', error);
    return {};
  }
}

// Refresh all services by opening tabs
async function refreshAllServices() {
  const serviceUrls = [
    'https://app.klingai.com/global/user-profile/published/all',
    'https://one.google.com/ai/activity?utm_source=flow'
  ];

  try {
    for (const url of serviceUrls) {
      const tab = await chrome.tabs.create({ url, active: false });

      // Close tab after content script has time to run
      setTimeout(() => {
        chrome.tabs.remove(tab.id).catch(() => {});
      }, 5000);
    }

    return { success: true, message: 'Refresh initiated' };
  } catch (error) {
    console.error('[AI Credits Dashboard] Error refreshing services:', error);
    return { success: false, error: error.message };
  }
}

console.log('[AI Credits Dashboard] Background service worker initialized');
