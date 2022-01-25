import { ExtensionMessage } from "../common/interfaces";

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
      chrome.scripting.executeScript({
        target: { tabId: details.tabId },
        files: ['content.js']
      }, () => {
        chrome.tabs.get(details.tabId, (tab) => {
          chrome.tabs.sendMessage<ExtensionMessage>(tab.id, {
            action: "initial load",
            source: "background",
          });
        });
      })
    }
  }
);

chrome.tabs.onUpdated.addListener(
  (tabId: number, changeInfo: chrome.tabs.TabChangeInfo, tab: chrome.tabs.Tab) => {
    let matchUrl: RegExp = /https:\/\/github.com\/.+\/.+\/pull\/\d+/;
    if (tab.status == "complete" && matchUrl.test(tab.url)) {
      chrome.tabs.sendMessage<ExtensionMessage>(tab.id, {
        action: "[GITHUB] Load Content",
        source: "background",
      });
    }
  }
);

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
  (m: any, sender: chrome.runtime.MessageSender, sendResponse: (response?: any) => void) => {
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
      chrome.storage.local.get(["githubTabId"], ({ tabId }: { tabId: number }) => {
        sendResponse({ response: "event log received" });
        chrome.tabs.sendMessage<ExtensionMessage>(tabId, {
          action: "send log",
          source: "background",
          events: m.events,
        });
        // replace with [GITHUB] Send Log for github implementation
      });
    } else if (m.action == "[GITHUB] Ready to Receive" && m.source == "github_content") {
      chrome.storage.local.set({ githubTabId: sender.tab.id });
    }
  }
);
