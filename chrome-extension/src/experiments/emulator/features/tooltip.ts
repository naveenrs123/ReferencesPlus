import * as h from "../../common/helpers";
import g from "../../common/globals";
import { IDictionary } from "../../common/interfaces";

export function openTooltip(): void {
  let oldTooltip: HTMLElement = document.getElementById("refg-tooltip");
  if (oldTooltip) document.body.removeChild(oldTooltip);

  let node: HTMLElement = g.hoverInfo.node;

  let rect: DOMRect = node.getBoundingClientRect();
  let properties: Object = {
    Node: node.nodeName,
    Parent: node.parentNode ? node.parentNode.nodeName : "TOP LEVEL",
    Id: node.id != "" ? node.id : "N/A",
    Classes: node.classList,
    Height: Math.round(rect.height) + "px",
    Width: Math.round(rect.width) + "px",
  };

  let tooltip: HTMLDivElement = createTooltip(properties);
  document.body.appendChild(tooltip);

  if (g.recordingState) {
    let timeStamp: number = (Date.now() - g.start) / 1000;
    let nodeHTML: string = node.innerHTML.trim();
    let innerHTML: string = nodeHTML.length > 100 ? nodeHTML.slice(0, 100) : nodeHTML;

    g.logs.push(
      `${timeStamp}s - Tooltip for: ${node.nodeName}, parent: ${node.parentNode.nodeName}, id: ${node.id}, innerHTML: ${innerHTML}\n`
    );
  }
}

function createTooltip(properties: IDictionary<any>): HTMLDivElement {
  let container: HTMLDivElement = document.createElement("div");
  container.classList.add("refg-tooltip");
  container.id = "refg-tooltip";

  let title: HTMLHeadingElement = document.createElement("h2");
  title.textContent = "Properties";
  title.style.marginBottom = "10px";
  title.style.color = "#4461EE";
  container.appendChild(title);

  for (const prop in properties) {
    let content: HTMLParagraphElement = document.createElement("p");
    content.innerHTML = `<strong>${prop}</strong>: ${properties[prop]}`;
    container.appendChild(content);
  }

  let style: CSSStyleDeclaration = getComputedStyle(g.hoverInfo.node);
  let docElem: HTMLElement = document.documentElement;
  let width: number = style?.position == "fixed" ? docElem.clientWidth : docElem.scrollWidth;
  let posX: number = h.shiftPosition(g.hoverInfo.posX, 300, width);
  let height: number = style?.position == "fixed" ? docElem.clientHeight : docElem.scrollHeight;
  let posY: number = h.shiftPosition(g.hoverInfo.posY, 300, height);

  let sheet: CSSStyleSheet = document.styleSheets[0];
  let refgTooltipRules: string = `.refg-tooltip { width: fit-content; max-width: 300px; max-height: 300px; overflow-y: auto; background-color: #FFF; color: #000; border-radius: 10px; border: 3px solid #000; position: absolute; top: ${posY}px; left: ${posX}px; padding: 15px; z-index: 200000; font-size: 12pt; }`;

  sheet.insertRule(refgTooltipRules, sheet.cssRules.length);

  return container;
}

/**
 * Event listener for the toggle-tooltips button. Changes
 * the button styles and adds/removes window listeners depending
 * on whether tooltips are enabled or disabled.
 *
 * @param event A "click" DOM event.
 */
export function toggleTooltips(): (event: MouseEvent) => void {
  return h.toggleButton("tooltipState");
}

export function setTooltips(): void {
  h.setButtonManual("toggle-tooltips", "tooltipState");
}

/**
 * Mouseover Event listener for the window when tooltips are enabled. Extracts useful
 * properties from the moused-over element and creates a tooltip to display this information
 * after a short timeout.
 *
 * @param event A mouseover event.
 */
export function onMouseMove(event: MouseEvent) {
  if (!h.forbiddenElement(event) && g.emulatorActive) {
    g.hoverInfo.node = event.target as HTMLElement;
    g.hoverInfo.posX = event.pageX;
    g.hoverInfo.posY = event.pageY;
  }
}
