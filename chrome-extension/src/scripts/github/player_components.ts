export function buildInteractions() {
  const interactions = document.createElement("div") as HTMLDivElement;
  interactions.style.width = "300px";
  interactions.style.padding = "10px";
  interactions.style.maxHeight = "600px";
  interactions.style.overflowY = "auto";
  interactions.id = "refg-interactions";
  return interactions;
}

export function Player() {
  const player = document.createElement("div") as HTMLDivElement;
  player.id = "refg-github-player";
  player.style.display = "flex";
  player.style.overflowY = "auto";
  return player;
}

export function PlayerBtn(text: string) {
  const btn = document.createElement("button") as HTMLButtonElement;
  btn.classList.add("m-2", "btn");
  btn.innerText = text;
  return btn;
}

export function TextInput(placeholder: string, id?: string) {
  const input = document.createElement("input") as HTMLInputElement;
  input.type = "text";
  input.placeholder = placeholder;
  input.classList.add("form-control")
  if (id !== undefined) input.id = id;
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
  container.id = "refg-player-container";

  container.style.maxHeight = "700px";
  container.style.marginTop = "10px";
  container.style.marginBottom = "10px";
  container.style.zIndex = "20000";
  container.style.paddingLeft = "56px";
  container.classList.add("d-none");

  container.setAttribute("role", "menu");
  return container;
}
