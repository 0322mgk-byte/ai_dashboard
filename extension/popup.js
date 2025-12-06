// Service configurations
const SERVICES = {
  kling: {
    id: 'kling',
    name: 'Kling AI',
    url: 'https://app.klingai.com/global/membership/membership-plan',
    color: 'kling'
  },
  flow: {
    id: 'flow',
    name: 'Google Flow',
    url: 'https://one.google.com/ai/activity?utm_source=flow',
    color: 'flow'
  }
};

// DOM Elements
const servicesGrid = document.getElementById('servicesGrid');
const emptyState = document.getElementById('emptyState');
const refreshBtn = document.getElementById('refreshBtn');
const settingsBtn = document.getElementById('settingsBtn');
const lastUpdateEl = document.getElementById('lastUpdate');
const toastContainer = document.getElementById('toastContainer');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  loadCredits();
  setupEventListeners();
});

// Load credits from storage
async function loadCredits() {
  try {
    const result = await chrome.storage.local.get(['services']);
    const services = result.services || {};

    renderServices(services);
    updateLastUpdate(services);
  } catch (error) {
    console.error('Failed to load credits:', error);
    showToast('크레딧 정보를 불러올 수 없습니다', 'error');
  }
}

// Render service cards
function renderServices(services) {
  const hasData = Object.keys(services).some(key => services[key]?.credits !== undefined);

  if (!hasData) {
    servicesGrid.innerHTML = '';
    emptyState.classList.remove('hidden');
    return;
  }

  emptyState.classList.add('hidden');
  servicesGrid.innerHTML = '';

  Object.entries(SERVICES).forEach(([key, config]) => {
    const serviceData = services[key];
    const card = createServiceCard(config, serviceData);
    servicesGrid.appendChild(card);
  });
}

// Format expiry date to unified format "YYYY년 MM월 DD일"
function formatExpiryDate(dateStr) {
  if (!dateStr) return null;

  // Handle various date formats
  let year, month, day;

  // Format: "2026/01/04" or "2026-01-04"
  const slashMatch = dateStr.match(/(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/);
  if (slashMatch) {
    year = slashMatch[1];
    month = slashMatch[2].padStart(2, '0');
    day = slashMatch[3].padStart(2, '0');
    return `${year}년 ${month}월 ${day}일`;
  }

  // Format: "1월 15일" (needs current year)
  const monthDayMatch = dateStr.match(/(\d{1,2})월\s*(\d{1,2})일/);
  if (monthDayMatch) {
    const now = new Date();
    year = now.getFullYear();
    month = monthDayMatch[1].padStart(2, '0');
    day = monthDayMatch[2].padStart(2, '0');
    // If the date is in the past, assume next year
    const expiryDate = new Date(year, parseInt(month) - 1, parseInt(day));
    if (expiryDate < now) {
      year = year + 1;
    }
    return `${year}년 ${month}월 ${day}일`;
  }

  return dateStr;
}

// Create service card element
function createServiceCard(config, data) {
  const card = document.createElement('div');
  card.className = 'service-card';

  const credits = data?.credits ?? 0;
  const lastUpdated = data?.lastUpdated ? formatTime(data.lastUpdated) : '데이터 없음';

  // Get expiry date (kling uses expiryDate, flow uses resetDate)
  const rawExpiryDate = data?.expiryDate || data?.resetDate;
  const expiryDate = formatExpiryDate(rawExpiryDate);

  card.innerHTML = `
    <div class="service-header clickable-header" data-url="${config.url}">
      <div class="service-logo-placeholder ${config.color}" title="클릭하여 이동">
        ${config.name.charAt(0)}
      </div>
      <div class="service-info">
        <div class="service-name">
          ${config.name}
          <svg class="external-link" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3"/>
          </svg>
        </div>
        <div class="service-subtitle">클릭하여 이동</div>
      </div>
      <span class="credit-badge">${credits.toLocaleString()} 크레딧</span>
    </div>

    <div class="expiry-info">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
        <line x1="16" y1="2" x2="16" y2="6"/>
        <line x1="8" y1="2" x2="8" y2="6"/>
        <line x1="3" y1="10" x2="21" y2="10"/>
      </svg>
      <span>만료: ${expiryDate || '정보 없음'}</span>
    </div>

    <div class="update-time">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"/>
        <polyline points="12 6 12 12 16 14"/>
      </svg>
      ${lastUpdated}
    </div>
  `;

  // Add click event listener for the header (logo + service name area)
  const header = card.querySelector('.clickable-header');
  header.addEventListener('click', () => {
    chrome.tabs.create({ url: config.url });
  });

  return card;
}

// Get status based on percentage
function getStatus(percentage) {
  if (percentage >= 50) return 'high';
  if (percentage >= 20) return 'medium';
  return 'low';
}

// Format time
function formatTime(timestamp) {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = Math.floor((now - date) / 1000);

  if (diff < 60) return '방금 전';
  if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;

  return date.toLocaleDateString('ko-KR', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Update last update time in footer
function updateLastUpdate(services) {
  let latestUpdate = null;

  Object.values(services).forEach(service => {
    if (service?.lastUpdated) {
      const date = new Date(service.lastUpdated);
      if (!latestUpdate || date > latestUpdate) {
        latestUpdate = date;
      }
    }
  });

  lastUpdateEl.textContent = latestUpdate ? formatTime(latestUpdate) : '-';
}

// Setup event listeners
function setupEventListeners() {
  // Refresh button
  refreshBtn.addEventListener('click', handleRefresh);

  // Settings button
  settingsBtn.addEventListener('click', () => {
    showToast('설정 기능은 준비 중입니다', 'info');
  });

  // Listen for storage changes
  chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'local' && changes.services) {
      loadCredits();
      showToast('크레딧 정보가 업데이트되었습니다', 'success');
    }
  });
}

// Handle refresh
async function handleRefresh() {
  refreshBtn.classList.add('loading');

  try {
    // Open service tabs in background to trigger content scripts
    const urls = Object.values(SERVICES).map(s => s.url);

    for (const url of urls) {
      const tab = await chrome.tabs.create({ url, active: false });

      // Close tab after 5 seconds
      setTimeout(() => {
        chrome.tabs.remove(tab.id).catch(() => {});
      }, 5000);
    }

    showToast('크레딧 정보를 업데이트 중입니다...', 'info');

    // Reload credits after delay
    setTimeout(() => {
      loadCredits();
      refreshBtn.classList.remove('loading');
    }, 6000);

  } catch (error) {
    console.error('Refresh failed:', error);
    showToast('새로고침에 실패했습니다', 'error');
    refreshBtn.classList.remove('loading');
  }
}

// Show toast notification
function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      ${type === 'success' ? '<path d="M22 11.08V12a10 10 0 11-5.93-9.14M22 4L12 14.01l-3-3"/>' : ''}
      ${type === 'error' ? '<circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>' : ''}
      ${type === 'info' ? '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>' : ''}
    </svg>
    ${message}
  `;

  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}
