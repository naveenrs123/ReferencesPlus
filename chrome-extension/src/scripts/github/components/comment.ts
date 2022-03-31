import { hideElemClass, unsavedCommentClass, waitForSaveClass } from "../../common/constants";
import { convertMsToTime, stateMap } from "../../common/helpers";
import { ButtonColor } from "../../common/interfaces";
import { MiniPlayerBtn } from "./util-components";

export function Comment(timestamp: number, idx: number): HTMLDivElement {
  const timestampLabel = document.createElement("label");
  timestampLabel.innerText = convertMsToTime(timestamp < 0 ? 0 : timestamp);
  timestampLabel.classList.add("Link--muted");
  timestampLabel.setAttribute("data-timestamp", (timestamp < 0 ? 0 : timestamp).toString());
  timestampLabel.addEventListener("click", () => {
    const time = parseInt(timestampLabel.getAttribute("data-timestamp"));
    stateMap[idx].mainPlayer.goto(time, false);
  });

  const copy = MiniPlayerBtn("Copy", ButtonColor.Yellow, [waitForSaveClass, unsavedCommentClass, hideElemClass]);

  const topContainer = document.createElement("div");
  topContainer.classList.add("d-flex", "flex-justify-center", "flex-items-center", "p-2");
  topContainer.style.width = "100%";
  topContainer.appendChild(timestampLabel);
  topContainer.appendChild(copy);

  const commentTextArea = document.createElement("textarea");
  commentTextArea.classList.add("m-2");
  commentTextArea.style.resize = "vertical";
  commentTextArea.style.width = "90%";

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
  container.style.width = "150px";

  del.addEventListener("click", (event: MouseEvent) => {
    handleDel(event, container);
  });

  container.appendChild(topContainer);
  container.appendChild(commentTextArea);
  container.appendChild(buttonsContainer);

  return container;
}

function handleDel(event: MouseEvent, container: HTMLDivElement): void {
  container.remove();
}
