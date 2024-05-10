document.getElementById('toggleButton').addEventListener('click', function() {
    chrome.storage.local.get('blockingEnabled', data => {
        chrome.storage.local.set({'blockingEnabled': !data.blockingEnabled});
    });
});