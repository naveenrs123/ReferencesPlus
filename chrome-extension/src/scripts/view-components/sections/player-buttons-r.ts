/**
 * Contains the buttons to enable the main functions of the readonly interface.
 */

import { readOnlyInterfaces } from "../../common/helpers";
import { ButtonColor, CommentData, ReadOnlyInterface } from "../../common/interfaces";
import { PlayerBtn } from "../../edit-components/util-components";

/**
 * Builds the player buttons for a particular interface.
 * @param idx The index of the interface.
 * @returns A {@link HTMLDivElement} containing the player buttons.
 */
export function PlayerButtonsR(idx: number): HTMLDivElement {
  const copyAll: HTMLButtonElement = PlayerBtn("Copy All", ButtonColor.Default);
  copyAll.addEventListener("click", (event: MouseEvent) => handleCopyAll(event, idx));

  const commentContainer = document.createElement("div");
  commentContainer.classList.add("d-flex");
  commentContainer.appendChild(copyAll);

  const leftButtonsContainer = document.createElement("div");
  leftButtonsContainer.classList.add("d-flex", "flex-justify-center", "mt-2");
  leftButtonsContainer.appendChild(commentContainer);

  return leftButtonsContainer;
}

/**
 * Click handler for the "Copy All" button.
 * @param event Mouse event.
 * @param idx Index of the relevant container.
 */
function handleCopyAll(event: MouseEvent, idx: number): void {
  const index = readOnlyInterfaces.findIndex((value: ReadOnlyInterface) => {
    return value.githubCommentId == idx;
  });

  const sessionId = readOnlyInterfaces[index].sessionDetails.id;
  let clipboardString = "";
  readOnlyInterfaces[index].comments.forEach((comment: CommentData) => {
    clipboardString += `SESSION[${sessionId}]_C[${comment.comment_id}]: [${comment.rawText.replace(
      /(\r\n|\n|\r)/gm,
      ""
    )}]\n`;
  });
  navigator.clipboard
    .writeText(clipboardString)
    .then(() => {
      const commentInfo = document.getElementById(`refg-comment-info-r-${idx}`);
      const oldText = commentInfo.innerText;
      commentInfo.innerText = "All comments copied!";
      setTimeout(() => {
        commentInfo.innerText = oldText;
      }, 1000);
    })
    .catch(() => {
      return;
    });
}
