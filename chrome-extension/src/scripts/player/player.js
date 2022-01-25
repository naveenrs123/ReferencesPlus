function receiveRecording() {
  chrome.runtime.sendMessage({ action: "[GITHUB] Ready to Receive", source: "github_content" });
}

window.addEventListener("DOMContentLoaded", () => {
  document.getElementById("receive-recording").addEventListener("click", receiveRecording);
});
