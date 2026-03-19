let focusModeEnabled = false;
let focusStyleElement = null;

const FOCUS_CSS = `
  /* Watch page: hide recommendations sidebar, expand video to full width */
  ytd-watch-flexy #secondary {
    display: none !important;
  }
  ytd-watch-flexy #primary {
    max-width: 100% !important;
  }
  ytd-watch-flexy #columns {
    max-width: 100% !important;
  }
  ytd-watch-flexy #primary-inner {
    max-width: 100% !important;
  }

  /* Hide autoplay toggle */
  .ytp-autonav-toggle-button-container {
    display: none !important;
  }

  /* Hide end-screen overlays and suggestions */
  .ytp-ce-element,
  .ytp-endscreen-content,
  .ytp-suggestion-set {
    display: none !important;
  }

  /* Hide Trending/Explore from sidebar */
  ytd-guide-entry-renderer:has(a[href="/feed/explore"]),
  ytd-guide-entry-renderer:has(a[href="/feed/trending"]),
  ytd-mini-guide-entry-renderer:has(a[href="/feed/explore"]),
  ytd-mini-guide-entry-renderer:has(a[href="/feed/trending"]) {
    display: none !important;
  }

  /* Search results: hide recommendation shelves, keep direct results */
  ytd-search ytd-shelf-renderer,
  ytd-search ytd-horizontal-card-list-renderer,
  ytd-search ytd-promoted-sparkles-web-renderer {
    display: none !important;
  }
`;

function injectFocusCSS() {
    if (focusStyleElement) return;
    focusStyleElement = document.createElement('style');
    focusStyleElement.id = 'focus-mode-style';
    focusStyleElement.textContent = FOCUS_CSS;
    (document.head || document.documentElement).appendChild(focusStyleElement);
}

function removeFocusCSS() {
    if (focusStyleElement) {
        focusStyleElement.remove();
        focusStyleElement = null;
    }
}

function updateFocusMode(enabled) {
    focusModeEnabled = enabled;
    if (enabled) {
        injectFocusCSS();
    } else {
        removeFocusCSS();
    }
}

chrome.storage.local.get('focusModeEnabled', data => {
    updateFocusMode(!!data.focusModeEnabled);
});

chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'local' && changes.focusModeEnabled) {
        updateFocusMode(!!changes.focusModeEnabled.newValue);
    }
});
