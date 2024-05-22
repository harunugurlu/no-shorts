
function removeShortButtons() {
    const shortsButtons = document.querySelectorAll('a[title="Shorts"]');

    shortsButtons.forEach(button => {
        button.remove();
    });
}

function removeShortSections() {
    const sections = document.querySelectorAll("span#title.style-scope.ytd-rich-shelf-renderer");
    sections.forEach(title => {
        if (title.textContent.trim() === "Shorts") {
            var section = title;
            for (let i = 1; i < 7; i++) {
                section = section.parentElement;
                if (!section){
                    return;
                }
            }

            if (section.className == "style-scope ytd-rich-shelf-renderer") {
                section.style.display = "none";
            }
        }
    });
}

function removeVideoShorts() {
    const reelTitle = document.querySelector("span#title.style-scope.ytd-reel-shelf-renderer");
    if (reelTitle){
        if (reelTitle.textContent.trim() === "Shorts") {
            var section = reelTitle;
            for (let i = 1; i < 5; i++) {
                section = section.parentElement;
                if (section.className == "style-scope ytd-item-section-renderer") {
                    section.style.display = "none";
                    return;
                }
            }
        }
    }
}

function tryRemoveShorts() {
    try {
        chrome.storage.local.get('blockingEnabled', data => {
            if (data.blockingEnabled) {
                removeShortButtons();
                removeShortSections();
                removeVideoShorts();
            }
        });
    }
    catch {
        removeShortButtons();
        removeShortSections();
        removeVideoShorts();
    }
}

window.addEventListener("load", function () {
    tryRemoveShorts();

    const observer = new MutationObserver(function (mutations) {
        tryRemoveShorts();
    });
    observer.observe(document.body, { childList: true, subtree: true });

    window.addEventListener('unload', function () {
        observer.disconnect();
    });
});
