// WAN AI Credit Extractor
// URL: https://create.wan.video/my-member-and-credit

(function() {
  'use strict';

  const SERVICE_ID = 'wan';
  const SERVICE_NAME = 'WAN AI';

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
      let expiryDate = null;

      console.log(`[${SERVICE_NAME}] Searching for credits on ${location.href}...`);
      console.log(`[${SERVICE_NAME}] Page text sample:`, document.body.innerText.substring(0, 1000));

      // Method 1: Look for "Credits" or "크레딧" text and find nearby number
      const allElements = document.querySelectorAll('*');
      for (const el of allElements) {
        const text = el.textContent || '';

        // Look for credit-related text patterns
        if (text.match(/credits?|크레딧|point|포인트/i)) {
          // Check if this element or its children contain a number
          const numberMatch = text.match(/(\d+)\s*(credits?|크레딧|point|포인트)/i);
          if (numberMatch) {
            credits = parseInt(numberMatch[1], 10);
            console.log(`[${SERVICE_NAME}] Found credits via text pattern: ${credits}`);
            break;
          }
        }
      }

      // Method 2: Look for font elements with data-spm-anchor-id attribute (WAN specific)
      if (credits === null) {
        const fontElements = document.querySelectorAll('font[data-spm-anchor-id]');
        for (const el of fontElements) {
          const text = (el.textContent || '').trim();
          if (/^\d+$/.test(text)) {
            credits = parseInt(text, 10);
            console.log(`[${SERVICE_NAME}] Found credits via font[data-spm-anchor-id]: ${credits}`);
            break;
          }
        }
      }

      // Method 3: Look for any element containing just a number (likely credit count)
      if (credits === null) {
        const candidates = document.querySelectorAll('span, div, p, font, strong, b');
        for (const el of candidates) {
          // Only check direct text content (not nested)
          const directText = Array.from(el.childNodes)
            .filter(node => node.nodeType === Node.TEXT_NODE)
            .map(node => node.textContent.trim())
            .join('');

          if (/^\d+$/.test(directText)) {
            const num = parseInt(directText, 10);
            if (num >= 0 && num <= 100000) {
              credits = num;
              console.log(`[${SERVICE_NAME}] Found credits via standalone number: ${credits}`);
              break;
            }
          }
        }
      }

      // Method 4: Look for expiry/validity date
      const bodyText = document.body.innerText;

      // Month name mapping
      const monthMap = {
        'jan': '01', 'feb': '02', 'mar': '03', 'apr': '04',
        'may': '05', 'jun': '06', 'jul': '07', 'aug': '08',
        'sep': '09', 'oct': '10', 'nov': '11', 'dec': '12'
      };

      // Pattern 1: "Expires 07 Dec 2025" format (WAN specific)
      const expiresMatch = bodyText.match(/Expires?\s+(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{4})/i);
      if (expiresMatch) {
        const day = expiresMatch[1].padStart(2, '0');
        const month = monthMap[expiresMatch[2].toLowerCase()];
        const year = expiresMatch[3];
        expiryDate = `${year}/${month}/${day}`;
        console.log(`[${SERVICE_NAME}] Found expiry date (Expires DD Mon YYYY): ${expiryDate}`);
      }

      // Pattern 2: YYYY/MM/DD or YYYY-MM-DD
      if (!expiryDate) {
        const dateMatch = bodyText.match(/(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/);
        if (dateMatch) {
          expiryDate = `${dateMatch[1]}/${dateMatch[2].padStart(2, '0')}/${dateMatch[3].padStart(2, '0')}`;
          console.log(`[${SERVICE_NAME}] Found expiry date (YYYY/MM/DD): ${expiryDate}`);
        }
      }

      // Pattern 3: Valid until, 만료, 유효기간 followed by date
      if (!expiryDate) {
        const expiryMatch = bodyText.match(/(valid|expire|만료|유효)[^\d]*(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/i);
        if (expiryMatch) {
          expiryDate = `${expiryMatch[2]}/${expiryMatch[3].padStart(2, '0')}/${expiryMatch[4].padStart(2, '0')}`;
          console.log(`[${SERVICE_NAME}] Found expiry date via keyword: ${expiryDate}`);
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
        console.log(`[${SERVICE_NAME}] Credits saved: ${credits}, Expiry: ${expiryDate}`);
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
