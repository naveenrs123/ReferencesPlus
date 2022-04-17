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
  const lowerText = target.textContent.trim().toLowerCase();
  if (target.tagName == "BUTTON" && target.classList.contains("review-thread-reply-button")) {
    makeCodeEditableInterface();
  } else if (
    target.tagName == "BUTTON" &&
    (target.classList.contains("js-add-line-comment") || lowerText.includes("create pull request"))
  ) {
    makePRCodeInterface();
  } else if (
    target.tagName == "BUTTON" &&
    (lowerText.includes("comment") || lowerText.includes("review") || lowerText.includes("delete"))
  ) {
    setTimeout(() => {
      makeReadonlyInterfaces();
    }, 3000);
  } else if (window.location.href != url) {
    url = window.location.href;
    const btn: HTMLButtonElement = document.querySelector(".refg-refresh-button");
    if (btn) btn.remove();

    if (constants.matchUrl.test(url)) initialize();
  }
});

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

let initTimeout: ReturnType<typeof setTimeout>;

window.addEventListener("popstate", () => {
  initialize();
});

// Initialize everything after a short delay.
function initialize(timeout = 1000): void {
  if (initTimeout) return;

  initTimeout = setTimeout(() => {
    addRefreshButton();
    makeReadonlyInterfaces();
    makeMainEditableInterface();
    makePRCodeInterface();
    makeCodeEditableInterface();
  }, timeout);
}

initialize();
