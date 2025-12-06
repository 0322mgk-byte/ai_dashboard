// Kling AI Credit Extractor
// URL: https://app.klingai.com/global/membership/membership-plan

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
      // Wait for the page to load - increased for background tabs
      await new Promise(resolve => setTimeout(resolve, 5000));

      let credits = null;
      let freeCredits = null;
      let expiryDate = null;

      const pageText = document.body.innerText;
      console.log(`[${SERVICE_NAME}] Searching for credits on ${location.href}...`);
      console.log(`[${SERVICE_NAME}] Page text sample (first 500 chars):`, pageText.substring(0, 500));

      // Method 1: Look for "남은 크레딧: 31" pattern on membership page
      const remainingMatch = pageText.match(/남은\s*크레딧[:\s]*(\d+)/);
      if (remainingMatch) {
        credits = parseInt(remainingMatch[1], 10);
        console.log(`[${SERVICE_NAME}] Found 남은 크레딧: ${credits}`);
      }

      // Method 2: Look for "무료 크레딧:31" pattern
      if (credits === null) {
        const freeMatch = pageText.match(/무료\s*크레딧[:\s]*(\d+)/);
        if (freeMatch) {
          freeCredits = parseInt(freeMatch[1], 10);
          credits = freeCredits;
          console.log(`[${SERVICE_NAME}] Found 무료 크레딧: ${credits}`);
        }
      }

      // Method 3: Look for expiry date patterns
      // Pattern 1: "2026/01/04에 만료" or "2026-01-04 만료"
      let expiryMatch = pageText.match(/(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})\s*에?\s*만료/);
      if (expiryMatch) {
        expiryDate = `${expiryMatch[1]}/${expiryMatch[2].padStart(2, '0')}/${expiryMatch[3].padStart(2, '0')}`;
        console.log(`[${SERVICE_NAME}] Found expiry date (pattern 1): ${expiryDate}`);
      }

      // Pattern 2: "만료: 2026/01/04" or standalone date near "만료"
      if (!expiryDate) {
        expiryMatch = pageText.match(/만료[:\s]*(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/);
        if (expiryMatch) {
          expiryDate = `${expiryMatch[1]}/${expiryMatch[2].padStart(2, '0')}/${expiryMatch[3].padStart(2, '0')}`;
          console.log(`[${SERVICE_NAME}] Found expiry date (pattern 2): ${expiryDate}`);
        }
      }

      // Pattern 3: Just find any date in format YYYY/MM/DD or YYYY-MM-DD on the page
      if (!expiryDate) {
        expiryMatch = pageText.match(/(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/);
        if (expiryMatch) {
          expiryDate = `${expiryMatch[1]}/${expiryMatch[2].padStart(2, '0')}/${expiryMatch[3].padStart(2, '0')}`;
          console.log(`[${SERVICE_NAME}] Found expiry date (pattern 3): ${expiryDate}`);
        }
      }

      // Method 4: Search for credit numbers near "크레딧" text
      if (credits === null) {
        // Find all elements and look for credit-related content
        const allText = document.body.innerText;
        const patterns = [
          /크레딧[:\s]*(\d+)/gi,
          /(\d+)\s*크레딧/gi,
        ];

        for (const pattern of patterns) {
          const matches = [...allText.matchAll(pattern)];
          for (const match of matches) {
            const num = parseInt(match[1], 10);
            if (num > 0 && num <= 10000) {
              credits = num;
              console.log(`[${SERVICE_NAME}] Found credits via pattern: ${credits}`);
              break;
            }
          }
          if (credits !== null) break;
        }
      }

      // Method 5: Look for standalone numbers in credit-related elements
      if (credits === null) {
        const elements = document.querySelectorAll('[class*="credit"], [class*="Credit"], [class*="point"], [class*="balance"]');
        for (const el of elements) {
          const text = (el.textContent || '').trim();
          const numMatch = text.match(/(\d+)/);
          if (numMatch) {
            const num = parseInt(numMatch[1], 10);
            if (num > 0 && num <= 10000) {
              credits = num;
              console.log(`[${SERVICE_NAME}] Found credits from element: ${credits}`);
              break;
            }
          }
        }
      }

      if (credits !== null) {
        await saveCredits(credits, expiryDate);
        return credits;
      } else {
        console.log(`[${SERVICE_NAME}] Could not find credit information`);
        return null;
      }

    } catch (error) {
      console.error(`[${SERVICE_NAME}] Error extracting credits:`, error);
      return null;
    }
  }

  // Save credits to Chrome storage
  async function saveCredits(credits, expiryDate = null) {
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
          expiryDate: expiryDate,
          lastUpdated: new Date().toISOString(),
          history: filteredHistory.slice(-100)
        };

        await chrome.storage.local.set({ services });
        console.log(`[${SERVICE_NAME}] Credits saved: ${credits}, expiry: ${expiryDate}`);
      } else {
        services[SERVICE_ID] = {
          ...services[SERVICE_ID],
          expiryDate: expiryDate || services[SERVICE_ID]?.expiryDate,
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

    // Re-extract on DOM changes
    let debounceTimer;
    const observer = new MutationObserver(() => {
      if (!isExtensionValid()) {
        observer.disconnect();
        return;
      }
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(extractCredits, 2000);
    });

    observer.observe(document.body, { childList: true, subtree: true });
  }

  init();
})();
