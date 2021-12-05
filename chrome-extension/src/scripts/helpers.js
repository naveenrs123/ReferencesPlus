export let color = "#ee2020";
export let recorder = null;
let draggable = true;

/**
 * Function that allows an element to be dragged across a page.
 *
 * Taken from: https://www.w3schools.com/howto/howto_js_draggable.asp
 *
 * @param elmnt The element you want to make draggable.
 */
export function dragElement(elmnt) {
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

/**
 * Creates the header element used to drag the emulator buttons container.
 * Also adds appropriate styles.
 *
 * @returns A HTML Div Element representing the header used for dragging.
 */
export function buildDragHeader() {
  let grab = document.createElement("div");
  let text = document.createElement("p");
  grab.id = "emulator-buttons-header";
  grab.style.backgroundColor = "blue";
  grab.style.cursor = "move";
  grab.style.color = "#FFFFFF";
  grab.style.width = "55px";
  grab.style.textAlign = "center";
  grab.style.display = "flex";
  grab.style.justifyContent = "center";
  grab.style.alignItems = "center";

  text.textContent = "Move";
  text.style.margin = "0";
  grab.appendChild(text);
  
  return grab;
}

/**
 * Creates an emulator button with the appropriate styling.
 *
 * @param id The id of the button to be created.
 * @param text The text inside the button to be created.
 * @returns The created button.
 */
export function buildEmulatorButton(id, text) {
  let btn = document.createElement("a");
  let t = document.createElement("p");
  btn.id = id;
  btn.style.padding = "5px 5px";
  btn.style.color = "#000000";
  btn.style.backgroundColor = "#FFFFFF";
  btn.style.position = "static";
  btn.style.border = "1px solid black";
  btn.style.textAlign = "center";
  btn.style.display = "flex";
  btn.style.justifyContent = "center";
  btn.style.alignItems = "center";

  t.style.color = "inherit";
  t.style.backgroundColor = "inherit";
  t.style.margin = "0";
  t.textContent = text;

  btn.appendChild(t);
  return btn;
}

export function buildColorPicker() {
  let colorPicker = document.createElement("input");
  colorPicker.type = "color";
  colorPicker.id = "border-color-picker";
  colorPicker.value = color;
  colorPicker.style.height = "auto";
  colorPicker.addEventListener("input", (event) => {
    color = event.target.value;
  });
  return colorPicker;
}

export function shiftPosition(pos, elmntDimension, clientDimension) {
  while (pos + elmntDimension >= clientDimension) {
    pos -= 25;
  }

  return pos;
}

// #region RECORDING
// Code taken from: https://developer.mozilla.org/en-US/docs/Web/API/MediaStream_Recording_API/Recording_a_media_element

export function startRecording(stream) {
  recorder = new MediaRecorder(stream);
  let data = [];

  recorder.ondataavailable = (event) => data.push(event.data);
  recorder.start();

  let stopped = new Promise((resolve, reject) => {
    recorder.onstop = resolve;
    recorder.onerror = (event) => reject(event.name);
  });

  return stopped.then(() => data);
}

export function stop(stream) {
  if (recorder) {
    recorder.state == "recording" && recorder.stop();
    stream.getTracks().forEach((track) => track.stop());
  }
}

export function forbiddenElement(event) {
  return (
    event.target.id == "emulator-buttons" || event.target.parentNode.id == "emulator-buttons" ||
    event.target.id == "refg-tooltip" || event.target.parentNode.id == "toggle-borders" ||
    event.target.parentNode.id == "toggle-tooltips" || event.target.parentNode.id == "toggle-recording" ||
    event.target.parentNode.id == "refg-download" || event.target.parentNode.id == "emulator-buttons-header"
  );
}

// #endregion RECORDING
