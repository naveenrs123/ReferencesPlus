import * as h from "./helpers.js";
import g from "./globals.js";
import html2canvas from "../external/html2canvas.js";
import * as l from "./listeners.js";

function activate() {
  window.addEventListener("mousemove", l.onMouseMove);
  if (!document.getElementById("toggle-emulation")) {
    createEmulatorButtons();
  }
  l.setBordersManual();
  l.setTooltipsManual();
  h.setState();
}

function activateTooltip() {
  let oldTooltip = document.getElementById("refg-tooltip");
  if (oldTooltip) {
    g.body.removeChild(oldTooltip);
  }
  let properties = {};
  let rect = g.hoverInfo.node.getBoundingClientRect();

  properties["Node Name"] = g.hoverInfo.node.nodeName;
  properties["Parent"] = g.hoverInfo.node.parentNode
    ? g.hoverInfo.node.parentNode.nodeName
    : "TOP LEVEL";
  properties["Id"] = g.hoverInfo.node.id != "" ? g.hoverInfo.node.id : "N/A";
  properties["Classes"] = g.hoverInfo.node.classList;
  properties["Height"] = Math.round(rect.height) + "px";
  properties["Width"] = Math.round(rect.width) + "px";

  let tooltip = createTooltip(properties);
  g.body.appendChild(tooltip);

  if (g.recordingState) {
    let timeStamp = (Date.now() - g.start) / 1000;
    let hoverNodeHTML = g.hoverInfo.node.innerHTML.trim();
    let innerHTML = hoverNodeHTML.length > 100 ? hoverNodeHTML.slice(0, 100) : hoverNodeHTML;

    g.logs.push(
      `${timeStamp}s - Tooltip for: ${g.hoverInfo.node.nodeName}, parent: ${g.hoverInfo.node.parentNode.nodeName}, id: ${g.hoverInfo.node.id}, innerHTML: ${innerHTML}\n`
    );
  }
}

function activateDOMChangeForm() {
  let DOMChangeForm = document.getElementById("refg-dom-form");
  if (DOMChangeForm) {
    g.body.removeChild(DOMChangeForm);
  }
  g.DOMFormInfo.node = g.hoverInfo.node;
  g.DOMFormInfo.posX = g.hoverInfo.posX;
  g.DOMFormInfo.posY = g.hoverInfo.posY;

  DOMChangeForm = createDOMChangeForm();
  g.body.appendChild(DOMChangeForm);
  g.DOMFormOpen = true;
}

/**
 * Creates a tooltip at a specified position on the page with useful information
 * about a DOM element that is being moused-over.
 *
 * @param posX The x position of the cursor on the screen.
 * @param posY The y position of the cursor on the screen.
 * @param properties An object containing useful properties of the element.
 * @returns the tooltip.
 */
function createTooltip(properties) {
  let container = document.createElement("div");
  container.classList.add("refg-tooltip");
  container.id = "refg-tooltip";

  let title = document.createElement("h2");
  title.textContent = "Properties";
  title.style.marginBottom = "10px";
  title.style.color = "#4461EE";
  container.appendChild(title);

  for (const prop in properties) {
    let content = document.createElement("p");
    let contentString = `<strong>${prop}</strong>: ${properties[prop]}`;
    content.innerHTML = contentString;
    container.appendChild(content);
  }

  let computedStyle = getComputedStyle(g.hoverInfo.node);

  let posX = h.shiftPosition(
    g.hoverInfo.posX,
    300,
    computedStyle != null && computedStyle.position == "fixed"
      ? document.documentElement.clientWidth
      : document.documentElement.scrollWidth
  );
  let posY = h.shiftPosition(
    g.hoverInfo.posY,
    300,
    computedStyle != null && computedStyle.position == "fixed"
      ? document.documentElement.clientHeight
      : document.documentElement.scrollHeight
  );

  let sheet = document.styleSheets[0];
  let refgTooltipRules = `.refg-tooltip { width: fit-content; max-width: 300px; max-height: 300px; overflow-y: auto; background-color: #FFF; color: #000; border-radius: 10px; border: 3px solid #000; position: absolute; top: ${posY}px; left: ${posX}px; padding: 15px; z-index: 200000; font-size: 12pt; }`;

  sheet.insertRule(refgTooltipRules, sheet.cssRules.length);

  return container;
}

/**
 * Creates the emulator buttons panel, which contains all the controls needed
 * for emulation and video capture.
 */
function createEmulatorButtons() {
  // Set up container
  let container = document.createElement("div");
  container.id = "refg-emulator";
  container.style.display = "flex";
  container.style.flexDirection = "row";
  container.style.position = "fixed";
  container.style.top = "60px";
  container.style.left = "20px";
  container.style.zIndex = "200000";
  container.style.backgroundColor = "white";
  container.style.border = "1px solid black";
  container.style.height = "45px";
  container.style.fontSize = "14px";

  // construct emulator controls.
  let grab = h.buildDragHeader();
  let colorPicker = h.buildColorPicker();
  let btn1 = h.buildEmulatorButton("toggle-borders", "Borders");
  let btn2 = h.buildEmulatorButton("toggle-tooltips", "Tooltips");
  let btn3 = h.buildEmulatorButton("toggle-recording", "Recording");
  let btn4 = h.buildEmulatorButton("refg-download", "Download");
  let btn5 = h.buildEmulatorButton("refg-log", "Log");
  let btn6 = h.buildEmulatorButton("refg-dl-screenshot", "Download Screenshot");

  btn4.style.display = "none";
  g.downloadButton = btn4;
  btn5.style.display = "none";
  g.logButton = btn5;
  btn6.style.display = "none";
  g.dlScreenshotButton = btn6;

  btn1.addEventListener("click", l.toggleBorders());
  btn2.addEventListener("click", l.toggleTooltips());
  btn3.addEventListener("click", l.toggleRecording());

  // build and insert component
  container.appendChild(grab);
  container.appendChild(colorPicker);
  container.appendChild(btn1);
  container.appendChild(btn2);
  container.appendChild(btn3);
  container.appendChild(btn4);
  container.appendChild(btn5);
  container.appendChild(btn6);

  h.dragElement(container);
  g.body.insertBefore(container, g.body.childNodes[0]);
}

