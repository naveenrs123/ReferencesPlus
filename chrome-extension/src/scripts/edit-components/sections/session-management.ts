/**
 * NOT USED
 *
 * Would be a separate section to control session management. This would involve allowing users to
 * save and load sessions manually.
 */

import { getFetchUrl } from "../../common/constants";
import { prDetails, stateMap } from "../../common/helpers";
import { CoreState, SaveResponse, SessionDetails } from "../../common/interfaces";
import { ChangesSavedModal } from "../modals/changes-saved-modal";
import { SaveSessionModal } from "../modals/save-session-modal";
import { PlayerBtn, TextInput } from "../util-components";

export function SessionManagement(idx: number): HTMLDivElement {
  const container = document.createElement("div");
  container.classList.add("d-flex");
  container.style.flexDirection = "column";

  const sessionID = document.createElement("label");
  sessionID.id = `refg-session-label-${idx}`;
  sessionID.innerText = "Session ID: N/A";
  sessionID.style.textAlign = "right";
  sessionID.classList.add("text-normal");

  const saveContainer = document.createElement("div");
  saveContainer.classList.add("d-flex");
  saveContainer.style.alignSelf = "flex-end";
  const saveAs = PlayerBtn("Save As");
  saveAs.addEventListener("click", (event: MouseEvent) => handleSaveAs(event, idx));

  const save = PlayerBtn("Save");
  save.addEventListener("click", (event: MouseEvent) => handleSave(event, idx));

  saveContainer.appendChild(saveAs);
  saveContainer.appendChild(save);

  const loadSessionContainer = document.createElement("div");
  loadSessionContainer.classList.add("d-flex");
  loadSessionContainer.style.alignItems = "center";

  const label = document.createElement("label");
  label.htmlFor = "refg-load-session-input";
  label.innerText = "Load Session";
  label.classList.add("text-normal", "mx-2");

  const input = TextInput("Enter title/id.", [], "refg-load-session-input");
  input.addEventListener("input", (event: InputEvent) => handleInput(event, idx));
  loadSessionContainer.appendChild(label);
  loadSessionContainer.appendChild(input);

  container.appendChild(sessionID);
  container.appendChild(saveContainer);
  container.appendChild(loadSessionContainer);
  return container;
}

function handleSaveAs(event: MouseEvent, idx: number): void {
  const playerContainer = document.getElementById(`refg-github-player-${idx}`);
  const oldModal = playerContainer.querySelector(`#refg-save-session-modal-${idx}`);
  if (oldModal) playerContainer.removeChild(oldModal);
  if (!playerContainer.hasChildNodes() || !stateMap[idx].hasUnsavedChanges) return;
  playerContainer.appendChild(SaveSessionModal(idx));
}

function handleSave(event: MouseEvent, idx: number): void {
  const playerContainer = document.getElementById(`refg-github-player-${idx}`);
  const oldModal = playerContainer.querySelector(`#refg-save-session-modal-${idx}`);
  if (oldModal) playerContainer.removeChild(oldModal);
  if (!playerContainer.hasChildNodes() || !stateMap[idx].hasUnsavedChanges) return;

  if (stateMap[idx].sessionDetails.title == "") {
    playerContainer.appendChild(SaveSessionModal(idx));
  } else {
    const stateCopy: CoreState = {
      events: stateMap[idx].events,
      sessionDetails: stateMap[idx].sessionDetails,
      comments: stateMap[idx].comments,
      nextCommentId: stateMap[idx].nextCommentId,
    };

    const stringifiedData = JSON.stringify({
      prDetails: prDetails,
      state: stateCopy,
    });

    const fetchParams = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: stringifiedData,
    };

    fetch(`${getFetchUrl()}/insertSession`, fetchParams)
      .then((res: Response) => {
        return res.json();
      })
      .then((data: SaveResponse) => {
        if (data.id != "") stateMap[idx].sessionDetails.id = data.id;
        playerContainer.appendChild(ChangesSavedModal(idx));
      })
      .catch(() => {
        return;
      });
  }
}

let timeout: ReturnType<typeof setTimeout> = null;
function handleInput(event: InputEvent, idx: number): void {
  clearTimeout(timeout);
  timeout = setTimeout(() => {
    const target = event.target as HTMLInputElement;
    if (target.value == "") return;
    fetch(`${getFetchUrl()}/loadSession/${target.value}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(prDetails),
    })
      .then((res: Response) => res.json())
      .then((data: SessionDetails[]) => {
        return;
      })
      .catch(() => {
        return;
      });
  }, 500);
}
