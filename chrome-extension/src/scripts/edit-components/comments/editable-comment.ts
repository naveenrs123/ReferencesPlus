/**
 * Creates an editable comment.
 */

import {
  convertMsToTimestamp,
  defaultPostSave,
  saveChanges,
  splitOnRefs,
  stateMap,
} from "../../common/helpers";
import { ButtonColor, CommentData, SaveResponse } from "../../common/interfaces";
import { color } from "../../github/borders";
import { SavedComment } from "./saved-comment";
import { MiniPlayerBtn } from "../util-components";
import { saveCommentMatch } from "../../common/constants";

/**
 * Builds an editable comment with the given data.
 * @param data the data for the editable comment.
 * @returns A {@link HTMLDivElement} with the editable comment.
 */
export function EditableComment(data: CommentData): HTMLDivElement {
  const timestampLabel = document.createElement("label");
  const timestamp = data.timestamp <= 50 ? 50 : data.timestamp;
  timestampLabel.innerText = convertMsToTimestamp(timestamp);
  timestampLabel.classList.add("Link--muted");
  timestampLabel.addEventListener("click", () => {
    stateMap[data.idx].mainPlayer.goto(timestamp, false);
  });

  const topContainer = document.createElement("div");
  topContainer.classList.add("d-flex", "flex-justify-center", "flex-items-center", "p-2");
  topContainer.style.width = "100%";
  topContainer.appendChild(timestampLabel);

  const commentTextArea = document.createElement("textarea");
  commentTextArea.classList.add("m-2");
  commentTextArea.value = data.rawText;
  commentTextArea.style.resize = "vertical";
  commentTextArea.style.width = "90%";
  commentTextArea.style.height = "180px";

  const buttonsContainer = document.createElement("div");
  buttonsContainer.classList.add("d-flex", "flex-justify-center", "mb-2");

  const save = MiniPlayerBtn("Save", ButtonColor.Green);
  const del = MiniPlayerBtn("Delete", ButtonColor.Red);
  buttonsContainer.appendChild(save);
  buttonsContainer.appendChild(del);

  const container = document.createElement("div");
  container.classList.add(
    "d-flex",
    "mx-2",
    "flex-column",
    "flex-items-center",
    "color-shadow-small",
    "border",
    "refg-comment"
  );
  container.style.height = "250px";
  container.style.minWidth = "150px";
  container.style.maxWidth = "200px";

  save.addEventListener("click", () => {
    const commentId = stateMap[data.idx].nextCommentId;
    if (data.comment_id == null) {
      stateMap[data.idx].nextCommentId++;
    }

    handleSave(container, {
      comment_id: data.comment_id ?? commentId,
      timestamp: data.timestamp,
      idx: data.idx,
      rawText: commentTextArea.value,
      contents: null,
    });
  });
  del.addEventListener("click", () => handleDel(container));

  container.appendChild(topContainer);
  container.appendChild(commentTextArea);
  container.appendChild(buttonsContainer);

  return container;
}

/**
 * Click handler for the "Delete" button.
 * @param container The container containing the button.
 */
function handleDel(container: HTMLDivElement): void {
  container.remove();
}

/**
 * Click handler for the "Save" button.
 * @param container The container containing the button.
 * @param data The comment data
 */
function handleSave(container: HTMLDivElement, data: CommentData): void {
  const splitArray: string[] = splitOnRefs(data.rawText);
  const spans: HTMLSpanElement[] = [];

  splitArray.forEach((text: string) => {
    const span: HTMLSpanElement = document.createElement("span");
    const matches = text.match(saveCommentMatch); // match with a group to get the node id
    if (matches != null) {
      span.classList.add("Link");
      const nodeId = parseInt(matches[1]);
      span.addEventListener("click", () => {
        const timestamp = data.timestamp <= 50 ? 50 : data.timestamp;
        stateMap[data.idx].mainPlayer.goto(timestamp, true);
        stateMap[data.idx].mainPlayer.pause();
        const focusedNode = stateMap[data.idx].mainPlayer.getMirror().getNode(nodeId) as unknown;
        const focusedElem: HTMLElement = focusedNode as HTMLElement;
        const border = focusedElem.style.border;
        const outline = focusedElem.style.outline;
        focusedElem.style.setProperty("border", `3px solid ${color}`, "important");
        focusedElem.style.setProperty("outline", `3px solid ${color}`, "important");
        setTimeout(() => {
          focusedElem.style.border = border;
          focusedElem.style.outline = outline;
        }, 3000);
      });
    }
    span.innerText = text;
    spans.push(span);
  });

  data.contents = document.createElement("div");
  data.contents.classList.add("p-2", "mb-2", "overflow-y-auto");
  data.contents.style.height = "180px";
  data.contents.style.width = "90%";
  data.contents.style.wordBreak = "normal";
  spans.forEach((span: HTMLSpanElement) => {
    data.contents.appendChild(span);
  });

  const commentIndex = stateMap[data.idx].comments.findIndex(
    (value: CommentData) => value.comment_id == data.comment_id
  );
  if (commentIndex > -1) {
    stateMap[data.idx].comments[commentIndex] = data;
  } else {
    const oldMax = stateMap[data.idx].nextCommentId;
    stateMap[data.idx].nextCommentId = data.comment_id > oldMax ? data.comment_id : oldMax;
    stateMap[data.idx].comments.push(data);
  }

  saveChanges(data.idx)
    .then((saveRes: SaveResponse) => {
      defaultPostSave(saveRes, data.idx);
      container.replaceWith(SavedComment(data));
    })
    .catch(() => {
      return;
    });
}
