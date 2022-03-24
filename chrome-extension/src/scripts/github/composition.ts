import { ButtonColor } from "../common/interfaces";
import * as c from "./components";
import { getMainPlayer } from "./rrweb-utils";

const waitForPlayer: string = "refg-wait-for-player";
const waitForSave: string = "refg-wait-for-save";
const hideElem: string = "refg-hide-elem";

export function SessionManagement() {
  const container = document.createElement("div") as HTMLDivElement;
  container.classList.add("d-flex");
  container.style.flexDirection = "column";

  const sessionID = document.createElement("label") as HTMLLabelElement;
  sessionID.innerText = "Session ID: N/A";
  sessionID.style.textAlign = "right";
  sessionID.classList.add("text-normal");

  const saveContainer = document.createElement("div") as HTMLDivElement;
  saveContainer.classList.add("d-flex");
  saveContainer.style.alignSelf = "flex-end";
  const saveAs = c.PlayerBtn("Save As");
  const save = c.PlayerBtn("Save");
  saveContainer.appendChild(saveAs);
  saveContainer.appendChild(save);

  const loadSessionContainer = document.createElement("div") as HTMLDivElement;
  loadSessionContainer.classList.add("d-flex");
  loadSessionContainer.style.alignItems = "center";

  const label = document.createElement("label") as HTMLLabelElement;
  label.htmlFor = "refg-load-session-input";
  label.innerText = "Load Session";
  label.classList.add("text-normal", "mx-2");

  const input = c.TextInput("Enter title/id.", [], "refg-load-session-input");
  loadSessionContainer.appendChild(label);
  loadSessionContainer.appendChild(input);

  container.appendChild(sessionID);
  container.appendChild(saveContainer);
  container.appendChild(loadSessionContainer);
  return container;
}

export function LeftButtons() {
  const closeResetContainer = document.createElement("div") as HTMLDivElement;
  closeResetContainer.classList.add("d-flex");

  const close: HTMLButtonElement = c.PlayerBtn("Close");
  const reset: HTMLButtonElement = c.PlayerBtn("Reset");

  closeResetContainer.appendChild(close);
  closeResetContainer.appendChild(reset);

  const commentContainer = document.createElement("div") as HTMLDivElement;
  commentContainer.classList.add("d-flex");

  const comment: HTMLButtonElement = c.PlayerBtn("Comment", [waitForPlayer, hideElem]);
  comment.addEventListener("click", () => {
    const commentSection = document.getElementById("refg-comments") as HTMLDivElement;
    commentSection.appendChild(Comment(getMainPlayer().getReplayer().getCurrentTime()));
  });

  const insertAll: HTMLButtonElement = c.PlayerBtn("Insert All", [waitForSave, hideElem]);
  commentContainer.appendChild(comment);
  commentContainer.appendChild(insertAll);

  const leftButtonsContainer = document.createElement("div") as HTMLDivElement;
  leftButtonsContainer.classList.add("d-flex", "flex-column", "flex-justify-between");
  leftButtonsContainer.appendChild(closeResetContainer);
  leftButtonsContainer.appendChild(commentContainer);

  return leftButtonsContainer;
}

export function Comment(timestamp: number) {
  const timestampLabel = document.createElement("label") as HTMLLabelElement;
  console.log(timestamp)
  timestampLabel.innerText = Math.floor(timestamp / 1000).toString();

  const commentTextArea = document.createElement("textarea") as HTMLTextAreaElement;
  commentTextArea.classList.add("m-2");
  commentTextArea.style.resize = "vertical";
  commentTextArea.style.width = "90%";

  const buttonsContainer = document.createElement("div") as HTMLDivElement;
  buttonsContainer.classList.add("d-flex", "flex-justify-center");

  const save = c.MiniPlayerBtn("Save", ButtonColor.Green);
  const del = c.MiniPlayerBtn("Delete", ButtonColor.Red);
  buttonsContainer.appendChild(save);
  buttonsContainer.appendChild(del);

  const container = document.createElement("div") as HTMLDivElement;
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
  container.appendChild(timestampLabel);
  container.appendChild(commentTextArea);
  container.appendChild(buttonsContainer);

  return container;
}
