import { stateMap } from "../../common/helpers";
import { ButtonColor } from "../../common/interfaces";
import { ChangesSavedModal } from "./changes-saved-modal";
import { PlayerBtn } from "./util-components";

export function SaveSessionModal(idx: number): HTMLDivElement {
  const heading = document.createElement("h3");
  heading.innerText = "Save Session As";
  heading.classList.add("my-2");

  const input = document.createElement("input");
  input.id = `refg-save-session-input-${idx}`;
  input.type = "text";
  input.placeholder = "Enter Title Here...";
  input.classList.add("form-control", "m-2");

  const save = PlayerBtn("Save", ButtonColor.Green);
  save.addEventListener("click", (event: MouseEvent) => {
    handleSave(event, idx);
  });
  const cancel = PlayerBtn("Cancel", ButtonColor.Red);
  cancel.addEventListener("click", (event: MouseEvent) => {
    handleCancel(event, idx);
  });

  const buttonContainer = document.createElement("div");
  buttonContainer.classList.add("d-flex", "flex-justify-center");
  buttonContainer.appendChild(save);
  buttonContainer.appendChild(cancel);

  const container = document.createElement("div");
  container.id = `refg-save-session-modal-${idx}`;
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
  container.appendChild(heading);
  container.appendChild(input);
  container.appendChild(buttonContainer);

  return container;
}

function handleSave(event: MouseEvent, idx: number): void {
  const input = document.getElementById(`refg-save-session-input-${idx}`) as HTMLInputElement;
  stateMap[idx].sessionDetails = {
    website: "website.com",
    title: input.value,
    id: "12345",
  };

  const playerContainer = document.getElementById(`refg-github-player-${idx}`);
  const oldModal = document.getElementById(`refg-save-session-modal-${idx}`);
  playerContainer.removeChild(oldModal);
  playerContainer.appendChild(ChangesSavedModal(idx));
}

function handleCancel(event: MouseEvent, idx: number): void {
  const playerContainer = document.getElementById(`refg-github-player-${idx}`);
  const oldModal = document.getElementById(`refg-save-session-modal-${idx}`);
  playerContainer.removeChild(oldModal);
}
