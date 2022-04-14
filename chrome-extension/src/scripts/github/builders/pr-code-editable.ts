import { betaCodeCommentQuery, makePrQuery } from "../../common/constants";
import { counter, findAncestor, stateMap, updateCounter } from "../../common/helpers";
import { ExtensionMessage } from "../../common/interfaces";
import { MainInterface } from "../../edit-components/sections/main-interface";
import { ShowInterfaceBtn } from "../../edit-components/util-components";

export function makePRCodeInterface(): void {
  document.querySelectorAll(betaCodeCommentQuery).forEach((elem: HTMLElement) => {
    makePrInterface(elem);
  });
  if (document.querySelector(makePrQuery)) {
    makePrInterface(document.querySelector(makePrQuery), false);
  }
}

function makePrInterface(elem: HTMLElement, isCodeComment = true): void {
  if (!elem) return;
  const detailsParent = elem.parentElement;

  let btn = detailsParent.querySelector("[id^=refg-show-interface]");
  if (btn) return;

  // Setup button to activate interface
  const idx = counter;
  updateCounter();
  btn = ShowInterfaceBtn(detailsParent, idx);

  btn.addEventListener("click", (event: MouseEvent) => {
    event.preventDefault();
    const commentForm = isCodeComment
      ? findAncestor(detailsParent, "js-inline-comment-form")
      : document.querySelector(".js-previewable-comment-form");
    const makePrContainer = isCodeComment
      ? commentForm.parentElement
      : document.querySelector(".js-slash-command-surface");

    let mainInterface = makePrContainer.querySelector(`#refg-interface-container-${idx}`);
    if (mainInterface == undefined) {
      mainInterface = MainInterface(idx, true);
      makePrContainer.insertBefore(mainInterface, commentForm);
      stateMap[idx] = {
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
    stateMap[idx].active = !hidden;

    if (hidden) {
      mainInterface.classList.remove("refg-active");
    } else {
      mainInterface.classList.add("refg-active", "d-flex", "flex-column");
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
    events: [],
    nextCommentId: 0,
  };

  const mainInterface = MainInterface(idx, true);
  const commentForm = isCodeComment
    ? findAncestor(detailsParent, "js-inline-comment-form")
    : document.querySelector(".js-previewable-comment-form");
  const makePrContainer = isCodeComment
    ? commentForm.parentElement
    : document.querySelector(".js-slash-command-surface");
  makePrContainer.insertBefore(mainInterface, commentForm);
}
