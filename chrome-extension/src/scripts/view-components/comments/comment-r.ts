import { convertMsToTime, readOnlyInterfaces } from "../../common/helpers";
import { CommentData } from "../../common/interfaces";
import { refSymbol } from "../../common/constants";
import { color } from "../../github/borders";

export function CommentR(data: CommentData): HTMLDivElement {
  const timestampLabel = document.createElement("label");
  const timestamp = data.timestamp <= 50 ? 50 : data.timestamp;
  timestampLabel.innerText = convertMsToTime(timestamp);
  timestampLabel.classList.add("Link--muted");
  timestampLabel.addEventListener("click", () => {
    readOnlyInterfaces[data.idx].mainPlayer.goto(timestamp, false);
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
    const sessionId = readOnlyInterfaces[data.idx].sessionDetails.id;
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

  const label: HTMLLabelElement = document.createElement("label");
  label.classList.add("d-none", "m-2");
  label.innerText = "Selected!";

  container.appendChild(topContainer);
  container.appendChild(data.contents);
  container.appendChild(label);
  return container;
}

export function processComment(data: CommentData, idx: number): void {
  const splitArray: string[] = splitOnRefs(data.rawText);
  const spans: HTMLSpanElement[] = [];

  splitArray.forEach((text: string) => {
    const span: HTMLSpanElement = document.createElement("span");
    const pattern = RegExp(`${refSymbol}\\[(\\d+)\\]${refSymbol}`, "i");
    const matches = text.match(pattern); // match with a group to get the node id
    if (matches != null) {
      span.classList.add("Link");
      const nodeId = parseInt(matches[1]);
      span.addEventListener("click", () => {
        const timestamp = data.timestamp <= 50 ? 50 : data.timestamp;
        readOnlyInterfaces[idx].mainPlayer.goto(timestamp, true);
        readOnlyInterfaces[idx].mainPlayer.pause();
        const focusedNode = readOnlyInterfaces[idx].mainPlayer
          .getMirror()
          .getNode(nodeId) as unknown;
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
  data.idx = idx;
}

function splitOnRefs(splitString: string): string[] {
  const splitArray: string[] = [];
  let str = "";
  let matchingRef = false;
  for (const c of splitString) {
    if (c == refSymbol) {
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
