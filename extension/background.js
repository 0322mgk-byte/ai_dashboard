// AI Credits Dashboard - Background Service Worker

const ALARM_NAME = 'autoRefreshCredits';
const DEFAULT_REFRESH_INTERVAL = 30; // 30 minutes

// Initialize storage and alarm on install
chrome.runtime.onInstalled.addListener(async (details) => {
  console.log('[AI Credits Dashboard] Extension installed/updated');

  if (details.reason === 'install') {
    // Initialize default storage structure
    const defaultData = {
      services: {},
      settings: {
        notifications: true,
        lowCreditThreshold: 100,
        autoRefreshEnabled: true,
        autoRefreshInterval: DEFAULT_REFRESH_INTERVAL // minutes
      }
    };

    await chrome.storage.local.set(defaultData);
    console.log('[AI Credits Dashboard] Default settings initialized');
  }

  // Setup auto-refresh alarm
  await setupAutoRefreshAlarm();
});

// Setup auto-refresh alarm
async function setupAutoRefreshAlarm() {
  try {
    const result = await chrome.storage.local.get(['settings']);
    const settings = result.settings || {};

    // Clear existing alarm
    await chrome.alarms.clear(ALARM_NAME);

    if (settings.autoRefreshEnabled !== false) {
      const interval = settings.autoRefreshInterval || DEFAULT_REFRESH_INTERVAL;

      // Create alarm that fires periodically
      chrome.alarms.create(ALARM_NAME, {
        delayInMinutes: interval, // First trigger after interval
        periodInMinutes: interval // Then repeat every interval
      });

      console.log(`[AI Credits Dashboard] Auto-refresh alarm set for every ${interval} minutes`);
    } else {
      console.log('[AI Credits Dashboard] Auto-refresh is disabled');
    }
  } catch (error) {
    console.error('[AI Credits Dashboard] Error setting up alarm:', error);
  }
}

// Listen for alarm events
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === ALARM_NAME) {
    console.log('[AI Credits Dashboard] Auto-refresh triggered');
    await refreshAllServices();
  }
});

// Listen for messages from content scripts and popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('[AI Credits Dashboard] Message received:', message.type, message);

  if (message.type === 'CREDITS_UPDATED') {
    handleCreditsUpdate(message.data);
    sendResponse({ success: true });
  }

  if (message.type === 'GET_CREDITS') {
    getCredits().then(sendResponse);
    return true;
  }

  if (message.type === 'REFRESH_ALL') {
    console.log('[AI Credits Dashboard] REFRESH_ALL received, starting refresh...');
    refreshAllServices().then((result) => {
      console.log('[AI Credits Dashboard] REFRESH_ALL completed:', result);
      sendResponse(result);
    });
    return true;
  }

  if (message.type === 'UPDATE_ALARM_SETTINGS') {
    setupAutoRefreshAlarm().then(() => {
      sendResponse({ success: true });
    });
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

// Service configurations for refresh
const SERVICE_CONFIGS = [
  {
    url: 'https://app.klingai.com/global/membership/membership-plan',
    scriptFile: 'content-scripts/kling.js'
  },
  {
    url: 'https://one.google.com/ai/activity?utm_source=flow',
    scriptFile: 'content-scripts/flow.js'
  },
  {
    url: 'https://create.wan.video/my-member-and-credit',
    scriptFile: 'content-scripts/wan.js'
  }
];

// Refresh all services by opening tabs and forcing script execution
async function refreshAllServices() {
  console.log('[AI Credits Dashboard] Starting refresh for all services...');

  try {
    for (const service of SERVICE_CONFIGS) {
      await refreshService(service);
    }

    return { success: true, message: 'Refresh initiated' };
  } catch (error) {
    console.error('[AI Credits Dashboard] Error refreshing services:', error);
    return { success: false, error: error.message };
  }
}

// Refresh a single service
async function refreshService(service) {
  return new Promise(async (resolve) => {
    try {
      // Create tab
      const tab = await chrome.tabs.create({ url: service.url, active: false });
      console.log(`[AI Credits Dashboard] Created tab ${tab.id} for ${service.url}`);

      // Listen for tab to complete loading
      const onUpdated = async (tabId, changeInfo) => {
        if (tabId === tab.id && changeInfo.status === 'complete') {
          chrome.tabs.onUpdated.removeListener(onUpdated);

          // Wait a bit for page to render dynamic content
          setTimeout(async () => {
            try {
              // Force execute content script
              await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                files: [service.scriptFile]
              });
              console.log(`[AI Credits Dashboard] Script executed on tab ${tab.id}`);

              // Wait for script to extract data (kling.js waits 5s, so we wait 8s total)
              setTimeout(() => {
                chrome.tabs.remove(tab.id).catch(() => {});
                console.log(`[AI Credits Dashboard] Closed tab ${tab.id}`);
                resolve();
              }, 8000);
            } catch (err) {
              console.error(`[AI Credits Dashboard] Script execution error:`, err);
              chrome.tabs.remove(tab.id).catch(() => {});
              resolve();
            }
          }, 3000);
        }
      };

      chrome.tabs.onUpdated.addListener(onUpdated);

      // Timeout fallback - close tab after 20 seconds regardless
      setTimeout(() => {
        chrome.tabs.onUpdated.removeListener(onUpdated);
        chrome.tabs.remove(tab.id).catch(() => {});
        resolve();
      }, 20000);

    } catch (error) {
      console.error(`[AI Credits Dashboard] Error refreshing ${service.url}:`, error);
      resolve();
    }
  });
}

// Initialize alarm on service worker startup (browser restart)
setupAutoRefreshAlarm();

console.log('[AI Credits Dashboard] Background service worker initialized');
