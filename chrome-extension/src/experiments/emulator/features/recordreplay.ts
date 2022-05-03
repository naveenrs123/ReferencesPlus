import g from "../../common/globals";
import { record } from "rrweb";
import { ExtensionMessage } from "../../common/interfaces";

export function recordInteractions(): void {
  g.stopFn = record({
    emit(event) {
      g.events.push(event);
    },
  });
}

export function stopRecording(): void {
  if (g.stopFn) {
    g.stopFn();
    chrome.runtime.sendMessage<ExtensionMessage>(
      { action: "recording stopped", source: "content", events: g.events },
      (message) => {
        console.log(message);
        if (message.response != "event log received") {
          alert("Recording error encountered, please record again.");
        }
        g.events = [];
      }
    );
  }
}
