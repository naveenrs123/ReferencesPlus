import rrwebPlayer, { RRwebPlayerOptions } from "rrweb-player";
import { INode } from "rrweb-snapshot";
import { Mirror } from "rrweb/typings/types";
import { ExtensionMessage } from "../common/interfaces";
import * as components from "./player_components";
import { mouseOutBorders, mouseOverBorders } from "./borders";

const codeCommentQuery: string = "markdown-toolbar[for*='new_inline_comment_discussion'] details";
const mainCommentQuery = "markdown-toolbar[for='new_comment_field'] details";

const listeners: { [key: string]: (arg0: any) => void } = {
  mouseover: mouseOverBorders,
  mouseout: mouseOutBorders,
  click: handleIframeClick,
};

const replayerOptions: RRwebPlayerOptions = {
  target: null,
  props: {
    events: [],
    width: 768,
    height: 432,
    triggerFocus: false,
    pauseAnimation: true,
    mouseTail: false,
    autoPlay: false,
  },
};

let replayer: rrwebPlayer;

function disableInteractions(replayer: rrwebPlayer, iframe: HTMLIFrameElement) {
  replayer.getReplayer().disableInteract();
  for (let l in listeners) iframe.contentWindow.removeEventListener(l, listeners[l]);
  iframe.removeAttribute("listener");
}

function enableInteractions(replayer: rrwebPlayer, iframe: HTMLIFrameElement) {
  replayer.getReplayer().enableInteract();
  for (let l in listeners) iframe.contentWindow.addEventListener(l, listeners[l]);
  iframe.setAttribute("listener", "true");
}

/**
 * Prevents click events from firing when the replayer is active.
 * @param event A mouse event corresponding to a click.
 */
function handleIframeClick(event: MouseEvent) {
  event.preventDefault();
  event.stopPropagation();
  const mirror: Mirror = replayer.getMirror();
  const targetId: number = mirror.getId(event.target as INode);
  const currTime: number = Math.floor(replayer.getReplayer().getCurrentTime() % 1000);
  navigator.clipboard.writeText(targetId.toString());
}

function onPlayerStateChange(state: any) {
  const iframe = document.querySelector("iframe");
  if (state.payload == "playing") {
    disableInteractions(replayer, iframe);
  } else {
    enableInteractions(replayer, iframe);
  }
}

function SessionManagementSection() {
  const container = document.createElement("div") as HTMLDivElement;
  container.style.display = "flex";
  container.style.flexDirection = "column";

  const sessionID = document.createElement("label") as HTMLLabelElement;
  sessionID.innerText = "Session ID: N/A";
  sessionID.style.textAlign = "right";
  sessionID.classList.add("text-normal");

  const saveContainer = document.createElement("div") as HTMLDivElement;
  saveContainer.style.display = "flex";
  saveContainer.style.alignSelf = "flex-end";
  const saveAs = components.PlayerBtn("Save As");
  const save = components.PlayerBtn("Save");
  saveContainer.appendChild(saveAs);
  saveContainer.appendChild(save);

  const loadSessionContainer = document.createElement("div") as HTMLDivElement;
  loadSessionContainer.style.display = "flex";
  loadSessionContainer.style.alignItems = "center"

  const label = document.createElement("label") as HTMLLabelElement;
  label.htmlFor = "refg-load-session-input";
  label.innerText = "Load Session";
  label.classList.add("text-normal", "mx-2");

  const input = components.TextInput("Enter title/id.", "refg-load-session-input");
  loadSessionContainer.appendChild(label);
  loadSessionContainer.appendChild(input);

  container.appendChild(sessionID);
  container.appendChild(saveContainer);
  container.appendChild(loadSessionContainer);
  return container;
}

/**
 * Builds the contents of the player container for emulator interactions.
 * @param playerContainer The container to which the contents will be added.
 */
