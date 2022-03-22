import rrwebPlayer, { RRwebPlayerOptions } from "rrweb-player";
import { INode } from "rrweb-snapshot";
import { Mirror } from "rrweb/typings/types";
import { buildButtonDiv } from "../common/helpers";
import { ExtensionMessage } from "../common/interfaces";
import * as components from "./player_components";
import * as listeners from "./borders";

const eventListeners: { [key: string]: (arg0: any) => void } = {
  mouseover: listeners.mouseOverBorders,
  mouseout: listeners.mouseOutBorders,
  click: handleIFrameClick,
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
  for (let listener in eventListeners) {
    iframe.contentWindow.removeEventListener(listener, eventListeners[listener]);
  }
  iframe.removeAttribute("listener");
}

function enableInteractions(replayer: rrwebPlayer, iframe: HTMLIFrameElement) {
  replayer.getReplayer().enableInteract();
  for (let listener in eventListeners) {
    iframe.contentWindow.addEventListener(listener, eventListeners[listener]);
  }
  iframe.setAttribute("listener", "true");
}

/**
 * Prevents click events from firing when the replayer is active.
 * @param event A mouse event corresponding to a click.
 */
function handleIFrameClick(event: MouseEvent) {
  event.preventDefault();
  event.stopPropagation();
  const mirror: Mirror = replayer.getMirror();
  const targetId: number = mirror.getId(event.target as INode);
  const currTime: number = Math.floor(replayer.getReplayer().getCurrentTime() % 1000);
}

function onPlayerStateChange(state: any) {
  const iframe = document.querySelector("iframe");
  if (state.payload == "playing") {
    disableInteractions(replayer, iframe);
  } else {
    enableInteractions(replayer, iframe);
  }
}

/**
 * Builds the contents of the player container for emulator interactions.
 * @param playerContainer The container to which the contents will be added.
 */
function buildPlayerContents(playerContainer: HTMLDivElement) {
  const buttonsContainer: HTMLDivElement = document.createElement("div") as HTMLDivElement;
  buttonsContainer.style.display = "flex";

  // Button Bar
  const hide: HTMLDivElement = buildButtonDiv("refg-github-hide", "Hide", "green", "pointer");
  const addReference: HTMLButtonElement = components.buildPlayerBtn("Add Reference");

  // Player
  const player: HTMLDivElement = components.buildPlayer();
  hide.addEventListener("click", () => playerContainer.classList.add("d-none"));

  buttonsContainer.appendChild(hide);
  buttonsContainer.appendChild(addReference);
  playerContainer.appendChild(buttonsContainer);
  playerContainer.appendChild(player);
}

function insertReference(target?: number, currTime?: number) {
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
}

/**
 * Create the interface required to support UI references in the GitHub PR page.
 */
function makeInterface(): void {
  const detailsQuery = "markdown-toolbar[for='new_comment_field'] details";
  const details: HTMLDetailsElement = document.querySelector(detailsQuery);
  const detailsParent: ParentNode = details.parentNode;

  const emulator = components.buildEmulatorBtn(detailsParent);
  const playerContainer = components.buildPlayerContainer();

  emulator.addEventListener("click", (event: MouseEvent) => {
    playerContainer.classList.toggle("d-none");
    chrome.runtime.sendMessage<ExtensionMessage>({
      action: "[GITHUB] Ready to Receive",
      source: "github_content",
    });
  });

  buildPlayerContents(playerContainer);
  detailsParent.appendChild(emulator);

  const actionsContainer = document.querySelector(".discussion-timeline-actions") as HTMLDivElement;
  const issueCommentBox = document.getElementById("issue-comment-box") as HTMLDivElement;
  actionsContainer.insertBefore(playerContainer, issueCommentBox);
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

makeInterface();
