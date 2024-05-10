chrome.webNavigation.onHistoryStateUpdated.addListener(function(details) {
    chrome.storage.local.get('blockingEnabled', data => {
        if (data.blockingEnabled && details.url.includes('/shorts/')) {
            chrome.tabs.update(details.tabId, {url: "https://www.youtube.com/"});
        }
    });
}, {url: [{urlMatches : 'https://www.youtube.com/shorts/*'}]});