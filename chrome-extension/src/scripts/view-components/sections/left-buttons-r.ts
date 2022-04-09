import { readOnlyInterfaces } from "../../common/helpers";
import { ButtonColor, CommentData, ReadOnlyInterface } from "../../common/interfaces";
import { PlayerBtn } from "../../edit-components/util-components";

export function LeftButtonsR(idx: number): HTMLDivElement {
  const copyAll: HTMLButtonElement = PlayerBtn("Copy All", ButtonColor.Default);
  copyAll.addEventListener("click", (event: MouseEvent) => handleCopyAll(event, idx));

  const commentContainer = document.createElement("div");
  commentContainer.classList.add("d-flex");
  commentContainer.appendChild(copyAll);

  const leftButtonsContainer = document.createElement("div");
  leftButtonsContainer.classList.add("d-flex", "flex-justify-between");
  leftButtonsContainer.appendChild(commentContainer);

  return leftButtonsContainer;
}

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
