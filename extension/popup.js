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

// Create service card element
function createServiceCard(config, data) {
  const card = document.createElement('div');
  card.className = 'service-card';

  const credits = data?.credits ?? 0;
  const total = data?.total ?? credits;
  const used = data?.used ?? 0;
  const percentage = total > 0 ? Math.round((credits / total) * 100) : 0;
  const status = getStatus(percentage);
  const lastUpdated = data?.lastUpdated ? formatTime(data.lastUpdated) : '데이터 없음';

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
      <span class="credit-badge ${status}">${credits.toLocaleString()} 크레딧</span>
    </div>

    <div class="credit-details">
      <div class="credit-item">
        <div class="credit-label">전체</div>
        <div class="credit-value">${total > 0 ? total.toLocaleString() : '-'}</div>
      </div>
      <div class="credit-item">
        <div class="credit-label">사용</div>
        <div class="credit-value">${used > 0 ? used.toLocaleString() : '-'}</div>
      </div>
      <div class="credit-item">
        <div class="credit-label">잔여</div>
        <div class="credit-value">${credits.toLocaleString()}</div>
      </div>
    </div>

    <div class="progress-container">
      <div class="progress-bar">
        <div class="progress-fill ${status}" style="width: ${percentage}%"></div>
      </div>
      <div class="progress-text">
        <span>잔여율</span>
        <span>${percentage}%</span>
      </div>
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
