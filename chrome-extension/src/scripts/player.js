function recordPageStart() {
  chrome.runtime.sendMessage({ action: "record page start", source: "player" });
}

function recordPageStop() {
  chrome.runtime.sendMessage({ action: "record page stop", source: "player" });
}

window.addEventListener("DOMContentLoaded", () => {
  document.getElementById("record-page-start").addEventListener("click", recordPageStart);
  document.getElementById("record-page-stop").addEventListener("click", recordPageStop);
});