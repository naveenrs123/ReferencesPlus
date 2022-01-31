import rrwebPlayer from "rrweb-player";
import { INode } from "rrweb-snapshot";
import { PlayerMachineState, PlayerState } from "rrweb/typings/replay/machine";
import { customEvent, Mirror } from "rrweb/typings/types";
import { buildButtonDiv, buildColorPicker, dragElement } from "../common/helpers";
import { ExtensionMessage } from "../common/interfaces";

let borderTmt: NodeJS.Timeout;
let border: string;
let replayer: rrwebPlayer;
let color: string = "red";

/**
 * Create the emulator button responsible for opening the emulator interface.
 * @param parent A parent node that will contain the emulator button as a child.
 * @returns The emulator button.
 */
function createEmulatorBtn(parent: ParentNode): HTMLButtonElement {
  let emulator: HTMLButtonElement = document.getElementById("refg-github-emulator") as HTMLButtonElement;
  if (emulator != null) parent.removeChild(emulator);
  emulator = document.createElement("button");
  emulator.id = "refg-github-emulator";
  emulator.innerText = "X";
  emulator.classList.add("toolbar-item", "details-reset");
  emulator.setAttribute("role", "button");
  return emulator;
}

/**
 * Create a container div element that will contain emulator interactions.
 * @returns The created container div.
 */
function createPlayerContainer(): HTMLDivElement {
  const playerContainer: HTMLDivElement = document.createElement("div");
  playerContainer.id = "refg-github-em";
  playerContainer.style.width = "fit-content";
  playerContainer.style.position = "absolute";
  playerContainer.style.top = "60px";
  playerContainer.style.left = "20px";
  playerContainer.style.marginTop = "0px";
  playerContainer.style.zIndex = "20000";
  playerContainer.classList.add("color-bg-default", "select-menu-modal", "d-none");
  playerContainer.setAttribute("role", "menu");
  return playerContainer;
}

/**
 * Function that performs actions related to adding borders to elements that are moused over.
 * @param event A mouse event corresponding to a mouseover on an element.
 */
function borderActions(event: MouseEvent) {
  const target = event.target as HTMLElement;
  border = target.style.border;
  target.style.setProperty("border", `3px solid ${color}`, "important");
}

/**
 * Mouseout listener to remove borders from the element.
 * @param event A mouse event corresponding to a mouseout.
 */
function mouseOutBorders(event: any) {
  clearTimeout(borderTmt);
  const target = event.target;
  target.style.border = border;
}

/**
 * Mouseover listener to add borders to an element after a brief timeout.
 * @param event A mouse event corresponding to a mouseover.
 */
function mouseOverBorders(event: any) {
  borderTmt = setTimeout(() => borderActions(event), 500);
}

/**
 * Builds the contents of the player container for emulator interactions.
 * @param playerContainer The container to which the contents will be added.
 */
function buildPlayerContents(playerContainer: HTMLDivElement) {
  const buttonsContainer: HTMLDivElement = document.createElement("div") as HTMLDivElement;
  buttonsContainer.style.display = "flex";

  const hide: HTMLDivElement = buildButtonDiv("refg-github-hide", "Hide", "green", "pointer");
  const dragHeader: HTMLDivElement = buildButtonDiv("refg-github-em-header", "Move", "blue", "move");
  const colorPicker: HTMLInputElement = buildColorPicker();

  const toggleInteraction: HTMLButtonElement = document.createElement("button");
  toggleInteraction.classList.add("m-2", "btn");
  toggleInteraction.innerText = "Toggle Interaction";

  const addReference: HTMLButtonElement = document.createElement("button");
  addReference.classList.add("m-2", "btn");
  addReference.innerText = "Add Reference";

  const player: HTMLDivElement = document.createElement("div");
  player.id = "refg-github-player";
  player.style.display = "flex";
  player.style.height = "min-content";

  const interactions: HTMLDivElement = document.createElement("div");
  interactions.style.width = "300px";
  interactions.style.padding = "10px";
  interactions.style.overflowY = "auto";

  const interactionsHeader: HTMLHeadingElement = document.createElement("h3");
  interactionsHeader.innerText = "References";

  colorPicker.addEventListener("input", (event: InputEvent) => {
    let target: HTMLInputElement = event.target as HTMLInputElement;
    color = target.value;
  });

  hide.addEventListener("click", () => {
    playerContainer.classList.add("d-none");
  });

  toggleInteraction.addEventListener("click", onToggleInteraction);

  buttonsContainer.appendChild(dragHeader);
  buttonsContainer.appendChild(hide);
  buttonsContainer.appendChild(colorPicker);
  buttonsContainer.appendChild(toggleInteraction);
  buttonsContainer.appendChild(addReference);

  interactions.appendChild(interactionsHeader);
  player.appendChild(interactions);

  playerContainer.appendChild(buttonsContainer);
  playerContainer.appendChild(player);
  dragElement(playerContainer, dragHeader);
}

