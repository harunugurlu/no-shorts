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

function redirectShorts() {
    chrome.storage.local.get('blockingEnabled', data => {
        if (data.blockingEnabled) {
            chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                var activeTab = tabs[0];
                if (activeTab.url.includes("/shorts/")) {
                    chrome.tabs.update(activeTab.id, { url: "https://www.youtube.com/" });
                }
            });
        }
    });
}

document.getElementById('enableButton').addEventListener('click', function () {
    if(!this.classList.contains('selected')) {
        this.classList.add('selected');
        document.getElementById('disableButton').classList.remove('selected');
        chrome.storage.local.get('blockingEnabled', data => {
            chrome.storage.local.set({ 'blockingEnabled': !data.blockingEnabled });
            redirectShorts();
        });
    }
});

document.getElementById('disableButton').addEventListener('click', function () {
    if(!this.classList.contains('selected')) {
        this.classList.add('selected');
        document.getElementById('enableButton').classList.remove('selected');
        chrome.storage.local.get('blockingEnabled', data => {
            chrome.storage.local.set({ 'blockingEnabled': !data.blockingEnabled })
        });
    }
});