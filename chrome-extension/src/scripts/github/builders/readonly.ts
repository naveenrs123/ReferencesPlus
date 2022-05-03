/**
 * Builds a readonly interface for every anchored comment inserted into GitHub comments.
 */

import * as interfaces from "../../common/interfaces";
import * as constants from "../../common/constants";
import * as helpers from "../../common/helpers";
import { eventWithTime } from "rrweb/typings/types";
import { injectReadOnlyPlayer } from "../player";
import { CommentR, processComment } from "../../view-components/comments/comment-r";
import { MainInterfaceR } from "../../view-components/main-interface-r";

const buttonIndexes: Set<number> = new Set();
const sessionIds: Set<string> = new Set();
const sessionCommentMap: interfaces.SessionCommentMap = {};
const textSessionsMap: interfaces.TextWithSessionsMap = {};

/**
 * Recursively find all session strings in an element and its descendants.
 * @param elem Element where searching is started
 * @param idx index of a GitHub comment
 */
function findSessions(elem: Node, idx: number): void {
  if (elem.nodeName == "#text") {
    const matches = elem.textContent.matchAll(constants.sessionMatchPattern);
    const sessionCommentsArr: string[] = [];

    for (const match of matches) {
      sessionIds.add(match[2]);
      sessionCommentMap[match[1]] = { sessionId: match[2], commentId: parseInt(match[3]) };
      if (sessionCommentsArr.includes(match[1])) continue;
      sessionCommentsArr.push(match[1]);
    }

    if (sessionCommentsArr.length == 0) return;

    if (!(idx in textSessionsMap)) textSessionsMap[idx] = [];

    textSessionsMap[idx].push({
      node: elem,
      refs: sessionCommentsArr,
    });
  } else {
    elem.childNodes.forEach((child: Node) => findSessions(child as HTMLElement, idx));
  }
}

/**
 * Tag the text to identify which parts are session strings and which parts are regular text.
 * @param textContent The raw text to tag.
 * @param sessionCommentsArr An array of session-comment strings to split on.
 * @returns An array containing the tagged representation of the text.
 */
function tagText(textContent: string, sessionCommentsArr: string[]): interfaces.TaggedText[] {
  const taggedText: interfaces.TaggedText[] = [];
  let modified = textContent;
  sessionCommentsArr.forEach((str: string) => {
    const splits: string[] = modified.split(str, 2);
    if (splits[0].length > 0) {
      taggedText.push({ text: splits[0], isSessionString: false });
    }
    modified = splits[1];
    taggedText.push({ text: str, isSessionString: true });
  });
  taggedText.push({ text: modified, isSessionString: false });
  return taggedText;
}

/**
 * An click event handler that loads the relevant information when the "View Context"
 * button is clicked.
 * @param event The mouse event.
 */
function onViewContextClick(event: MouseEvent): void {
  const button = event.target as HTMLButtonElement;
  const commentBody = helpers.findAncestor(button, "js-comment-body");
  const idx = parseInt(button.getAttribute("data-idx"));
  const sessionId = button.getAttribute("data-sessionId");
  const commentId = parseInt(button.getAttribute("data-commentId"));

  event.preventDefault();

  const interfaceContainer = commentBody.parentElement.querySelector(
    `#refg-interface-container-r-${idx}`
  );

  if (!interfaceContainer) return;

  let active = false;
  commentBody.querySelectorAll(".refg-view-interface").forEach((btn: HTMLButtonElement) => {
    if (button == btn) {
      active = btn.classList.toggle("btn-primary");
    } else {
      btn.classList.remove("btn-primary");
    }
  });

  if (active) {
    interfaceContainer.classList.remove("d-none");
    interfaceContainer.classList.add("d-flex", "flex-column");
  } else {
    interfaceContainer.classList.add("d-none");
  }

  const index = helpers.readOnlyInterfaces.findIndex((value: interfaces.ReadOnlyInterface) => {
    return value.githubCommentId == idx;
  });

  window.getSelection().removeAllRanges();
  injectReadOnlyPlayer(idx, sessionId);

  const commentTimestamp = helpers.readOnlyInterfaces[index].comments[commentId].timestamp;
  const timestamp = commentTimestamp <= 50 ? 50 : commentTimestamp;
  helpers.readOnlyInterfaces[index].mainPlayer.goto(timestamp, false);

  const commentContainer = document.getElementById(`refg-comments-r-${idx}`);
  commentContainer.innerHTML = "";

  for (const commentData of helpers.readOnlyInterfaces[index].comments) {
    processComment(commentData, index);
    const comment = CommentR(commentData);
    if (commentData.comment_id == commentId) {
      comment.style.setProperty("border", ` 3px solid green`, "important");
      setTimeout(() => {
        comment.style.border = "";
      }, 4000);
    }
    commentContainer.appendChild(comment);
  }
}

/**
 * Load the session associated with the given session id.
 * @param sessionId The session id to load.
 * @returns A promise containing the core state associated with the loaded session.
 */
