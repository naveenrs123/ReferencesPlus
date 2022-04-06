import { ExtensionMessage } from "../common/interfaces";
import { codeCommentQuery, mainCommentQuery } from "../common/constants";
import { injectMainPlayer } from "./rrweb-utils";
import { LeftButtons } from "../components/sections/left-buttons";
import { SessionManagement } from "../components/sections/session-management";
import { counter, findAncestorWithClass, prDetails, stateMap, updateCounter } from "../common/helpers";
import { Comments, InterfaceContainer, Player, ShowInterfaceBtn } from "../components/util-components";

const matchUrl = /https:\/\/github.com\/(.+)\/(.+)\/pull\/(\d+)/;
const matchesArr = window.location.href.match(matchUrl);
prDetails.userOrOrg = matchesArr[1];
prDetails.repository = matchesArr[2];
prDetails.prNumber = parseInt(matchesArr[3]);

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

  const player: HTMLDivElement = Player(idx);
  const comments: HTMLDivElement = Comments(idx);

  const label: HTMLLabelElement = document.createElement("label");
  label.id = `refg-comment-info-${idx}`;
  label.classList.add("d-none", "m-2", "text-center");
  label.innerText = "Double click on comments to copy them. Click on 'Copy All' to copy all comments.";

  const container = InterfaceContainer(idx, isCodeComment);
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
function MainMenu(): HTMLDivElement {
  const container = document.createElement("div");
  container.classList.add("d-flex", "flex-justify-between");
  return container;
}

/**
 * Creates an editable interface for each code comment on the page.
 */
function makeCodeEditableInterface(): void {
  document.querySelectorAll(codeCommentQuery).forEach((elem: HTMLElement) => {
    const idx = counter;
    const detailsParent = elem.parentElement;
    let btn = detailsParent.querySelector("[id^=refg-show-interface]");
    if (btn) return;

    updateCounter();

    const insertPoint = findAncestorWithClass(detailsParent, "js-line-comments");
    btn = ShowInterfaceBtn(detailsParent, idx);

    btn.addEventListener("click", () => {
      const insertPoint = findAncestorWithClass(detailsParent, "js-line-comments");
      let mainInterface: Element = insertPoint.querySelector(`#refg-interface-container-${idx}`);
      if (mainInterface == undefined) {
        mainInterface = MainInterface(idx, true);
        const reviewThreadReply = findAncestorWithClass(detailsParent, "review-thread-reply");
        insertPoint.insertBefore(mainInterface, reviewThreadReply);
        stateMap[idx] = {
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
      stateMap[idx].active = !hidden;

      if (hidden) {
        mainInterface.classList.remove("refg-active");
      } else {
        mainInterface.classList.add("refg-active", "d-flex", "flex-column");
        chrome.runtime.sendMessage<ExtensionMessage>({
          action: "[GITHUB] Ready to Receive",
          source: "github_content",
          idx: idx,
        });
      }
    });

    detailsParent.appendChild(btn);

    stateMap[idx] = {
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
    const reviewThreadReply: HTMLElement = findAncestorWithClass(detailsParent, "review-thread-reply");
    insertPoint.insertBefore(mainInterface, reviewThreadReply);
  });
}

/**
 * Creates an editable interface for the main comment box on the page.
 */
function makeMainEditableInterface(): void {
  // retrieve button insertion point
  const details: HTMLDetailsElement = document.querySelector(mainCommentQuery);
  const detailsParent = details.parentElement;

  // Setup button to activate interface
  const idx = counter;
  updateCounter();
  const btn = ShowInterfaceBtn(detailsParent, idx);

  btn.addEventListener("click", () => {
    const timelineActions = document.querySelector(".discussion-timeline-actions");
    let mainInterface = timelineActions.querySelector(`#refg-interface-container-${idx}`);
    if (mainInterface == undefined) {
      mainInterface = MainInterface(idx);
      const issueCommentBox = document.getElementById("issue-comment-box") as HTMLDivElement;
      timelineActions.insertBefore(mainInterface, issueCommentBox);
      stateMap[idx] = {
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
    stateMap[idx].active = !hidden;

    if (hidden) {
      mainInterface.classList.remove("refg-active");
    } else {
      mainInterface.classList.add("refg-active", "d-flex", "flex-column");
      chrome.runtime.sendMessage<ExtensionMessage>({
        action: "[GITHUB] Ready to Receive",
        source: "github_content",
        idx: idx,
      });
    }
  });

  detailsParent.appendChild(btn);

  stateMap[idx] = {
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
chrome.runtime.onMessage.addListener((m: ExtensionMessage) => {
  if (m.action == "[GITHUB] Send Log" && m.source == "background") {
    injectMainPlayer(m.events, m.idx, m.website);
  }
});

window.addEventListener("click", (event: MouseEvent) => {
  const target = event.target as HTMLElement;
  if (target.tagName == "BUTTON" && target.classList.contains("review-thread-reply-button")) {
    makeCodeEditableInterface();
  }
});

// Create the interface after a short delay.
setTimeout(() => {
  makeMainEditableInterface();
  makeCodeEditableInterface();
}, 200);
