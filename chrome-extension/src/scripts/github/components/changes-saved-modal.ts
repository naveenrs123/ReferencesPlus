import { ButtonColor } from "../../common/interfaces";
import { PlayerBtn } from "./util-components";

export function ChangesSavedModal(website: string, title: string, id: string, idx: number) {
  const heading = document.createElement("h3") as HTMLHeadingElement;
  heading.innerText = "Changes Saved";
  heading.classList.add("my-2")

  const websiteP = document.createElement("p") as HTMLParagraphElement;
  websiteP.innerText = website;

  const titleP = document.createElement("p") as HTMLParagraphElement;
  titleP.innerText = `Title: ${title}`;

  const idP = document.createElement("p") as HTMLParagraphElement;
  idP.innerText = `Title`;


  const ok = PlayerBtn("OK", ButtonColor.Green);
  ok.addEventListener("click", () => {
    const playerContainer = document.getElementById(`refg-github-player-${idx}`);
    const oldModal = playerContainer.querySelector(`#refg-changes-saved-modal-${idx}`);
    playerContainer.removeChild(oldModal);
  });

  const container = document.createElement("div") as HTMLDivElement;
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
  container.appendChild(heading)
  container.appendChild(websiteP)
  container.appendChild(titleP)
  container.appendChild(idP)
  container.appendChild(ok)

  return container;
}
