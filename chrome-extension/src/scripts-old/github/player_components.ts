export function buildInteractions() {
  const interactions = document.createElement("div") as HTMLDivElement;
  interactions.style.width = "300px";
  interactions.style.padding = "10px";
  interactions.style.maxHeight = "600px";
  interactions.style.overflowY = "auto";
  interactions.id = "refg-interactions";
  return interactions;
}

export function buildPlayer() {
  const player = document.createElement("div") as HTMLDivElement;
  player.id = "refg-github-player";
  player.style.display = "flex";
  player.style.overflowY = "auto";
  return player;
}

export function buildPlayerBtn(text: string) {
  const btn = document.createElement("button") as HTMLButtonElement;
  btn.classList.add("m-2", "btn");
  btn.innerText = text;
  return btn;
}

/**
 * Create the emulator button responsible for opening the emulator interface.
 * @param parent A parent node that will contain the emulator button as a child.
 * @returns The emulator button.
 */
export function buildEmulatorBtn(parent: ParentNode): HTMLButtonElement {
  let emulator = document.getElementById("refg-github-emulator") as HTMLButtonElement;
  if (emulator != null) parent.removeChild(emulator);
  emulator = document.createElement("button");
  emulator.id = "refg-github-emulator";
  emulator.innerText = "X";
  emulator.setAttribute("role", "button");
  emulator.classList.add("toolbar-item", "details-reset", "btn-octicon");
  return emulator;
}

/**
 * Create a container div element that will contain emulator interactions.
 * @returns The created container div.
 */
export function buildPlayerContainer(): HTMLDivElement {
  const playerContainer = document.createElement("div") as HTMLDivElement;
  playerContainer.id = "refg-github-em";
  playerContainer.style.width = "fit-content";
  playerContainer.style.maxHeight = "700px";

  playerContainer.style.marginTop = "10px";
  playerContainer.style.marginBottom = "10px";
  playerContainer.style.zIndex = "20000";
  playerContainer.style.paddingLeft = "56px";
  playerContainer.classList.add("d-none");

  playerContainer.setAttribute("role", "menu");
  return playerContainer;
}
