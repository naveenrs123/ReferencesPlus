import * as h from "./helpers.js";
import g from "./globals.js";

/**
 * Mouseover Event listener for the window when borders are enabled. Adds a border
 * around the currently moused-over element after a short timeout.
 *
 * @param event A mouseover event.
 */
export function onMouseEnterBorders(event) {
  let target = event.target;
  g.borderTimeout = setTimeout(() => {
    if (!h.forbiddenElement(event)) {
      g.border = target.style.border;
      target.style.setProperty("border", `3px solid ${h.color}`, "important");

      if (g.recordingState) {
        let timeStamp = (Date.now() - g.start) / 1000;
        let hoverNodeHTML = g.hoverInfo.node.innerHTML.trim();
        let innerHTML = hoverNodeHTML.length > 100 ? hoverNodeHTML.slice(0, 100) : hoverNodeHTML;
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
  }, 500);
}

/**
 * Mouseout Event listener for the window when borders are enabled. Resets the border
 * around the moused-over element when the mouse cursor exits the element area. Also
 * clears the timeout to prevent a border from showing immediately while the cursor is
 * moving.
 *
 * @param event A mouseout event.
 */
export function onMouseLeaveBorders(event) {
  clearTimeout(g.borderTimeout);
  if (!h.forbiddenElement(event)) {
    event.target.style.border = g.border;
  }
}

/**
 * Mouseover Event listener for the window when tooltips are enabled. Extracts useful
 * properties from the moused-over element and creates a tooltip to display this information
 * after a short timeout.
 *
 * @param event A mouseover event.
 */
export function onMouseMove(event) {
  if (!h.forbiddenElement(event) && g.emulatorActive) {
    g.hoverInfo.node = event.target;
    g.hoverInfo.posX = event.pageX;
    g.hoverInfo.posY = event.pageY;
  }
}

export function onSubmitDOMChange(event) {
  event.preventDefault();
  let textarea = document.getElementById("dom-change-text");
  let text = document.getElementById("dom-element-selector");
  let elem;
  let cssProperties = null;

  try {
    cssProperties = JSON.parse(textarea.value.replace(/\n/g, ""));
    let elementQuery = text.value;
    elem = elementQuery != "" ? document.querySelector(elementQuery) : g.DOMFormInfo.node;

    let propertyString = "Changed Properties: ";
    for (let property in cssProperties) {
      elem.style.setProperty(property, cssProperties[property]);
      if (g.recordingState) {
        propertyString += `${property} : ${cssProperties[property]};`;
      }
    }

    if (g.recordingState) {
      let timeStamp = (Date.now() - g.start) / 1000;
      let node = g.hoverNode.node;
      let hoverNodeHTML = node.innerHTML.trim();
      let innerHTML = hoverNodeHTML.length > 100 ? hoverNodeHTML.slice(0, 100) : hoverNodeHTML;
      let log =
        timeStamp +
        "s - Changed DOM for: " +
        node.nodeName +
        ", parent: " +
        node.parentNode.nodeName +
        ", id: " +
        node.id +
        ", innerHTML: " +
        innerHTML +
        "\n" +
        propertyString +
        "\n";
      g.logs.push(log);
    }
  } catch (error) {
    let errorText = "An error occurred.";
    if (elem == null) {
      errorText = "Invalid CSS selector query.";
    } else if (cssProperties == null) {
      errorText = `Invalid JSON syntax provided\n${textarea.value.replace(/\n/g, "")}`;
    }
    alert(errorText);
  }
}

/**
 * Event listener for the toggle-borders button. Changes
 * the button styles and adds/removes window listeners depending
 * on whether borders are enabled or disabled.
 */
export function toggleBorders() {
  let eventListeners = {
    mouseover: onMouseEnterBorders,
    mouseout: onMouseLeaveBorders,
  };
  return h.toggleButton("borderState", eventListeners);
}

export function setBordersManual() {
  let eventListeners = {
    mouseover: onMouseEnterBorders,
    mouseout: onMouseLeaveBorders,
  };
  h.setButtonManual("toggle-borders", "borderState", eventListeners);
}

/**
 * Event listener for the toggle-tooltips button. Changes
 * the button styles and adds/removes window listeners depending
 * on whether tooltips are enabled or disabled.
 *
 * @param event A "click" DOM event.
 */
export function toggleTooltips() {
  return h.toggleButton("tooltipState");
}

export function setTooltipsManual() {
  h.setButtonManual("toggle-tooltips", "tooltipState");
}

export function toggleRecording() {
  //   return h.toggleButton("recordingState", {}, () => true, h.runRecording);
  return h.toggleButton("recordingState", {}, () => h.stop(g.stream), h.runRecording);
}
