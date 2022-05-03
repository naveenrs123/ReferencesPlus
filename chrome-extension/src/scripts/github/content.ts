/**
 * The entry point for the code that interacts with the GitHub PR discussion.
 */

import * as interfaces from "../common/interfaces";
import * as constants from "../common/constants";
import { injectEditablePlayer } from "./player";
import * as helpers from "../common/helpers";
import { makeMainEditableInterface } from "./builders/main-editable";
import { makeCodeEditableInterface } from "./builders/code-editable";
import { makePRCodeInterface } from "./builders/pr-code-editable";
import { makeReadonlyInterfaces } from "./builders/readonly";

let url = window.location.href;
let initTimeout: ReturnType<typeof setTimeout>;
let initialized = false;

// Initialize everything after a short delay.
function initialize(timeout = 500): void {
  if (initTimeout != undefined || initialized) return;
  initialized = true;
  initTimeout = setTimeout(() => {
    const matchesArr = window.location.href.match(constants.matchUrl);
    helpers.prDetails.userOrOrg = matchesArr[1];
    helpers.prDetails.repository = matchesArr[2];
    makeReadonlyInterfaces();
    makeMainEditableInterface();
    makePRCodeInterface();
    makeCodeEditableInterface();
    addRefreshButton();
  }, timeout);
}

/**
 * Listener to handle messages sent by the background script. Messages should be in the
 * form of an {@link ExtensionMessage}.
 */
chrome.runtime.onMessage.addListener((m: interfaces.ExtensionMessage) => {
  if (m.action == "[GITHUB] Send Log" && m.source == "background") {
    injectEditablePlayer(m.events, m.idx, m.website);
  }
});

/**
 * An event listener to listen for clicks on the window and trigger the recording
 * interfaces to reload.
 */
window.addEventListener("click", (event: MouseEvent) => {
  if (window.self != window.top) return;
  event.stopPropagation();
  const target = event.target as HTMLElement;
  const lowerText = target.textContent.trim().toLowerCase();
  if (target.tagName == "BUTTON" && target.classList.contains("review-thread-reply-button")) {
    // When user replies to a comment on code.
    makeCodeEditableInterface();
  } else if (
    target.tagName == "BUTTON" &&
    (target.classList.contains("js-add-line-comment") || lowerText.includes("create pull request"))
  ) {
    // User creates a pull request
    makePRCodeInterface();
  } else if (
    target.tagName == "BUTTON" &&
    (lowerText.includes("comment") || lowerText.includes("review") || lowerText.includes("delete"))
  ) {
    // Make changes to comments e.g. adding/deleting.
    setTimeout(() => {
      makeReadonlyInterfaces();
    }, 3000);
  } else if (window.location.href != url) {
    // Used to keep track of url changes and reload the interface correctly.
    initialized = false;
    url = window.location.href;
  }
});

// Used to track page changes and load everything correctly.
window.addEventListener("popstate", () => {
  if (constants.matchUrl.test(url)) {
    initialize();
  } else {
    document.querySelector(".refg-refresh-button")?.remove();
  }
});

/**
 * Create a button that refreshes the readonly interfaces. Manual workaround to
 * deal with GitHub making changes to the page.
 */
function addRefreshButton(): void {
  let btn: HTMLButtonElement = document.querySelector(".refg-refresh-button");
  if (btn) btn.remove();
  btn = document.createElement("button");
  btn.classList.add("refg-refresh-button", "position-fixed", "btn", "p-2");
  btn.style.bottom = "30px";
  btn.style.left = "30px";
  btn.style.zIndex = "2000000000";
  btn.innerText = "⭮ Refresh Contexts";
  btn.addEventListener("click", () => {
    makeReadonlyInterfaces();
  });
  document.querySelector("body").appendChild(btn);
}

initialize();
