import * as interfaces from "../../common/interfaces";
import * as constants from "../../common/constants";
import * as helpers from "../../common/helpers";
import { eventWithTime } from "rrweb/typings/types";
import { injectReadOnlyPlayer } from "../rrweb-utils";
import { CommentR, processComment } from "../../view-components/comments/comment-r";
import { MainInterfaceR } from "../../view-components/main-interface-r";

const buttonIndexes: Set<number> = new Set();

function findSessions(
  elem: Node,
  sessionIds: Set<string>,
  sessionCommentMap: interfaces.SessionCommentMap,
  textNodes: interfaces.TextWithSessions[]
): void {
  if (elem.nodeName == "#text") {
    const matches = elem.textContent.matchAll(constants.sessionMatchPattern);
    const sessionCommentsArr: string[] = [];

    for (const match of matches) {
      sessionIds.add(match[2]);
      sessionCommentMap[match[1]] = { sessionId: match[2], commentId: parseInt(match[3]) };
      sessionCommentsArr.push(match[1]);
    }

    if (sessionCommentsArr.length == 0) return;

    textNodes.push({
      node: elem,
      parent: elem.parentElement,
      refs: sessionCommentsArr,
    });
  } else {
    elem.childNodes.forEach((child: Node) =>
      findSessions(child as HTMLElement, sessionIds, sessionCommentMap, textNodes)
    );
  }
}

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

function loadSession(sessionId: string): Promise<void> {
  return fetch(`${constants.getFetchUrl()}/loadSession/${sessionId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(helpers.prDetails),
  })
    .then((res: Response) => res.json())
    .then((data: interfaces.CoreState) => {
      if ("sessionDetails" in data) {
        helpers.loadedSessions[data.sessionDetails.id] = data;
        helpers.loadedSessions[data.sessionDetails.id].events = JSON.parse(
          data.stringEvents
        ) as eventWithTime[];
      }
    });
}

function loadReferencedSessions(commentBody: HTMLElement, idx: number): Promise<void> {
  const sessionIds: Set<string> = new Set();
  const sessionCommentMap: interfaces.SessionCommentMap = {};
  const textNodes: interfaces.TextWithSessions[] = [];
  findSessions(commentBody, sessionIds, sessionCommentMap, textNodes);

  for (const sessionId of Object.keys(helpers.loadedSessions)) {
    sessionIds.delete(sessionId);
  }

  const promiseArray: Promise<Response>[] = [];
  sessionIds.forEach((sessionId: string) => {
    promiseArray.push(
      fetch(`${constants.getFetchUrl()}/loadSession/${sessionId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(helpers.prDetails),
      })
    );
  });

  return Promise.all(promiseArray)
    .then((resArray: Response[]) => {
      return Promise.all(resArray.map((res: Response) => res.json()));
    })
    .then((state: interfaces.CoreState[]) => {
      for (const interfaceInfo of state) {
        if ("sessionDetails" in interfaceInfo) {
          helpers.loadedSessions[interfaceInfo.sessionDetails.id] = interfaceInfo;
          helpers.loadedSessions[interfaceInfo.sessionDetails.id].events = JSON.parse(
            interfaceInfo.stringEvents
          ) as eventWithTime[];
        }
      }

      for (const info of textNodes) {
        const { node, parent, refs }: interfaces.TextWithSessions = info;
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
            button.addEventListener("click", onViewContextClick);
            nodes.push(button);
          } else {
            nodes.push(document.createTextNode(tag.text));
          }
        });

        const textElement = node as Element;
        textElement.replaceWith(...nodes);
      }
    });
}

export function makeReadonlyInterfaces(): void {
  helpers.clearLoadedSessions();
  helpers.clearReadOnlyInterfaces();
  helpers.clearStateMap();

  const existingButtons: Promise<void>[] = [];

  document.querySelectorAll(".refg-view-interface").forEach((elem: HTMLButtonElement) => {
    elem.classList.remove("btn-primary");
    const index = parseInt(elem.getAttribute("data-idx"));
    const sessionId = elem.getAttribute("data-sessionId");
    buttonIndexes.add(index);
    existingButtons.push(loadSession(sessionId));
  });

  Promise.all(existingButtons)
    .then(() => {
      document.querySelectorAll(".refg-view-interface").forEach((elem: HTMLButtonElement) => {
        elem.addEventListener("click", onViewContextClick);
      });

      const newSessions: Promise<void>[] = [];
      document.querySelectorAll('[class*="js-comment-body"]').forEach((elem: HTMLElement) => {
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

        newSessions.push(loadReferencedSessions(elem, idx));
      });

      return Promise.all(newSessions);
    })
    .then(() => {
      console.log("SUCCESS");
    })
    .catch((err) => {
      console.log(err);
    });
}
