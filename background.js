function redirectShorts(details) {
    chrome.storage.local.get('blockingEnabled', data => {
        if (data.blockingEnabled && details.url.includes('/shorts/')) {
            chrome.tabs.update(details.tabId, { url: "https://www.youtube.com/" });
        }
    });
}
function redirectShortsOnActiveChange(activeInfo) {
    chrome.storage.local.get('blockingEnabled', data => {
        chrome.tabs.get(activeInfo.tabId).then(currentTab => {
            if (data.blockingEnabled && currentTab.url.includes('/shorts/')) {
                chrome.tabs.update(activeInfo.tabId, { url: "https://www.youtube.com/" });
            }
        });
    });
}

chrome.webNavigation.onHistoryStateUpdated.addListener(redirectShorts, { url: [{ urlMatches: 'https://www.youtube.com/shorts/*' }] });

chrome.tabs.onActivated.addListener(redirectShortsOnActiveChange);