import * as helpers from "./helpers";

// GLOBALS for MAIN PANEL
let emulatorActive = false;

// GLOBALS for BORDER
let border;
let borderTimeout = null;
let borderState = false;

// GLOBALS for TOOLTIPS
let tooltipState = false;
let hoverInfo = {
  node: null,
  posX: 0,
  posY: 0,
};

// GLOBALS for RECORDING
let recordingState = false;
let stream = null;
let downloadButton = null;
let logButton = null;
let start = null;
let logs = [];

// Common DOM Elements
let body = document.querySelector("body");

function setState() {
  sessionStorage.setItem("borderState", JSON.stringify(borderState));
  sessionStorage.setItem("tooltipState", JSON.stringify(tooltipState));
  sessionStorage.setItem("recordingState", JSON.stringify(recordingState));
  sessionStorage.setItem("emulatorActive", JSON.stringify(emulatorActive));
}

function getState() {
  borderState = JSON.parse(sessionStorage.getItem("borderState"));
  tooltipState = JSON.parse(sessionStorage.getItem("tooltipState"));
  recordingState = JSON.parse(sessionStorage.getItem("recordingState"));
  emulatorActive = JSON.parse(sessionStorage.getItem("emulatorActive"));
}

// #region BORDERS

/**
 * Mouseover Event listener for the window when borders are enabled. Adds a border
 * around the currently moused-over element after a short timeout.
 *
 * @param event A mouseover event.
 */
