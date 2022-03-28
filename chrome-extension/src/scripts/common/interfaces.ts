import rrwebPlayer from "rrweb-player";
import { eventWithTime } from "rrweb/typings/types";

export interface HoverInfo {
  node: HTMLElement;
  posX: number;
  posY: number;
}

export interface IDictionary<TValue> {
  [id: string]: TValue;
}

export interface ExtensionMessage {
  action: string;
  source: string;
  idx?: number;
  events?: eventWithTime[];
}

export enum ButtonColor {
  Default = 1,
  Green,
  Red,
  Yellow,
}

export interface InterfaceState {
  containerId: string;
  hasUnsavedChanges?: boolean;
  mainPlayer?: rrwebPlayer;
  active?: boolean;
}

export interface StateMap {
  [id: number]: InterfaceState;
}

export interface GitHubTabState {
  state: TabState;
}

export interface TabState {
  tabId: number;
  idx: number;
}
