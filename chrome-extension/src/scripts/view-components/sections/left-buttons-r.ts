import { ButtonColor } from "../../common/interfaces";
import { PlayerBtn } from "../../edit-components/util-components";

export function LeftButtonsR(idx: number): HTMLDivElement {
  const copyAll: HTMLButtonElement = PlayerBtn("Copy All", ButtonColor.Default);
  //copyAll.addEventListener("click", (event: MouseEvent) => handleCopyAll(event, idx));

  const commentContainer = document.createElement("div");
  commentContainer.classList.add("d-flex");
  commentContainer.appendChild(copyAll);

  const leftButtonsContainer = document.createElement("div");
  leftButtonsContainer.classList.add("d-flex", "flex-justify-between");
  leftButtonsContainer.appendChild(commentContainer);

  return leftButtonsContainer;
}

// TODO: Complete Function
/* function handleCopyAll(event: MouseEvent, idx: number): void {
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
      }, 1000);
    })
    .catch(() => {
      return;
    });
} */