function onMouseEnterBorders(event) {
  borderTimeout = setTimeout(() => {
    if (!helpers.forbiddenElement(event)) {
      border = event.target.style.border;
      event.target.style.setProperty(
        "border",
        `3px solid ${helpers.color}`,
        "important"
      );
      
      if (recordingState) {
        let timeStamp = (Date.now() - start) / 1000; 
        logs.push(`${timeStamp}s - Border for: ${event.target.nodeName}, parent: ${event.target.parentNode.nodeName}, id: ${event.target.id}\n`);
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
  clearTimeout(borderTimeout);
  if (!helpers.forbiddenElement(event)) {
    event.target.style.border = border;
  }
}

/**
 * Event listener for the toggle-borders button. Changes
 * the button styles and adds/removes window listeners depending
 * on whether borders are enabled or disabled.
 *
 * @param event A "click" DOM event.
 */
function toggleBorders(event) {
  let button = event.currentTarget;
  if (borderState) {
    button.style.color = "#000000";
    button.style.backgroundColor = "#FFFFFF";
    window.removeEventListener("mouseover", onMouseEnterBorders);
    window.removeEventListener("mouseout", onMouseLeaveBorders);
    borderState = false;
  } else {
    button.style.color = "#FFFFFF";
    button.style.backgroundColor = "#000000";
    window.addEventListener("mouseover", onMouseEnterBorders);
    window.addEventListener("mouseout", onMouseLeaveBorders);
    borderState = true;
  }
  setState();
}

function setBordersManual() {
  let button = document.getElementById("toggle-borders");
  if (button) {
    if (!borderState) {
      button.style.color = "#000000";
      button.style.backgroundColor = "#FFFFFF";
      window.removeEventListener("mouseover", onMouseEnterBorders);
      window.removeEventListener("mouseout", onMouseLeaveBorders);
    } else {
      button.style.color = "#FFFFFF";
      button.style.backgroundColor = "#000000";
      window.addEventListener("mouseover", onMouseEnterBorders);
      window.addEventListener("mouseout", onMouseLeaveBorders);
    }
  }
}

/**
 * Chrome listener for messages sent between the different scripts used by the
 * extension.
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "toggle emulation") {
    let container = document.getElementById("emulator-buttons");
    if (!container) {
      createEmulatorButtons();
      setBordersManual();
      setTooltipsManual();
      emulatorActive = true;
      setState();
    } else {
      body.removeChild(container);
      emulatorActive = false;
      setState();
    }
  } else if (message.action === "initial load") {
    getState();
    if (emulatorActive) {
      createEmulatorButtons();
      setBordersManual();
      setTooltipsManual();
      setState();
    }
  }
  sendResponse("Response!");
});

// #endregion BORDERS

// #region TOOLTIPS

document.onkeydown = function (event) {
  if (event.altKey && event.key.toLowerCase() === "t" && tooltipState) {
    let oldTooltip = document.getElementById("refg-tooltip");
    if (oldTooltip) {
      body.removeChild(oldTooltip);
    }
    let properties = {};
    let rect = hoverInfo.node.getBoundingClientRect();

    properties["Node Name"] = hoverInfo.node.nodeName;
    properties["Parent"] = hoverInfo.node.parentNode
      ? hoverInfo.node.parentNode.nodeName
      : "TOP LEVEL";
    properties["Id"] = hoverInfo.node.id != "" ? hoverInfo.node.id : "N/A";
    properties["Classes"] = hoverInfo.node.classList;
    properties["Height"] = Math.round(rect.height) + "px";
    properties["Width"] = Math.round(rect.width) + "px";
    
    let tooltip = createTooltip(hoverInfo.posX, hoverInfo.posY, properties);
    body.appendChild(tooltip);

    if (recordingState) {
      let timeStamp = (Date.now() - start) / 1000; 
      logs.push(`${timeStamp}s - Tooltip for: ${event.target.nodeName}, parent: ${event.target.parentNode.nodeName}, id: ${event.target.id}\n`);
    }
  }

  if (event.altKey && event.key.toLowerCase() === "y") {
    let oldTooltip = document.getElementById("refg-tooltip");
    if (oldTooltip) {
      body.removeChild(oldTooltip);
    }
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
function createTooltip(posX, posY, properties) {
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

  let computedStyle = getComputedStyle(hoverInfo.node);

  posX = helpers.shiftPosition(
    posX,
    300,
    computedStyle.position == "fixed"
      ? document.documentElement.clientWidth
      : document.documentElement.scrollWidth
  );
  posY = helpers.shiftPosition(
    posY,
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
 * Event listener for the toggle-tooltips button. Changes
 * the button styles and adds/removes window listeners depending
 * on whether tooltips are enabled or disabled.
 *
 * @param event A "click" DOM event.
 */
function toggleTooltips(event) {
  let button = event.currentTarget;
  if (tooltipState) {
    button.style.color = "#000000";
    button.style.backgroundColor = "#FFFFFF";
    window.removeEventListener("mousemove", onMouseMoveTooltips);
  } else {
    button.style.color = "#FFFFFF";
    button.style.backgroundColor = "#000000";
    window.addEventListener("mousemove", onMouseMoveTooltips);
  }
  tooltipState = !tooltipState;
  setState();
}

function setTooltipsManual(event) {
  let button = document.getElementById("toggle-tooltips");
  if (!tooltipState) {
    button.style.color = "#000000";
    button.style.backgroundColor = "#FFFFFF";
    window.removeEventListener("mousemove", onMouseMoveTooltips);
  } else {
    button.style.color = "#FFFFFF";
    button.style.backgroundColor = "#000000";
    window.addEventListener("mousemove", onMouseMoveTooltips);
  }
}

/**
 * Mouseover Event listener for the window when tooltips are enabled. Extracts useful
 * properties from the moused-over element and creates a tooltip to display this information
 * after a short timeout.
 *
 * @param event A mouseover event.
 */
function onMouseMoveTooltips(event) {
  if (!helpers.forbiddenElement(event)) {
    hoverInfo.node = event.target;
    hoverInfo.posX = event.pageX;
    hoverInfo.posY = event.pageY;
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
  container.id = "emulator-buttons";
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
  btn1.addEventListener("click", toggleBorders);
  let colorPicker = helpers.buildColorPicker();
  let btn2 = helpers.buildEmulatorButton("toggle-tooltips", "Tooltips");
  btn2.addEventListener("click", toggleTooltips);
  let btn3 = helpers.buildEmulatorButton("toggle-recording", "Recording");
  btn3.addEventListener("click", toggleRecording);
  let btn4 = helpers.buildEmulatorButton("refg-download", "Download");
  btn4.style.display = "none";
  downloadButton = btn4;
  let btn5 = helpers.buildEmulatorButton("refg-log", "Log");
  btn5.style.display = "none";
  logButton = btn5;

  // build and insert component
  container.appendChild(grab);
  container.appendChild(colorPicker);
  container.appendChild(btn1);
  container.appendChild(btn2);
  container.appendChild(btn3);
  container.appendChild(btn4);
  container.appendChild(btn5);

  helpers.dragElement(container);

  body.insertBefore(container, body.childNodes[0]);
}

function toggleRecording(event) {
  let button = event.currentTarget;
  if (recordingState) {
    button.style.color = "#000000";
    button.style.backgroundColor = "#FFFFFF";
    helpers.stop(stream);
    recordingState = false;
    setState();
  } else {
    button.style.color = "#FFFFFF";
    button.style.backgroundColor = "#000000";
    downloadButton.style.display = "none";
    recordingState = true;
    setState();

    navigator.mediaDevices
      .getDisplayMedia({
        video: true,
        audio: false,
      })
      .then((stm) => {
        stream = stm;
        logs = [];
        start = Date.now();
        return helpers.startRecording(stm);
      })
      .then((recordedChunks) => {
        let recordedBlob = new Blob(recordedChunks, { type: "video/mp4" });
        downloadButton.href = URL.createObjectURL(recordedBlob);
        downloadButton.download = "RecordedVideo.mp4";
        downloadButton.style.display = "flex";
        
        let logBlob = new Blob(logs, {type: "text/plain;charset=utf-8" });
        logButton.href = URL.createObjectURL(logBlob);
        logButton.download = "logs.txt";
        logButton.style.display = "flex";

        recordingState = false;
        setState();
      })
      .catch((err) => {
        button.style.color = "#000000";
        button.style.backgroundColor = "#FFFFFF";
        recordingState = false;
        setState();
      });
  }
}

/*
THINGS TO NOTE:

A MediaStream is tied to its responsible document, so in general, 
you cannot continue recording when the tab is reloaded. You must start the 
recording from another document (popup/tab) that remains open while
the recording is in progress.

*/