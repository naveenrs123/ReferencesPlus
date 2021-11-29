// GLOBALS for BORDER
let border;
let borderTimeout = null;
let borderState = false;
let color = "#ee2020";

// GLOBALS for TOOLTIPS
let tooltipTimeout = null;
let tooltipState = false;
let hoverInfo = {
  element: null,
  posX: 0,
  posY: 0,
};

// Common DOM Elements
let body = document.querySelector("body");

/**
 * Function that allows an element to be dragged across a page.
 * 
 * Taken from: https://www.w3schools.com/howto/howto_js_draggable.asp
 * 
 * @param elmnt The element you want to make draggable.
 */
function dragElement(elmnt) {
  var pos1 = 0,
    pos2 = 0,
    pos3 = 0,
    pos4 = 0;
  if (document.getElementById(elmnt.id + "-header")) {
    // if present, the header is where you move the DIV from:
    document.getElementById(elmnt.id + "-header").onmousedown = dragMouseDown;
  } else {
    // otherwise, move the DIV from anywhere inside the DIV:
    elmnt.onmousedown = dragMouseDown;
  }

  function dragMouseDown(e) {
    e = e || window.event;
    e.preventDefault();
    // get the mouse cursor position at startup:
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDragElement;
    // call a function whenever the cursor moves:
    document.onmousemove = elementDrag;
  }

  function elementDrag(e) {
    e = e || window.event;
    e.preventDefault();
    // calculate the new cursor position:
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    // set the element's new position:
    elmnt.style.top = elmnt.offsetTop - pos2 + "px";
    elmnt.style.left = elmnt.offsetLeft - pos1 + "px";
  }

  function closeDragElement() {
    // stop moving when mouse button is released:
    document.onmouseup = null;
    document.onmousemove = null;
  }
}

/* 
function createFrame() {
  let entryPoint = document.getElementById("main");

  let fragment = document.createDocumentFragment();
  let miniForm = document.createElement("div");

  let input = document.createElement("input");
  input.type = "text";
  input.placeholder = "www.google.com";

  let button = document.createElement("button");
  button.innerText = "Load URL";

  let frame = document.createElement("iframe");
  frame.height = "700";
  frame.width = "1200";

  miniForm.appendChild(input);
  miniForm.appendChild(button);

  fragment.appendChild(miniForm);
  fragment.appendChild(frame);

  entryPoint.appendChild(fragment);

  button.addEventListener("click", () => {
    frame.src = input.value;
  });
}
 */

/**
 * Creates the header element used to drag the emulator buttons container.
 * Also adds appropriate styles.
 * 
 * @returns A HTML Div Element representing the header used for dragging.
 */
function buildDragHeader() {
  let grab = document.createElement("div");
  grab.id = "emulator-buttons-header";
  grab.innerText = "Move";
  grab.style.padding = "10px 15px";
  grab.style.backgroundColor = "blue";
  grab.style.cursor = "move";
  grab.style.color = "#FFFFFF";
  return grab;
}

/**
 * Creates an emulator button with the appropriate styling.
 * 
 * @param id The id of the button to be created.
 * @param text The text inside the button to be created.
 * @returns The created button.
 */
function buildEmulatorButton(id, text) {
  let btn = document.createElement("button");
  btn.id = id;
  btn.textContent = text;
  btn.style.padding = "10px 15px";
  btn.style.color = "#000000";
  btn.style.backgroundColor = "#FFFFFF";
  btn.style.display = "inline-block";
  btn.style.position = "static";
  return btn;
}

/**
 * Event listener for the toggle-borders button. Changes
 * the button styles and adds/removes window listeners depending
 * on whether borders are enabled or disabled.
 * 
 * @param event A "click" DOM event. 
 */
function toggleBorders(event) {
  let button = event.target;
  if (borderState) {
    button.style.color = "#000000";
    button.style.backgroundColor = "#FFFFFF";
    button.innerText = "Borders: OFF";
    window.removeEventListener("mouseover", onMouseEnterBorders);
    window.removeEventListener("mouseout", onMouseLeaveBorders);
  } else {
    button.style.color = "#FFFFFF";
    button.style.backgroundColor = "#000000";
    button.innerText = "Borders: ON";
    window.addEventListener("mouseover", onMouseEnterBorders);
    window.addEventListener("mouseout", onMouseLeaveBorders);
  }
  borderState = !borderState;
}

/**
 * Creates the emulator buttons panel, which contains all the controls needed
 * for emulation and video capture. 
 */
