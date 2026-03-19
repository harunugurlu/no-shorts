let quotes = [];

// Load quotes when extension starts
fetch(chrome.runtime.getURL('quotes.txt'))
    .then(response => response.text())
    .then(text => {
        const normalized = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
        const blocks = normalized.split('\n\n');
        quotes = blocks.filter(block => block.trim() !== '').map(block => {
            const lines = block.split('\n').filter(line => line.trim() !== '');
            return {
                quote: lines[0],
                author: lines[1] || '',
                reference: lines[2] || ''
            };
        });
    })
    .catch(() => {});

function getInspirationalQuote() {
    if (quotes.length === 0) {
        return "Stay focused and make the most of your time!";
    }
    // Filter for shorter quotes (less than 100 characters)
    const shortQuotes = quotes.filter(q => q.quote.length < 100);
    if (shortQuotes.length === 0) return "Stay focused and make the most of your time!";
    
    const randomQuote = shortQuotes[Math.floor(Math.random() * shortQuotes.length)];
    return `"${randomQuote.quote}"\n- ${randomQuote.author}`;
}

function createRedirectionNotification() {
    const quote = getInspirationalQuote();
    chrome.notifications.create({
        type: 'basic',
        iconUrl: chrome.runtime.getURL('no-distractions-youtube-128-128.png'),
        title: 'Redirected from YouTube Shorts',
        message: `Helping you stay productive!\n${quote}`,
        priority: 2
    });
}

function isValidShortsUrl(url) {
    if (!url) return false;
    
    try {
        const urlObj = new URL(url);
        if (urlObj.hostname !== 'www.youtube.com') return false;
        
        const path = urlObj.pathname;
        
        // Check for channel Shorts
        if (path.includes('/@') && path.endsWith('/shorts')) return true;
        if (path.includes('/channel/') && path.endsWith('/shorts')) return true;
        
        // Check for individual Shorts
        if (path.startsWith('/shorts/')) return true;
        
        return false;
    } catch {
        return false;
    }
}

function getChannelMainPage(url) {
    try {
        const urlObj = new URL(url);
        const path = urlObj.pathname;
        
        // Get channel path without /shorts
        if (path.includes('/@') || path.includes('/channel/')) {
            return `https://www.youtube.com${path.replace('/shorts', '')}`;
        }
        
        return 'https://www.youtube.com/';
    } catch {
        return 'https://www.youtube.com/';
    }
}

function handleShortsRedirect(url, tabId) {
    if (!url) return;
    
    chrome.storage.local.get('blockingEnabled', data => {
        if (data.blockingEnabled && isValidShortsUrl(url)) {
            const redirectUrl = url.includes('/shorts/') ? 
                'https://www.youtube.com/' : 
                getChannelMainPage(url);
            
            chrome.tabs.update(tabId, { url: redirectUrl }, () => {
                if (!chrome.runtime.lastError) {
                    createRedirectionNotification();
                }
            });
        }
    });
}

function isExploreTrendingUrl(url) {
    if (!url) return false;
    try {
        const urlObj = new URL(url);
        if (urlObj.hostname !== 'www.youtube.com') return false;
        const path = urlObj.pathname;
        return path === '/feed/explore' || path === '/feed/trending';
    } catch {
        return false;
    }
}

function handleExploreTrendingRedirect(url, tabId) {
    if (!url) return;
    chrome.storage.local.get('focusModeEnabled', data => {
        if (data.focusModeEnabled && isExploreTrendingUrl(url)) {
            chrome.tabs.update(tabId, { url: 'https://www.youtube.com/' });
        }
    });
}

function handleNavigation(details) {
    if (details.frameId === 0) {
        handleShortsRedirect(details.url, details.tabId);
        handleExploreTrendingRedirect(details.url, details.tabId);
    }
}

chrome.webNavigation.onCommitted.addListener(handleNavigation, {
    url: [
        { hostEquals: 'www.youtube.com', pathContains: '/shorts' },
        { hostEquals: 'www.youtube.com', pathEquals: '/feed/explore' },
        { hostEquals: 'www.youtube.com', pathEquals: '/feed/trending' }
    ]
});

chrome.webNavigation.onHistoryStateUpdated.addListener(handleNavigation, {
    url: [
        { hostEquals: 'www.youtube.com', pathContains: '/shorts' },
        { hostEquals: 'www.youtube.com', pathEquals: '/feed/explore' },
        { hostEquals: 'www.youtube.com', pathEquals: '/feed/trending' }
    ]
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'showRedirectNotification') {
        createRedirectionNotification();
    }
});

chrome.tabs.onActivated.addListener(activeInfo => {
    chrome.tabs.get(activeInfo.tabId, tab => {
        if (chrome.runtime.lastError) return;
        if (tab.url && tab.url.includes('www.youtube.com/') && tab.url.includes('/shorts')) {
            handleShortsRedirect(tab.url, tab.id);
        }
    });
});