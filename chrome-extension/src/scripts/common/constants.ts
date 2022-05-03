// Common CSS Classes
export const waitForPlayerClass = "refg-wait-for-player";
export const waitForSaveClass = "refg-wait-for-save";
export const hideElemClass = "refg-hide-elem";
export const unsavedCommentClass = "refg-unsaved-comment";

// CSS Selector Queries
export const codeCommentQuery = "markdown-toolbar[for*='new_inline_comment_discussion'] details";
export const mainCommentQuery = "markdown-toolbar[for='new_comment_field'] details";
export const makePrQuery = "markdown-toolbar[for='pull_request_body'] details";
export const betaCodeCommentQuery = "markdown-toolbar[for*=new_inline_comment_diff] details";

// References
export const refSymbol = "%";
export const refBegin = refSymbol + "[";
export const refEnd = "]" + refSymbol;

// Regex Matches
export const matchUrl = /https:\/\/github.com\/(.+)\/(.+)\/(?:pull|compare)\/.*/;
export const sessionMatchPattern =
  /(SESSION\[(\w+)\]_C\[(\d+)\]:)\s*\[(?:(?!SESSION\[(\w+)\]_C\[(\d+)\]:).)+\]/g;
export const saveCommentMatch = RegExp(`${refSymbol}\\[(\\d+)\\]${refSymbol}`, "i");

// URLs
export const localUrl = "http://127.0.0.1:5000";
export const globalUrl = "https://pr-referencing.azurewebsites.net";
export function getFetchUrl(): string {
  return globalUrl;
}

export const clickBorderOutline = "3px solid #299b03";
