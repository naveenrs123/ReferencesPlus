import { ExtensionMessage } from "../common/interfaces";
import { mainCommentQuery } from "../common/constants";
import { injectMainPlayer } from "./rrweb-utils";
import { LeftButtons } from "./components/left-buttons";
import { SessionManagement } from "./components/session-management";
import { counter, stateMap, updateCounter } from "../common/helpers";
import { Comments, InterfaceContainer, Player, ShowInterfaceBtn } from "./components/util-components";

/**
 * Builds the contents of the player container for emulator interactions.
 * @param playerContainer The container to which the contents will be added.
 */
function MainInterface(idx: number) {
  const closeResetSection: HTMLDivElement = LeftButtons(idx);
  const sessionManagementSection: HTMLDivElement = SessionManagement(idx);
  const mainMenu: HTMLDivElement = MainMenu(idx);
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

function MainMenu(idx: number) {
  const container = document.createElement("div");
  container.classList.add("d-flex", "flex-justify-between");
  return container;
}

/**
 * Create the interface required to support UI references in the GitHub PR page.
 */
function makeEditableInterface(query: string): void {
  const details: HTMLDetailsElement = document.querySelector(query);
  const detailsParent: ParentNode = details.parentNode;

  const idx = counter;
  updateCounter();
  const btn = ShowInterfaceBtn(detailsParent, idx);
  detailsParent.appendChild(btn);

  btn.addEventListener("click", () => {
    const timelineActions = document.querySelector(".discussion-timeline-actions") as HTMLDivElement;
    let mainInterface = timelineActions.querySelector(`#refg-interface-container-${idx}`) as HTMLDivElement;
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
  const timelineActions = document.querySelector(".discussion-timeline-actions") as HTMLDivElement;
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

makeEditableInterface(mainCommentQuery);
