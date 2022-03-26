import { ExtensionMessage } from "../common/interfaces";
import * as c from "./components/util-components";
import { mainCommentQuery } from "../common/constants";
import { injectMainPlayer } from "./rrweb-utils";
import { LeftButtons } from "./components/left-button";
import { SessionManagement } from "./components/session-management";

/**
 * Builds the contents of the player container for emulator interactions.
 * @param playerContainer The container to which the contents will be added.
 */
function MainInterface() {
  const closeResetSection: HTMLDivElement = LeftButtons();
  const sessionManagementSection: HTMLDivElement = SessionManagement();

  const buttonsSection: HTMLDivElement = document.createElement("div");
  buttonsSection.classList.add("d-flex");
  buttonsSection.style.justifyContent = "space-between";
  buttonsSection.style.alignItems = "flex-start";
  buttonsSection.appendChild(closeResetSection);
  buttonsSection.appendChild(sessionManagementSection);

  const player: HTMLDivElement = c.Player();
  const comments: HTMLDivElement = c.Comments();

  const container = c.InterfaceContainer();
  container.appendChild(buttonsSection);
  container.appendChild(player);
  container.appendChild(comments);
  return container;
}

/**
 * Create the interface required to support UI references in the GitHub PR page.
 */
function makeEditableInterface(query: string): void {
  const details: HTMLDetailsElement = document.querySelector(query);
  const detailsParent: ParentNode = details.parentNode;
  const btn = c.ShowInterfaceBtn(detailsParent);
  detailsParent.appendChild(btn);

  btn.addEventListener("click", () => {
    const timelineActions = document.querySelector(".discussion-timeline-actions") as HTMLDivElement;
    let mainInterface = timelineActions.querySelector("#refg-interface-container") as HTMLDivElement;
    if (mainInterface == undefined) {
      mainInterface = MainInterface();
      const issueCommentBox = document.getElementById("issue-comment-box") as HTMLDivElement;
      timelineActions.insertBefore(mainInterface, issueCommentBox);
    }

    if (mainInterface.classList.toggle("d-none")) {
      mainInterface.classList.remove("refg-active");
    } else {
      mainInterface.classList.add("refg-active");
      chrome.runtime.sendMessage<ExtensionMessage>({
        action: "[GITHUB] Ready to Receive",
        source: "github_content",
      });
    }
  });

  const mainInterface = MainInterface();
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
    injectMainPlayer(m.events);
  }
});

makeEditableInterface(mainCommentQuery);
