function initToggle(storageKey, enableBtnId, disableBtnId, onEnable) {
    const enableBtn = document.getElementById(enableBtnId);
    const disableBtn = document.getElementById(disableBtnId);

    chrome.storage.local.get(storageKey, function (data) {
        if (data[storageKey]) {
            enableBtn.classList.add('selected');
            disableBtn.classList.remove('selected');
        } else {
            disableBtn.classList.add('selected');
            enableBtn.classList.remove('selected');
        }
    });

    enableBtn.addEventListener('click', function () {
        if (!this.classList.contains('selected')) {
            this.classList.add('selected');
            disableBtn.classList.remove('selected');
            chrome.storage.local.set({ [storageKey]: true }, () => {
                if (onEnable) onEnable();
            });
        }
    });

    disableBtn.addEventListener('click', function () {
        if (!this.classList.contains('selected')) {
            this.classList.add('selected');
            enableBtn.classList.remove('selected');
            chrome.storage.local.set({ [storageKey]: false });
        }
    });
}

function redirectCurrentTabIfShorts() {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        const activeTab = tabs[0];
        if (activeTab && activeTab.url && activeTab.url.includes("/shorts/")) {
            chrome.tabs.update(activeTab.id, { url: "https://www.youtube.com/" }, () => {
                if (!chrome.runtime.lastError) {
                    chrome.runtime.sendMessage({ type: 'showRedirectNotification' });
                }
            });
        }
    });
}

window.onload = function () {
    initToggle('blockingEnabled', 'shortsEnableButton', 'shortsDisableButton', redirectCurrentTabIfShorts);
    initToggle('focusModeEnabled', 'focusEnableButton', 'focusDisableButton');
};
