import { eventWithTime } from "rrweb/typings/types";
import { HoverInfo, IDictionary } from "./interfaces";

// STATE
let emulatorActive: boolean = false;
let borderState: boolean = false;
let tooltipState: boolean = false;
let recordingState: boolean = false;

// BORDER BEHAVIOUR
let color: string = "#ee2020";
let border: string;
let borderTimeout: NodeJS.Timeout = null;

// TOOLTIPS BEHAVIOUR
let hoverInfo: HoverInfo = {
  node: null,
  posX: 0,
  posY: 0,
};

// RECORDING BEHAVIOUR
let stream: MediaStream = null;
let downloadButton: HTMLAnchorElement = null;
let logButton: HTMLAnchorElement = null;
let start: number = 0;
let logs: string[] = [];
let events: eventWithTime[] = [];
let stopFn: Function = null;

// DOM CHANGE FORM BEHAVIOUR
let DOMFormInfo: HoverInfo = {
  node: null,
  posX: 0,
  posY: 0,
};
let DOMFormOpen: boolean = false;

interface Globals extends IDictionary<any> {
  emulatorActive: boolean;
  tooltipState: boolean;
  recordingState: boolean;
  borderState: boolean;
  border: string;
  borderTimeout: NodeJS.Timeout;
  color: string;
  hoverInfo: HoverInfo;
  stream: MediaStream;
  downloadButton: HTMLAnchorElement;
  logButton: HTMLAnchorElement;
  start: number;
  logs: string[];
  events: eventWithTime[];
  stopFn: Function;
  DOMFormInfo: HoverInfo;
  DOMFormOpen: boolean;
}

let globals: Globals = {
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
  DOMFormOpen: DOMFormOpen
};

export default globals;
