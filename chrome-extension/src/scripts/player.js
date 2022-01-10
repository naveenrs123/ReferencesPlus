

function recordPageClick() {
    chrome.runtime.sendMessage({action: "record page"});
}

window.addEventListener("DOMContentLoaded", () => {
    document.getElementById('record-page').addEventListener('click', recordPageClick);
})