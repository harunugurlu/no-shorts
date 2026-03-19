let blockingEnabled = false;
let styleElement = null;
let pendingUpdate = null;

const HIDE_CLASS = 'no-shorts-hidden';

const SHORTS_CSS = `
  .${HIDE_CLASS},
  ytd-guide-entry-renderer:has(a[title="Shorts"]),
  ytd-guide-entry-renderer:has(a[href^="/shorts"]),
  ytd-mini-guide-entry-renderer:has(a[title="Shorts"]),
  ytm-pivot-bar-item-renderer:has(a[href^="/shorts"]),
  ytd-rich-item-renderer:has(a[href^="/shorts"]),
  ytd-video-renderer:has(a[href^="/shorts"]),
  ytd-reel-shelf-renderer,
  ytd-compact-video-renderer:has(a[href^="/shorts"]),
  ytd-compact-movie-renderer:has(a[href^="/shorts"]),
  ytd-compact-playlist-renderer:has(a[href^="/shorts"]),
  ytd-reel-item-renderer,
  yt-tab-shape[tab-title="Shorts"],
  tp-yt-paper-tab:has(a[href*="/shorts"]),
  .ytChipBarViewModelChipWrapper:has(button[aria-label="Shorts"]) {
    display: none !important;
  }
`;

function injectCSS() {
    if (styleElement) return;
    styleElement = document.createElement('style');
    styleElement.id = 'no-shorts-style';
    styleElement.textContent = SHORTS_CSS;
    (document.head || document.documentElement).appendChild(styleElement);
}

function removeCSS() {
    if (styleElement) {
        styleElement.remove();
        styleElement = null;
    }
    document.querySelectorAll(`.${HIDE_CLASS}`).forEach(el => {
        el.classList.remove(HIDE_CLASS);
    });
}

function hasExactText(el, text) {
    const formatted = el.querySelector('yt-formatted-string');
    if (formatted && formatted.textContent.trim() === text) return true;
    return el.textContent.trim() === text;
}

function removeTextBasedShorts() {
    if (!blockingEnabled) return;

    const shelfTitles = document.querySelectorAll(
        'span#title.style-scope.ytd-rich-shelf-renderer'
    );
    shelfTitles.forEach(title => {
        if (title.textContent.trim() === 'Shorts') {
            const section = title.closest('ytd-rich-shelf-renderer, ytd-item-section-renderer');
            if (section) section.classList.add(HIDE_CLASS);
        }
    });

    const chips = document.querySelectorAll('yt-chip-cloud-chip-renderer');
    chips.forEach(chip => {
        if (hasExactText(chip, 'Shorts')) {
            chip.classList.add(HIDE_CLASS);
        }
    });

    const paperTabs = document.querySelectorAll('tp-yt-paper-tab');
    paperTabs.forEach(tab => {
        if (hasExactText(tab, 'Shorts')) {
            tab.classList.add(HIDE_CLASS);
        }
    });

    document.querySelectorAll('yt-tab-shape[tab-title="Shorts"]').forEach(tab => {
        tab.classList.add(HIDE_CLASS);
    });

    document.querySelectorAll('.ytChipBarViewModelChipWrapper').forEach(wrapper => {
        const btn = wrapper.querySelector('button[aria-label="Shorts"]');
        if (btn) wrapper.classList.add(HIDE_CLASS);
    });
}

function updateBlocking(enabled) {
    blockingEnabled = enabled;
    if (enabled) {
        injectCSS();
        removeTextBasedShorts();
    } else {
        removeCSS();
    }
}

chrome.storage.local.get('blockingEnabled', data => {
    updateBlocking(!!data.blockingEnabled);
});

chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'local' && changes.blockingEnabled) {
        updateBlocking(!!changes.blockingEnabled.newValue);
    }
});

const observer = new MutationObserver(() => {
    if (!blockingEnabled || pendingUpdate) return;
    pendingUpdate = requestAnimationFrame(() => {
        removeTextBasedShorts();
        pendingUpdate = null;
    });
});

const observeTarget = document.querySelector('ytd-app') || document.body;
observer.observe(observeTarget, {
    childList: true,
    subtree: true
});
