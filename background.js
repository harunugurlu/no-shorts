function redirectShorts(details) {
    chrome.storage.local.get('blockingEnabled', data => {
        if (data.blockingEnabled && details.url.includes('/shorts/')) {
            chrome.tabs.update(details.tabId, { url: "https://www.youtube.com/" }, () => {
                if(chrome.runtime.lastError) {
                    console.log(`Error redirecting ${chrome.runtime.lastError}`);
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
}
function redirectShortsOnActiveChange(activeInfo) {
    chrome.storage.local.get('blockingEnabled', data => {
        chrome.tabs.get(activeInfo.tabId, currentTab => {
            console.log("currentTab", currentTab);
            if (chrome.runtime.lastError) {
                console.error(`Error retrieving tab: ${chrome.runtime.lastError}`);
                return;
            }
            if (data.blockingEnabled && currentTab.url.includes('/shorts/')) {
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

chrome.tabs.onActivated.addListener(redirectShortsOnActiveChange);