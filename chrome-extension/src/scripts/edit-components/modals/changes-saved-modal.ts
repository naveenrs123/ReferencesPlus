import { unsavedCommentClass, waitForSaveClass } from "../../common/constants";
import { stateMap } from "../../common/helpers";
import { ButtonColor } from "../../common/interfaces";
import { PlayerBtn } from "../util-components";

export function ChangesSavedModal(idx: number): HTMLDivElement {
  const heading = document.createElement("h3");
  heading.innerText = "Changes Saved";
  heading.classList.add("my-2");

  const sessionDetails = stateMap[idx].sessionDetails;

  const websiteP = document.createElement("p");
  websiteP.innerText = sessionDetails.website;

  const titleP = document.createElement("p");
  titleP.innerText = `Title: ${sessionDetails.title}`;

  const idP = document.createElement("p");
  idP.innerText = `Id: ${sessionDetails.id}`;

  const ok = PlayerBtn("OK", ButtonColor.Green);
  ok.addEventListener("click", (event: MouseEvent) => handleOK(event, idx));

  const container = document.createElement("div");
  container.id = `refg-changes-saved-modal-${idx}`;
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
  container.appendChild(websiteP);
  container.appendChild(titleP);
  container.appendChild(idP);
  container.appendChild(ok);

  return container;
}

function handleOK(event: MouseEvent, idx: number): void {
  const playerContainer = document.getElementById(`refg-github-player-${idx}`);
  const oldModal = playerContainer.querySelector(`#refg-changes-saved-modal-${idx}`);
  playerContainer.removeChild(oldModal);
  const interfaceContainer = document.getElementById(`refg-interface-container-${idx}`);
  interfaceContainer.querySelectorAll("." + waitForSaveClass).forEach((elem: HTMLElement) => {
    if (elem.classList.contains(unsavedCommentClass)) return;
    elem.removeAttribute("aria-disabled");
  });
  const sessionIdLabel: HTMLLabelElement = interfaceContainer.querySelector(`#refg-session-label-${idx}`);
  sessionIdLabel.innerText = `Session ID: ${stateMap[idx].sessionDetails.id}`;

  const sessionTitleLabel: HTMLLabelElement = interfaceContainer.querySelector(`#refg-session-title-${idx}`);
  sessionTitleLabel.innerText = stateMap[idx].sessionDetails.title;
}