function createEmulatorButtons() {
  let container = document.createElement("div");
  container.id = "emulator-buttons";
  container.style.display = "flex";

  let sheet = document.styleSheets[0];
  let rules =
    "#emulator-buttons { flex-direction: row; position: absolute; top: 60px; left: 20px;" +
    "z-index: 20000 !important; background-color: white !important; }";
  sheet.insertRule(rules, sheet.cssRules.length);

  dragElement(container);

  let grab = buildDragHeader();

  let btn1 = buildEmulatorButton("toggle-borders", "Borders: OFF");
  btn1.addEventListener("click", toggleBorders);

  let colorPicker = document.createElement("input");
  colorPicker.type = "color";
  colorPicker.id = "border-color-picker";
  colorPicker.value = color;
  colorPicker.style.height = "inherit";
  colorPicker.addEventListener("input", (event) => {
    color = event.target.value;
  });

  let btn2 = buildEmulatorButton("toggle-tooltips", "Tooltips: OFF");
  btn2.addEventListener("click", toggleTooltips);

  container.appendChild(grab);
  container.appendChild(colorPicker);
  container.appendChild(btn1);
  container.appendChild(btn2);
  body.insertBefore(container, body.childNodes[0]);
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
    } else {
      body.removeChild(container);
    }
  }
  sendResponse("Response!");
});

/**
 * Mouseover Event listener for the window when borders are enabled. Adds a border 
 * around the currently moused-over element after a short timeout.
 * 
 * @param event A mouseover event.
 */
function onMouseEnterBorders(event) {
  borderTimeout = setTimeout(() => {
    if (
      event.target.id != "emulator-buttons" &&
      event.target.parentNode.id != "emulator-buttons"
    ) {
      border = event.target.style.border;
      event.target.style.border = "3px solid " + color;
    }
  }, 250);
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
  if (event.target.parentNode.id != "emulator-buttons") {
    event.target.style.border = border;
  }
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
    console.log(contentString);
    content.innerHTML = contentString;
    console.log(content.innerHTML);
    container.appendChild(content);
  }

  posX = posX + 400 >= document.documentElement.clientWidth ? posX - 400 : posX;
  posY = posY + 400 >= document.documentElement.clientHeight ? posY - 400 : posY;

  let sheet = document.styleSheets[0];
  let refgTooltipRules = `.refg-tooltip { width: fit-content; max-width: 400px; background-color: #FFF; color: #000; border-radius: 10px; border: 3px solid #000; position: absolute; top: ${posY}px; left: ${posX}px; padding: 15px; z-index: 200000; }`;

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
  let button = event.target;
  if (tooltipState) {
    window.removeEventListener("mouseover", onMouseEnterTooltips);
    window.removeEventListener("mouseout", onMouseLeaveTooltips);

    button.style.color = "#000000";
    button.style.backgroundColor = "#FFFFFF";
    button.innerText = "Tooltips: OFF";
  } else {
    window.addEventListener("mouseover", onMouseEnterTooltips);
    window.addEventListener("mouseout", onMouseLeaveTooltips);

    button.style.color = "#FFFFFF";
    button.style.backgroundColor = "#000000";
    button.innerText = "Tooltips: ON";
  }
  tooltipState = !tooltipState;
}

/**
 * Mouseover Event listener for the window when tooltips are enabled. Extracts useful
 * properties from the moused-over element and creates a tooltip to display this information
 * after a short timeout.
 * 
 * @param event A mouseover event.
 */
function onMouseEnterTooltips(event) {
  tooltipTimeout = setTimeout(() => {
    if (
      event.target.id != "emulator-buttons" &&
      event.target.parentNode.id != "emulator-buttons" &&
      event.target.id != "refg-tooltip"
    ) {
      let properties = {};
      properties["Node Name"] = event.target.nodeName;
      properties["Parent"] = event.target.parentNode
        ? event.target.parentNode.nodeName
        : "TOP LEVEL";
      properties["Id"] = event.target.id != "" ? event.target.id : "N/A";
      properties["Classes"] = event.target.classList;

      let rect = event.target.getBoundingClientRect();

      properties["Height"] = Math.round(rect.height) + "px";
      properties["Width"] = Math.round(rect.width) + "px";
      let tooltip = createTooltip(event.pageX, event.pageY, properties);
      body.appendChild(tooltip);
    }
  }, 250);
}

/**
 * Mouseout Event listener for the window when borders are enabled. Removes the tooltip for 
 * the moused-over element when the mouse cursor exits the element area. Also
 * clears the timeout to prevent a tooltip from showing immediately while the cursor is
 * moving.
 * 
 * @param event A mouseout event.
 */
function onMouseLeaveTooltips(event) {
  clearTimeout(tooltipTimeout);
  if (
    event.target.id != "refg-tooltip" &&
    event.target.parentNode.id != "emulator-buttons"
  ) {
    let tooltip = document.getElementById("refg-tooltip");
    if (tooltip) {
      body.removeChild(tooltip);
    }
  }
}
