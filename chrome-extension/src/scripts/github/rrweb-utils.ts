import rrwebPlayer, { RRwebPlayerOptions } from "rrweb-player";
import { color, mouseOutBorders, mouseOverBorders } from "./borders";
import { eventWithTime, Mirror } from "rrweb/typings/types";
import { INode } from "rrweb-snapshot";
import { refBegin, refEnd, waitForPlayerClass } from "../common/constants";
import {
  defaultPostSave,
  findAncestor,
  loadedSessions,
  readOnlyInterfaces,
  saveChanges,
  stateMap,
} from "../common/helpers";
import { ReadOnlyInterface, SaveResponse } from "../common/interfaces";

function onPlayerStateChange(state: { payload: string }, mainPlayer: rrwebPlayer): void {
  if (state.payload == "paused") {
    enableInteractions(mainPlayer);
  } else {
    disableInteractions(mainPlayer);
  }
}

/**
 * Prevents click events from firing when the replayer is active.
 * @param event A mouse event corresponding to a click.
 */
function handleIframeClick(event: MouseEvent, mainPlayer: rrwebPlayer): void {
  event.preventDefault();
  event.stopPropagation();
  const mirror: Mirror = mainPlayer.getMirror();
  const targetId: number = mirror.getId(event.target as INode);
  navigator.clipboard
    .writeText(refBegin + targetId.toString() + refEnd)
    .then(() => {
      const target = event.target as HTMLElement;
      const border = target.style.border;
      const outline = target.style.outline;
      target.style.setProperty("border", `3px solid #299b03`, "important");
      target.style.setProperty("outline", `3px solid #299b03`, "important");
      setTimeout(() => {
        target.style.border = "";
        target.style.outline = "";
      }, 500);
    })
    .catch(() => {
      return;
    });
}

export function disableInteractions(mainPlayer: rrwebPlayer): void {
  // eslint-disable-next-line no-unused-vars
  const listeners: { [key: string]: (event: MouseEvent) => void } = {
    mouseover: mouseOverBorders,
    mouseout: mouseOutBorders,
    click: (event: MouseEvent) => {
      handleIframeClick(event, mainPlayer);
    },
  };
  const iframe = mainPlayer.getReplayer().iframe;
  mainPlayer.getReplayer().disableInteract();
  for (const l in listeners) iframe.contentWindow.removeEventListener(l, listeners[l]);
  iframe.removeAttribute("listener");
  iframe.contentDocument.querySelector("html").style.overflow = "";
}

export function enableInteractions(mainPlayer: rrwebPlayer): void {
  // eslint-disable-next-line no-unused-vars
  const listeners: { [key: string]: (event: MouseEvent) => void } = {
    mouseover: mouseOverBorders,
    mouseout: mouseOutBorders,
    click: (event: MouseEvent) => {
      handleIframeClick(event, mainPlayer);
    },
  };
  const iframe = mainPlayer.getReplayer().iframe;
  mainPlayer.getReplayer().enableInteract();
  for (const l in listeners) iframe.contentWindow.addEventListener(l, listeners[l]);
  iframe.setAttribute("listener", "true");
  iframe.contentDocument.querySelector("html").style.overflow = "hidden";
}

export function generateReplayerOptions(
  playerDiv: HTMLDivElement,
  events: eventWithTime[]
): RRwebPlayerOptions {
  return {
    target: playerDiv,
    props: {
      events: events,
      height: 480,
      width: parseInt(getComputedStyle(playerDiv).width),
      triggerFocus: false,
      pauseAnimation: false,
      mouseTail: true,
      autoPlay: false,
    },
  };
}

