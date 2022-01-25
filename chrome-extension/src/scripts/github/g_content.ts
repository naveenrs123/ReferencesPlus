import rrwebPlayer from "rrweb-player";
import { buildDragHeader, dragElement } from "../common/helpers";
import { ExtensionMessage } from "../common/interfaces";

function makeInterface(): void {
  let detailsButton: HTMLDetailsElement = document.querySelector(
    "markdown-toolbar[for='new_comment_field'] details"
  );
  let detailsParent: ParentNode = detailsButton.parentNode;

  let emulator: HTMLButtonElement = document.getElementById("refg-github-emulator") as HTMLButtonElement;

  if (emulator != null) {
    detailsButton.removeChild(emulator);
  }
  emulator = document.createElement("button");
  emulator.id = "refg-github-emulator";
  emulator.innerText = "X";
  emulator.classList.add("toolbar-item", "details-reset");
  emulator.setAttribute("role", "button");

  let playerContainer: HTMLElement = document.createElement("div");
  playerContainer.id = "refg-github-emulator-container";
  playerContainer.style.position = "absolute";
  playerContainer.style.top = "60px";
  playerContainer.style.left = "20px";
  playerContainer.style.marginTop = "0px";
  playerContainer.classList.add("color-bg-default", "select-menu-modal", "d-none");
  playerContainer.style.zIndex = "20000";
  playerContainer.setAttribute("role", "menu");

  let dragHeader: HTMLDivElement = buildDragHeader("refg-github-emulator-container-header");

  let recordStart: HTMLButtonElement = document.createElement("button");
  recordStart.id = "record-page-start";
  recordStart.classList.add("m-2", "btn");
  recordStart.innerText = "Receive Recording";

  recordStart.addEventListener("click", () => {
    chrome.runtime.sendMessage<ExtensionMessage>({
      action: "[GITHUB] Ready to Receive",
      source: "github_content",
    });
  });
  emulator.addEventListener("click", (event: MouseEvent) => {
    playerContainer.classList.toggle("d-none");
  });

  let player: HTMLDivElement = document.createElement("div");
  player.id = "refg-github-player";

  detailsParent.appendChild(emulator);

  playerContainer.appendChild(dragHeader);
  playerContainer.appendChild(recordStart);
  playerContainer.appendChild(player);
  dragElement(playerContainer, dragHeader);
  document.body.appendChild(playerContainer);
}

chrome.runtime.onMessage.addListener(
  (
    m: ExtensionMessage,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response?: any) => void
  ) => {
    console.log(m);
    if (m.action == "[GITHUB] Send Log" && m.source == "background") {
      let events = m.events;
      if (events && events.length > 2) {
        console.log(events);
      }
      new rrwebPlayer({
        target: document.getElementById("refg-github-player"),
        props: {
          events,
        },
      });
    }
  }
);

makeInterface();

// MISC

function makeButton2(): void {
  let detailsButton: HTMLDetailsElement = document.querySelector(
    "markdown-toolbar[for='new_comment_field'] details"
  );
  let detailsParent: ParentNode = detailsButton.parentNode;

  let emulator: HTMLDetailsElement = document.getElementById(
    "refg-github-emulator"
  ) as HTMLDetailsElement;

  if (emulator != null) {
    detailsButton.removeChild(emulator);
  }
  emulator = document.createElement("details");
  emulator.id = "refg-github-emulator";
  emulator.classList.add("toolbar-item", "details-reset");

  let summary: HTMLElement = document.createElement("summary");
  summary.innerHTML = "X <span class='dropdown-caret'></span>";

  let playerContainer: HTMLElement = document.createElement("details-menu");
  playerContainer.id = "refg-github-emulator-container";
  playerContainer.classList.add("position-absolute", "color-bg-default", "mt-3");
  playerContainer.style.zIndex = "20000";
  playerContainer.setAttribute("role", "menu");

  let frame: HTMLIFrameElement = document.createElement("iframe");
  frame.id = "refg-player-interface";
  frame.src = chrome.runtime.getURL("recordInterface.html");

  playerContainer.appendChild(frame);
  emulator.appendChild(summary);
  emulator.appendChild(playerContainer);
  detailsParent.appendChild(emulator);
}
