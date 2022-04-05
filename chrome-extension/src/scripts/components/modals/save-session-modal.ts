import { prDetails, stateMap } from "../../common/helpers";
import { ButtonColor, CheckUniqueResponse, InterfaceStateReq, SaveResponse } from "../../common/interfaces";
import { ChangesSavedModal } from "./changes-saved-modal";
import { PlayerBtn } from "../util-components";

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
  save.addEventListener("click", (event: MouseEvent) => handleSave(event, idx));
  const cancel = PlayerBtn("Cancel", ButtonColor.Red);
  cancel.addEventListener("click", (event: MouseEvent) => handleCancel(event, idx));

  const buttonContainer = document.createElement("div");
  buttonContainer.classList.add("d-flex", "flex-justify-center");
  buttonContainer.appendChild(save);
  buttonContainer.appendChild(cancel);

  const errorMsg: HTMLParagraphElement = document.createElement("p");
  errorMsg.id = `refg-save-session-error-${idx}`;
  errorMsg.classList.add("m-2", "d-none");
  errorMsg.innerText = "";

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
  container.appendChild(errorMsg);

  return container;
}

function handleSave(event: MouseEvent, idx: number): void {
  const input = document.getElementById(`refg-save-session-input-${idx}`) as HTMLInputElement;
  stateMap[idx].sessionDetails.title = input.value;

  fetch(`http://127.0.0.1:5000/checkUnique/${input.value}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prDetails: prDetails,
    }),
  })
    .then((res: Response) => res.json())
    .then((data: CheckUniqueResponse) => {
      if (!data.isUnique && !stateMap[idx].allowOverwrite) {
        const errorMsg = document.getElementById(`refg-save-session-error-${idx}`);
        errorMsg.innerText = "An existing document with this title has been detected, do you want to overwrite it?";
        errorMsg.classList.remove("d-none");
        stateMap[idx].allowOverwrite = true;
        return Promise.reject("Attempt to save again.");
      } else {
        stateMap[idx].allowOverwrite = false;
        const stateCopy: InterfaceStateReq = {
          events: stateMap[idx].events,
          sessionDetails: stateMap[idx].sessionDetails,
          comments: stateMap[idx].comments,
          nextCommentId: stateMap[idx].nextCommentId,
        };

        const stringifiedData = JSON.stringify({
          prDetails: prDetails,
          state: stateCopy,
        });

        return fetch("http://127.0.0.1:5000/insertSession", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: stringifiedData,
        });
      }
    })
    .then((res: Response) => {
      return res.json();
    })
    .then((data: SaveResponse) => {
      console.log(data.id);
      if (data.id != "") stateMap[idx].sessionDetails.id = data.id;
      const playerContainer = document.getElementById(`refg-github-player-${idx}`);
      const oldModal = document.getElementById(`refg-save-session-modal-${idx}`);
      playerContainer.removeChild(oldModal);
      playerContainer.appendChild(ChangesSavedModal(idx));
    })
    .catch(() => {
      return;
    });
}

function handleCancel(event: MouseEvent, idx: number): void {
  const playerContainer = document.getElementById(`refg-github-player-${idx}`);
  const oldModal = document.getElementById(`refg-save-session-modal-${idx}`);
  playerContainer.removeChild(oldModal);
}
