import { buttonColorToClass } from "../common/helpers";
import { ButtonColor } from "../common/interfaces";

export function Player(idx: number): HTMLDivElement {
  const player = document.createElement("div");
  player.id = `refg-github-player-${idx}`;
  player.classList.add("d-flex", "position-relative");
  return player;
}

export function Comments(idx: number): HTMLDivElement {
  const comments = document.createElement("div");
  comments.id = `refg-comments-${idx}`;
  comments.classList.add("p-2", "d-flex", "overflow-x-auto", "flex-items-center");
  return comments;
}

export function PlayerBtn(
  text: string,
  color: ButtonColor = ButtonColor.Default,
  toggleClass: string[] = [],
  disabled?: boolean,
  id?: string,
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
  id?: string,
): HTMLButtonElement {
  const btn = document.createElement("button");
  if (id !== undefined) btn.id = id;
  btn.classList.add("btn-sm", margins? "mx-2" : "ml-2", buttonColorToClass(color), ...toggleClass);
  btn.setAttribute("type", "button");
  if (disabled) btn.setAttribute("aria-disabled", "true");
  btn.innerText = text;
  return btn;
}

export function TextInput(placeholder: string, toggleClass: string[] = [], id?: string): HTMLInputElement {
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
export function ShowInterfaceBtn(parent: ParentNode, idx: number): HTMLButtonElement {
  let btn = document.getElementById(`refg-show-interface-${idx}`) as HTMLButtonElement;
  if (btn != null) parent.removeChild(btn);
  btn = document.createElement("button");
  btn.id = `refg-show-interface-${idx}`;
  btn.innerText = "X";
  btn.setAttribute("role", "button");
  btn.classList.add("toolbar-item", "details-reset", "btn-octicon");
  return btn;
}

/**
 * Create a container div element that will contain emulator interactions.
 * @returns The created container div.
 */
export function InterfaceContainer(idx: number, isCodeComment: boolean): HTMLDivElement {
  const container = document.createElement("div");
  container.id = `refg-interface-container-${idx}`;
  container.classList.add("d-none");
  container.style.maxHeight = "1000px";
  container.style.margin = "10px 0px";
  container.style.zIndex = "20000";
  container.style.padding = isCodeComment ? "10px" : "0 0 0 56px";
  container.setAttribute("role", "menu");
  return container;
}