function loadSession(sessionId: string): Promise<interfaces.CoreState> {
  return fetch(`${constants.getFetchUrl()}/loadSession/${sessionId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(helpers.prDetails),
  })
    .then((res: Response) => res.json())
    .then((data: interfaces.CoreState) => {
      return data;
    });
}

/**
 * Load all referenced sessions for a particular text node.
 * @param idx The index associated with the text node.
 */
function loadReferencedSessions(idx: number): void {
  for (const info of textSessionsMap[idx]) {
    const { node, refs }: interfaces.TextWithSessions = info;
    const taggedText = tagText(node.textContent, refs);
    const nodes: Node[] = [];

    taggedText.forEach((tag: interfaces.TaggedText) => {
      if (tag.isSessionString) {
        const { sessionId, commentId } = sessionCommentMap[tag.text];

        if (!(sessionId in helpers.loadedSessions)) {
          nodes.push(document.createTextNode(tag.text));
          return;
        }

        const button = document.createElement("button");
        button.innerText = `View Context`;
        button.classList.add("m-2", "btn", "refg-view-interface");
        button.setAttribute("data-idx", idx.toString());
        button.setAttribute("data-sessionId", sessionId);
        button.setAttribute("data-commentId", commentId.toString());
        button.onclick = onViewContextClick;
        nodes.push(button);
      } else {
        nodes.push(document.createTextNode(tag.text));
      }
    });

    const textElement = node as Element;
    textElement.replaceWith(...nodes);
  }
}

/**
 * Processes the comment body by adding a read only interface into it.
 * @param elem The {@link HTMLElement} that is the comment body.
 * @returns A number representing the index of the comment body.
 */
function processCommentBody(elem: HTMLElement): number {
  let mainInterface = elem.parentNode.querySelector(`[id^=refg-interface-container-r]`);
  if (mainInterface) elem.parentNode.removeChild(mainInterface);

  let idx: number;
  const btn = elem.querySelector(".refg-view-interface");
  if (btn) {
    idx = parseInt(btn.getAttribute("data-idx"));
  } else {
    do {
      idx = helpers.counter;
      helpers.updateCounter();
    } while (buttonIndexes.has(idx));
  }

  mainInterface = MainInterfaceR(idx);
  elem.parentNode.appendChild(mainInterface);

  helpers.readOnlyInterfaces.push({
    commentBody: elem,
    githubCommentId: idx,
    events: [],
    sessionDetails: null,
    comments: [],
    nextCommentId: 0,
    mainPlayer: null,
  });

  return idx;
}

/**
 * Builds all readonly interfaces from anchored comments inserted into GitHub comments.
 */
export function makeReadonlyInterfaces(): void {
  helpers.clearReadOnlyInterfaces();
  const buttonSessionIds: Set<string> = new Set();
  const existingBtnPromises: Promise<interfaces.CoreState>[] = [];

  document.querySelectorAll(".refg-view-interface").forEach((elem: HTMLButtonElement) => {
    elem.classList.remove("btn-primary");
    const index = parseInt(elem.getAttribute("data-idx"));
    const sessionId = elem.getAttribute("data-sessionId");
    buttonIndexes.add(index);
    buttonSessionIds.add(sessionId);
    elem.onclick = onViewContextClick;
  });

  buttonSessionIds.forEach((sessionId: string) => {
    if (sessionId in helpers.loadedSessions) return;
    existingBtnPromises.push(loadSession(sessionId));
  });

  Promise.all(existingBtnPromises)
    .then((btnSessions: interfaces.CoreState[]) => {
      const btnSessionIds = btnSessions.map(
        (value: interfaces.CoreState) => value.sessionDetails.id
      );

      const indexes: number[] = [];
      document.querySelectorAll('[class*="js-comment-body"]').forEach((elem: HTMLElement) => {
        const idx = processCommentBody(elem);
        indexes.push(idx);
        findSessions(elem, idx);
      });

      const promiseArray: Promise<interfaces.CoreState>[] = [];
      sessionIds.forEach((sessionId: string) => {
        if (sessionId in helpers.loadedSessions || btnSessionIds.includes(sessionId)) return;
        promiseArray.push(loadSession(sessionId));
      });

      return Promise.all(promiseArray).then((newSessions: interfaces.CoreState[]) => {
        newSessions.push(...btnSessions);
        newSessions.forEach((data: interfaces.CoreState) => {
          if ("sessionDetails" in data) {
            helpers.loadedSessions[data.sessionDetails.id] = data;
            helpers.loadedSessions[data.sessionDetails.id].events = JSON.parse(
              data.stringEvents
            ) as eventWithTime[];
          }
        });

        indexes.forEach((idx: number) => {
          if (!(idx in textSessionsMap)) return;
          loadReferencedSessions(idx);
        });
      });
    })
    .catch(() => {
      return;
    });
}
