/**
 * Builds the main interface above the PR comment box in the Conversations tab.
 */

import * as constants from "../../common/constants";
import * as helpers from "../../common/helpers";
import { ExtensionMessage } from "../../common/interfaces";
import { MainInterface } from "../../edit-components/sections/main-interface";
import * as utilComponents from "../../edit-components/util-components";

/**
 * Handler for a click event on the activate button.
 * @param event The mouse event.
 * @param idx The index used to identify the interface and its associated state.
 */
function activateButtonClicked(event: MouseEvent, idx: number): void {
  console.log("MAIN CLICKED");
  event.preventDefault();
  const timelineActions = document.querySelector(".discussion-timeline-actions");
  let mainInterface = timelineActions.querySelector(`#refg-interface-container-${idx}`);
  if (!mainInterface) {
    mainInterface = MainInterface(idx);
    const issueCommentBox = document.getElementById("issue-comment-box");
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
}

/**
 * Creates an editable interface for the main comment box on the page.
 */
export function makeMainEditableInterface(): void {
  // retrieve button insertion point
  if (!document.querySelector(constants.mainCommentQuery)) return;

  const details: HTMLDetailsElement = document.querySelector(constants.mainCommentQuery);
  const detailsParent = details.parentElement;

  let btn: HTMLButtonElement = detailsParent.querySelector("[id^=refg-show-interface]");
  if (btn) {
    btn.onclick = (event: MouseEvent): void =>
      activateButtonClicked(event, parseInt(btn.getAttribute("data-idx")));
    return;
  }

  // Setup button to activate interface
  const idx = helpers.counter;
  helpers.updateCounter();
  btn = utilComponents.ShowInterfaceBtn(detailsParent, idx);
  btn.onclick = (event: MouseEvent): void => activateButtonClicked(event, idx);

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
