import { getFetchUrl, refSymbol, waitForSaveClass } from "./constants";
import {
  ButtonColor,
  CoreState,
  PRDetails,
  SaveResponse,
  EditableInterfacesMap,
  LoadedSessionsMap,
  ReadOnlyInterface,
  CommentData,
} from "./interfaces";

export const stateMap: EditableInterfacesMap = {};
export const loadedSessions: LoadedSessionsMap = {};
export const prDetails: PRDetails = {
  userOrOrg: "",
  repository: "",
};

export let counter = 0;
export let readOnlyInterfaces: ReadOnlyInterface[] = [];

export function clearReadOnlyInterfaces(): void {
  readOnlyInterfaces = [];
}

/**
 * Converts a {@link ButtonColor} to a string representing a background color class.
 * @param color
 * @returns
 */
export function buttonColorToClass(color: ButtonColor): string {
  switch (color) {
    case ButtonColor.Green:
      return "color-bg-success";
    case ButtonColor.Red:
      return "color-bg-danger";
    case ButtonColor.Yellow:
      return "color-bg-attention";
    default:
      return "color-bg-subtle";
  }
}

/**
 * Pads the number with zeroes to the specified number of digits.
 * @param num The number to pad.
 * @param digits The final padded length.
 * @returns
 */
function padToNDigits(num: number, digits = 2): string {
  return num.toString().padStart(digits, "0");
}

/**
 * Converts milliseconds to seconds and minutes.
 * @param milliseconds The number of milliseconds to be converted.
 * @returns
 */
export function convertMsToTimestamp(milliseconds: number): string {
  let seconds = Math.floor(milliseconds / 1000);
  let minutes = Math.floor(seconds / 60);

  seconds = seconds % 60;
  minutes = minutes % 60;

  return `${padToNDigits(minutes)}:${padToNDigits(seconds)}`;
}

/**
 * Updates the counter.
 */
export function updateCounter(): void {
  counter++;
}

/**
 * Finds an ancestor element with a particular class.
 * @param elem Element where searching will begin.
 * @param className The search class.
 * @returns
 */
export function findAncestor(elem: HTMLElement, className: string): HTMLElement {
  while (!elem.classList.contains(className)) {
    elem = elem.parentElement;
  }
  return elem;
}

/**
 * Saves any changes to a particular session.
 * @param idx The index for the state to save.
 * @returns A promise with the save response.
 */
export function saveChanges(idx: number): Promise<void | SaveResponse> {
  const comments: CommentData[] = [];
  stateMap[idx].comments.forEach((comment: CommentData) => {
    comments.push({
      comment_id: comment.comment_id,
      timestamp: comment.timestamp,
      idx: comment.idx,
      rawText: comment.rawText,
    });
  });

  const stateCopy: CoreState = {
    stringEvents: JSON.stringify(stateMap[idx].events),
    sessionDetails: stateMap[idx].sessionDetails,
    comments: comments,
    nextCommentId: stateMap[idx].nextCommentId,
  };

  const stringifiedData = JSON.stringify({
    prDetails: prDetails,
    state: stateCopy,
  });

  const fetchParams = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: stringifiedData,
  };

  return fetch(`${getFetchUrl()}/insertSession`, fetchParams)
    .then((res: Response) => {
      return res.json();
    })
    .then((data: SaveResponse) => {
      return Promise.resolve(data);
    })
    .catch(() => {
      return;
    });
}

/**
 * Default behaviour after changes are saved. Updates the session id and enables
 * any disabled buttons.
 * @param data The save response.
 * @param idx The index of the state associated with the save.
 */
export function defaultPostSave(data: SaveResponse, idx: number): void {
  if (data?.id !== "") stateMap[idx].sessionDetails.id = data.id;
  const interfaceContainer = document.getElementById(`refg-interface-container-${idx}`);
  interfaceContainer.querySelectorAll("." + waitForSaveClass).forEach((elem: HTMLElement) => {
    elem.removeAttribute("aria-disabled");
  });
}

/**
 * Splits a string into an array with regular text and element references.
 * @param commentString the raw string of the comment.
 * @returns A string array with the split string.
 */
 export function splitOnRefs(commentString: string): string[] {
  const splitArray: string[] = [];
  let str = "";
  let matchingRef = false;
  for (const c of commentString) {
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