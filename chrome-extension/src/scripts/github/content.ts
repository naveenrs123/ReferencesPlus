import { ExtensionMessage } from "../common/interfaces";
import * as c from "./components";
import { mainCommentQuery } from "../common/constants";
import { LeftButtons, SessionManagement } from "./composition";
import { injectMainPlayer } from "./rrweb-utils";

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

  const comments: HTMLDivElement = document.createElement("div");
  comments.id = "refg-comments";
  comments.classList.add("p-2", "d-flex", "overflow-x-auto", "flex-items-center");

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

  const mainInterface = MainInterface();

  btn.addEventListener("click", () => {
    let hidden: boolean = mainInterface.classList.toggle("d-none");
    if (!hidden) {
      mainInterface.classList.add("refg-active");
      chrome.runtime.sendMessage<ExtensionMessage>({
        action: "[GITHUB] Ready to Receive",
        source: "github_content",
      });
    } else {
      mainInterface.classList.remove("refg-active");
    }
  });

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
