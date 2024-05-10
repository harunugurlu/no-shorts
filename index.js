
const getActiveUrl = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        // since only one tab should be active and in the current window at once
        // the return variable should only have one entry
        var activeTab = tabs[0];
        var activeTabId = activeTab.id; // or do whatever you need
        console.log("activeTab", activeTab.url);
      });
}
document.getElementById('clickme').addEventListener('click', () => {
    getActiveUrl();
    alert('Button clicked!');
});


chrome.webNavigation.onHistoryStateUpdated.addListener((details) => {
    
})