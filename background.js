function redirectShorts(details) {
    chrome.storage.local.get('blockingEnabled', data => {
        console.log("data.blockingEnabled:", data.blockingEnabled);
        if (data.blockingEnabled && details.url.includes('/shorts/')) {
            console.log("url:", details.url);
            chrome.tabs.update(details.tabId, { url: "https://www.youtube.com/" });
        }
    });
}

chrome.webNavigation.onHistoryStateUpdated.addListener(redirectShorts, { url: [{ urlMatches: 'https://www.youtube.com/shorts/*' }] });