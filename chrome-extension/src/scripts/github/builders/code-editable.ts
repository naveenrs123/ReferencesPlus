import { codeCommentQuery } from "../../common/constants";
import { counter, findAncestor, stateMap, updateCounter } from "../../common/helpers";
import { ExtensionMessage } from "../../common/interfaces";
import { MainInterface } from "../../edit-components/sections/main-interface";
import { ShowInterfaceBtn } from "../../edit-components/util-components";

function buttonClicked(event: MouseEvent, idx: number, detailsParent: HTMLElement): void {
  event.preventDefault();
  const insertPoint = findAncestor(detailsParent, "js-line-comments");
  let mainInterface: Element = insertPoint.querySelector(`#refg-interface-container-${idx}`);
  if (mainInterface == undefined) {
    mainInterface = MainInterface(idx, true);
    const reviewThreadReply = findAncestor(detailsParent, "review-thread-reply");
    insertPoint.insertBefore(mainInterface, reviewThreadReply);
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
}

/**
 * Creates an editable interface for each code comment on the page.
 */
export function makeCodeEditableInterface(): void {
  document.querySelectorAll(codeCommentQuery).forEach((elem: HTMLElement) => {
    const idx = counter;
    const detailsParent = elem.parentElement;
    let btn: HTMLButtonElement = detailsParent.querySelector("[id^=refg-show-interface]");
    if (btn) {
      btn.onclick = (event: MouseEvent): void =>
        buttonClicked(event, parseInt(btn.getAttribute("data-idx")), detailsParent);
      return;
    }

    updateCounter();

    const insertPoint = findAncestor(detailsParent, "js-line-comments");
    btn = ShowInterfaceBtn(detailsParent, idx);

    btn.onclick = (event: MouseEvent): void => buttonClicked(event, idx, detailsParent);

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

    const mainInterface: HTMLDivElement = MainInterface(idx, true);
    const reviewThreadReply = findAncestor(detailsParent, "review-thread-reply");
    insertPoint.insertBefore(mainInterface, reviewThreadReply);
  });
}
