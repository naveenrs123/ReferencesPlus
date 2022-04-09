import * as interfaces from "../common/interfaces";
import * as constants from "../common/constants";
import { injectMainPlayer, injectReadOnlyPlayer } from "./rrweb-utils";
import { LeftButtons } from "../edit-components/sections/left-buttons";
//import { SessionManagement } from "../edit-components/sections/session-management";
import * as helpers from "../common/helpers";
import * as utilComponents from "../edit-components/util-components";
import { MainInterfaceR } from "../view-components/main-interface-r";
import { CommentR, processComment } from "../view-components/comments/comment-r";

const matchesArr = window.location.href.match(constants.matchUrl);
helpers.prDetails.userOrOrg = matchesArr[1];
helpers.prDetails.repository = matchesArr[2];
helpers.prDetails.prNumber = parseInt(matchesArr[3]);

/**
 * Builds the contents of the player container for emulator interactions.
 * @param playerContainer The container to which the contents will be added.
 */
function MainInterface(idx: number, isCodeComment = false): HTMLDivElement {
  const closeResetSection: HTMLDivElement = LeftButtons(idx);

  // const mainMenu: HTMLDivElement = MainMenu();
  // mainMenu.appendChild(closeResetSection);

  /*
  This section is commented out because session management is not required for the study.

  const sessionManagementSection: HTMLDivElement = SessionManagement(idx);

  const sessionTitle: HTMLLabelElement = document.createElement("label");
  sessionTitle.id = `refg-session-title-${idx}`;
  sessionTitle.classList.add("m-2");
  mainMenu.appendChild(sessionTitle);

  mainMenu.appendChild(sessionManagementSection);
  */

  const player: HTMLDivElement = utilComponents.Player(idx);
  const comments: HTMLDivElement = utilComponents.Comments(idx);

  const label: HTMLLabelElement = document.createElement("label");
  label.id = `refg-comment-info-${idx}`;
  label.classList.add("d-none", "m-2", "text-center");
  label.innerText =
    "Double click on comments to copy them. Click on 'Copy All' to copy all comments.";

  const container = utilComponents.InterfaceContainer(idx, isCodeComment);
  container.appendChild(player);
  container.appendChild(closeResetSection);
  container.appendChild(label);
  container.appendChild(comments);
  return container;
}

/**
 * Builds the main menu container.
 * @returns A div representing the main menu container.
 */
/* function MainMenu(): HTMLDivElement {
  const container = document.createElement("div");
  container.classList.add("d-flex", "flex-justify-between");
  return container;
} */

function makeReadonlyInterfaces(): void {
  document.querySelectorAll(".js-comment-body").forEach((elem: HTMLElement) => {
    const interfaceIndex = helpers.readOnlyInterfaces.findIndex(
      (value: interfaces.ReadOnlyInterface) => {
        return value.commentBody == elem;
      }
    );

    if (interfaceIndex > -1) return;

    const idx = helpers.counter;
    const mainInterface = MainInterfaceR(idx);
    mainInterface.classList.add("d-none");
    helpers.updateCounter();

    const parent = elem.parentNode;
    const firstChild = parent.firstChild;
    parent.insertBefore(mainInterface, firstChild);
    helpers.readOnlyInterfaces.push({
      commentBody: elem,
      githubCommentId: idx,
      events: [],
      sessionDetails: null,
      comments: [],
      nextCommentId: 0,
      mainPlayer: null,
    });
  });
}

/**
 * Creates an editable interface for each code comment on the page.
 */
function makeCodeEditableInterface(): void {
  document.querySelectorAll(constants.codeCommentQuery).forEach((elem: HTMLElement) => {
    const idx = helpers.counter;
    const detailsParent = elem.parentElement;
    let btn = detailsParent.querySelector("[id^=refg-show-interface]");
    if (btn) return;

    helpers.updateCounter();

    const insertPoint = helpers.findAncestor(detailsParent, "js-line-comments");
    btn = utilComponents.ShowInterfaceBtn(detailsParent, idx);

    btn.addEventListener("click", () => {
      const insertPoint = helpers.findAncestor(detailsParent, "js-line-comments");
      let mainInterface: Element = insertPoint.querySelector(`#refg-interface-container-${idx}`);
      if (mainInterface == undefined) {
        mainInterface = MainInterface(idx, true);
        const reviewThreadReply = helpers.findAncestor(detailsParent, "review-thread-reply");
        insertPoint.insertBefore(mainInterface, reviewThreadReply);
        helpers.stateMap[idx] = {
          hasUnsavedChanges: false,
          containerId: `refg-interface-container-${idx}`,
          mainPlayer: null,
          sessionDetails: null,
          comments: [],
          events: [],
          nextCommentId: 0,
        };
      }

      const hidden = mainInterface.classList.toggle("d-none");
      helpers.stateMap[idx].active = !hidden;

      if (hidden) {
        mainInterface.classList.remove("refg-active");
      } else {
        mainInterface.classList.add("refg-active", "d-flex", "flex-column");
        chrome.runtime.sendMessage<interfaces.ExtensionMessage>({
          action: "[GITHUB] Ready to Receive",
          source: "github_content",
          idx: idx,
        });
      }
    });

    detailsParent.appendChild(btn);

    helpers.stateMap[idx] = {
      hasUnsavedChanges: false,
      containerId: `refg-interface-container-${idx}`,
      active: false,
      mainPlayer: null,
      sessionDetails: null,
      comments: [],
      events: [],
      nextCommentId: 0,
    };

    const mainInterface: HTMLDivElement = MainInterface(idx, true);
    const reviewThreadReply: HTMLElement = helpers.findAncestor(
      detailsParent,
      "review-thread-reply"
    );
    insertPoint.insertBefore(mainInterface, reviewThreadReply);
  });
}

