// bundled with content.js

import { eventWithTime } from "rrweb/typings/types";
import { HoverInfo, IDictionary } from "./interfaces";

// STATE
let emulatorActive: boolean = false;

// BORDER
let borderState: boolean = false;
let color: string = "#ee2020";
let border: string;
let borderTimeout: number = null;

// TOOLTIPS
let tooltipState: boolean = false;
let hoverInfo: HoverInfo = {
  node: null,
  posX: 0,
  posY: 0,
};

// RECORDING AND SCREENSHOTS
let recordingState: boolean = false;
let stream: MediaStream = null;
let downloadButton: HTMLAnchorElement = null;
let logButton: HTMLAnchorElement = null;
let start: number = 0;
let logs: string[] = [];
let events: eventWithTime[] = [];
let stopFn: Function = null;

// DOM CHANGE FORM
let DOMFormInfo: HoverInfo = {
  node: null,
  posX: 0,
  posY: 0,
};
let DOMFormOpen: boolean = false;

// Common DOM Elements
let body: HTMLBodyElement = document.querySelector("body");


let globals: IDictionary<any> = {
  emulatorActive: emulatorActive,
  tooltipState: tooltipState,
  recordingState: recordingState,
  borderState: borderState,
  border: border,
  borderTimeout: borderTimeout,
  color: color,
  hoverInfo: hoverInfo,
  stream: stream,
  downloadButton: downloadButton,
  logButton: logButton,
  start: start,
  logs: logs,
  events: events,
  stopFn: stopFn,
  DOMFormInfo: DOMFormInfo,
  DOMFormOpen: DOMFormOpen,
  body: body,
};

export default globals;
