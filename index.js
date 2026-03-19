window.onload = function () {
    chrome.storage.local.get('blockingEnabled', function (data) {
        if (data.blockingEnabled) {
            document.getElementById('enableButton').classList.add('selected');
            document.getElementById('disableButton').classList.remove('selected');
        } else {
            document.getElementById('disableButton').classList.add('selected');
            document.getElementById('enableButton').classList.remove('selected');
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

document.getElementById('enableButton').addEventListener('click', function () {
    if (!this.classList.contains('selected')) {
        this.classList.add('selected');
        document.getElementById('disableButton').classList.remove('selected');
        chrome.storage.local.set({ 'blockingEnabled': true }, redirectCurrentTabIfShorts);
    }
});

document.getElementById('disableButton').addEventListener('click', function () {
    if (!this.classList.contains('selected')) {
        this.classList.add('selected');
        document.getElementById('enableButton').classList.remove('selected');
        chrome.storage.local.set({ 'blockingEnabled': false });
    }
});
