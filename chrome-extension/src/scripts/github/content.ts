import { ExtensionMessage, PRDetails } from "../common/interfaces";
import { codeCommentQuery, mainCommentQuery } from "../common/constants";
import { injectMainPlayer } from "./rrweb-utils";
import { LeftButtons } from "../components/sections/left-buttons";
import { SessionManagement } from "../components/sections/session-management";
import { counter, findAncestorWithClass, stateMap, updateCounter } from "../common/helpers";
import { Comments, InterfaceContainer, Player, ShowInterfaceBtn } from "../components/util-components";

const matchUrl = /https:\/\/github.com\/(.+)\/(.+)\/pull\/(\d+)/;
const matchesArr = window.location.href.match(matchUrl);
const prDetails: PRDetails = {
  userOrOrg: matchesArr[1],
  repository: matchesArr[2],
  prNumber: parseInt(matchesArr[3]),
};

console.log(prDetails);

/**
 * Builds the contents of the player container for emulator interactions.
 * @param playerContainer The container to which the contents will be added.
 */
function MainInterface(idx: number, isCodeComment = false): HTMLDivElement {
  const closeResetSection: HTMLDivElement = LeftButtons(idx);
  const sessionManagementSection: HTMLDivElement = SessionManagement(idx);
  const mainMenu: HTMLDivElement = MainMenu();
  mainMenu.appendChild(closeResetSection);
  mainMenu.appendChild(sessionManagementSection);

  const player: HTMLDivElement = Player(idx);
  const comments: HTMLDivElement = Comments(idx);

  const container = InterfaceContainer(idx, isCodeComment);
  container.appendChild(mainMenu);
  container.appendChild(player);
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
        };
      }

      const hidden = mainInterface.classList.toggle("d-none");
      stateMap[idx].active = !hidden;

      if (hidden) {
        mainInterface.classList.remove("refg-active");
      } else {
        mainInterface.classList.add("refg-active");
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
      };
    }

    const hidden = mainInterface.classList.toggle("d-none");
    stateMap[idx].active = !hidden;

    if (hidden) {
      mainInterface.classList.remove("refg-active");
    } else {
      mainInterface.classList.add("refg-active");
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
