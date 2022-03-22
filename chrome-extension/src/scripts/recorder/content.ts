import { ExtensionMessage } from "../common/interfaces";
import { record } from "rrweb";
import { eventWithTime } from "rrweb/typings/types";

let stopFn: Function = null;
let events: eventWithTime[] = [];

/**
 * Chrome listener for messages sent between the different scripts used by the
 * extension.
 */
chrome.runtime.onMessage.addListener(function (m: ExtensionMessage) {
  if (m.action == "start recording" && m.source == "background") {
    recordInteractions();
  } else if (m.action == "stop recording" && m.source == "background") {
    stopRecording();
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
  if (stopFn) {
    stopFn();
    let eventCopy = events
    events = [];
    chrome.runtime.sendMessage<ExtensionMessage>(
      { action: "recording stopped", source: "content", events: eventCopy },
    );
  }
}