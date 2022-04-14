import * as constants from "../../common/constants";
import * as helpers from "../../common/helpers";
import { ExtensionMessage } from "../../common/interfaces";
import { MainInterface } from "../../edit-components/sections/main-interface";
import * as utilComponents from "../../edit-components/util-components";

/**
 * Builds the main menu container.
 * @returns A div representing the main menu container.
 */
/* function MainMenu(): HTMLDivElement {
  const container = document.createElement("div");
  container.classList.add("d-flex", "flex-justify-between");
  return container;
} */

/**
 * Creates an editable interface for the main comment box on the page.
 */
export function makeMainEditableInterface(): void {
  // retrieve button insertion point
  if (!document.querySelector(constants.mainCommentQuery)) return;

  const details: HTMLDetailsElement = document.querySelector(constants.mainCommentQuery);
  const detailsParent = details.parentElement;

  let btn = detailsParent.querySelector("[id^=refg-show-interface]");
  if (btn) return;

  // Setup button to activate interface
  const idx = helpers.counter;
  helpers.updateCounter();
  btn = utilComponents.ShowInterfaceBtn(detailsParent, idx);

  btn.addEventListener("click", (event: MouseEvent) => {
    event.preventDefault();
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
      chrome.runtime.sendMessage<ExtensionMessage>(
        {
          action: "[GITHUB] Ready to Receive",
          source: "github_content",
          idx: idx,
        },
        (response) => {
          console.log(response);
        }
      );
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
