import { convertMsToTime, saveChanges, stateMap } from "../../common/helpers";
import { ButtonColor, CommentData } from "../../common/interfaces";
import { Comment } from "./comment";
import { MiniPlayerBtn } from "../util-components";

export function SavedComment(data: CommentData): HTMLDivElement {
  const timestampLabel = document.createElement("label");
  const timestamp = data.timestamp <= 50 ? 50 : data.timestamp;
  timestampLabel.innerText = convertMsToTime(timestamp);
  timestampLabel.classList.add("Link--muted");
  timestampLabel.addEventListener("click", () => {
    stateMap[data.idx].mainPlayer.goto(timestamp, false);
  });

  const commentIdLabel = document.createElement("label");
  commentIdLabel.innerText = `(${data.comment_id.toString()})`;

  const topContainer = document.createElement("div");
  topContainer.classList.add("d-flex", "flex-justify-between", "flex-items-center", "p-3");
  topContainer.style.width = "100%";
  topContainer.appendChild(commentIdLabel);
  topContainer.appendChild(timestampLabel);

  const buttonsContainer = document.createElement("div");
  buttonsContainer.classList.add("d-flex", "flex-justify-center", "mb-2");

  const edit = MiniPlayerBtn("Edit", ButtonColor.Green);
  const del = MiniPlayerBtn("Delete", ButtonColor.Red);
  buttonsContainer.appendChild(edit);
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
  container.style.width = "150px";

  edit.addEventListener("click", (event: MouseEvent) => {
    handleEdit(event, data, container);
  });
  del.addEventListener("click", (event: MouseEvent) => {
    handleDel(event, data, container);
  });

  const label: HTMLLabelElement = document.createElement("label");
  label.classList.add("d-none", "m-2");
  label.innerText = "Selected!";

  const contents = data.contents;
  data.contents.addEventListener("dblclick", () => {
    console.log("DBLCLICK EVENT!");
    window.getSelection().selectAllChildren(contents);
    const sessionId = stateMap[data.idx].sessionDetails.id;
    navigator.clipboard
      .writeText(`SESSION[${sessionId}]_C[${data.comment_id}]: [${data.rawText.replace(/(\r\n|\n|\r)/gm, "")}]\n`)
      .then(() => {
        label.classList.remove("d-none");
        setTimeout(() => {
          label.classList.add("d-none");
        }, 1500);
      })
      .catch(() => {
        return;
      });
  });

  container.appendChild(topContainer);
  container.appendChild(data.contents);
  container.appendChild(buttonsContainer);
  container.appendChild(label);
  data.contents = null;
  return container;
}

function handleDel(event: MouseEvent, data: CommentData, container: HTMLDivElement): void {
  container.remove();
  const index = stateMap[data.idx].comments.findIndex((value: CommentData) => value.comment_id == data.comment_id);
  stateMap[data.idx].comments.splice(index, 1);
  saveChanges(data.idx).catch(() => {
    return;
  });
}

function handleEdit(event: MouseEvent, data: CommentData, container: HTMLDivElement): void {
  container.replaceWith(Comment(data));
}
