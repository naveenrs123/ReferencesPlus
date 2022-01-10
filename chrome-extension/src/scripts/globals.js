// STATE
let emulatorActive = false;
let tooltipState = false;
let recordingState = false;
let borderState = false;

// BORDER
let border;
let borderTimeout = null;

// TOOLTIPS
let hoverInfo = {
  node: null,
  posX: 0,
  posY: 0,
};

// RECORDING AND SCREENSHOTS
let stream = null;
let downloadButton = null;
let logButton = null;
let start = null;
let logs = [];
let events = [];

let dlScreenshotButton = null;

// DOM CHANGE FORM
let DOMFormInfo = {
  node: null,
  posX: 0,
  posY: 0,
};
let DOMFormOpen = false;

// Common DOM Elements
let body = document.querySelector("body");

let globals = {
  emulatorActive: emulatorActive,
  tooltipState: tooltipState,
  recordingState: recordingState,
  borderState: borderState,
  border: border,
  borderTimeout: borderTimeout,
  hoverInfo: hoverInfo,
  stream: stream,
  downloadButton: downloadButton,
  logButton: logButton,
  dlScreenshotButton: dlScreenshotButton,
  start: start,
  logs: logs,
  events: events,
  DOMFormInfo: DOMFormInfo,
  DOMFormOpen: DOMFormOpen,
  body: body,
};

export default globals;
