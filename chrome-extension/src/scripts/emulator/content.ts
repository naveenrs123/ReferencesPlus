import g from "../common/globals";
import * as h from "../common/helpers";
import { ExtensionMessage } from "../common/interfaces";
import { setBorders, toggleBorders } from "./features/borders";
import { activateDOMChangeForm } from "./features/domchange";
import { toggleRecord } from "./features/recording";
import { recordInteractions, stopRecording } from "./features/recordreplay";
import { openTooltip, onMouseMove, setTooltips, toggleTooltips } from "./features/tooltip";

function activate(): void {
  window.addEventListener("mousemove", onMouseMove);
  if (!document.getElementById("toggle-emulation")) createEmulatorButtons();
  setBorders();
  setTooltips();
  h.setState();
}

/**
 * Creates a tooltip at a specified position on the page with useful information
 * about a DOM element that is being moused-over.
 *
 * @param properties An object containing useful properties of the element.
 * @returns the tooltip.
 */

function createEmulatorContainer(): HTMLDivElement {
  let container: HTMLDivElement = document.createElement("div");
  container.id = "refg-emulator";
  container.style.display = "flex";
  container.style.flexDirection = "row";
  container.style.position = "fixed";
  container.style.top = "60px";
  container.style.left = "20px";
  container.style.zIndex = "200000";
  container.style.backgroundColor = "white";
  container.style.border = "1px solid black";
  container.style.height = "45px";
  container.style.fontSize = "14px";
  return container;
}

/**
 * Creates the emulator buttons panel, which contains all the controls needed
 * for emulation and video capture.
 */
function createEmulatorButtons(): void {
  // Set up container
  let container: HTMLDivElement = createEmulatorContainer();

  // construct emulator controls.
  let dragHeader: HTMLDivElement = h.buildButtonDiv("refg-emulator-header", "Move");
  let colorPicker: HTMLInputElement = h.buildColorPicker();
  let btn1: HTMLAnchorElement = h.buildEmulatorButton("toggle-borders", "Borders");
  let btn2: HTMLAnchorElement = h.buildEmulatorButton("toggle-tooltips", "Tooltips");
  let btn3: HTMLAnchorElement = h.buildEmulatorButton("toggle-recording", "Recording");
  let btn4: HTMLAnchorElement = h.buildEmulatorButton("refg-download", "Download", true);
  let btn5: HTMLAnchorElement = h.buildEmulatorButton("refg-log", "Log", true);

  g.downloadButton = btn4;
  g.logButton = btn5;

  btn1.addEventListener("click", toggleBorders());
  btn2.addEventListener("click", toggleTooltips());
  btn3.addEventListener("click", toggleRecord());

  // build and insert component
  container.appendChild(dragHeader);
  container.appendChild(colorPicker);
  container.appendChild(btn1);
  container.appendChild(btn2);
  container.appendChild(btn3);
  container.appendChild(btn4);
  container.appendChild(btn5);

  h.dragElement(container, dragHeader);
  document.body.insertBefore(container, document.body.childNodes[0]);
}

/**
 * Chrome listener for messages sent between the different scripts used by the
 * extension.
 */
chrome.runtime.onMessage.addListener(function (m: ExtensionMessage, sender, sendResponse) {
  if (m.action == "toggle emulation" && m.source == "background") {
    let container: HTMLDivElement = document.getElementById("refg-emulator") as HTMLDivElement;
    if (!container) {
      g.emulatorActive = true;
      activate();
    } else {
      g.emulatorActive = false;
      window.removeEventListener("mousemove", onMouseMove);
      document.body.removeChild(container);
      h.setState();
    }
  } else if (m.action == "initial load" && m.source == "background") {
    h.getState();
    if (g.emulatorActive) activate();
  } else if (m.action == "start recording" && m.source == "background") {
    recordInteractions();
  } else if (m.action == "stop recording" && m.source == "background") {
    stopRecording();
  }
});

function keyboardEvents(event: KeyboardEvent): void {
  if (event.altKey && event.key.toLowerCase() === "t" && g.tooltipState) {
    openTooltip();
  }

  if (event.altKey && event.key.toLowerCase() === "y") {
    let oldTooltip = document.getElementById("refg-tooltip");
    if (oldTooltip) document.body.removeChild(oldTooltip);
  }

  if (event.altKey && event.shiftKey && event.key.toLowerCase() === "d" && g.emulatorActive) {
    activateDOMChangeForm();
  }

  if (event.altKey && event.shiftKey && event.key.toLowerCase() === "e") {
    let DOMChangeForm = document.getElementById("refg-dom-form");
    if (DOMChangeForm) document.body.removeChild(DOMChangeForm);
    g.DOMFormOpen = false;
  }
}

document.addEventListener("keydown", keyboardEvents);
