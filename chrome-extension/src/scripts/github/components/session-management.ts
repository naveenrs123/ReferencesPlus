import { stateMap } from "../../common/helpers";
import { ChangesSavedModal } from "./changes-saved-modal";
import { SaveSessionModal } from "./save-session-modal";
import { PlayerBtn, TextInput } from "./util-components";

export function SessionManagement(idx: number): HTMLDivElement {
  const container = document.createElement("div");
  container.classList.add("d-flex");
  container.style.flexDirection = "column";

  const sessionID = document.createElement("label");
  sessionID.innerText = "Session ID: N/A";
  sessionID.style.textAlign = "right";
  sessionID.classList.add("text-normal");

  const saveContainer = document.createElement("div");
  saveContainer.classList.add("d-flex");
  saveContainer.style.alignSelf = "flex-end";
  const saveAs = PlayerBtn("Save As");
  saveAs.addEventListener("click", (event: MouseEvent) => {
    handleSaveAs(event, idx);
  });

  const save = PlayerBtn("Save");
  save.addEventListener("click", (event: MouseEvent) => {
    handleSave(event, idx);
  });

  saveContainer.appendChild(saveAs);
  saveContainer.appendChild(save);

  const loadSessionContainer = document.createElement("div");
  loadSessionContainer.classList.add("d-flex");
  loadSessionContainer.style.alignItems = "center";

  const label = document.createElement("label");
  label.htmlFor = "refg-load-session-input";
  label.innerText = "Load Session";
  label.classList.add("text-normal", "mx-2");

  const input = TextInput("Enter title/id.", [], "refg-load-session-input");
  loadSessionContainer.appendChild(label);
  loadSessionContainer.appendChild(input);

  container.appendChild(sessionID);
  container.appendChild(saveContainer);
  container.appendChild(loadSessionContainer);
  return container;
}

function handleSaveAs(event: MouseEvent, idx: number): void {
  const playerContainer = document.getElementById(`refg-github-player-${idx}`);
  const oldModal = playerContainer.querySelector(`#refg-save-session-modal-${idx}`);
  if (oldModal) playerContainer.removeChild(oldModal);
  if (!playerContainer.hasChildNodes() || !stateMap[idx].hasUnsavedChanges) return;
  playerContainer.appendChild(SaveSessionModal(idx));
}

function handleSave(event: MouseEvent, idx: number): void {
  const playerContainer = document.getElementById(`refg-github-player-${idx}`);
  const oldModal = playerContainer.querySelector(`#refg-save-session-modal-${idx}`);
  if (oldModal) playerContainer.removeChild(oldModal);
  if (!playerContainer.hasChildNodes() || !stateMap[idx].hasUnsavedChanges) return;
  if (stateMap[idx].sessionDetails.title == "") {
    playerContainer.appendChild(SaveSessionModal(idx));
  } else {
    playerContainer.appendChild(ChangesSavedModal(idx));
  }
}
