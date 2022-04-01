import rrwebPlayer, { RRwebPlayerOptions } from "rrweb-player";
import { mouseOutBorders, mouseOverBorders } from "./borders";
import { eventWithTime, Mirror } from "rrweb/typings/types";
import { INode } from "rrweb-snapshot";
import { hideElemClass, waitForPlayerClass } from "../common/constants";
import { stateMap } from "../common/helpers";

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
  void navigator.clipboard.writeText("~[" + targetId.toString() + "]~");
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
  const oldPlayers = activeInterface.querySelectorAll(".rr-player");
  const playerDiv: HTMLDivElement = activeInterface.querySelector(`#refg-github-player-${idx}`);
  oldPlayers.forEach((player: HTMLDivElement) => {
    if (playerDiv.contains(player)) playerDiv.removeChild(player);
  });

  const replayerOptions: RRwebPlayerOptions = generateReplayerOptions(playerDiv, events);

  const waitForPlayerElems = activeInterface.querySelectorAll("." + waitForPlayerClass);
  waitForPlayerElems.forEach((elem) => {
    elem.classList.remove(hideElemClass);
  });

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
