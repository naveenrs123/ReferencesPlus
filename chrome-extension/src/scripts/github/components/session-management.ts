import { ChangesSavedModal } from "./changes-saved-modal";
import { SaveSessionModal } from "./save-session-modal";
import { PlayerBtn, TextInput } from "./util-components";

export function SessionManagement(idx: number) {
  const container = document.createElement("div") as HTMLDivElement;
  container.classList.add("d-flex");
  container.style.flexDirection = "column";

  const sessionID = document.createElement("label") as HTMLLabelElement;
  sessionID.innerText = "Session ID: N/A";
  sessionID.style.textAlign = "right";
  sessionID.classList.add("text-normal");

  const saveContainer = document.createElement("div") as HTMLDivElement;
  saveContainer.classList.add("d-flex");
  saveContainer.style.alignSelf = "flex-end";
  const saveAs = PlayerBtn("Save As");
  saveAs.addEventListener("click", () => {
    const playerContainer = document.getElementById(`refg-github-player-${idx}`);
    const oldModal = playerContainer.querySelector(`#refg-save-session-modal-${idx}`);
    if (oldModal) playerContainer.removeChild(oldModal);
    if (playerContainer.hasChildNodes()) {
      playerContainer.appendChild(SaveSessionModal(idx));
    }
  })

  const save = PlayerBtn("Save");
  save.addEventListener("click", () => {
    const playerContainer = document.getElementById(`refg-github-player-${idx}`);
    const oldModal = playerContainer.querySelector(`#refg-save-session-modal-${idx}`);
    if (oldModal) playerContainer.removeChild(oldModal);
    if (playerContainer.hasChildNodes()) {
      playerContainer.appendChild(ChangesSavedModal("website", "title", "12345", idx));
    }
  })

  saveContainer.appendChild(saveAs);
  saveContainer.appendChild(save);

  const loadSessionContainer = document.createElement("div") as HTMLDivElement;
  loadSessionContainer.classList.add("d-flex");
  loadSessionContainer.style.alignItems = "center";

  const label = document.createElement("label") as HTMLLabelElement;
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
