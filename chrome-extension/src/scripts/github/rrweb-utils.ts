import rrwebPlayer, { RRwebPlayerOptions } from "rrweb-player";
import { mouseOutBorders, mouseOverBorders } from "./borders";
import { eventWithTime, Mirror } from "rrweb/typings/types";
import { INode } from "rrweb-snapshot";
import { refBegin, refEnd, waitForPlayerClass } from "../common/constants";
import { loadedSessions, readOnlyInterfaces, stateMap } from "../common/helpers";
import { ReadOnlyInterface } from "../common/interfaces";

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
  void navigator.clipboard.writeText(refBegin + targetId.toString() + refEnd);
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

export function generateReplayerOptions(playerDiv: HTMLDivElement, events: eventWithTime[]): RRwebPlayerOptions {
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
  if (!stateMap[idx].active) return; // cannot inject if player is not active.

  stateMap[idx].mainPlayer = null;
  const activeInterface = document.querySelector(".refg-active");
  const playerDiv: HTMLDivElement = activeInterface.querySelector(`#refg-github-player-${idx}`);
  playerDiv.innerHTML = "";
  const replayerOptions: RRwebPlayerOptions = generateReplayerOptions(playerDiv, events);

  const waitForPlayerElems = activeInterface.querySelectorAll("." + waitForPlayerClass);
  waitForPlayerElems.forEach((elem) => {
    elem.removeAttribute("aria-disabled");
  });

  const commentInfo = activeInterface.querySelector(`#refg-comment-info-${idx}`);
  commentInfo.classList.remove("d-none");

  stateMap[idx].events = events;
  stateMap[idx].hasUnsavedChanges = true;
  stateMap[idx].sessionDetails = {
    title: "",
    website: website,
    id: "",
  };
  stateMap[idx].mainPlayer = new rrwebPlayer(replayerOptions);
  stateMap[idx].mainPlayer.addEventListener("ui-update-player-state", (state: { payload: string }) => {
    onPlayerStateChange(state, stateMap[idx].mainPlayer);
  });
}

export function injectReadOnlyPlayer(idx: number, sessionId: string): void {
  const activeInterface = document.getElementById(`refg-interface-container-r-${idx}`);
  const playerDiv: HTMLDivElement = activeInterface.querySelector(`#refg-github-player-r-${idx}`);
  playerDiv.innerHTML = "";

  const waitForPlayerElems = activeInterface.querySelectorAll("." + waitForPlayerClass);
  waitForPlayerElems.forEach((elem) => {
    elem.removeAttribute("aria-disabled");
  });

  const commentInfo = activeInterface.querySelector(`#refg-comment-info-r-${idx}`);
  commentInfo.classList.remove("d-none");

  const index = readOnlyInterfaces.findIndex((value: ReadOnlyInterface) => {
    value.commentId == idx;
  });

  const loadedSession = loadedSessions[sessionId];
  const replayerOptions: RRwebPlayerOptions = generateReplayerOptions(playerDiv, loadedSession.events);

  readOnlyInterfaces[index].events = loadedSession.events;
  readOnlyInterfaces[index].sessionDetails = loadedSession.sessionDetails;
  readOnlyInterfaces[index].comments = loadedSession.comments;
  readOnlyInterfaces[index].nextCommentId = loadedSession.nextCommentId;
  readOnlyInterfaces[index].mainPlayer = new rrwebPlayer(replayerOptions);
  readOnlyInterfaces[index].mainPlayer.addEventListener("ui-update-player-state", (state: { payload: string }) => {
    onPlayerStateChange(state, readOnlyInterfaces[index].mainPlayer);
  });
}
