import { matchUrl } from "./common/constants";
import { ExtensionMessage, GitHubTabState, TabState, TabTimeoutMap } from "./common/interfaces";

/**
 * Create the Context Menu items required for the extension.
 */
function createContextMenuItems(): void {
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

const tabTimeoutMap: TabTimeoutMap = {};

/**
 * Listener to insert relevant content scripts into a GitHub PR page.
 */
chrome.tabs.onUpdated.addListener(
  (tabId: number, changeInfo: chrome.tabs.TabChangeInfo, tab: chrome.tabs.Tab) => {
    if (changeInfo.status == "complete") {
      if (tabId in tabTimeoutMap) return;
      if (matchUrl.test(tab.url)) {
        tabTimeoutMap[tabId] = setTimeout(() => {
          chrome.scripting
            .executeScript({
              target: { tabId: tabId },
              files: ["vendors-content.js", "content.js"],
            })
            .then(() => {
              return chrome.scripting.insertCSS({
                target: { tabId: tabId },
                files: ["css/rrweb-player.min.css", "css/refg-styles.css"],
              });
            })
            .then(() => {
              return chrome.scripting.executeScript({
                target: { tabId: tab.id },
                files: ["vendors-recorder.js", "recorder.js"],
              });
            })
            .then(() => {
              delete tabTimeoutMap[tabId];
            })
            .catch(() => {
              return;
            });
        }, 1000);
      } else if (!/^(?:edge|chrome|brave):\/\/.*$/.test(tab.url)) {
        // Don't insert into internal pages.
        tabTimeoutMap[tabId] = setTimeout(() => {
          void chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ["vendors-recorder.js", "recorder.js"],
          });
        }, 1000);
      }
    }
  }
);

/* chrome.webNavigation.onHistoryStateUpdated.addListener(
  (details: chrome.webNavigation.WebNavigationFramedCallbackDetails) => {
    if (matchUrl.test(details.url)) {
      chrome.scripting
        .executeScript({
          target: { tabId: details.tabId },
          files: ["vendors-content.js", "content.js"],
        })
        .then(() => {
          return chrome.scripting.insertCSS({
            target: { tabId: details.tabId },
            files: ["css/rrweb-player.min.css", "css/refg-styles.css"],
          });
        })
        .then(() => {
          void chrome.scripting.executeScript({
            target: { tabId: details.tabId },
            files: ["vendors-recorder.js", "recorder.js"],
          });
        })
        .catch(() => {
          return;
        });
    } else if (!/^(?:edge|chrome|brave):\/\/.*$/.test(details.url)) {
      // Don't insert into internal pages.
      void chrome.scripting.executeScript({
        target: { tabId: details.tabId },
        files: ["vendors-recorder.js", "recorder.js"],
      });
    }
  }
); */

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
    sender: chrome.runtime.MessageSender,
    sendResponse: (response?: any) => void
  ) => {
    if (m.action == "recording stopped" && m.source == "content") {
      chrome.storage.local.get(["state"], ({ state }: { state: TabState }) => {
        chrome.tabs.sendMessage<ExtensionMessage>(state.tabId, {
          action: "[GITHUB] Send Log",
          source: "background",
          idx: state.idx,
          website: m.website,
          events: m.events,
        });
      });
    } else if (m.action == "[GITHUB] Ready to Receive" && m.source == "github_content") {
      const tabState: GitHubTabState = {
        state: {
          tabId: sender.tab.id,
          idx: m.idx,
        },
      };
      void chrome.storage.local.set(tabState);
    }

    sendResponse("Received");
    return true;
  }
);

createContextMenuItems();
