let quotes = [];

// Load quotes when extension starts
fetch(chrome.runtime.getURL('quotes.txt'))
    .then(response => response.text())
    .then(text => {
        // Split by empty lines to get quote blocks
        const blocks = text.split('\n\n');
        quotes = blocks.filter(block => block.trim() !== '').map(block => {
            const lines = block.split('\n').filter(line => line.trim() !== '');
            return {
                quote: lines[0],
                author: lines[1] || '',
                reference: lines[2] || '',
                length: lines[0].length // Add length for filtering
            };
        });
    });

function getInspirationalQuote() {
    if (quotes.length === 0) {
        return "Stay focused and make the most of your time!";
    }
    // Filter for shorter quotes (less than 100 characters)
    const shortQuotes = quotes.filter(q => q.length < 100);
    if (shortQuotes.length === 0) return "Stay focused and make the most of your time!";
    
    const randomQuote = shortQuotes[Math.floor(Math.random() * shortQuotes.length)];
    return `"${randomQuote.quote}"\n- ${randomQuote.author}`;
}

function createRedirectionNotification() {
    const quote = getInspirationalQuote();
    chrome.notifications.create({
        type: 'basic',
        iconUrl: '128x128.png',
        title: '🎯 Redirecting from YouTube Shorts',
        message: `Helping you stay productive!\n\n${quote}`,
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

// Handle direct navigation and history state changes
function handleNavigation(details) {
    if (details.frameId === 0) { // Only handle main frame
        handleShortsRedirect(details.url, details.tabId);
    }
}

// Listen for navigation events
chrome.webNavigation.onCommitted.addListener(handleNavigation, {
    url: [{
        hostEquals: 'www.youtube.com',
        pathContains: '/shorts'
    }]
});

chrome.webNavigation.onHistoryStateUpdated.addListener(handleNavigation, {
    url: [{
        hostEquals: 'www.youtube.com',
        pathContains: '/shorts'
    }]
});

// Handle tab activation
chrome.tabs.onActivated.addListener(activeInfo => {
    chrome.tabs.get(activeInfo.tabId, tab => {
        if (chrome.runtime.lastError) return;
        handleShortsRedirect(tab.url, tab.id);
    });
});