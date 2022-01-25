import g from "./globals";
import { IDictionary } from "./interfaces";

export function setState(): void {
  sessionStorage.setItem("borderState", JSON.stringify(g.borderState));
  sessionStorage.setItem("tooltipState", JSON.stringify(g.tooltipState));
  sessionStorage.setItem("recordingState", JSON.stringify(g.recordingState));
  sessionStorage.setItem("emulatorActive", JSON.stringify(g.emulatorActive));
}

export function getState(): void {
  g.borderState = JSON.parse(sessionStorage.getItem("borderState"));
  g.tooltipState = JSON.parse(sessionStorage.getItem("tooltipState"));
  g.recordingState = JSON.parse(sessionStorage.getItem("recordingState"));
  g.emulatorActive = JSON.parse(sessionStorage.getItem("emulatorActive"));
}

/**
 * Function that allows an element to be dragged across a page.
 *
 * Taken from: https://www.w3schools.com/howto/howto_js_draggable.asp
 *
 * @param elmnt The element you want to make draggable.
 */
export function dragElement(elmnt: HTMLElement): void {
  let pos1: number = 0;
  let pos2: number = 0;
  let pos3: number = 0;
  let pos4: number = 0;

  if (document.getElementById(elmnt.id + "-header")) {
    // if present, the header is where you move the DIV from:
    document.getElementById(elmnt.id + "-header").onmousedown = dragMouseDown;
  } else {
    // otherwise, move the DIV from anywhere inside the DIV:
    elmnt.onmousedown = dragMouseDown;
  }

  function dragMouseDown(e: MouseEvent) {
    e.preventDefault();
    // get the mouse cursor position at startup:
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDragElement;
    // call a function whenever the cursor moves:
    document.onmousemove = elementDrag;
  }

  function elementDrag(e: MouseEvent) {
    e.preventDefault();
    // calculate the new cursor position:
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    // set the element's new position:
    elmnt.style.top = elmnt.offsetTop - pos2 + "px";
    elmnt.style.left = elmnt.offsetLeft - pos1 + "px";
  }

  function closeDragElement() {
    // stop moving when mouse button is released:
    document.onmouseup = null;
    document.onmousemove = null;
  }
}

//#region Build Elements

/**
 * Creates the header element used to drag the emulator buttons container.
 * Also adds appropriate styles.
 *
 * @returns A HTML Div Element representing the header used for dragging.
 */
export function buildDragHeader(): HTMLDivElement {
  let grab: HTMLDivElement = document.createElement("div");
  grab.id = "refg-emulator-header";
  grab.style.backgroundColor = "blue";
  grab.style.cursor = "move";
  grab.style.color = "#FFFFFF";
  grab.style.width = "55px";
  grab.style.textAlign = "center";
  grab.style.display = "flex";
  grab.style.justifyContent = "center";
  grab.style.alignItems = "center";

  let text: HTMLParagraphElement = document.createElement("p");
  text.textContent = "Move";
  text.style.margin = "0";
  grab.appendChild(text);

  return grab;
}

/**
 * Creates an emulator button with the appropriate styling.
 *
 * @param id The id of the button to be created.
 * @param text The text inside the button to be created.
 * @returns The created button.
 */
export function buildEmulatorButton(
  id: string,
  text: string,
  hidden: boolean = false
): HTMLAnchorElement {
  let btn: HTMLAnchorElement = document.createElement("a");
  btn.id = id;
  btn.style.padding = "5px 5px";
  btn.style.color = "#000000";
  btn.style.backgroundColor = "#FFFFFF";
  btn.style.position = "static";
  btn.style.border = "1px solid black";
  btn.style.textAlign = "center";
  btn.style.display = hidden ? "none" : "flex";
  btn.style.justifyContent = "center";
  btn.style.alignItems = "center";

  let t = document.createElement("p");
  t.style.color = "inherit";
  t.style.backgroundColor = "inherit";
  t.style.margin = "0";
  t.textContent = text;

  btn.appendChild(t);
  return btn;
}

export function buildColorPicker(): HTMLInputElement {
  let colorPicker: HTMLInputElement = document.createElement("input");
  colorPicker.type = "color";
  colorPicker.id = "border-color-picker";
  colorPicker.value = g.color;
  colorPicker.style.height = "auto";
  colorPicker.addEventListener("input", (event: InputEvent) => {
    let target: HTMLInputElement = event.target as HTMLInputElement;
    g.color = target.value;
  });
  return colorPicker;
}

//#endregion Build Elements

export function shiftPosition(pos: number, elmntDimension: number, clientDimension: number) {
  while (pos + elmntDimension >= clientDimension) {
    pos -= 25;
  }
  return pos;
}

export function forbiddenElement(event: Event): boolean {
  let emulatorContainer = document.getElementById("refg-emulator");
  let tooltip = document.getElementById("refg-tooltip");
  let DOMChangeForm = document.getElementById("refg-dom-form");

  let target: HTMLElement = event.target as HTMLElement;

  let isForbidden: boolean =
    target.id == "refg-emulator" ||
    target.id == "refg-tooltip" ||
    target.id == "refg-dom-form" ||
    (emulatorContainer != null && emulatorContainer.contains(target)) ||
    (tooltip != null && tooltip?.contains(target)) ||
    (DOMChangeForm != null && DOMChangeForm?.contains(target));

  return isForbidden;
}

export function toggleButton(
  state: string,
  eventListeners: any = {},
  success: Function = null,
  failure: Function = null
): (event: MouseEvent) => void {
  return function (event: MouseEvent) {
    let button: HTMLAnchorElement = event.currentTarget as HTMLAnchorElement;
    if (g[state]) {
      button.style.color = "#000000";
      button.style.backgroundColor = "#FFFFFF";
      for (let listener in eventListeners) {
        window.removeEventListener(listener, eventListeners[listener]);
      }
      g[state] = false;
      if (success) success();
    } else {
      button.style.color = "#FFFFFF";
      button.style.backgroundColor = "#000000";
      for (let listener in eventListeners) {
        window.addEventListener(listener, eventListeners[listener]);
      }
      g[state] = true;
      if (failure) failure();
    }
    setState();
  };
}

export function setButtonManual(id: string, state: string, eventListeners: IDictionary<any> = {}): void {
  let button: HTMLAnchorElement = document.getElementById(id) as HTMLAnchorElement;
  if (button) {
    if (!g[state]) {
      button.style.color = "#000000";
      button.style.backgroundColor = "#FFFFFF";
      for (let listener in eventListeners) {
        window.removeEventListener(listener, eventListeners[listener]);
      }
    } else {
      button.style.color = "#FFFFFF";
      button.style.backgroundColor = "#000000";
      for (let listener in eventListeners) {
        window.addEventListener(listener, eventListeners[listener]);
      }
    }
  }
}
