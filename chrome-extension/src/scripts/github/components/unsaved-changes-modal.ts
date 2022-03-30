import { stateMap } from "../../common/helpers";
import { ButtonColor } from "../../common/interfaces";
import { ChangesSavedModal } from "./changes-saved-modal";
import { SaveSessionModal } from "./save-session-modal";
import { PlayerBtn } from "./util-components";

export function UnsavedChangesModal(idx: number): HTMLDivElement {
  const heading = document.createElement("h3");
  heading.innerText = "You have unsaved changes!";

  const sub = document.createElement("p");
  sub.innerText = "Do you want to save them?";

  const textContainer = document.createElement("div");
  textContainer.classList.add("d-flex", "flex-column", "flex-justify-center", "flex-items-center");
  textContainer.appendChild(heading);
  textContainer.appendChild(sub);

  const ok = PlayerBtn("OK", ButtonColor.Green);
  ok.addEventListener("click", (event: MouseEvent) => {
    handleOK(event, idx);
  });
  const close = PlayerBtn("Close", ButtonColor.Red);
  close.addEventListener("click", (event: MouseEvent) => {
    handleClose(event, idx);
  });
  const cancel = PlayerBtn("cancel", ButtonColor.Default);
  cancel.addEventListener("click", (event: MouseEvent) => {
    handleCancel(event, idx);
  });

  const buttonContainer = document.createElement("div");
  buttonContainer.classList.add("d-flex", "flex-justify-center");
  buttonContainer.appendChild(ok);
  buttonContainer.appendChild(close);
  buttonContainer.appendChild(cancel);

  const container = document.createElement("div");
  container.id = `refg-unsaved-changes-modal-${idx}`;
  container.classList.add(
    "p-4",
    "d-flex",
    "flex-column",
    "flex-justify-center",
    "flex-items-center",
    "position-absolute",
    "color-bg-overlay",
    "color-border-default"
  );

  container.style.top = "50%";
  container.style.left = "50%";
  container.style.transform = "translate(-50%, -50%)";
  container.appendChild(textContainer);
  container.appendChild(buttonContainer);

  return container;
}

function handleOK(event: MouseEvent, idx: number): void {
  const playerContainer = document.getElementById(`refg-github-player-${idx}`);
  const oldModal = document.getElementById(`refg-unsaved-changes-modal-${idx}`);
  playerContainer.removeChild(oldModal);
  if (stateMap[idx].sessionDetails.title == "") {
    playerContainer.appendChild(SaveSessionModal(idx));
  } else {
    playerContainer.appendChild(ChangesSavedModal(idx));
  }
}

function handleClose(event: MouseEvent, idx: number): void {
  const interfaceContainer = document.getElementById(`refg-interface-container-${idx}`);
  interfaceContainer.parentElement.removeChild(interfaceContainer);
  stateMap[idx] = null;
}

function handleCancel(event: MouseEvent, idx: number): void {
  const playerContainer = document.getElementById(`refg-github-player-${idx}`);
  const oldModal = document.getElementById(`refg-unsaved-changes-modal-${idx}`);
  playerContainer.removeChild(oldModal);
}
