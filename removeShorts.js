function removeShortButtons() {
    // Remove Shorts from sidebar
    const shortsButtons = document.querySelectorAll('a[title="Shorts"], ytd-guide-entry-renderer a[href^="/shorts"]');
    shortsButtons.forEach(button => {
        const parent = button.closest('ytd-guide-entry-renderer');
        if (parent) parent.remove();
        else button.remove();
    });

    // Remove Shorts from mobile menu
    const mobileShorts = document.querySelectorAll('ytm-pivot-bar-item-renderer a[href^="/shorts"]');
    mobileShorts.forEach(item => item.closest('ytm-pivot-bar-item-renderer').remove());
}

function removeShortSections() {
    // Remove Shorts shelf sections
    const sections = document.querySelectorAll("span#title.style-scope.ytd-rich-shelf-renderer, span#title.style-scope.ytd-reel-shelf-renderer");
    sections.forEach(title => {
        if (title.textContent.trim() === "Shorts") {
            let section = title;
            while (section && !section.matches('ytd-rich-shelf-renderer, ytd-reel-shelf-renderer, ytd-item-section-renderer')) {
                section = section.parentElement;
            }
            if (section) section.style.display = "none";
        }
    });

    // Remove individual Shorts videos from feed
    const shortVideos = document.querySelectorAll('ytd-rich-item-renderer a[href^="/shorts"], ytd-video-renderer a[href^="/shorts"]');
    shortVideos.forEach(video => {
        const container = video.closest('ytd-rich-item-renderer, ytd-video-renderer');
        if (container) container.remove();
    });

    // Remove Shorts shelf in home feed
    const reelShelves = document.querySelectorAll('ytd-reel-shelf-renderer');
    reelShelves.forEach(shelf => shelf.remove());

    // Remove Shorts from related videos section
    const relatedShorts = document.querySelectorAll(`
        ytd-compact-video-renderer a[href^="/shorts"],
        ytd-compact-movie-renderer a[href^="/shorts"],
        ytd-compact-playlist-renderer a[href^="/shorts"],
        ytd-reel-item-renderer
    `);
    relatedShorts.forEach(video => {
        const container = video.closest('ytd-compact-video-renderer, ytd-compact-movie-renderer, ytd-compact-playlist-renderer, ytd-reel-item-renderer');
        if (container) container.remove();
    });

    // Remove Shorts from search results
    const searchShorts = document.querySelectorAll('ytd-video-renderer a[href^="/shorts"]');
    searchShorts.forEach(video => {
        const container = video.closest('ytd-video-renderer');
        if (container) container.remove();
    });
}

function removeShortChips() {
    // Remove Shorts filter chips/buttons in subscriptions and home page
    const chips = document.querySelectorAll('yt-chip-cloud-chip-renderer');
    chips.forEach(chip => {
        if (chip.textContent.trim() === "Shorts") {
            chip.remove();
        }
    });
}

function tryRemoveShorts() {
    try {
        chrome.storage.local.get('blockingEnabled', data => {
            if (data.blockingEnabled) {
                removeShortButtons();
                removeShortSections();
                removeShortChips();
            }
        });
    }
    catch {
        removeShortButtons();
        removeShortSections();
        removeShortChips();
    }
}

// Initialize and set up observers
window.addEventListener("load", function () {
    tryRemoveShorts();

    // Create a more specific observer for better performance
    const observer = new MutationObserver(function(mutations) {
        for (const mutation of mutations) {
            if (mutation.addedNodes.length) {
                tryRemoveShorts();
                break;
            }
        }
    });

    // Observe specific parts of the page that contain dynamic content
    const observeTarget = document.querySelector('ytd-app') || document.body;
    observer.observe(observeTarget, {
        childList: true,
        subtree: true
    });

    // Cleanup observer on page unload
    window.addEventListener('unload', function() {
        observer.disconnect();
    });
});
