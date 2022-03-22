import { IDictionary } from "./interfaces";

/**
 * Function that allows an element to be dragged across a page.
 *
 * Taken from: https://www.w3schools.com/howto/howto_js_draggable.asp
 *
 * @param elmnt The element you want to make draggable.
 */
export function dragElement(elmnt: HTMLElement, dragElmnt: HTMLElement): void {
  let pos1: number = 0;
  let pos2: number = 0;
  let pos3: number = 0;
  let pos4: number = 0;

  if (dragElmnt) {
    // if present, the header is where you move the DIV from:
    dragElmnt.onmousedown = dragMouseDown;
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

/**
 * Creates the header element used to drag the emulator buttons container.
 * Also adds appropriate styles.
 *
 * @returns A HTML Div Element representing the header used for dragging.
 */
export function buildButtonDiv(id: string, content: string, color: string = "blue", cursor: string = "auto"): HTMLDivElement {
  let grab: HTMLDivElement = document.createElement("div");
  grab.id = id;
  grab.style.backgroundColor = color;
  grab.style.cursor = cursor;
  grab.style.color = "#FFFFFF";
  grab.style.width = "55px";
  grab.style.textAlign = "center";
  grab.style.display = "flex";
  grab.style.justifyContent = "center";
  grab.style.alignItems = "center";

  let text: HTMLParagraphElement = document.createElement("p");
  text.textContent = content;
  text.style.margin = "0";
  grab.appendChild(text);

  return grab;
}

export function shiftPosition(pos: number, elmntDimension: number, clientDimension: number) {
  while (pos + elmntDimension >= clientDimension) {
    pos -= 25;
  }
  return pos;
}