/**
 * Creates an editable interface for the main comment box on the page.
 */
function makeMainEditableInterface(): void {
  // retrieve button insertion point
  const details: HTMLDetailsElement = document.querySelector(constants.mainCommentQuery);
  const detailsParent = details.parentElement;

  // Setup button to activate interface
  const idx = helpers.counter;
  helpers.updateCounter();
  const btn = utilComponents.ShowInterfaceBtn(detailsParent, idx);

  btn.addEventListener("click", () => {
    const timelineActions = document.querySelector(".discussion-timeline-actions");
    let mainInterface = timelineActions.querySelector(`#refg-interface-container-${idx}`);
    if (mainInterface == undefined) {
      mainInterface = MainInterface(idx);
      const issueCommentBox = document.getElementById("issue-comment-box") as HTMLDivElement;
      timelineActions.insertBefore(mainInterface, issueCommentBox);
      helpers.stateMap[idx] = {
        hasUnsavedChanges: false,
        containerId: `refg-interface-container-${idx}`,
        mainPlayer: null,
        sessionDetails: null,
        comments: [],
        events: [],
        nextCommentId: 0,
      };
    }

    const hidden = mainInterface.classList.toggle("d-none");
    helpers.stateMap[idx].active = !hidden;

    if (hidden) {
      mainInterface.classList.remove("refg-active");
    } else {
      mainInterface.classList.add("refg-active", "d-flex", "flex-column");
      chrome.runtime.sendMessage<interfaces.ExtensionMessage>({
        action: "[GITHUB] Ready to Receive",
        source: "github_content",
        idx: idx,
      });
    }
  });

  detailsParent.appendChild(btn);

  helpers.stateMap[idx] = {
    hasUnsavedChanges: false,
    containerId: `refg-interface-container-${idx}`,
    active: false,
    mainPlayer: null,
    sessionDetails: null,
    comments: [],
    events: [],
    nextCommentId: 0,
  };

  const mainInterface = MainInterface(idx);
  const timelineActions = document.querySelector(".discussion-timeline-actions");
  const issueCommentBox = document.getElementById("issue-comment-box") as HTMLDivElement;
  timelineActions.insertBefore(mainInterface, issueCommentBox);
}

/**
 * Listener to handle messages sent by the background script. Messages should be in the
 * form of an {@link ExtensionMessage}.
 */
chrome.runtime.onMessage.addListener((m: interfaces.ExtensionMessage) => {
  if (m.action == "[GITHUB] Send Log" && m.source == "background") {
    injectMainPlayer(m.events, m.idx, m.website);
  }
});

window.addEventListener("click", (event: MouseEvent) => {
  const target = event.target as HTMLElement;
  if (target.tagName == "BUTTON" && target.classList.contains("review-thread-reply-button")) {
    makeCodeEditableInterface();
  } else if (target.tagName == "BUTTON" && target.textContent.toLowerCase().includes("comment")) {
    console.log("THIS IS THE RIGHT SPOT!");
    setTimeout(() => {
      makeReadonlyInterfaces();
      loadReferencedSessions();
    }, 2000);
  }
});

const sessionIds: Set<string> = new Set();
let sessionToCommentMap: interfaces.SessionToCommentMap = {};
let textNodes: interfaces.TextWithSessions[] = [];

