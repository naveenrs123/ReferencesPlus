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

// INTERFACE STATE
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

export interface CoreState {
  events?: eventWithTime[];
  sessionDetails?: SessionDetails;
  comments?: CommentData[];
  nextCommentId?: number;
  mainPlayer?: rrwebPlayer;
}

export interface ReadOnlyInterface extends CoreState {
  commentBody?: HTMLElement;
  githubCommentId?: number;
}

export interface EditableInterface extends CoreState {
  containerId?: string;
  hasUnsavedChanges?: boolean;
  active?: boolean;
  allowOverwrite?: boolean;
}

export interface EditableInterfacesMap {
  [id: number]: EditableInterface;
}

export interface LoadedSessions {
  [sessionId: string]: CoreState;
}
// INTERFACE STATE

export interface GitHubTabState {
  state: TabState;
}

export interface TabState {
  tabId: number;
  idx: number;
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

export interface SessionToCommentMap {
  [sessionCommentString: string]: {
    sessionId: string;
    commentId: number;
  };
}

export interface TextWithSessions {
  textNode: Node;
  parentElem: HTMLElement;
  sessionCommentsArr: string[];
}

export interface TaggedText {
  text: string;
  isSessionString: boolean;
}
