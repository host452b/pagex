import {
  PAGEX_MESSAGE_TYPES,
  PAGEX_STATE_KEY,
} from './src/shared/constants.js';
import {
  formatResultForCopy,
  sortTabsForPicker,
} from './src/shared/result-utils.js';
import {
  canCopyForSelectedTab,
  getResultMismatchMessage,
  isParseButtonDisabled,
} from './src/shared/popup-state.js';
import { buildOriginPermissionPattern } from './src/shared/origin-permissions.js';

const viewState = {
  tabs: [],
  parseState: null,
  isStartingParse: false,
  copyResetTimer: 0,
};

const elements = {
  app: document.getElementById('app'),
  tabSelect: document.getElementById('tabSelect'),
  parseButton: document.getElementById('parseBtn'),
  copyButton: document.getElementById('copyBtn'),
  statusText: document.getElementById('statusText'),
  detailText: document.getElementById('detailText'),
  framesValue: document.getElementById('framesValue'),
  elementsValue: document.getElementById('elementsValue'),
  clicksValue: document.getElementById('clicksValue'),
  sizeValue: document.getElementById('sizeValue'),
  summaryNote: document.getElementById('summaryNote'),
  copyFeedback: document.getElementById('copyFeedback'),
};

void init();

async function init() {
  bindEvents();
  await loadTabs();
  await loadStoredState();
  syncSelectedTab();
  render();
}

function bindEvents() {
  elements.parseButton.addEventListener('click', () => {
    void handleParseClick();
  });

  elements.copyButton.addEventListener('click', () => {
    void handleCopyClick();
  });

  elements.tabSelect.addEventListener('change', () => {
    resetCopyFeedback();
    render();
  });

  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName !== 'session') {
      return;
    }

    if (!changes[PAGEX_STATE_KEY]) {
      return;
    }

    viewState.parseState = changes[PAGEX_STATE_KEY].newValue || null;
    syncSelectedTab();
    render();
  });
}

async function loadTabs() {
  const tabs = await chrome.tabs.query({ currentWindow: true });
  const availableTabs = [];
  let activeTabId = 0;

  for (const tab of tabs) {
    if (!Number.isInteger(tab.id)) {
      continue;
    }

    availableTabs.push(tab);

    if (tab.active) {
      activeTabId = tab.id;
    }
  }

  viewState.tabs = sortTabsForPicker(availableTabs, activeTabId);
  renderTabOptions();
}

async function loadStoredState() {
  const stored = await chrome.storage.session.get(PAGEX_STATE_KEY);

  viewState.parseState = stored[PAGEX_STATE_KEY] || null;
}

function render() {
  renderStatus();
  renderSummary();
  renderButtons();
}

function renderTabOptions() {
  elements.tabSelect.textContent = '';

  if (viewState.tabs.length === 0) {
    const option = document.createElement('option');
    option.value = '';
    option.textContent = 'No tabs available';
    elements.tabSelect.appendChild(option);
    elements.tabSelect.disabled = true;
    return;
  }

  elements.tabSelect.disabled = false;

  for (const tab of viewState.tabs) {
    const option = document.createElement('option');
    option.value = String(tab.id);
    option.textContent = tab.label;
    elements.tabSelect.appendChild(option);
  }
}

function syncSelectedTab() {
  if (viewState.tabs.length === 0) {
    return;
  }

  const preferredTabId = getPreferredTabId();

  if (!Number.isInteger(preferredTabId)) {
    elements.tabSelect.value = String(viewState.tabs[0].id);
    return;
  }

  for (const tab of viewState.tabs) {
    if (tab.id === preferredTabId) {
      elements.tabSelect.value = String(preferredTabId);
      return;
    }
  }

  elements.tabSelect.value = String(viewState.tabs[0].id);
}

function getPreferredTabId() {
  if (
    viewState.parseState &&
    Number.isInteger(viewState.parseState.selectedTabId)
  ) {
    return viewState.parseState.selectedTabId;
  }

  const selectedValue = Number(elements.tabSelect.value);

  if (Number.isInteger(selectedValue) && selectedValue > 0) {
    return selectedValue;
  }

  if (viewState.tabs.length > 0) {
    return viewState.tabs[0].id;
  }

  return null;
}

