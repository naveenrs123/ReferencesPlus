import { hideElemClass, waitForPlayerClass, waitForSaveClass } from "../../common/constants";
import { PlayerBtn } from "./util-components";
import { getMainPlayer } from "../rrweb-utils";
import { Comment } from "./comment";
import { ButtonColor } from "../../common/interfaces";
import { UnsavedChangesModal } from "./unsaved-changes-modal";

export function LeftButtons() {
  const closeResetContainer = document.createElement("div") as HTMLDivElement;
  closeResetContainer.classList.add("d-flex");

  const close: HTMLButtonElement = PlayerBtn("Close");
  close.addEventListener("click", () => {
    const interfaceContainer = document.getElementById("refg-interface-container");
    const oldModal = interfaceContainer.querySelector("#refg-unsaved-changes-modal");
    if (oldModal) {
      interfaceContainer.removeChild(oldModal);
    }
    interfaceContainer.appendChild(UnsavedChangesModal());
  });
  const reset: HTMLButtonElement = PlayerBtn("Reset");

  closeResetContainer.appendChild(close);
  closeResetContainer.appendChild(reset);

  const commentContainer = document.createElement("div") as HTMLDivElement;
  commentContainer.classList.add("d-flex");

  const comment: HTMLButtonElement = PlayerBtn("Comment", ButtonColor.Default, [
    waitForPlayerClass,
    hideElemClass,
  ]);
  comment.addEventListener("click", () => {
    const commentSection = document.getElementById("refg-comments") as HTMLDivElement;
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
