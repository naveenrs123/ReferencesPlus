/**
 * Contains the buttons to enable the main functions of the editable interface.
 */

import { waitForPlayerClass, waitForSaveClass } from "../../common/constants";
import { Comments, Player, PlayerBtn } from "../util-components";
import { EditableComment } from "../comments/editable-comment";
import { ButtonColor, CommentData, ExtensionMessage } from "../../common/interfaces";
import { stateMap } from "../../common/helpers";

/**
 * Builds the player buttons for a particular interface.
 * @param idx The index of the interface.
 * @returns A {@link HTMLDivElement} containing the player buttons.
 */
export function PlayerButtons(idx: number): HTMLDivElement {
  const close: HTMLButtonElement = PlayerBtn("Close");
  close.addEventListener("click", (event: MouseEvent) => handleClose(event, idx));
  const reset: HTMLButtonElement = PlayerBtn("Reset");
  reset.addEventListener("click", (event: MouseEvent) => handleReset(event, idx));

  const closeResetContainer = document.createElement("div");
  closeResetContainer.classList.add("d-flex");
  closeResetContainer.appendChild(close);
  closeResetContainer.appendChild(reset);

  const comment: HTMLButtonElement = PlayerBtn(
    "Comment",
    ButtonColor.Default,
    [waitForPlayerClass],
    true
  );
  comment.addEventListener("click", (event: MouseEvent) => handleComment(event, idx));
  const copyAll: HTMLButtonElement = PlayerBtn(
    "Copy All",
    ButtonColor.Default,
    [waitForSaveClass],
    true
  );
  copyAll.addEventListener("click", (event: MouseEvent) => handleCopyAll(event, idx));

  const commentContainer = document.createElement("div");
  commentContainer.classList.add("d-flex");
  commentContainer.appendChild(comment);
  commentContainer.appendChild(copyAll);

  const leftButtonsContainer = document.createElement("div");
  leftButtonsContainer.classList.add("d-flex", "flex-justify-between", "mt-2");
  leftButtonsContainer.appendChild(closeResetContainer);
  leftButtonsContainer.appendChild(commentContainer);

  return leftButtonsContainer;
}

/**
 * Click handler for the "Close" button.
 * @param event Mouse event.
 * @param idx Index of the relevant container.
 */
function handleClose(event: MouseEvent, idx: number): void {
  // const playerContainer = document.getElementById(`refg-github-player-${idx}`);
  // const oldModal = playerContainer.querySelector(`#refg-unsaved-changes-modal-${idx}`);
  // if (oldModal) playerContainer.removeChild(oldModal);
  // if (stateMap[idx].hasUnsavedChanges) {
  //   playerContainer.appendChild(UnsavedChangesModal(idx));
  // }
  const interfaceContainer = document.getElementById(`refg-interface-container-${idx}`);
  interfaceContainer.parentElement.removeChild(interfaceContainer);
  stateMap[idx] = null;
}

/**
 * Click handler for the "Reset" button.
 * @param event Mouse event.
 * @param idx Index of the relevant container.
 */
function handleReset(event: MouseEvent, idx: number): void {
  const interfaceContainer = document.getElementById(`refg-interface-container-${idx}`);
  const player = document.getElementById(`refg-github-player-${idx}`) as HTMLDivElement;
  const comments = document.getElementById(`refg-comments-${idx}`) as HTMLDivElement;
  interfaceContainer.querySelectorAll("." + waitForPlayerClass).forEach((elem: Element) => {
    elem.setAttribute("aria-disabled", "true");
  });

  interfaceContainer.querySelectorAll("." + waitForSaveClass).forEach((elem: Element) => {
    elem.setAttribute("aria-disabled", "true");
  });

  const commentInfo = interfaceContainer.querySelector(`#refg-comment-info-${idx}`);
  commentInfo.classList.add("d-none");

  player.replaceWith(Player(idx));
  comments.replaceWith(Comments(idx));

  stateMap[idx].sessionDetails = null;
  stateMap[idx].hasUnsavedChanges = false;
  stateMap[idx].mainPlayer = null;
  stateMap[idx].nextCommentId = 0;

  chrome.runtime.sendMessage<ExtensionMessage>({
    action: "[GITHUB] Ready to Receive",
    source: "github_content",
    idx: idx,
  });
}

/**
 * Click handler for the "Comment" button.
 * @param event Mouse event.
 * @param idx Index of the relevant container.
 */
function handleComment(event: MouseEvent, idx: number): void {
  const commentSection = document.getElementById(`refg-comments-${idx}`) as HTMLDivElement;
  commentSection.appendChild(
    EditableComment({
      comment_id: null, // give it a null comment id until it is saved.
      timestamp: stateMap[idx].mainPlayer.getReplayer().getCurrentTime(),
      idx: idx,
      rawText: "",
      contents: null,
    })
  );
  stateMap[idx].hasUnsavedChanges = true;
}

/**
 * Click handler for the "Copy All" button.
 * @param event Mouse event.
 * @param idx Index of the relevant container.
 */
function handleCopyAll(event: MouseEvent, idx: number): void {
  const btn = event.target as HTMLButtonElement;
  if (btn.getAttribute("aria-disabled") === "true") return;

  const sessionId = stateMap[idx].sessionDetails.id;
  let clipboardString = "";
  stateMap[idx].comments.forEach((comment: CommentData) => {
    clipboardString += `SESSION[${sessionId}]_C[${comment.comment_id}]: [${comment.rawText.replace(
      /(\r\n|\n|\r)/gm,
      ""
    )}]\n`;
  });
  navigator.clipboard
    .writeText(clipboardString)
    .then(() => {
      const commentInfo = document.getElementById(`refg-comment-info-${idx}`);
      const oldText = commentInfo.innerText;
      commentInfo.innerText = "All comments copied!";
      setTimeout(() => {
        commentInfo.innerText = oldText;
      }, 1500);
    })
    .catch(() => {
      return;
    });
}
