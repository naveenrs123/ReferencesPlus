/* eslint-disable no-unused-vars */
import rrwebPlayer from "rrweb-player";
import { eventWithTime } from "rrweb/typings/types";

// GENERAL
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
export interface PRDetails {
  userOrOrg: string;
  repository: string;
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
  contents?: HTMLDivElement; // A div containing the processed contents of the textarea.
  saved?: boolean;
}

export interface CoreState {
  events?: eventWithTime[];
  stringEvents?: string;
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

// TEXT PROCESSING
export interface TextWithSessions {
  node: Node;
  refs: string[];
}

export interface TaggedText {
  text: string;
  isSessionString: boolean;
}

// MAPS
export interface EditableInterfacesMap {
  [id: number]: EditableInterface;
}

export interface SessionCommentMap {
  [sessionCommentString: string]: {
    sessionId: string;
    commentId: number;
  };
}

export interface TextWithSessionsMap {
  [idx: number]: TextWithSessions[];
}

export interface TabTimeoutMap {
  [tabId: number]: ReturnType<typeof setTimeout>;
}

export interface LoadedSessionsMap {
  [sessionId: string]: CoreState;
}

// TAB STATE
export interface GitHubTabState {
  state: TabState;
}

export interface TabState {
  tabId: number;
  idx: number;
}

// RESPONSES
export interface SaveResponse {
  id: string;
}

export interface CheckUniqueResponse {
  isUnique: boolean;
}




