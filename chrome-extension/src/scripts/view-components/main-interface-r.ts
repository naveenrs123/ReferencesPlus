import { Comments, InterfaceContainer, Player } from "../edit-components/util-components";
import { LeftButtonsR } from "./sections/left-buttons-r";

/**
 * Builds the contents of the player container for emulator interactions.
 * @param playerContainer The container to which the contents will be added.
 */
export function MainInterfaceR(idx: number): HTMLDivElement {
  const closeResetSection: HTMLDivElement = LeftButtonsR(idx);
  const player: HTMLDivElement = Player(idx, true);
  const comments: HTMLDivElement = Comments(idx, true);

  const label: HTMLLabelElement = document.createElement("label");
  label.id = `refg-comment-info-r-${idx}`;
  label.classList.add("d-none", "m-2", "text-center");
  label.innerText =
    "Click the top-right icon on a comment to copy it. Click on 'Copy All' to copy all comments.";

  const container = InterfaceContainer(idx, false, true);
  container.appendChild(player);
  container.appendChild(closeResetSection);
  container.appendChild(label);
  container.appendChild(comments);
  return container;
}
