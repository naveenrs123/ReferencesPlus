chrome.webNavigation.onCompleted.addListener((details) => {
  if (details.frameId === 0) {
    chrome.tabs.get(details.tabId, (tab) => {
      chrome.tabs.sendMessage(tab.id, { action: "initial load" });
    });
  }
});

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    checked: false,
    id: "toggle-emulation",
    title: "Toggle Emulation",
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "toggle-emulation") {
    chrome.tabs.sendMessage(tab.id, { action: "toggle emulation" });
  }
});

chrome.action.onClicked.addListener((tab) => {
  chrome.storage.local.set({ tabId: tab.id }, () => {
    chrome.windows
      .create({
        url: chrome.runtime.getURL("recordInterface.html"),
        type: "popup",
      })
      .then(() => {
        chrome.tabs.sendMessage(tab.id, { action: "start recording" });
      });
  });
});

chrome.runtime.onMessage.addListener((message) => {
  if (message.action == "record page") {
    chrome.storage.local.get(['tabId'], (result) => {
      chrome.tabs.sendMessage(result.tabId, { action: "start recording" })
    })
  }
});