function MainInterface() {
  const closeResetSection: HTMLDivElement = CloseResetSection();
  const sessionManagementSection: HTMLDivElement = SessionManagementSection();

  const buttonsSection: HTMLDivElement = document.createElement("div") as HTMLDivElement;
  buttonsSection.style.display = "flex";
  buttonsSection.style.justifyContent = "space-between";
  buttonsSection.style.alignItems = "flex-start";
  buttonsSection.appendChild(closeResetSection);
  buttonsSection.appendChild(sessionManagementSection);

  const player: HTMLDivElement = components.Player();

  const container = components.InterfaceContainer();
  container.appendChild(buttonsSection);
  container.appendChild(player);
  return container;
}

function CloseResetSection() {
  const container: HTMLDivElement = document.createElement("div") as HTMLDivElement;
  container.style.display = "flex";

  const close: HTMLButtonElement = components.PlayerBtn("Close");
  const reset: HTMLButtonElement = components.PlayerBtn("Reset");

  container.appendChild(close);
  container.appendChild(reset);
  return container;
}

/**
 * Create the interface required to support UI references in the GitHub PR page.
 */
function makeEditableInterface(query: string): void {
  const details: HTMLDetailsElement = document.querySelector(query);
  const detailsParent: ParentNode = details.parentNode;
  const btn = components.ShowInterfaceBtn(detailsParent);
  detailsParent.appendChild(btn);

  const mainInterface = MainInterface();

  btn.addEventListener("click", () => {
    let active: boolean = mainInterface.classList.toggle("d-none");
    if (!active) {
      chrome.runtime.sendMessage<ExtensionMessage>({
        action: "[GITHUB] Ready to Receive",
        source: "github_content",
      });
    }
  });

  const timelineActions = document.querySelector(".discussion-timeline-actions") as HTMLDivElement;
  const issueCommentBox = document.getElementById("issue-comment-box") as HTMLDivElement;
  timelineActions.insertBefore(mainInterface, issueCommentBox);
}

/**
 * Listener to handle messages sent by the background script. Messages should be in the
 * form of an {@link ExtensionMessage}.
 */
chrome.runtime.onMessage.addListener((m: ExtensionMessage) => {
  if (m.action == "[GITHUB] Send Log" && m.source == "background") {
    replayer = null;
    let oldPlayers = document.querySelectorAll(".rr-player");
    let playerDiv = document.getElementById("refg-github-player");
    oldPlayers.forEach((player: Element) => {
      if (playerDiv.contains(player)) playerDiv.removeChild(player);
    });

    replayerOptions.target = document.getElementById("refg-github-player");
    replayerOptions.props.events = m.events;
    replayer = new rrwebPlayer(replayerOptions);
    replayer.addEventListener("ui-update-player-state", onPlayerStateChange);
  }
});

makeEditableInterface(mainCommentQuery);

/* function insertReference(target?: number, currTime?: number) {
  const refContainer = document.getElementById("refg-interactions") as HTMLDivElement;
  const reference = document.createElement("div") as HTMLDivElement;
  reference.style.padding = "15px";
  reference.style.border = "1px solid black";
  reference.style.marginBottom = "10px";
  reference.classList.add("refg-ref");

  const label = document.createElement("p") as HTMLParagraphElement;
  let now = new Date();
  label.innerText = `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;

  const textarea = document.createElement("textarea") as HTMLTextAreaElement;
  textarea.style.width = "100%";
  textarea.style.height = "120px";
  textarea.style.overflowY = "auto;";
  textarea.style.resize = "none";

  const remove = components.buildPlayerBtn("");
  remove.addEventListener("click", () => {
    refContainer.removeChild(reference);
  });

  reference.appendChild(label);

  if (!!target && !!currTime) {
    const refNode = document.createElement("p") as HTMLParagraphElement;
    refNode.innerText = `#${target} @ ${currTime}`;
    refNode.classList.add("text-semibold", "node-reference");
    reference.appendChild(refNode);
  }

  reference.appendChild(remove);
  reference.appendChild(textarea);
  refContainer.appendChild(reference);
} */
