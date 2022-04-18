import { buttonColorToClass } from "../common/helpers";
import { ButtonColor } from "../common/interfaces";

export function Player(idx: number, readOnly = false): HTMLDivElement {
  const player = document.createElement("div");
  player.id = readOnly ? `refg-github-player-r-${idx}` : `refg-github-player-${idx}`;
  player.classList.add("position-relative", "text-center", "p-2", "overflow-hidden");
  player.style.width = "100%";
  player.style.outline = "1px solid black";

  const readyToReceive = document.createElement("p");
  readyToReceive.style.width = "100%";
  readyToReceive.innerText = "Ready to receive recording.";

  const interactWithPlayer = document.createElement("p");
  interactWithPlayer.style.width = "100%";
  interactWithPlayer.innerText =
    "You can interact with the elements of the recording and comment on them.";

  player.appendChild(readyToReceive);
  player.appendChild(interactWithPlayer);
  return player;
}

export function Comments(idx: number, readOnly = false): HTMLDivElement {
  const comments = document.createElement("div");
  comments.id = readOnly ? `refg-comments-r-${idx}` : `refg-comments-${idx}`;
  comments.classList.add("p-2", "d-flex", "overflow-x-auto", "flex-items-center");
  comments.style.maxWidth = "100%";
  comments.style.flex = "1 1 auto";

  return comments;
}

export function PlayerBtn(
  text: string,
  color: ButtonColor = ButtonColor.Default,
  toggleClass: string[] = [],
  disabled?: boolean,
  id?: string
): HTMLButtonElement {
  const btn = document.createElement("button");
  if (id !== undefined) btn.id = id;
  btn.classList.add("m-2", "btn", buttonColorToClass(color), ...toggleClass);
  btn.setAttribute("type", "button");
  if (disabled) btn.setAttribute("aria-disabled", "true");
  btn.innerText = text;
  return btn;
}

export function MiniPlayerBtn(
  text: string,
  color: ButtonColor,
  toggleClass: string[] = [],
  margins = true,
  disabled?: boolean,
  id?: string
): HTMLButtonElement {
  const btn = document.createElement("button");
  if (id !== undefined) btn.id = id;
  btn.classList.add("btn-sm", margins ? "mx-2" : "ml-2", buttonColorToClass(color), ...toggleClass);
  btn.setAttribute("type", "button");
  if (disabled) btn.setAttribute("aria-disabled", "true");
  btn.innerText = text;
  return btn;
}

export function TextInput(
  placeholder: string,
  toggleClass: string[] = [],
  id?: string
): HTMLInputElement {
  const input = document.createElement("input");
  if (id !== undefined) input.id = id;
  input.classList.add("form-control", ...toggleClass);
  input.type = "text";
  input.placeholder = placeholder;
  return input;
}

/**
 * Create the emulator button responsible for opening the emulator interface.
 * @param parent A parent node that will contain the emulator button as a child.
 * @returns The emulator button.
 */
export function ShowInterfaceBtn(
  parent: ParentNode,
  idx: number,
  readOnly = false
): HTMLButtonElement {
  const id = readOnly ? `refg-show-interface-r${idx}` : `refg-show-interface-${idx}`;
  let btn = document.getElementById(id) as HTMLButtonElement;
  if (btn != null) parent.removeChild(btn);
  btn = document.createElement("button");
  btn.id = id;
  btn.setAttribute("role", "button");
  btn.setAttribute("data-idx", idx.toString());
  btn.classList.add("toolbar-item", "details-reset", "btn-octicon");
  btn.style.fill = "#57606a";

  const deviceCamString =
    '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M16 3.75a.75.75 0 00-1.136-.643L11 5.425V4.75A1.75 1.75 0 009.25 3h-7.5A1.75 1.75 0 000 4.75v6.5C0 12.216.784 13 1.75 13h7.5A1.75 1.75 0 0011 11.25v-.675l3.864 2.318A.75.75 0 0016 12.25v-8.5zm-5 5.075l3.5 2.1v-5.85l-3.5 2.1v1.65zM9.5 6.75v-2a.25.25 0 00-.25-.25h-7.5a.25.25 0 00-.25.25v6.5c0 .138.112.25.25.25h7.5a.25.25 0 00.25-.25v-4.5z"/></svg>';
  const svg = new DOMParser().parseFromString(deviceCamString, "image/svg+xml")
    .firstChild as SVGAElement;
  svg.classList.add("octicon");

  btn.appendChild(svg);
  return btn;
}

/**
 * Create a container div element that will contain emulator interactions.
 * @returns The created container div.
 */
export function InterfaceContainer(
  idx: number,
  isEvenlyPadded = false,
  readOnly = false
): HTMLDivElement {
  const container = document.createElement("div");
  container.id = readOnly ? `refg-interface-container-r-${idx}` : `refg-interface-container-${idx}`;
  container.classList.add("d-none");
  container.style.maxHeight = "1000px";
  container.style.margin = "10px 0px";
  container.style.zIndex = "20000";
  if (isEvenlyPadded) {
    container.style.padding = "10px";
  } else if (!readOnly) {
    container.style.padding = "0 0 0 56px";
  }
  container.setAttribute("role", "menu");
  return container;
}
