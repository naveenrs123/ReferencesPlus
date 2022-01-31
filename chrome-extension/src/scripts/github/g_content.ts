import rrwebPlayer from "rrweb-player";
import { buildButtonDiv, dragElement } from "../common/helpers";
import { ExtensionMessage } from "../common/interfaces";

let borderTmt: any;
let border: any;
let replayer: rrwebPlayer;

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
  target.style.setProperty("border", "3px solid red", "important");
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
  buttonsContainer.style.marginBottom = "10px"

  const hide: HTMLDivElement = buildButtonDiv("refg-github-hide", "Hide", "green");
  const dragHeader: HTMLDivElement = buildButtonDiv("refg-github-em-header", "Move", "blue", "move");

  const recordStart: HTMLButtonElement = document.createElement("button");
  recordStart.id = "record-page-start";
  recordStart.classList.add("m-2", "btn");
  recordStart.innerText = "Receive Recording";

  const toggleBorders: HTMLButtonElement = document.createElement("button");
  toggleBorders.classList.add("m-2", "btn");
  toggleBorders.innerText = "Toggle Borders";

  const player: HTMLDivElement = document.createElement("div");
  player.id = "refg-github-player";

  hide.addEventListener("click", () => {
    playerContainer.classList.add("d-none");
  });

  recordStart.addEventListener("click", () => {
    chrome.runtime.sendMessage<ExtensionMessage>({
      action: "[GITHUB] Ready to Receive",
      source: "github_content",
    });
  });

  toggleBorders.addEventListener("click", onToggleBorders);

  buttonsContainer.appendChild(dragHeader);
  buttonsContainer.appendChild(hide);
  buttonsContainer.appendChild(recordStart);
  buttonsContainer.appendChild(toggleBorders);
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
}

/**
 * Event listener for the toggle borders button.
 */
function onToggleBorders() {
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
      console.log(replayer.getMirror().map);
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
    console.log(events);
    replayer = new rrwebPlayer({
      target: document.getElementById("refg-github-player"),
      props: {
        events,
        height: 476,
        pauseAnimation: true,
        mouseTail: false,
        autoPlay: false,
      },
    });
  }
});

makeInterface();
