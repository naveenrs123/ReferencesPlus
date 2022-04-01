import { Mirror } from "rrweb/typings/types";
import { convertMsToTime, stateMap } from "../../common/helpers";
import { ButtonColor, SavedCommentData } from "../../common/interfaces";
import { color } from "../borders";
import { SavedComment } from "./saved-comment";
import { MiniPlayerBtn } from "./util-components";

export function Comment(data: SavedCommentData): HTMLDivElement {
  const timestampLabel = document.createElement("label");
  const timestamp = data.timestamp <= 50 ? 50 : data.timestamp;
  timestampLabel.innerText = convertMsToTime(timestamp);
  timestampLabel.classList.add("Link--muted");
  timestampLabel.setAttribute("data-timestamp", timestamp.toString());
  timestampLabel.addEventListener("click", () => {
    const time = parseInt(timestampLabel.getAttribute("data-timestamp"));
    stateMap[data.idx].mainPlayer.goto(time, false);
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
    handleSave(event, container, {
      timestamp: data.timestamp,
      idx: data.idx,
      rawText: commentTextArea.value,
      contents: null,
    });
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

function handleSave(event: MouseEvent, container: HTMLDivElement, data: SavedCommentData): void {
  // const matchRef = /(~[^~]+~)/g;

  const splitArray: string[] = splitOnRefs(data.rawText);
  const spans: HTMLSpanElement[] = [];

  splitArray.forEach((text: string) => {
    const span: HTMLSpanElement = document.createElement("span");
    const matches = text.match(/~\[(\d+)\]~/); // match with a group to get the node id

    console.log(text);
    console.log(matches);
    if (matches != null) {
      span.classList.add("Link");
      const nodeId = parseInt(matches[1]);
      span.addEventListener("click", () => {
        const timestamp = data.timestamp <= 50 ? 50 : data.timestamp;
        stateMap[data.idx].mainPlayer.goto(timestamp, true);
        stateMap[data.idx].mainPlayer.pause();
        const focusedNode = stateMap[data.idx].mainPlayer.getMirror().getNode(nodeId) as unknown;
        console.log(focusedNode);
        const focusedElem: HTMLElement = focusedNode as HTMLElement;
        console.log(focusedElem);
        const border = focusedElem.style.border;
        focusedElem.style.setProperty("border", `3px solid ${color}`, "important");
        setTimeout(() => {
          focusedElem.style.border = border;
        }, 3000);
      });
    }
    span.innerText = text;
    spans.push(span);
  });

  data.contents = document.createElement("div");
  data.contents.classList.add("p-2", "mb-2", "overflow-y-auto");
  data.contents.style.maxHeight = "180px";
  data.contents.style.wordBreak = "normal";
  spans.forEach((span: HTMLSpanElement) => {
    data.contents.appendChild(span);
  });

  container.replaceWith(SavedComment(data));
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
      } else {
        str += c;
        matchingRef = true;
      }
    } else {
      str += c;
    }
  }
  splitArray.push(str);
  return splitArray;
}
