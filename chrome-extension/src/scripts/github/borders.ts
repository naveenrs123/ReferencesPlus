/**
 * Code that creates borders in the player when the user interacts with it.
 */

export const color = "red";

let border: string;
let outline: string;

/**
 * Function that performs actions related to adding borders to elements that are moused over.
 * @param event A mouse event corresponding to a mouseover on an element.
 */
export function borderActions(event: MouseEvent): void {
  const target = event.target as HTMLElement;
  border = target.style.border;
  outline = target.style.outline;
  target.style.setProperty("border", `3px solid ${color}`, "important");
  target.style.setProperty("outline", `3px solid ${color}`, "important");
}

/**
 * Mouseout listener to remove borders from the element.
 * @param event A mouse event corresponding to a mouseout.
 */
export function mouseOutBorders(event: MouseEvent): void {
  const target = event.target as HTMLElement;
  target.style.border = border;
  target.style.outline = outline;
  border = "";
  outline = "";
}

/**
 * Mouseover listener to add borders to an element after a brief timeout.
 * @param event A mouse event corresponding to a mouseover.
 */
export function mouseOverBorders(event: MouseEvent): void {
  borderActions(event);
}