function loadReferencedSessions(): void {
  sessionIds.clear();
  sessionToCommentMap = {};
  textNodes = [];

  document.querySelectorAll(".comment-body").forEach((body: HTMLElement) => {
    findSessions(body);
  });

  const promiseArray: Promise<Response>[] = [];
  sessionIds.forEach((sessionId: string) => {
    promiseArray.push(
      fetch(`http://127.0.0.1:5000/loadSession/${sessionId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(helpers.prDetails),
      })
    );
  });

  Promise.all(promiseArray)
    .then((resArray: Response[]) => {
      return Promise.all(resArray.map((res: Response) => res.json()));
    })
    .then((value: interfaces.CoreState[]) => {
      for (const interfaceInfo of value) {
        helpers.loadedSessions[interfaceInfo.sessionDetails.id] = interfaceInfo;
      }

      console.log(helpers.loadedSessions);

      for (const info of textNodes) {
        const { textNode, sessionCommentsArr }: interfaces.TextWithSessions = info;
        const commentBody = helpers.findAncestor(textNode.parentElement, "js-comment-body");
        const taggedText = buildSplitArr(textNode.textContent, sessionCommentsArr);
        const nodes: Node[] = [];

        taggedText.forEach((tag: interfaces.TaggedText) => {
          if (tag.isSessionString) {
            const {sessionId, commentId} = sessionToCommentMap[tag.text];

            const button = document.createElement("button");
            button.innerText = `View In Interface`;
            button.classList.add("m-2", "btn", "refg-view-interface");
            button.addEventListener("click", () => {
              const idx = helpers.readOnlyInterfaces.findIndex(
                (value: interfaces.ReadOnlyInterface) => {
                  return value.commentBody == commentBody;
                }
              );

              const interfaceContainer = commentBody.parentElement.querySelector(
                `#refg-interface-container-r-${helpers.readOnlyInterfaces[idx].githubCommentId}`
              );
              console.log(interfaceContainer);

              //let hidden = false;
              let active = false;
              commentBody
                .querySelectorAll(".refg-view-interface")
                .forEach((btn: HTMLButtonElement) => {
                  if (btn == button) {
                    console.log("BTN MATCHED");
                    active = btn.classList.toggle("btn-primary");
                  } else {
                    btn.classList.remove("btn-primary");
                  }
                });

              if (active) {
                interfaceContainer.classList.remove("d-none");
                interfaceContainer.classList.add("refg-active", "d-flex", "flex-column");
              } else {
                interfaceContainer.classList.add("d-none");
                interfaceContainer.classList.remove("refg-active");
              }

              window.getSelection().removeAllRanges();

              console.log(sessionId);
              injectReadOnlyPlayer(helpers.readOnlyInterfaces[idx].githubCommentId, sessionId);

              const commentContainer = document.getElementById(
                `refg-comments-r-${helpers.readOnlyInterfaces[idx].githubCommentId}`
              );
              commentContainer.innerHTML = "";
              for (const data of helpers.readOnlyInterfaces[idx].comments) {
                processComment(data, idx);
                const comment = CommentR(data);
                if (data.comment_id == commentId) {
                  comment.style.setProperty("border", "3px solid red", "important");
                  setTimeout(() => {
                    comment.style.border = "";
                  }, 2000);
                }
                commentContainer.appendChild(comment);
              }
            });
            nodes.push(button);
          } else {
            nodes.push(document.createTextNode(tag.text));
          }
        });
        textNode.parentElement.replaceChildren(...nodes);
      }
    })
    .catch((err: Error) => {
      console.log(err);
    });
}

function findSessions(elem: Node): void {
  if (elem.nodeName == "#text") {
    const matches: IterableIterator<RegExpMatchArray> = elem.textContent.matchAll(
      constants.sessionMatchPattern
    );
    const sessionCommentsArr: string[] = [];
    for (const match of matches) {
      const sessionId: string = match[2];
      const commentId: number = parseInt(match[3]);
      sessionIds.add(sessionId);
      sessionToCommentMap[match[1]] = { sessionId: sessionId, commentId: commentId };
      sessionCommentsArr.push(match[1]);
    }
    if (sessionCommentsArr.length == 0) return;
    textNodes.push({ textNode: elem as Text, sessionCommentsArr: sessionCommentsArr });
  } else {
    elem.childNodes.forEach((child: Node) => findSessions(child));
  }
}

function buildSplitArr(textContent: string, sessionCommentsArr: string[]): interfaces.TaggedText[] {
  const splitArray: interfaces.TaggedText[] = [];

  let modified = textContent;
  sessionCommentsArr.forEach((str: string) => {
    const splits: string[] = modified.split(str, 2);
    if (splits[0].length > 0) {
      splitArray.push({ text: splits[0], isSessionString: false });
    }
    modified = splits[1];
    splitArray.push({ text: str, isSessionString: true });
  });
  splitArray.push({ text: modified, isSessionString: false });

  return splitArray;
}

// Create the interface after a short delay.
setTimeout(() => {
  makeReadonlyInterfaces();
  makeMainEditableInterface();
  makeCodeEditableInterface();
  loadReferencedSessions();
}, 200);
