import { ExtensionMessage } from "../common/interfaces";
import { record } from "rrweb";
import { eventWithTime, listenerHandler } from "rrweb/typings/types";

let stopFn: listenerHandler = null;
let events: eventWithTime[] = [];

/**
 * Chrome listener for messages sent between the different scripts used by the
 * extension.
 */
chrome.runtime.onMessage.addListener(function (m: ExtensionMessage) {
  if (m.action == "start recording" && m.source == "background") {
    recordInteractions();
    alert("Recording started.");
  } else if (m.action == "stop recording" && m.source == "background") {
    stopRecording();
    alert("Recording stopped.");
  }
});

function recordInteractions(): void {
  stopFn = record({
    emit(event) {
      events.push(event);
    },
  });
}

function stopRecording(): void {
  if (stopFn && events.length > 2) {
    stopFn();
    const eventCopy = events;
    events = [];
    chrome.runtime.sendMessage<ExtensionMessage>({
      action: "recording stopped",
      source: "content",
      website: window.location.href,
      events: eventCopy,
    });
  }
}
