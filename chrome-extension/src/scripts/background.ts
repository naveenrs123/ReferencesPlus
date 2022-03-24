import { ExtensionMessage } from "./common/interfaces";

// Regular expression for GitHub PRs URLs
let matchUrl: RegExp = /https:\/\/github.com\/.+\/.+\/pull\/\d+/;

/**
 * Create the Context Menu items required for the extension.
 */
function createContextMenuItems() {
  chrome.contextMenus.removeAll();
  chrome.contextMenus.create({
    checked: false,
    id: "record-page-start",
    title: "Record Page",
    contexts: ["all"],
  });
  chrome.contextMenus.create({
    checked: false,
    id: "record-page-stop",
    title: "Stop Recording",
    contexts: ["all"],
  });
}

/**
 * Listener to insert relevant content scripts into a GitHub PR page.
 */
chrome.webNavigation.onCompleted.addListener(
  (details: chrome.webNavigation.WebNavigationFramedCallbackDetails) => {
    if (details.frameId === 0) {
      if (matchUrl.test(details.url)) {
        chrome.scripting
          .executeScript({
            target: { tabId: details.tabId },
            files: ["vendors-content.js", "content.js"],
          })
          .then(() => {
            chrome.scripting.insertCSS({
              target: { tabId: details.tabId },
              files: ["css/rrweb-player.min.css", "css/refg-styles.css"],
            });
          })
          .then(() => insertContentScripts(details));
      } else {
        insertContentScripts(details);
      }
    }
  }
);

/**
 * Inserts the content scripts into the tab where a web navigation was just completed.
 *
 * @param details An object containing information related to webNavigation.
 */
function insertContentScripts(details: chrome.webNavigation.WebNavigationFramedCallbackDetails) {
  chrome.scripting.executeScript(
    {
      target: { tabId: details.tabId },
      files: ["vendors-recorder.js", "recorder.js"],
    },
    () => {
      chrome.tabs.get(details.tabId, (tab) => {
        chrome.tabs.sendMessage<ExtensionMessage>(tab.id, {
          action: "initial load",
          source: "background",
        });
      });
    }
  );
}

/**
 * An event listener to check for interactions with Context Menu items.
 */
chrome.contextMenus.onClicked.addListener(
  (info: chrome.contextMenus.OnClickData, tab: chrome.tabs.Tab) => {
    if (info.menuItemId === "record-page-start") {
      chrome.tabs.sendMessage<ExtensionMessage>(tab.id, {
        action: "start recording",
        source: "background",
      });
    } else if (info.menuItemId === "record-page-stop") {
      chrome.tabs.sendMessage<ExtensionMessage>(tab.id, {
        action: "stop recording",
        source: "background",
      });
    }
  }
);

/**
 * An event listener to respond to messages from different content scripts. All messages
 * provided must be in the form of an {@link ExtensionMessage}.
 */
chrome.runtime.onMessage.addListener(
  (
    m: ExtensionMessage,
    sender: chrome.runtime.MessageSender
  ) => {
    if (m.action == "recording stopped" && m.source == "content") {
      // replace with popupTabId for popup implementation.
      chrome.storage.local.get(["githubTabId"], (result) => {
        chrome.tabs.sendMessage<ExtensionMessage>(result.githubTabId, {
          action: "[GITHUB] Send Log",
          source: "background",
          events: m.events,
        });
      });
    } else if (m.action == "[GITHUB] Ready to Receive" && m.source == "github_content") {
      chrome.storage.local.set({ githubTabId: sender.tab.id });
    }
  }
);

createContextMenuItems();