import { ExtensionMessage } from "../common/interfaces";

// Regular expression for GitHub PRs URLs
let matchUrl: RegExp = /https:\/\/github.com\/.+\/.+\/pull\/\d+/;

chrome.contextMenus.removeAll();
chrome.contextMenus.create({
  checked: false,
  id: "toggle-emulation",
  title: "Toggle Emulation",
  contexts: ["all"],
});
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

chrome.webNavigation.onCompleted.addListener(
  (details: chrome.webNavigation.WebNavigationFramedCallbackDetails) => {
    if (details.frameId === 0) {
      if (matchUrl.test(details.url)) {
        chrome.scripting
          .executeScript({
            target: { tabId: details.tabId },
            files: ["vendors-g_content.js", "g_content.js"],
          })
          .then(() => {
            chrome.scripting.insertCSS({
              target: { tabId: details.tabId },
              files: ["css/rrweb-player.min.css"],
            });
          }).then(() => insertContentScripts(details));
      } else {
        insertContentScripts(details);
      }
    }
  }
);

function insertContentScripts(details: chrome.webNavigation.WebNavigationFramedCallbackDetails) {
  chrome.scripting.executeScript(
    {
      target: { tabId: details.tabId },
      files: ["vendors-content.js", "content.js"],
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

chrome.contextMenus.onClicked.addListener(
  (info: chrome.contextMenus.OnClickData, tab: chrome.tabs.Tab) => {
    if (info.menuItemId === "toggle-emulation") {
      console.log(tab);
      chrome.tabs.sendMessage<ExtensionMessage>(tab.id, {
        action: "toggle emulation",
        source: "background",
      });
    } else if (info.menuItemId === "record-page-start") {
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

chrome.action.onClicked.addListener((tab) => {
  chrome.storage.local.set({ tabId: tab.id }, () => {
    let interfaceUrl: string = chrome.runtime.getURL("recordInterface.html");
    chrome.windows
      .create({ url: interfaceUrl, type: "popup" })
      .then((windowObj: chrome.windows.Window) => {
        chrome.storage.local.set({ popupTabId: windowObj.tabs[0].id });
      });
  });
});

chrome.runtime.onMessage.addListener(
  (
    m: ExtensionMessage,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response?: any) => void
  ) => {
    if (m.action == "record page start" && m.source == "player") {
      chrome.storage.local.get(["tabId"], ({ tabId }: { tabId: number }) => {
        chrome.tabs.sendMessage<ExtensionMessage>(tabId, {
          action: "start recording",
          source: "background",
        });
      });
    } else if (m.action == "record page stop" && m.source == "player") {
      chrome.storage.local.get(["tabId"], ({ tabId }: { tabId: number }) => {
        chrome.tabs.sendMessage<ExtensionMessage>(tabId, {
          action: "stop recording",
          source: "background",
        });
      });
    } else if (m.action == "recording stopped" && m.source == "content") {
      // replace with popupTabId for popup implementation.
      chrome.storage.local.get(["githubTabId"], (result) => {
        console.log(result.githubTabId);
        sendResponse({ response: "event log received" });
        chrome.tabs.sendMessage<ExtensionMessage>(result.githubTabId, {
          action: "[GITHUB] Send Log",
          source: "background",
          events: m.events,
        });
        // replace with [GITHUB] Send Log for github implementation
      });
    } else if (m.action == "[GITHUB] Ready to Receive" && m.source == "github_content") {
      console.log(sender.tab.id);
      chrome.storage.local.set({ githubTabId: sender.tab.id });
    }
  }
);
