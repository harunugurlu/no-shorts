chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.local.get('blockingEnabled', data => {
        if (data.blockingEnabled === undefined) {
            chrome.storage.local.set({ 'blockingEnabled': true });
        }
    });
    chrome.storage.local.get('shortsCount', data => {
        if (data.shortsCount === undefined) {
            chrome.storage.local.set({ shortsCount: 0 });
        }
    });
    chrome.storage.local.get('isNotified', data => {
        if (data.isNotified === undefined) {
            chrome.storage.local.set({ isNotified: false });
        }
    });
});

function updateShortsCount(count) {
    chrome.storage.local.get('shortsCount', data => {
        let newCount = count === 0 ? 0 : (data.shortsCount || 0) + count;
        console.log("current shortsCount", data.shortsCount);
        chrome.storage.local.set({ shortsCount: newCount }, () => {
            console.log("shortsCount is updated to", newCount);
        });
    });
}

let timeout;
const debounce = (callback, delay) => {
    return (...args) => { // ...args means this function takes any number of arguments
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            callback.apply(this, args) // apply is method that calls another method with the given arguments
        }, delay);
    }
}

//TODO: When enabled, allow for only one shorts, restrict scrolling down.
// When disabled, just send a warning notification once.

function redirectShorts(details) {
    chrome.storage.local.get('blockingEnabled', data => {
        if (data.blockingEnabled && details.url.includes('/shorts/')) {
            chrome.storage.local.get('shortsCount', data => {
                console.log("redirectShorts shortsCount", data.shortsCount);
                if (data.shortsCount && data.shortsCount >= 1) {
                    chrome.tabs.update(details.tabId, { url: "https://www.youtube.com/" }, () => {
                        if (!chrome.runtime.lastError) {
                            chrome.notifications.create({
                                type: 'basic',
                                iconUrl: '128x128.png',
                                title: 'Redirection Notice',
                                message: 'You were redirected away from YouTube Shorts. Now, go be productive :)',
                                priority: 2
                            });
                            updateShortsCount(0);
                        }
                    });
                } else {
                    updateShortsCount(1);
                }
            });
        }
        else if (!data.blockingEnabled && details.url.includes('/shorts/')) {
            console.log("blockingEnabled is FALSE");
            chrome.storage.local.get(['shortsCount', 'isNotified'], data => {
                if (data.shortsCount && data.shortsCount > 4 && !data.isNotified) {
                    chrome.notifications.create({
                        type: 'basic',
                        iconUrl: '128x128.png',
                        title: 'Doom Scrolling Warning',
                        message: 'Hey, it looks like you started doom scrolling, just saying.',
                        priority: 2
                    });
                    updateShortsCount(0);
                    chrome.storage.local.set({ isNotified: true });
                } else {
                    updateShortsCount(1);
                }
            });
        }
    });
}

// redirectShorts() is being called with 300 min delay after the historyStateUpdated event
chrome.webNavigation.onHistoryStateUpdated.addListener(debounce(redirectShorts, 300), { url: [{ urlMatches: 'https://www.youtube.com/shorts/*' }] }); 