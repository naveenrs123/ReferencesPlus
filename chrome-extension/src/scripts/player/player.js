import { rrwebPlayer } from "../external/rrwebPlayer.js";

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

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action == "send log" && message.source == "background") {
    let events = message.events;
    if (events && events.length > 2) {
      console.log(events);
      new rrwebPlayer({
        target: document.getElementById("refg-player"),
        props: {
          events,
        },
      });
    }
  }
});
