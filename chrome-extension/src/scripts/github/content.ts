import * as interfaces from "../common/interfaces";
import * as constants from "../common/constants";
import { injectMainPlayer } from "./rrweb-utils";
import * as helpers from "../common/helpers";
import { makeMainEditableInterface } from "./builders/main-editable";
import { makeCodeEditableInterface } from "./builders/code-editable";
import { makePRCodeInterface } from "./builders/pr-code-editable";
import { makeReadonlyInterfaces } from "./builders/readonly";

let url = window.location.href;

const matchesArr = window.location.href.match(constants.matchUrl);
helpers.prDetails.userOrOrg = matchesArr[1];
helpers.prDetails.repository = matchesArr[2];

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
  if (window.self != window.top) return;
  event.stopPropagation();
  const target = event.target as HTMLElement;
  const lowerText = target.textContent.toLowerCase();
  if (target.tagName == "BUTTON" && target.classList.contains("review-thread-reply-button")) {
    makeCodeEditableInterface();
  } else if (target.tagName == "BUTTON" && target.classList.contains("js-add-line-comment")) {
    makePRCodeInterface();
  } else if (target.tagName == "BUTTON" && (lowerText.includes("comment") || lowerText.includes("review"))) {
    setTimeout(() => {
      makeReadonlyInterfaces();
    }, 1500);
  } else if (window.location.href != url) {
    url = window.location.href;
    initialize();
  }
});

let initTimeout: ReturnType<typeof setTimeout>;

window.addEventListener("popstate", () => {
  clearTimeout(initTimeout);
  initialize();
});

// Initialize everything after a short delay.
function initialize(): void {
  initTimeout = setTimeout(() => {
    console.log("INITIALIZING");
    makeReadonlyInterfaces();
    if (document.querySelector(constants.mainCommentQuery)) makeMainEditableInterface();
    if (
      document.querySelector(constants.makePrQuery) ||
      document.querySelector(constants.betaCodeCommentQuery)
    ) {
      makePRCodeInterface();
    }
    makeCodeEditableInterface();
  }, 1500);
}

initialize();
