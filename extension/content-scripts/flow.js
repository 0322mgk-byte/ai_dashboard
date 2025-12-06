// Google Flow Credit Extractor
// URLs: https://labs.google/fx/ko/tools/flow, https://one.google.com/ai/activity

(function() {
  'use strict';

  const SERVICE_ID = 'flow';
  const SERVICE_NAME = 'Google Flow';

  // Extract credits from page
  async function extractCredits() {
    try {
      // Wait for the page to fully load
      await new Promise(resolve => setTimeout(resolve, 3000));

      let credits = null;
      let resetDate = null;

      console.log(`[${SERVICE_NAME}] Searching for credits on ${location.href}...`);

      // Check if we're on the Google One AI activity page
      if (location.href.includes('one.google.com/ai')) {
        const pageText = document.body.innerText;

        // Extract reset date first - "다음 업데이트: 12월 11일" pattern
        const resetPatterns = [
          /다음\s*업데이트[:\s]*(\d{1,2})월\s*(\d{1,2})일/,
          /Next\s*update[:\s]*(\w+)\s+(\d{1,2})/i
        ];

        for (const pattern of resetPatterns) {
          const match = pageText.match(pattern);
          if (match) {
            resetDate = `${match[1]}월 ${match[2]}일`;
            console.log(`[${SERVICE_NAME}] Found reset date: ${resetDate}`);
            break;
          }
        }

        // Look for "월간 AI 크레딧" section - the large number (560)
        const allElements = document.querySelectorAll('*');

        for (const el of allElements) {
          const text = el.textContent || '';

          // Find the element containing "월간 AI 크레딧" or "Monthly AI credits"
          if (text.includes('월간 AI 크레딧') || text.includes('Monthly AI')) {
            // Look for a large number nearby (direct child or sibling)
            const parent = el.closest('div');
            if (parent) {
              const numbers = parent.querySelectorAll('*');
              for (const numEl of numbers) {
                const numText = (numEl.textContent || '').trim();
                // Match standalone numbers like "560"
                if (/^\d{1,5}$/.test(numText)) {
                  const num = parseInt(numText, 10);
                  if (num > 0 && num <= 10000) {
                    credits = num;
                    console.log(`[${SERVICE_NAME}] Found monthly credits: ${credits}`);
                    break;
                  }
                }
              }
            }
            if (credits !== null) break;
          }
        }

        // Alternative: Find large standalone numbers in the page
        if (credits === null) {
          const candidates = [];
          document.querySelectorAll('div, span, p').forEach(el => {
            const text = (el.textContent || '').trim();
            // Look for standalone 3-digit numbers (likely credit amounts)
            if (/^\d{2,4}$/.test(text)) {
              const num = parseInt(text, 10);
              if (num >= 10 && num <= 10000) {
                candidates.push({ el, num, html: el.outerHTML.substring(0, 100) });
              }
            }
          });

          console.log(`[${SERVICE_NAME}] Credit candidates:`, candidates);

          // Take the first reasonable candidate (usually the monthly credits)
          if (candidates.length > 0) {
            credits = candidates[0].num;
            console.log(`[${SERVICE_NAME}] Using first candidate: ${credits}`);
          }
        }
      }

      // Check if we're on labs.google (Flow page with profile menu)
      if (location.href.includes('labs.google')) {
        // Look for credit text in profile menu or page
        const bodyText = document.body.innerText;

        // Pattern: "560 AI 크레딧" or similar
        const patterns = [
          /(\d{1,5})\s*AI\s*크레딧/i,
          /(\d{1,5})\s*AI\s*credits?/i,
          /AI\s*크레딧[:\s]*(\d{1,5})/i,
          /AI\s*credits?[:\s]*(\d{1,5})/i
        ];

        for (const pattern of patterns) {
          const match = bodyText.match(pattern);
          if (match) {
            credits = parseInt(match[1], 10);
            console.log(`[${SERVICE_NAME}] Found credits in labs.google: ${credits}`);
            break;
          }
        }
      }

      if (credits !== null) {
        await saveCredits(credits, resetDate);
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
  async function saveCredits(credits, resetDate = null) {
    try {
      const result = await chrome.storage.local.get(['services']);
      const services = result.services || {};

      const previousCredits = services[SERVICE_ID]?.credits;
      const history = services[SERVICE_ID]?.history || [];

      // Add to history if credits changed
      if (previousCredits !== credits) {
        history.push({
          timestamp: new Date().toISOString(),
          credits: credits
        });

        // Keep only last 30 days of history
        const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
        const filteredHistory = history.filter(h =>
          new Date(h.timestamp).getTime() > thirtyDaysAgo
        );

        services[SERVICE_ID] = {
          name: SERVICE_NAME,
          credits: credits,
          resetDate: resetDate,
          lastUpdated: new Date().toISOString(),
          history: filteredHistory.slice(-100)
        };

        await chrome.storage.local.set({ services });
        console.log(`[${SERVICE_NAME}] Credits saved: ${credits}`);
      } else {
        services[SERVICE_ID] = {
          ...services[SERVICE_ID],
          resetDate: resetDate || services[SERVICE_ID]?.resetDate,
          lastUpdated: new Date().toISOString()
        };
        await chrome.storage.local.set({ services });
        console.log(`[${SERVICE_NAME}] Credits unchanged: ${credits}, resetDate: ${resetDate}`);
      }

    } catch (error) {
      console.error(`[${SERVICE_NAME}] Error saving credits:`, error);
    }
  }

  // Initialize
  function init() {
    console.log(`[${SERVICE_NAME}] Content script loaded on ${location.href}`);

    // Extract credits after page loads
    if (document.readyState === 'complete') {
      extractCredits();
    } else {
      window.addEventListener('load', () => {
        setTimeout(extractCredits, 2000);
      });
    }

    // Re-extract on DOM changes (for SPA or dynamic content)
    let debounceTimer;
    new MutationObserver(() => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(extractCredits, 2000);
    }).observe(document.body, { childList: true, subtree: true });
  }

  init();
})();