function createDOMChangeForm() {
  let container = document.createElement("div");
  container.id = "refg-dom-form";
  container.style.backgroundColor = "#FFF";
  container.style.color = "#000";

  let title = document.createElement("h3");
  title.textContent = "DOM Change Form";
  title.style.marginBottom = "15px";
  title.style.color = "#4461EE";

  let form = createForm();

  container.appendChild(title);
  container.appendChild(form);

  let computedStyle = getComputedStyle(g.DOMFormInfo.node);

  let posX = h.shiftPosition(
    g.DOMFormInfo.posX,
    400,
    computedStyle != null && computedStyle.position == "fixed"
      ? document.documentElement.clientWidth
      : document.documentElement.scrollWidth
  );
  let posY = h.shiftPosition(
    g.DOMFormInfo.posY,
    500,
    computedStyle != null && computedStyle.position == "fixed"
      ? document.documentElement.clientHeight
      : document.documentElement.scrollHeight
  );

  let sheet = document.styleSheets[0];
  let refgDomFormRules = `#refg-dom-form { width: fit-content; max-width: 400px; max-height: 500px; overflow-y: auto; background-color: #FFF; color: #000; border-radius: 10px; border: 3px solid #000; position: absolute; top: ${posY}px; left: ${posX}px; padding: 15px; z-index: 200000; font-size: 12pt; }`;

  sheet.insertRule(refgDomFormRules, sheet.cssRules.length);

  return container;
}

function createForm() {
  let form = document.createElement("form");
  form.style.display = "flex";
  form.style.flexDirection = "column";

  let label = document.createElement("label");
  label.setAttribute("for", "dom-element-selector");
  label.style.fontSize = "18px";
  label.textContent = "CSS Query Selector";

  let text = document.createElement("input");
  text.placeholder = "Blank for current element.";
  text.id = "dom-element-selector";
  text.value = "";
  text.style.marginBottom = "10px";

  let subtitle = document.createElement("label");
  subtitle.style.fontSize = "18px";
  subtitle.setAttribute("for", "dom-change-text");
  subtitle.textContent = "Enter properties in JSON Format";

  let textarea = document.createElement("textarea");
  textarea.id = "dom-change-text";
  textarea.textContent = '{\n"property": "value"\n}';
  textarea.style.marginBottom = "15px";

  let submit = document.createElement("input");
  submit.type = "submit";
  submit.value = "Submit";
  form.addEventListener("submit", l.onSubmitDOMChange);

  form.appendChild(label);
  form.appendChild(text);
  form.appendChild(subtitle);
  form.appendChild(textarea);
  form.appendChild(submit);

  return form;
}

/**
 * Chrome listener for messages sent between the different scripts used by the
 * extension.
 */
chrome.runtime.onMessage.addListener((m) => {
  if (m.action == "toggle emulation" && m.source == "background") {
    let container = document.getElementById("refg-emulator");
    if (!container) {
      g.emulatorActive = true;
      activate();
    } else {
      g.emulatorActive = false;
      window.removeEventListener("mousemove", l.onMouseMove);
      g.body.removeChild(container);
      h.setState();
    }
  } else if (m.action == "initial load" && m.source == "background") {
    h.getState();
    if (g.emulatorActive) {
      activate();
    }
  } else if (m.action == "start recording" && m.source == "background") {
    h.recordInteractions();
  } else if (m.action == "stop recording" && m.source == "background") {
    h.stopRecording();
  }
});

document.onkeydown = function (event) {
  if (event.altKey && event.key.toLowerCase() === "t" && g.tooltipState) {
    activateTooltip();
  }

  if (event.altKey && event.key.toLowerCase() === "y") {
    let oldTooltip = document.getElementById("refg-tooltip");
    if (oldTooltip) {
      g.body.removeChild(oldTooltip);
    }
  }

  if (event.altKey && event.shiftKey && event.key.toLowerCase() === "p" && g.emulatorActive) {
    let options = {
      backgroundColor: getComputedStyle(g.body).backgroundColor,
    };
    html2canvas(g.hoverInfo.node, options).then(function (canvas) {
      const base64image = canvas.toDataURL("image/png");
      g.dlScreenshotButton.href = base64image;
      g.dlScreenshotButton.download = "screenshot.png";
      g.dlScreenshotButton.style.display = "flex";
    });
  }

  if (event.altKey && event.shiftKey && event.key.toLowerCase() === "d" && g.emulatorActive) {
    activateDOMChangeForm();
  }

  if (event.altKey && event.shiftKey && event.key.toLowerCase() === "e") {
    let DOMChangeForm = document.getElementById("refg-dom-form");
    if (DOMChangeForm) {
      g.body.removeChild(DOMChangeForm);
    }
    g.DOMFormOpen = false;
  }
};
