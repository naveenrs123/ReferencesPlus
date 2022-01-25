import * as h from "../../common/helpers";
import g from "../../common/globals";

/**
 * Mouseover Event listener for the window when borders are enabled. Adds a border
 * around the currently moused-over element after a short timeout.
 *
 * @param event A mouseover event.
 */
function onMouseEnterBorders(event: MouseEvent): void {
  g.borderTimeout = setTimeout(borderTimeout, 500);
}

function borderTimeout(event: MouseEvent) {
  let target: HTMLElement = event.target as HTMLElement;
  if (!h.forbiddenElement(event)) {
    g.border = target.style.border;
    target.style.setProperty("border", `3px solid ${g.color}`, "important");

    if (g.recordingState) {
      let timeStamp: number = (Date.now() - g.start) / 1000;
      let nodeHTML: string = g.hoverInfo.node.innerHTML.trim();
      let innerHTML: string = nodeHTML.length > 100 ? nodeHTML.slice(0, 100) : nodeHTML;
      let log =
        timeStamp +
        "s - Border for: " +
        target.nodeName +
        ", parent: " +
        target.parentNode.nodeName +
        ", id: " +
        target.id +
        ", innerHTML: " +
        innerHTML +
        "\n";
      g.logs.push(log);
    }
  }
}

/**
 * Mouseout Event listener for the window when borders are enabled. Resets the border
 * around the moused-over element when the mouse cursor exits the element area. Also
 * clears the timeout to prevent a border from showing immediately while the cursor is
 * moving.
 *
 * @param event A mouseout event.
 */
function onMouseLeaveBorders(event: MouseEvent): void {
  clearTimeout(g.borderTimeout);
  if (!h.forbiddenElement(event)) {
    let target: HTMLElement = event.target as HTMLElement;
    target.style.border = g.border;
  }
}

/**
 * Event listener for the toggle-borders button. Changes
 * the button styles and adds/removes window listeners depending
 * on whether borders are enabled or disabled.
 */
export function toggleBorders(): (event: MouseEvent) => void {
  let eventListeners = { mouseover: onMouseEnterBorders, mouseout: onMouseLeaveBorders };
  return h.toggleButton("borderState", eventListeners);
}

export function setBorders(): void {
  let eventListeners = { mouseover: onMouseEnterBorders, mouseout: onMouseLeaveBorders };
  h.setButtonManual("toggle-borders", "borderState", eventListeners);
}