/**
 * Prevents click events from firing when the replayer is active.
 * @param event A mouse event corresponding to a click.
 */
function preventClicks(event: MouseEvent) {
  event.preventDefault();
  event.stopPropagation();
  const mirror: Mirror = replayer.getMirror();
  console.log(mirror.getId(event.target as INode));
}

/**
 * Event listener for the toggle borders button.
 */
function onToggleInteraction() {
  const iframe = document.querySelector("iframe");
  if (iframe) {
    iframe.setAttribute("sandbox", "allow-same-origin");
    if (iframe.getAttribute("listener")) {
      replayer.getReplayer().disableInteract();
      iframe.contentWindow.removeEventListener("mouseover", mouseOverBorders);
      iframe.contentWindow.removeEventListener("mouseout", mouseOutBorders);
      iframe.contentWindow.removeEventListener("click", preventClicks);
      iframe.removeAttribute("listener");
    } else {
      replayer.getReplayer().enableInteract();
      iframe.contentWindow.addEventListener("mouseover", mouseOverBorders);
      iframe.contentWindow.addEventListener("mouseout", mouseOutBorders);
      iframe.contentWindow.addEventListener("click", preventClicks);
      iframe.setAttribute("listener", "true");
    }
  }
}

/**
 * Create the interface required to support UI references in the GitHub PR page.
 */
function makeInterface(): void {
  const detailsQuery = "markdown-toolbar[for='new_comment_field'] details";
  const details: HTMLDetailsElement = document.querySelector(detailsQuery);
  const detailsParent: ParentNode = details.parentNode;

  const emulator = createEmulatorBtn(detailsParent);
  const playerContainer = createPlayerContainer();

  emulator.addEventListener("click", (event: MouseEvent) => {
    playerContainer.classList.toggle("d-none");
    playerContainer.style.top = event.pageY.toString() + "px";
    playerContainer.style.left = event.pageX.toString() + "px";
    chrome.runtime.sendMessage<ExtensionMessage>({
      action: "[GITHUB] Ready to Receive",
      source: "github_content",
    });
  });

  buildPlayerContents(playerContainer);
  detailsParent.appendChild(emulator);
  document.body.appendChild(playerContainer);
}

/**
 * Listener to handle messages sent by the background script. Messages should be in the
 * form of an {@link ExtensionMessage}.
 */
chrome.runtime.onMessage.addListener((m: ExtensionMessage) => {
  if (m.action == "[GITHUB] Send Log" && m.source == "background") {
    const events = m.events;

    replayer = null;
    let oldPlayers = document.querySelectorAll(".rr-player");
    let playerDiv = document.getElementById("refg-github-player");
    oldPlayers.forEach((player: Element) => {
      if (playerDiv.contains(player)) playerDiv.removeChild(player);
    });

    replayer = new rrwebPlayer({
      target: document.getElementById("refg-github-player"),
      props: {
        events,
        height: 476,
        triggerFocus: false,
        pauseAnimation: true,
        mouseTail: false,
        autoPlay: false,
      },
    });

    replayer.addEventListener("ui-update-player-state", (state: any) => {
      const iframe = document.querySelector("iframe");
      if (state.payload == "playing") {
        disableInteractions(replayer, iframe);
      } else {
        enableInteractions(replayer, iframe);
      }
    });
  }
});

function disableInteractions(replayer: rrwebPlayer, iframe: HTMLIFrameElement) {
  replayer.getReplayer().disableInteract();
  iframe.contentWindow.removeEventListener("mouseover", mouseOverBorders);
  iframe.contentWindow.removeEventListener("mouseout", mouseOutBorders);
  iframe.contentWindow.removeEventListener("click", preventClicks);
  iframe.removeAttribute("listener");
}

function enableInteractions(replayer: rrwebPlayer, iframe: HTMLIFrameElement) {
  replayer.getReplayer().enableInteract();
  iframe.contentWindow.addEventListener("mouseover", mouseOverBorders);
  iframe.contentWindow.addEventListener("mouseout", mouseOutBorders);
  iframe.contentWindow.addEventListener("click", preventClicks);
  iframe.setAttribute("listener", "true");
}

makeInterface();
