import * as helpers from "./helpers.js";
import g from "./globals.js";

// #region BORDERS

/**
 * Mouseover Event listener for the window when borders are enabled. Adds a border
 * around the currently moused-over element after a short timeout.
 *
 * @param event A mouseover event.
 */
function onMouseEnterBorders(event) {
  g.borderTimeout = setTimeout(() => {
    if (!helpers.forbiddenElement(event)) {
      g.border = event.target.style.border;
      event.target.style.setProperty(
        "border",
        `3px solid ${helpers.color}`,
        "important"
      );

      if (g.recordingState) {
        let timeStamp = (Date.now() - g.start) / 1000;
        let hoverNodeHTML = g.hoverInfo.node.innerHTML.trim();
        let innerHTML =
          hoverNodeHTML.length > 100
            ? hoverNodeHTML.slice(0, 100)
            : hoverNodeHTML;
        g.logs.push(
          `${timeStamp}s - Border for: ${event.target.nodeName}, parent: ${event.target.parentNode.nodeName}, id: ${event.target.id}, innerHTML: ${innerHTML}\n`
        );
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
function onMouseLeaveBorders(event) {
  clearTimeout(g.borderTimeout);
  if (!helpers.forbiddenElement(event)) {
    event.target.style.border = g.border;
  }
}

/**
 * Event listener for the toggle-borders button. Changes
 * the button styles and adds/removes window listeners depending
 * on whether borders are enabled or disabled.
 */
function toggleBorders() {
  let eventListeners = {
    mouseover: onMouseEnterBorders,
    mouseout: onMouseLeaveBorders,
  };
  return helpers.toggleButton("borderState", eventListeners);
}

function setBordersManual() {
  let eventListeners = {
    mouseover: onMouseEnterBorders,
    mouseout: onMouseLeaveBorders,
  };
  helpers.setButtonManual("toggle-borders", "borderState", eventListeners);
}

/**
 * Event listener for the toggle-tooltips button. Changes
 * the button styles and adds/removes window listeners depending
 * on whether tooltips are enabled or disabled.
 *
 * @param event A "click" DOM event.
 */
 function toggleTooltips(event) {
  return helpers.toggleButton("tooltipState");
}

function setTooltipsManual() {
  helpers.setButtonManual("toggle-tooltips", "tooltipState");
}

/**
 * Chrome listener for messages sent between the different scripts used by the
 * extension.
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "toggle emulation") {
    let container = document.getElementById("refg-emulator");
    if (!container) {
      createEmulatorButtons();
      setBordersManual();
      setTooltipsManual();
      window.addEventListener("mousemove", onMouseMove);
      g.emulatorActive = true;
      helpers.setState();
    } else {
      g.body.removeChild(container);
      window.removeEventListener("mousemove", onMouseMove);
      g.emulatorActive = false;
      helpers.setState();
    }
  } else if (message.action === "initial load") {
    helpers.getState();
    if (g.emulatorActive) {
      window.addEventListener("mousemove", onMouseMove);
      createEmulatorButtons();
      setBordersManual();
      setTooltipsManual();
      helpers.setState();
    }
  }
  sendResponse("Response!");
});

// #endregion BORDERS

// #region TOOLTIPS

document.onkeydown = function (event) {
  console.log(g.tooltipState);
  if (event.altKey && event.key.toLowerCase() === "t" && g.tooltipState) {
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
      let innerHTML =
        hoverNodeHTML.length > 100
          ? hoverNodeHTML.slice(0, 100)
          : hoverNodeHTML;

      g.logs.push(
        `${timeStamp}s - Tooltip for: ${g.hoverInfo.node.nodeName}, parent: ${g.hoverInfo.node.parentNode.nodeName}, id: ${g.hoverInfo.node.id}, innerHTML: ${innerHTML}\n`
      );
    }
  }

  if (event.altKey && event.key.toLowerCase() === "y") {
    let oldTooltip = document.getElementById("refg-tooltip");
    if (oldTooltip) {
      g.body.removeChild(oldTooltip);
    }
  }

  if (
    event.altKey &&
    event.shiftKey &&
    event.key.toLowerCase() === "d" &&
    g.emulatorActive
  ) {
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

  if (event.altKey && event.shiftKey && event.key.toLowerCase() === "e") {
    let DOMChangeForm = document.getElementById("refg-dom-form");
    if (DOMChangeForm) {
      g.body.removeChild(DOMChangeForm);
    }
    g.DOMFormOpen = false;
  }
};

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

  let posX = helpers.shiftPosition(
    g.hoverInfo.posX,
    300,
    computedStyle.position == "fixed"
      ? document.documentElement.clientWidth
      : document.documentElement.scrollWidth
  );
  let posY = helpers.shiftPosition(
    g.hoverInfo.posY,
    300,
    computedStyle.position == "fixed"
      ? document.documentElement.clientHeight
      : document.documentElement.scrollHeight
  );

  let sheet = document.styleSheets[0];
  let refgTooltipRules = `.refg-tooltip { width: fit-content; max-width: 300px; max-height: 300px; overflow-y: auto; background-color: #FFF; color: #000; border-radius: 10px; border: 3px solid #000; position: absolute; top: ${posY}px; left: ${posX}px; padding: 15px; z-index: 200000; font-size: 12pt; }`;

  sheet.insertRule(refgTooltipRules, sheet.cssRules.length);

  return container;
}

/**
 * Mouseover Event listener for the window when tooltips are enabled. Extracts useful
 * properties from the moused-over element and creates a tooltip to display this information
 * after a short timeout.
 *
 * @param event A mouseover event.
 */
function onMouseMove(event) {
  if (!helpers.forbiddenElement(event) && g.emulatorActive) {
    g.hoverInfo.node = event.target;
    g.hoverInfo.posX = event.pageX;
    g.hoverInfo.posY = event.pageY;
  }
}

// #endregion TOOLTIPS

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
  let grab = helpers.buildDragHeader();
  let btn1 = helpers.buildEmulatorButton("toggle-borders", "Borders");
  let bordersListener = toggleBorders();
  btn1.addEventListener("click", bordersListener);
  let colorPicker = helpers.buildColorPicker();
  let btn2 = helpers.buildEmulatorButton("toggle-tooltips", "Tooltips");
  btn2.addEventListener("click", toggleTooltips());
  let btn3 = helpers.buildEmulatorButton("toggle-recording", "Recording");
  btn3.addEventListener("click", toggleRecording());
  let btn4 = helpers.buildEmulatorButton("refg-download", "Download");
  btn4.style.display = "none";
  g.downloadButton = btn4;
  let btn5 = helpers.buildEmulatorButton("refg-log", "Log");
  btn5.style.display = "none";
  g.logButton = btn5;

  // build and insert component
  container.appendChild(grab);
  container.appendChild(colorPicker);
  container.appendChild(btn1);
  container.appendChild(btn2);
  container.appendChild(btn3);
  container.appendChild(btn4);
  container.appendChild(btn5);

  helpers.dragElement(container);

  g.body.insertBefore(container, g.body.childNodes[0]);
}

function toggleRecording() {
  return helpers.toggleButton("recordingState", {}, () => helpers.stop(g.stream), runRecording);
}

function runRecording() {
  navigator.mediaDevices
  .getDisplayMedia({
    video: true,
    audio: false,
  })
  .then((stm) => {
    g.stream = stm;
    g.logs = [];
    g.start = Date.now();
    return helpers.startRecording(stm);
  })
  .then((recordedChunks) => {
    helpers.getSeekableBlob(
      new Blob(recordedChunks, { type: "video/webm" }),
      (seekableBlob) => {
        g.downloadButton.href = URL.createObjectURL(seekableBlob);
        g.downloadButton.download = "RecordedVideo.mp4";
        g.downloadButton.style.display = "flex";

        let logBlob = new Blob(g.logs, {
          type: "text/plain;charset=utf-8",
        });
        g.logButton.href = URL.createObjectURL(logBlob);
        g.logButton.download = "logs.txt";
        g.logButton.style.display = "flex";

        g.recordingState = false;
        helpers.setState();
      }
    );
  })
  .catch((err) => {
    button.style.color = "#000000";
    button.style.backgroundColor = "#FFFFFF";
    g.recordingState = false;
    helpers.setState();
  });
}

function createDOMChangeForm() {
  let container = document.createElement("div");
  container.id = "refg-dom-form";
  container.style.backgroundColor = "#FFF";
  container.style.color = "#000";

  let form = document.createElement("form");
  form.style.display = "flex";
  form.style.flexDirection = "column";

  let title = document.createElement("h3");
  title.textContent = "DOM Change Form";
  title.style.marginBottom = "15px";
  title.style.color = "#4461EE";

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
  form.addEventListener("submit", function (event) {
    event.preventDefault();
    let elem;
    try {
      let cssProperties = JSON.parse(textarea.value.replace(/\n/g, ""));
      let elementQuery = text.value;
      elem = g.DOMFormInfo.node;
      if (elementQuery != "") {
        elem = document.querySelector(elementQuery);
      }

      for (let property in cssProperties) {
        elem.style.setProperty(property, cssProperties[property]);
      }
    } catch (error) {
      let errorText = "An error occurred.";
      if (elem == null) {
        errorText = "Invalid CSS selector query.";
      } else {
        errorText = `Invalid JSON syntax provided\n${textarea.value.replace(
          /\n/g,
          ""
        )}`;
      }
      alert(errorText);
    }
  });

  form.appendChild(label);
  form.appendChild(text);
  form.appendChild(subtitle);
  form.appendChild(textarea);
  form.appendChild(submit);

  container.appendChild(title);
  container.appendChild(form);

  let computedStyle = getComputedStyle(g.DOMFormInfo.node);

  let posX = helpers.shiftPosition(
    g.DOMFormInfo.posX,
    400,
    computedStyle.position == "fixed"
      ? document.documentElement.clientWidth
      : document.documentElement.scrollWidth
  );
  let posY = helpers.shiftPosition(
    g.DOMFormInfo.posY,
    500,
    computedStyle.position == "fixed"
      ? document.documentElement.clientHeight
      : document.documentElement.scrollHeight
  );

  let sheet = document.styleSheets[0];
  let refgDomFormRules = `#refg-dom-form { width: fit-content; max-width: 400px; max-height: 500px; overflow-y: auto; background-color: #FFF; color: #000; border-radius: 10px; border: 3px solid #000; position: absolute; top: ${posY}px; left: ${posX}px; padding: 15px; z-index: 200000; font-size: 12pt; }`;

  sheet.insertRule(refgDomFormRules, sheet.cssRules.length);

  return container;
}
