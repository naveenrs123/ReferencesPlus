import { ExtensionMessage } from "../common/interfaces";

function receiveRecording(): void {
  chrome.runtime.sendMessage<ExtensionMessage>({
    action: "[GITHUB] Ready to Receive",
    source: "github_content",
  });
}

window.addEventListener("DOMContentLoaded", () => {
  document.getElementById("receive-recording").addEventListener("click", receiveRecording);
});
