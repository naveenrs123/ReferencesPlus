import { Mirror } from "rrweb/typings/types";
import { hideElemClass, unsavedCommentClass, waitForSaveClass } from "../../common/constants";
import { convertMsToTime, stateMap } from "../../common/helpers";
import { ButtonColor, SavedCommentData } from "../../common/interfaces";
import { color } from "../borders";
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

  // TODO: remove from comment component since we can't copy a comment that hasn't been saved.
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

  save.addEventListener("click", (event: MouseEvent) => {
    handleSave(event, { timestamp: timestamp, idx: idx, rawText: commentTextArea.value, contents: null });
  });
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

function handleSave(event: MouseEvent, savedData: SavedCommentData): void {
  const matchRef = /(~[^~]+~)/g;
  const plainText = savedData.rawText.split(matchRef);
  const refs = savedData.rawText.match(matchRef);

  const splitArray: string[] = splitOnRefs(savedData.rawText);

  const mirror: Mirror = stateMap[savedData.idx].mainPlayer.getMirror();

  const refSpans: HTMLSpanElement[] = [];

  refs.forEach((ref: string) => {
    const nodeId = parseInt(ref.match(/d+/)[0]);
    const span: HTMLSpanElement = document.createElement("span");
    span.classList.add("Link");
    span.addEventListener("click", () => {
      stateMap[savedData.idx].mainPlayer.goto(savedData.timestamp, false);
      const focusedNode = mirror.getNode(nodeId) as unknown;
      const focusedElem: HTMLElement = focusedNode as HTMLElement;
      const border = focusedElem.style.border;
      focusedElem.style.setProperty("border", `3px solid ${color}`, "important");
      setTimeout(() => {
        focusedElem.style.border = border;
      }, 2000);
    });
    refSpans.push(span);
  });

  // TODO: Work on the logic for saving a comment and extracting the references.
}

function splitOnRefs(splitString: string): string[] {
  const splitArray: string[] = [];
  let str = "";
  let matchingRef = false;
  for (const c of splitString) {
    if (c == "~") {
      if (!matchingRef && str.length > 0) {
        splitArray.push(str);
        matchingRef = true;
        str = c;
      } else if (matchingRef && str.length > 0) {
        str += c;
        matchingRef = false;
        splitArray.push(str);
        str = "";
      }
    } else {
      str += c;
    }
  }
  return splitArray;
}
