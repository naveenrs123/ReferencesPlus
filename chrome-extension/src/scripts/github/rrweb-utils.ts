import rrwebPlayer, { RRwebPlayerOptions } from "rrweb-player";
import { mouseOutBorders, mouseOverBorders } from "./borders";
import { eventWithTime, Mirror } from "rrweb/typings/types";
import { INode } from "rrweb-snapshot";
import { hideElemClass, waitForPlayerClass } from "../common/constants";

const listeners: { [key: string]: (arg0: any) => void } = {
  mouseover: mouseOverBorders,
  mouseout: mouseOutBorders,
  click: handleIframeClick,
};

function onPlayerStateChange(state: any) {
  console.log("PLAYER STATE: " + JSON.stringify(state));
  if (state.payload == "paused") {
    enableInteractions(listeners);
  } else {
    disableInteractions(listeners);
  }
}

/**
 * Prevents click events from firing when the replayer is active.
 * @param event A mouse event corresponding to a click.
 */
function handleIframeClick(event: MouseEvent) {
  event.preventDefault();
  event.stopPropagation();
  const mirror: Mirror = getMainPlayer().getMirror();
  const targetId: number = mirror.getId(event.target as INode);
  navigator.clipboard.writeText(targetId.toString());
}

let mainPlayer: rrwebPlayer;
export function setMainPlayer(player: rrwebPlayer) {
  mainPlayer = player;
}
export function getMainPlayer(): rrwebPlayer {
  return mainPlayer;
}

export function disableInteractions(listeners: { [key: string]: (arg0: any) => void }) {
  const iframe = mainPlayer.getReplayer().iframe;
  mainPlayer.getReplayer().disableInteract();
  for (let l in listeners) iframe.contentWindow.removeEventListener(l, listeners[l]);
  iframe.removeAttribute("listener");
}

export function enableInteractions(listeners: { [key: string]: (arg0: any) => void }) {
  console.log("INTERACTIONS ENABLED");
  const iframe = mainPlayer.getReplayer().iframe;
  mainPlayer.getReplayer().enableInteract();
  for (let l in listeners) iframe.contentWindow.addEventListener(l, listeners[l]);
  iframe.setAttribute("listener", "true");
}

export function generateReplayerOptions(): RRwebPlayerOptions {
  return {
    target: null,
    props: {
      events: [],
      height: 480,
      triggerFocus: false,
      pauseAnimation: false,
      mouseTail: true,
      autoPlay: false,
    },
  };
}

export function injectMainPlayer(events: eventWithTime[], idx: number) {
  mainPlayer = null;
  const activeInterface = document.querySelector(".refg-active");
  const oldPlayers = activeInterface.querySelectorAll(".rr-player");
  const playerDiv = activeInterface.querySelector(`#refg-github-player-${idx}`) as HTMLElement;
  oldPlayers.forEach((player: Element) => {
    if (playerDiv.contains(player)) playerDiv.removeChild(player);
  });

  const replayerOptions: RRwebPlayerOptions = generateReplayerOptions();
  replayerOptions.target = playerDiv;
  replayerOptions.props.width = parseInt(getComputedStyle(playerDiv).width);
  replayerOptions.props.events = events;

  const waitForPlayerElems = activeInterface.querySelectorAll("." + waitForPlayerClass);
  waitForPlayerElems.forEach((elem) => {
    elem.classList.remove(hideElemClass);
  });

  mainPlayer = new rrwebPlayer(replayerOptions);
  mainPlayer.addEventListener("ui-update-player-state", onPlayerStateChange);
}
