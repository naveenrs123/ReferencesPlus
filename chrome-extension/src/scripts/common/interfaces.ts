/* eslint-disable no-unused-vars */
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
  website?: string;
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
  events?: eventWithTime[];
  mainPlayer?: rrwebPlayer;
  active?: boolean;
  sessionDetails?: SessionDetails;
  comments?: CommentData[];
  nextCommentId?: number;
  allowOverwrite?: boolean;
}

export interface StateMap {
  [id: number]: InterfaceState;
}

export interface InterfaceStateReq {
  events: eventWithTime[];
  sessionDetails?: SessionDetails;
  comments?: CommentData[];
  nextCommentId?: number;
}

export interface StateMapReq {
  [id: number]: InterfaceStateReq;
}

export interface GitHubTabState {
  state: TabState;
}

export interface TabState {
  tabId: number;
  idx: number;
}

export interface SessionDetails {
  title: string;
  website: string;
  id: string;
}

export interface CommentData {
  comment_id: number;
  timestamp: number;
  idx: number; // Associated with session
  rawText: string; // raw text from the textarea.
  contents: HTMLDivElement; // A div containing the processed contents of the textarea.
  saved?: boolean;
}

export interface PRDetails {
  userOrOrg: string;
  repository: string;
  prNumber: number;
}

export interface SaveResponse {
  id: string;
}

export interface CheckUniqueResponse {
  isUnique: boolean;
}
