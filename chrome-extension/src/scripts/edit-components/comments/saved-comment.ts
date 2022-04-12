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
  commentIdLabel.classList.add("mx-2");
  commentIdLabel.innerText = `(${data.comment_id.toString()})`;

  const copySVGString =
    '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 010 1.5h-1.5a.25.25 0 00-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 00.25-.25v-1.5a.75.75 0 011.5 0v1.5A1.75 1.75 0 019.25 16h-7.5A1.75 1.75 0 010 14.25v-7.5z"/><path fill-rule="evenodd" d="M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0114.25 11h-7.5A1.75 1.75 0 015 9.25v-7.5zm1.75-.25a.25.25 0 00-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 00.25-.25v-7.5a.25.25 0 00-.25-.25h-7.5z"/></svg>';
  const svg = new DOMParser().parseFromString(copySVGString, "image/svg+xml")
    .firstChild as SVGAElement;
  svg.classList.add("octicon");

  const copy = document.createElement("button");
  copy.classList.add("btn-octicon");
  copy.style.padding = "";
  copy.style.margin = "";
  copy.appendChild(svg);

  const contents = data.contents;
  copy.addEventListener("click", () => {
    window.getSelection().selectAllChildren(contents);
    const sessionId = stateMap[data.idx].sessionDetails.id;
    navigator.clipboard
      .writeText(
        `SESSION[${sessionId}]_C[${data.comment_id}]: [${data.rawText.replace(
          /(\r\n|\n|\r)/gm,
          ""
        )}]\n`
      )
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

  const topContainer = document.createElement("div");
  topContainer.classList.add(
    "d-flex",
    "flex-justify-between",
    "flex-items-center",
    "color-fg-muted",
    "px-2",
    "pt-3"
  );
  topContainer.style.width = "100%";
  topContainer.style.fill = "#57606a";
  topContainer.appendChild(commentIdLabel);
  topContainer.appendChild(timestampLabel);
  topContainer.appendChild(copy);

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

  container.appendChild(topContainer);
  container.appendChild(data.contents);
  container.appendChild(buttonsContainer);
  container.appendChild(label);
  return container;
}

function handleDel(event: MouseEvent, data: CommentData, container: HTMLDivElement): void {
  container.remove();
  const index = stateMap[data.idx].comments.findIndex(
    (value: CommentData) => value.comment_id == data.comment_id
  );
  stateMap[data.idx].comments.splice(index, 1);
  saveChanges(data.idx).catch(() => {
    return;
  });
}

function handleEdit(event: MouseEvent, data: CommentData, container: HTMLDivElement): void {
  container.replaceWith(Comment(data));
}
