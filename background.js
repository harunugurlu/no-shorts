function redirectShorts(details) {
    chrome.storage.local.get('blockingEnabled', data => {
        if (data.blockingEnabled && details.url.includes('/shorts/')) {
            chrome.tabs.update(details.tabId, { url: "https://www.youtube.com/" }, () => {
                if(chrome.runtime.lastError) {
                } else {
                    chrome.notifications.create({
                        type: 'basic',
                        iconUrl: '128x128.png',
                        title: 'Redirection Notice',
                        message: 'You were redirected away from YouTube Shorts. Now, go be productive :)',
                        priority: 2
                    });
                }
            });
        }
    });
}
function redirectShortsOnActiveChange(activeInfo) {
    chrome.storage.local.get('blockingEnabled', data => {
        chrome.tabs.get(activeInfo.tabId, currentTab => {
            if (chrome.runtime.lastError) {
                console.error(`Error retrieving tab: ${chrome.runtime.lastError}`);
                return;
            }
            currentUrl = currentTab.url ? currentTab.url : ''
            pendingUrl = currentTab.pendingUrl ? currentTab.pendingUrl : ''
            if (data.blockingEnabled && (currentUrl.includes('/shorts/') || pendingUrl.includes('/shorts/'))) {
                chrome.tabs.update(activeInfo.tabId, { url: "https://www.youtube.com/" }, () => {
                    if (chrome.runtime.lastError) {
                        console.error(`Error redirecting: ${chrome.runtime.lastError}`);
                    } else {
                        chrome.notifications.create({
                            type: 'basic',
                            iconUrl: '128x128.png',  // Ensure you have an icon.png in your extension directory
                            title: 'Redirection Notice',
                            message: 'You were redirected away from YouTube Shorts. Now, go be productive :)',
                            priority: 2
                        });
                    }
                });
            }
        });
    });
}

chrome.webNavigation.onHistoryStateUpdated.addListener(redirectShorts, { url: [{ urlMatches: 'https://www.youtube.com/shorts/*' }] });

chrome.webNavigation.onCommitted.addListener(redirectShorts, { url: [{ urlMatches: 'https://www.youtube.com/shorts/*' }] });

chrome.tabs.onActivated.addListener(redirectShortsOnActiveChange);