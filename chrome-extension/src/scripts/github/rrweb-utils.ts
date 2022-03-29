import rrwebPlayer, { RRwebPlayerOptions } from "rrweb-player";
import { mouseOutBorders, mouseOverBorders } from "./borders";
import { eventWithTime, Mirror } from "rrweb/typings/types";
import { INode } from "rrweb-snapshot";
import { hideElemClass, waitForPlayerClass } from "../common/constants";
import { stateMap } from "../common/helpers";

function onPlayerStateChange(state: any, mainPlayer: rrwebPlayer) {
  console.log("PLAYER STATE: " + JSON.stringify(state));
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
function handleIframeClick(event: MouseEvent, mainPlayer: rrwebPlayer) {
  event.preventDefault();
  event.stopPropagation();
  const mirror: Mirror = mainPlayer.getMirror();
  const targetId: number = mirror.getId(event.target as INode);
  navigator.clipboard.writeText(targetId.toString());
}

export function disableInteractions(mainPlayer: rrwebPlayer) {
  const listeners: { [key: string]: (arg0: any) => void } = {
    mouseover: mouseOverBorders,
    mouseout: mouseOutBorders,
    click: (event: MouseEvent) => {
      handleIframeClick(event, mainPlayer);
    },
  };
  const iframe = mainPlayer.getReplayer().iframe;
  mainPlayer.getReplayer().disableInteract();
  for (let l in listeners) iframe.contentWindow.removeEventListener(l, listeners[l]);
  iframe.removeAttribute("listener");
}

export function enableInteractions(mainPlayer: rrwebPlayer) {
  const listeners: { [key: string]: (arg0: any) => void } = {
    mouseover: mouseOverBorders,
    mouseout: mouseOutBorders,
    click: (event: MouseEvent) => {
      handleIframeClick(event, mainPlayer);
    },
  };
  const iframe = mainPlayer.getReplayer().iframe;
  mainPlayer.getReplayer().enableInteract();
  for (let l in listeners) iframe.contentWindow.addEventListener(l, listeners[l]);
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

export function injectMainPlayer(events: eventWithTime[], idx: number) {
  stateMap[idx].mainPlayer = null;
  const activeInterface = document.querySelector(".refg-active");
  const oldPlayers = activeInterface.querySelectorAll(".rr-player");
  const playerDiv = activeInterface.querySelector(`#refg-github-player-${idx}`) as HTMLDivElement;
  oldPlayers.forEach((player: Element) => {
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
    website: "",
    id: "",
  };
  stateMap[idx].mainPlayer = new rrwebPlayer(replayerOptions);
  stateMap[idx].mainPlayer.addEventListener("ui-update-player-state", (state: any) => {
    onPlayerStateChange(state, stateMap[idx].mainPlayer);
  });
}
