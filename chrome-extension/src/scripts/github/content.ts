import { ExtensionMessage } from "../common/interfaces";
import { codeCommentQuery, mainCommentQuery } from "../common/constants";
import { injectMainPlayer } from "./rrweb-utils";
import { LeftButtons } from "./components/left-buttons";
import { SessionManagement } from "./components/session-management";
import { counter, findAncestorWithClass, stateMap, updateCounter } from "../common/helpers";
import { Comments, InterfaceContainer, Player, ShowInterfaceBtn } from "./components/util-components";

/**
 * Builds the contents of the player container for emulator interactions.
 * @param playerContainer The container to which the contents will be added.
 */
function MainInterface(idx: number): HTMLDivElement {
  const closeResetSection: HTMLDivElement = LeftButtons(idx);
  const sessionManagementSection: HTMLDivElement = SessionManagement(idx);
  const mainMenu: HTMLDivElement = MainMenu();
  mainMenu.appendChild(closeResetSection);
  mainMenu.appendChild(sessionManagementSection);

  const player: HTMLDivElement = Player(idx);
  const comments: HTMLDivElement = Comments(idx);

  const container = InterfaceContainer(idx);
  container.appendChild(mainMenu);
  container.appendChild(player);
  container.appendChild(comments);
  return container;
}

function MainMenu(): HTMLDivElement {
  const container = document.createElement("div");
  container.classList.add("d-flex", "flex-justify-between");
  return container;
}

function makeCodeEditableInterface(): void {
  document.querySelectorAll(codeCommentQuery).forEach((elem: HTMLElement) => {
    const detailsParent = elem.parentElement;
    const idx = counter;
    updateCounter();
    const btn = ShowInterfaceBtn(detailsParent, idx);
    detailsParent.appendChild(btn);

    btn.addEventListener("click", () => {
      const insertPoint = findAncestorWithClass(detailsParent, "js-line-comments");
      let mainInterface: HTMLElement = insertPoint.querySelector(`#refg-interface-container-${idx}`);
      if (mainInterface == undefined) {
        mainInterface = MainInterface(idx);
        const reviewThreadReply = findAncestorWithClass(detailsParent, "review-thread-reply");
        insertPoint.insertBefore(mainInterface, reviewThreadReply);
        stateMap[idx] = {
          hasUnsavedChanges: false,
          containerId: `refg-interface-container-${idx}`,
          mainPlayer: null,
          sessionDetails: null,
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

    stateMap[idx] = {
      hasUnsavedChanges: false,
      containerId: `refg-interface-container-${idx}`,
      active: false,
      mainPlayer: null,
      sessionDetails: null,
    };
    const insertPoint = findAncestorWithClass(detailsParent, "js-line-comments");
    const mainInterface: HTMLElement = insertPoint.querySelector(`#refg-interface-container-${idx}`);
    const reviewThreadReply = findAncestorWithClass(detailsParent, "review-thread-reply");
    insertPoint.insertBefore(mainInterface, reviewThreadReply);
  });
}

/**
 * Create the interface required to support UI references in the GitHub PR page.
 */
function makeMainEditableInterface(): void {
  const details: HTMLDetailsElement = document.querySelector(mainCommentQuery);
  const detailsParent: ParentNode = details.parentNode;

  const idx = counter;
  updateCounter();
  const btn = ShowInterfaceBtn(detailsParent, idx);
  detailsParent.appendChild(btn);

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

  stateMap[idx] = {
    hasUnsavedChanges: false,
    containerId: `refg-interface-container-${idx}`,
    active: false,
    mainPlayer: null,
    sessionDetails: null,
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
    injectMainPlayer(m.events, m.idx);
  }
});

makeMainEditableInterface();