function getCurrentSelectedTabId() {
  const selectedValue = Number(elements.tabSelect.value);

  if (Number.isInteger(selectedValue) && selectedValue > 0) {
    return selectedValue;
  }

  return null;
}

function renderStatus() {
  let status = 'idle';
  let statusText = 'SYSTEM.IDLE';
  let detailText =
    'SELECT TARGET TAB. PARSE PAGE STRUCTURE. COPY CLEAN JSON.';

  if (viewState.parseState && viewState.parseState.status) {
    status = viewState.parseState.status;
  }

  if (status === 'running') {
    statusText = viewState.parseState.stageLabel || 'Parsing page';
    detailText =
      'EXPANDING HIDDEN CONTENT. COLLECTING DOM. WRITING PAYLOAD.';
  }

  if (status === 'completed') {
    statusText = 'PARSE.COMPLETE';
    detailText =
      'PAYLOAD READY. PRESS COPY.JSON.';

    const mismatchMessage = getResultMismatchMessage(
      viewState.parseState,
      getCurrentSelectedTabId(),
    );

    if (mismatchMessage) {
      detailText = mismatchMessage;
    }
  }

  if (status === 'error') {
    statusText = 'PARSE.FAILED';
    detailText = viewState.parseState.errorMessage || 'TARGET PAGE COULD NOT BE PARSED.';
  }

  elements.app.dataset.status = status;
  elements.statusText.textContent = statusText;
  elements.detailText.textContent = detailText;
}

function renderSummary() {
  resetMetricValues();

  if (!viewState.parseState) {
    elements.summaryNote.textContent = 'NO PAYLOAD CAPTURED.';
    return;
  }

  if (viewState.parseState.status === 'running') {
    elements.summaryNote.textContent =
      'ACTIVE TASK. KEEP WINDOW OPEN OR RETURN LATER.';
    return;
  }

  if (viewState.parseState.status === 'error') {
    elements.summaryNote.textContent =
      viewState.parseState.errorMessage || 'TARGET PAGE COULD NOT BE PARSED.';
    return;
  }

  const summary = viewState.parseState.summary;
  const mismatchMessage = getResultMismatchMessage(
    viewState.parseState,
    getCurrentSelectedTabId(),
  );

  if (!summary) {
    elements.summaryNote.textContent = 'NO PAYLOAD SUMMARY AVAILABLE.';
    return;
  }

  if (mismatchMessage) {
    elements.summaryNote.textContent = mismatchMessage;
    return;
  }

  elements.framesValue.textContent = String(summary.frameCount);
  elements.elementsValue.textContent = String(summary.elementCount);
  elements.clicksValue.textContent = String(summary.totalClicks);
  elements.sizeValue.textContent = summary.resultSizeLabel;
  elements.summaryNote.textContent = buildSummaryNote(summary);
}

function resetMetricValues() {
  elements.framesValue.textContent = '-';
  elements.elementsValue.textContent = '-';
  elements.clicksValue.textContent = '-';
  elements.sizeValue.textContent = '-';
}

function buildSummaryNote(summary) {
  const noteParts = [];

  noteParts.push(`${summary.accessibleFrameCount} accessible frame(s)`);
  noteParts.push(`${summary.skippedFrameCount} skipped frame(s)`);
  noteParts.push(`${summary.warningCount} warning(s)`);

  return noteParts.join(' • ');
}

function renderButtons() {
  const canCopy = canCopyForSelectedTab(
    viewState.parseState,
    getCurrentSelectedTabId(),
  );
  const parseDisabled = isParseButtonDisabled({
    hasTabs: viewState.tabs.length > 0,
    isStartingParse: viewState.isStartingParse,
    parseState: viewState.parseState,
  });
  let running = false;

  if (viewState.isStartingParse) {
    running = true;
  }

  if (viewState.parseState && viewState.parseState.status === 'running') {
    running = true;
  }

  elements.parseButton.disabled = parseDisabled;
  elements.copyButton.disabled = !canCopy;

  if (running) {
    elements.parseButton.textContent = 'PARSING...';
    return;
  }

  elements.parseButton.textContent = 'PARSE';
}

