import { buttonColorToClass } from "../../common/helpers";
import { ButtonColor } from "../../common/interfaces";

export function Player() {
  const player = document.createElement("div") as HTMLDivElement;
  player.id = "refg-github-player";
  player.classList.add("d-flex");
  player.style.overflowY = "auto";
  return player;
}

export function PlayerBtn(text: string, color: ButtonColor = ButtonColor.Default, toggleClass: string[] = [], id?: string) {
  const btn = document.createElement("button") as HTMLButtonElement;
  if (id !== undefined) btn.id = id;
  btn.classList.add("m-2", "btn", ...toggleClass);
  btn.innerText = text;
  return btn;
}

export function MiniPlayerBtn(
  text: string,
  color: ButtonColor,
  toggleClass: string[] = [],
  id?: string
) {
  const btn = document.createElement("button") as HTMLButtonElement;
  if (id !== undefined) btn.id = id;
  btn.classList.add("mx-2", "btn-sm", buttonColorToClass(color), ...toggleClass);
  btn.innerText = text;
  return btn;
}

export function TextInput(placeholder: string, toggleClass: string[] = [], id?: string) {
  const input = document.createElement("input") as HTMLInputElement;
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
export function ShowInterfaceBtn(parent: ParentNode): HTMLButtonElement {
  let btn = document.getElementById("refg-show-interface") as HTMLButtonElement;
  if (btn != null) parent.removeChild(btn);
  btn = document.createElement("button");
  btn.id = "refg-show-interface";
  btn.innerText = "X";
  btn.setAttribute("role", "button");
  btn.classList.add("toolbar-item", "details-reset", "btn-octicon");
  return btn;
}

/**
 * Create a container div element that will contain emulator interactions.
 * @returns The created container div.
 */
export function InterfaceContainer(): HTMLDivElement {
  const container = document.createElement("div") as HTMLDivElement;
  container.id = "refg-interface-container";
  container.classList.add("d-none");
  container.style.maxHeight = "1000px";
  container.style.margin = "10px 0px";
  container.style.zIndex = "20000";
  container.style.paddingLeft = "56px";
  container.setAttribute("role", "menu");
  return container;
}