export function injectMainPlayer(events: eventWithTime[], idx: number, website: string): void {
  const state = stateMap[idx];
  if (!state.active) return; // cannot inject if player is not active.

  state.mainPlayer = null;
  const activeInterface = document.querySelector(".refg-active");
  const playerDiv: HTMLDivElement = activeInterface.querySelector(`#refg-github-player-${idx}`);
  playerDiv.classList.remove("text-center", "p-2");
  playerDiv.innerHTML = "";
  const replayerOptions: RRwebPlayerOptions = generateReplayerOptions(playerDiv, events);

  const waitForPlayerElems = activeInterface.querySelectorAll("." + waitForPlayerClass);
  waitForPlayerElems.forEach((elem) => {
    elem.removeAttribute("aria-disabled");
  });

  const commentInfo = activeInterface.querySelector(`#refg-comment-info-${idx}`);
  commentInfo.classList.remove("d-none");

  state.events = events;
  state.hasUnsavedChanges = true;
  state.sessionDetails = {
    title: "",
    website: website,
    id: "",
  };
  state.mainPlayer = new rrwebPlayer(replayerOptions);
  state.mainPlayer.addEventListener(
    "ui-update-player-state",
    (playerState: { payload: string }) => {
      onPlayerStateChange(playerState, state.mainPlayer);
    }
  );

  const updateCount = 0;
  state.mainPlayer.addEventListener(
    "ui-update-current-time",
    (playerState: { payload: number }) => {
      if (updateCount % 3 != 0) return;
      for (const comment of state.comments) {
        const timestamp = comment.timestamp <= 50 ? 50 : comment.timestamp;
        const bound = Math.abs(timestamp - playerState.payload) < 750;
        const commentContainer = findAncestor(comment.contents, "refg-comment");
        if (bound) {
          commentContainer.style.setProperty("border", `3px solid ${color}`, "important");
        } else {
          commentContainer.style.border = "";
        }
      }
    }
  );

  saveChanges(idx)
    .then((saveRes: SaveResponse) => {
      defaultPostSave(saveRes, idx);
      state.mainPlayer.goto(50, false);
    })
    .catch((err) => {
      console.log(err);
    });
}

export function injectReadOnlyPlayer(idx: number, sessionId: string): void {
  const index = readOnlyInterfaces.findIndex((value: ReadOnlyInterface) => {
    return value.githubCommentId == idx;
  });

  const activeInterface = document.getElementById(`refg-interface-container-r-${idx}`);
  const playerDiv: HTMLDivElement = document.querySelector(`#refg-github-player-r-${idx}`);
  playerDiv.classList.remove("text-center", "p-2");
  playerDiv.innerHTML = "";

  const commentInfo = activeInterface.querySelector(`#refg-comment-info-r-${idx}`);
  commentInfo.classList.remove("d-none");

  const loadedSession = loadedSessions[sessionId];
  const replayerOptions: RRwebPlayerOptions = generateReplayerOptions(
    playerDiv,
    loadedSession.events
  );

  const state = readOnlyInterfaces[index];
  state.events = loadedSession.events;
  state.sessionDetails = loadedSession.sessionDetails;
  state.comments = loadedSession.comments;
  state.nextCommentId = loadedSession.nextCommentId;
  state.mainPlayer = new rrwebPlayer(replayerOptions);

  state.mainPlayer.addEventListener(
    "ui-update-player-state",
    (playerState: { payload: string }) => {
      onPlayerStateChange(playerState, state.mainPlayer);
    }
  );

  const updateCount = 0;
  state.mainPlayer.addEventListener(
    "ui-update-current-time",
    (playerState: { payload: number }) => {
      if (updateCount % 3 != 0) return;

      for (const comment of state.comments) {
        const timestamp = comment.timestamp <= 50 ? 50 : comment.timestamp;
        const bound = Math.abs(timestamp - playerState.payload) < 1000;
        const commentContainer = findAncestor(comment.contents, "refg-comment");
        if (commentContainer.style.border == "3px solid green") {
          continue;
        } else if (bound) {
          commentContainer.style.setProperty("border", `3px solid ${color}`, "important");
        } else {
          commentContainer.style.border = "";
        }
      }
    }
  );

  state.mainPlayer.goto(50, false);
}