async function handleParseClick() {
  if (
    isParseButtonDisabled({
      hasTabs: viewState.tabs.length > 0,
      isStartingParse: viewState.isStartingParse,
      parseState: viewState.parseState,
    })
  ) {
    return;
  }

  const selectedTabId = Number(elements.tabSelect.value);

  if (!Number.isInteger(selectedTabId) || selectedTabId <= 0) {
    elements.app.dataset.status = 'error';
    elements.statusText.textContent = 'TARGET.MISSING';
    elements.detailText.textContent = 'SELECT A VALID TAB BEFORE PARSE.';
    return;
  }

  viewState.isStartingParse = true;
  elements.app.dataset.status = 'running';
  elements.statusText.textContent = 'START.PARSE';
  elements.detailText.textContent =
    'SENDING TARGET TAB TO PARSER.';
  renderButtons();
  resetCopyFeedback();

  try {
    const permissionGranted = await ensureSelectedTabPermission(selectedTabId);

    if (!permissionGranted) {
      elements.app.dataset.status = 'error';
      elements.statusText.textContent = 'PERMISSION.REQUIRED';
      elements.detailText.textContent =
        'ALLOW SITE ACCESS FOR THIS ORIGIN BEFORE PARSE.';
      return;
    }

    const response = await chrome.runtime.sendMessage({
      type: PAGEX_MESSAGE_TYPES.START_PARSE,
      tabId: selectedTabId,
    });

    if (response && response.ok) {
      return;
    }

    elements.app.dataset.status = 'error';
    elements.statusText.textContent = 'PARSE.FAILED';

    if (response && response.errorMessage) {
      elements.detailText.textContent = response.errorMessage;
    } else {
      elements.detailText.textContent = 'PARSER COULD NOT START FOR THIS TAB.';
    }
  } catch (error) {
    elements.app.dataset.status = 'error';
    elements.statusText.textContent = 'PARSE.FAILED';
    elements.detailText.textContent = 'PARSER REQUEST COULD NOT BE DELIVERED.';
  } finally {
    viewState.isStartingParse = false;
    renderButtons();
  }
}

async function ensureSelectedTabPermission(selectedTabId) {
  const selectedTab = viewState.tabs.find((tab) => tab.id === selectedTabId);

  if (!selectedTab) {
    return false;
  }

  const permissionPattern = buildOriginPermissionPattern(selectedTab.url);

  if (!permissionPattern) {
    return true;
  }

  const containsPermission = await chrome.permissions.contains({
    origins: [permissionPattern],
  });

  if (containsPermission) {
    return true;
  }

  const granted = await chrome.permissions.request({
    origins: [permissionPattern],
  });

  if (granted) {
    return true;
  }

  return false;
}

async function handleCopyClick() {
  if (
    !canCopyForSelectedTab(viewState.parseState, getCurrentSelectedTabId()) ||
    !viewState.parseState ||
    !viewState.parseState.result
  ) {
    return;
  }

  const formatted = formatResultForCopy(viewState.parseState.result);
  await navigator.clipboard.writeText(formatted);
  setCopyFeedback('COPY COMPLETE.');
}

function setCopyFeedback(text) {
  if (viewState.copyResetTimer) {
    window.clearTimeout(viewState.copyResetTimer);
    viewState.copyResetTimer = 0;
  }

  elements.copyFeedback.textContent = text;

  viewState.copyResetTimer = window.setTimeout(() => {
    viewState.copyResetTimer = 0;
    resetCopyFeedback();
  }, 2200);
}

function resetCopyFeedback() {
  elements.copyFeedback.textContent =
    'LOCAL OUTPUT. NO REMOTE SEND.';
}
