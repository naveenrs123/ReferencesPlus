import { hideElemClass, waitForPlayerClass, waitForSaveClass } from "../../common/constants";
import { Comments, Player, PlayerBtn } from "./util-components";
import { Comment } from "./comment";
import { ButtonColor } from "../../common/interfaces";
import { UnsavedChangesModal } from "./unsaved-changes-modal";
import { stateMap } from "../../common/helpers";

export function LeftButtons(idx: number): HTMLDivElement {
  const close: HTMLButtonElement = PlayerBtn("Close");
  close.addEventListener("click", (event: MouseEvent) => {
    handleClose(event, idx);
  });

  const reset: HTMLButtonElement = PlayerBtn("Reset");
  reset.addEventListener("click", (event: MouseEvent) => {
    handleReset(event, idx);
  });

  const closeResetContainer = document.createElement("div");
  closeResetContainer.classList.add("d-flex");
  closeResetContainer.appendChild(close);
  closeResetContainer.appendChild(reset);

  const comment: HTMLButtonElement = PlayerBtn("Comment", ButtonColor.Default, [waitForPlayerClass, hideElemClass]);
  comment.addEventListener("click", (event: MouseEvent) => {
    handleComment(event, idx);
  });

  const insertAll: HTMLButtonElement = PlayerBtn("Insert All", ButtonColor.Default, [waitForSaveClass, hideElemClass]);

  const commentContainer = document.createElement("div");
  commentContainer.classList.add("d-flex");
  commentContainer.appendChild(comment);
  commentContainer.appendChild(insertAll);

  const leftButtonsContainer = document.createElement("div");
  leftButtonsContainer.classList.add("d-flex", "flex-column", "flex-justify-between");
  leftButtonsContainer.appendChild(closeResetContainer);
  leftButtonsContainer.appendChild(commentContainer);

  return leftButtonsContainer;
}

function handleClose(event: MouseEvent, idx: number): void {
  const playerContainer = document.getElementById(`refg-github-player-${idx}`);
  const oldModal = playerContainer.querySelector(`#refg-unsaved-changes-modal-${idx}`);
  if (oldModal) playerContainer.removeChild(oldModal);
  if (stateMap[idx].hasUnsavedChanges) {
    playerContainer.appendChild(UnsavedChangesModal(idx));
  } else {
    const interfaceContainer = document.getElementById(`refg-interface-container-${idx}`);
    interfaceContainer.parentElement.removeChild(interfaceContainer);
    stateMap[idx] = null;
  }
}

function handleReset(event: MouseEvent, idx: number): void {
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
  stateMap[idx].hasUnsavedChanges = false;
  stateMap[idx].mainPlayer = null;
}

function handleComment(event: MouseEvent, idx: number): void {
  const commentSection = document.getElementById(`refg-comments-${idx}`) as HTMLDivElement;
  commentSection.appendChild(Comment(stateMap[idx].mainPlayer.getReplayer().getCurrentTime(), idx));
  stateMap[idx].hasUnsavedChanges = true;
}
