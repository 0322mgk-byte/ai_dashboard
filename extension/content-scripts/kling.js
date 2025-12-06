// Kling AI Credit Extractor
// URL: https://app.klingai.com/global/user-profile

(function() {
  'use strict';

  const SERVICE_ID = 'kling';
  const SERVICE_NAME = 'Kling AI';

  // Check if extension context is valid
  function isExtensionValid() {
    try {
      return chrome.runtime && chrome.runtime.id;
    } catch (e) {
      return false;
    }
  }

  // Extract credits from page
  async function extractCredits() {
    if (!isExtensionValid()) {
      console.log(`[${SERVICE_NAME}] Extension context invalidated, stopping.`);
      return null;
    }

    try {
      // Wait for the page to load
      await new Promise(resolve => setTimeout(resolve, 3000));

      let credits = null;

      console.log(`[${SERVICE_NAME}] Searching for credits on ${location.href}...`);

      // Method 1: Look for "크레딧 명세" popup content (남은 크레딧: 31)
      const popupText = document.body.innerText;
      const remainingMatch = popupText.match(/남은\s*크레딧[:\s]*(\d+)/);
      if (remainingMatch) {
        credits = parseInt(remainingMatch[1], 10);
        console.log(`[${SERVICE_NAME}] Found remaining credits from popup: ${credits}`);
      }

      // Method 2: Look for credit display in profile page
      // The profile page shows "멤버십 플랜" and "크레딧" tabs
      if (credits === null) {
        // Find elements containing "크레딧" text
        const allElements = document.querySelectorAll('*');
        for (const el of allElements) {
          const text = (el.textContent || '').trim();

          // Look for standalone small numbers near credit-related text
          if (text === '크레딧' || text.includes('크레딧')) {
            // Check parent and siblings for numbers
            const parent = el.parentElement;
            if (parent) {
              const siblings = parent.querySelectorAll('*');
              for (const sib of siblings) {
                const sibText = (sib.textContent || '').trim();
                if (/^\d{1,4}$/.test(sibText)) {
                  const num = parseInt(sibText, 10);
                  if (num >= 0 && num <= 9999) {
                    credits = num;
                    console.log(`[${SERVICE_NAME}] Found credits near 크레딧 text: ${credits}`);
                    break;
                  }
                }
              }
            }
          }
          if (credits !== null) break;
        }
      }

      // Method 3: Search for patterns in page text
      if (credits === null) {
        const patterns = [
          /남은\s*크레딧[:\s=]*(\d+)/gi,
          /잔여\s*크레딧[:\s=]*(\d+)/gi,
          /(\d+)\s*크레딧\s*남/gi,
          /크레딧\s*증정[:\s]*(\d+)/gi,
        ];

        for (const pattern of patterns) {
          const match = popupText.match(pattern);
          if (match) {
            const numMatch = match[0].match(/(\d+)/);
            if (numMatch) {
              credits = parseInt(numMatch[1], 10);
              console.log(`[${SERVICE_NAME}] Found credits via pattern: ${credits}`);
              break;
            }
          }
        }
      }

      // Method 4: Find credit-related class names
      if (credits === null) {
        const creditSelectors = [
          '[class*="credit"]',
          '[class*="Credit"]',
          '[class*="point"]',
          '[class*="balance"]',
          '[class*="coin"]'
        ];

        for (const selector of creditSelectors) {
          try {
            const elements = document.querySelectorAll(selector);
            for (const el of elements) {
              const text = (el.textContent || '').trim();
              const numMatch = text.match(/^(\d{1,4})$/);
              if (numMatch) {
                credits = parseInt(numMatch[1], 10);
                console.log(`[${SERVICE_NAME}] Found credits from selector ${selector}: ${credits}`);
                break;
              }
            }
          } catch (e) {}
          if (credits !== null) break;
        }
      }

      if (credits !== null) {
        await saveCredits(credits);
        return credits;
      } else {
        console.log(`[${SERVICE_NAME}] Could not find credit information`);
        console.log(`[${SERVICE_NAME}] Tip: Open the 크레딧 명세 popup on the profile page`);
        return null;
      }

    } catch (error) {
      console.error(`[${SERVICE_NAME}] Error extracting credits:`, error);
      return null;
    }
  }

  // Save credits to Chrome storage
  async function saveCredits(credits) {
    if (!isExtensionValid()) {
      console.log(`[${SERVICE_NAME}] Extension context invalidated, cannot save.`);
      return;
    }

    try {
      const result = await chrome.storage.local.get(['services']);
      const services = result.services || {};

      const previousCredits = services[SERVICE_ID]?.credits;
      const history = services[SERVICE_ID]?.history || [];

      if (previousCredits !== credits) {
        history.push({
          timestamp: new Date().toISOString(),
          credits: credits
        });

        const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
        const filteredHistory = history.filter(h =>
          new Date(h.timestamp).getTime() > thirtyDaysAgo
        );

        services[SERVICE_ID] = {
          name: SERVICE_NAME,
          credits: credits,
          lastUpdated: new Date().toISOString(),
          history: filteredHistory.slice(-100)
        };

        await chrome.storage.local.set({ services });
        console.log(`[${SERVICE_NAME}] Credits saved: ${credits}`);
      } else {
        services[SERVICE_ID] = {
          ...services[SERVICE_ID],
          lastUpdated: new Date().toISOString()
        };
        await chrome.storage.local.set({ services });
        console.log(`[${SERVICE_NAME}] Credits unchanged: ${credits}`);
      }

    } catch (error) {
      if (error.message?.includes('Extension context invalidated')) {
        console.log(`[${SERVICE_NAME}] Extension was reloaded, stopping script.`);
      } else {
        console.error(`[${SERVICE_NAME}] Error saving credits:`, error);
      }
    }
  }

  // Initialize
  function init() {
    if (!isExtensionValid()) return;

    console.log(`[${SERVICE_NAME}] Content script loaded on ${location.href}`);

    // Extract credits after page loads
    if (document.readyState === 'complete') {
      extractCredits();
    } else {
      window.addEventListener('load', () => {
        setTimeout(extractCredits, 2000);
      });
    }

    // Re-extract on DOM changes (for popup detection)
    let debounceTimer;
    const observer = new MutationObserver(() => {
      if (!isExtensionValid()) {
        observer.disconnect();
        return;
      }
      // Debounce to avoid too many calls
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        // Check if 크레딧 명세 popup is visible
        if (document.body.innerText.includes('남은 크레딧') ||
            document.body.innerText.includes('크레딧 명세')) {
          extractCredits();
        }
      }, 1000);
    });

    observer.observe(document.body, { childList: true, subtree: true });

    // Periodic re-check every 30 seconds
    const intervalId = setInterval(() => {
      if (!isExtensionValid()) {
        clearInterval(intervalId);
        return;
      }
      extractCredits();
    }, 30000);
  }

  init();
})();
