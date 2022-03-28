import { ButtonColor } from "../../common/interfaces";
import { PlayerBtn } from "./util-components";

export function SaveSessionModal(idx: number) {
  const heading = document.createElement("h3") as HTMLHeadingElement;
  heading.innerText = "Save Session As";
  heading.classList.add("my-2")

  const input = document.createElement("input") as HTMLInputElement;
  input.type = "text";
  input.placeholder = "Enter Title Here...";
  input.classList.add("form-control", "m-2")

  const save = PlayerBtn("Save", ButtonColor.Green);
  save.addEventListener("click", () => {
    const playerContainer = document.getElementById(`refg-github-player-${idx}`);
    const oldModal = playerContainer.querySelector(`#refg-save-session-modal-${idx}`);
    playerContainer.removeChild(oldModal);
  });
  const cancel = PlayerBtn("Cancel", ButtonColor.Red);
  cancel.addEventListener("click", () => {
    const playerContainer = document.getElementById(`refg-github-player-${idx}`);
    const oldModal = playerContainer.querySelector(`#refg-save-session-modal-${idx}`);
    playerContainer.removeChild(oldModal);
  });

  const buttonContainer = document.createElement("div") as HTMLDivElement;
  buttonContainer.classList.add("d-flex", "flex-justify-center");
  buttonContainer.appendChild(save);
  buttonContainer.appendChild(cancel);

  const container = document.createElement("div") as HTMLDivElement;
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
  container.appendChild(heading)
  container.appendChild(input)
  container.appendChild(buttonContainer);

  return container;
}
