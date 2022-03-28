import { hideElemClass, waitForPlayerClass, waitForSaveClass } from "../../common/constants";
import { Comments, Player, PlayerBtn } from "./util-components";
import { getMainPlayer } from "../rrweb-utils";
import { Comment } from "./comment";
import { ButtonColor } from "../../common/interfaces";
import { UnsavedChangesModal } from "./unsaved-changes-modal";

export function LeftButtons(idx: number) {
  const closeResetContainer = document.createElement("div") as HTMLDivElement;
  closeResetContainer.classList.add("d-flex");

  const close: HTMLButtonElement = PlayerBtn("Close");
  close.addEventListener("click", () => {
    const playerContainer = document.getElementById(`refg-github-player-${idx}`);
    const oldModal = playerContainer.querySelector(`#refg-unsaved-changes-modal-${idx}`);
    if (oldModal) playerContainer.removeChild(oldModal);
    if (playerContainer.hasChildNodes()) {
      playerContainer.appendChild(UnsavedChangesModal(idx));
    } else {
      const interfaceContainer = document.getElementById(`refg-interface-container-${idx}`);
      interfaceContainer.parentElement.removeChild(interfaceContainer);
    }
  });

  const reset: HTMLButtonElement = PlayerBtn("Reset");
  reset.addEventListener("click", () => {
    const player = document.getElementById(`refg-github-player-${idx}`) as HTMLDivElement;
    const comments = document.getElementById(`refg-comments-${idx}`) as HTMLDivElement;
    const waitForPlayerElems = document.querySelectorAll("." + waitForPlayerClass);
    waitForPlayerElems.forEach((elem: Element) => {
      elem.classList.add(hideElemClass);
    });

    const interfaceContainer = document.getElementById(`refg-interface-container-${idx}`);
    interfaceContainer.removeChild(player);
    interfaceContainer.removeChild(comments);
    interfaceContainer.appendChild(Player(idx));
    interfaceContainer.appendChild(Comments(idx));
  });

  closeResetContainer.appendChild(close);
  closeResetContainer.appendChild(reset);

  const commentContainer = document.createElement("div") as HTMLDivElement;
  commentContainer.classList.add("d-flex");

  const comment: HTMLButtonElement = PlayerBtn("Comment", ButtonColor.Default, [
    waitForPlayerClass,
    hideElemClass,
  ]);
  comment.addEventListener("click", () => {
    const commentSection = document.getElementById(`refg-comments-${idx}`) as HTMLDivElement;
    commentSection.appendChild(Comment(getMainPlayer().getReplayer().getCurrentTime()));
  });

  const insertAll: HTMLButtonElement = PlayerBtn("Insert All", ButtonColor.Default, [
    waitForSaveClass,
    hideElemClass,
  ]);
  commentContainer.appendChild(comment);
  commentContainer.appendChild(insertAll);

  const leftButtonsContainer = document.createElement("div") as HTMLDivElement;
  leftButtonsContainer.classList.add("d-flex", "flex-column", "flex-justify-between");
  leftButtonsContainer.appendChild(closeResetContainer);
  leftButtonsContainer.appendChild(commentContainer);

  return leftButtonsContainer;
}
