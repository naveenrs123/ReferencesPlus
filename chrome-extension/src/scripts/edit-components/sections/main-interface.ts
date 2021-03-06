/**
 * This builds the main editable interface.
 */

import { PlayerButtons } from "./player-buttons";
import * as utilComponents from "../util-components";

/**
 * Builds the editable interface.
 * @param playerContainer The container to which the contents will be added.
 */
export function MainInterface(idx: number, isEvenlyPadded = false): HTMLDivElement {
  const closeResetSection: HTMLDivElement = PlayerButtons(idx);

  // const mainMenu: HTMLDivElement = MainMenu();
  // mainMenu.appendChild(closeResetSection);

  /*
    NOTE: This section is commented out because session management is not fully implemented

    const sessionManagementSection: HTMLDivElement = SessionManagement(idx);

    const sessionTitle: HTMLLabelElement = document.createElement("label");
    sessionTitle.id = `refg-session-title-${idx}`;
    sessionTitle.classList.add("m-2");
    mainMenu.appendChild(sessionTitle);

    mainMenu.appendChild(sessionManagementSection);
    */

  const player: HTMLDivElement = utilComponents.Player(idx);
  const comments: HTMLDivElement = utilComponents.Comments(idx);

  const label: HTMLLabelElement = document.createElement("label");
  label.id = `refg-comment-info-${idx}`;
  label.classList.add("d-none", "m-2", "text-center");
  label.innerText =
    "Click the top-right icon on a comment to copy it. Click on 'Copy All' to copy all comments.";

  const container = utilComponents.InterfaceContainer(idx, isEvenlyPadded, false);
  container.addEventListener("click", (event: MouseEvent) => event.preventDefault());
  container.appendChild(player);
  container.appendChild(closeResetSection);
  container.appendChild(label);
  container.appendChild(comments);
  return container;
}
