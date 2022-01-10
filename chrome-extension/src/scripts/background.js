chrome.webNavigation.onCompleted.addListener((details) => {
  if (details.frameId === 0) {
    chrome.tabs.get(details.tabId, (tab) => {
      chrome.tabs.sendMessage(tab.id, { action: "initial load", source: "background" });
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
    chrome.tabs.sendMessage(tab.id, { action: "toggle emulation", source: "background" });
  }
});

chrome.action.onClicked.addListener((tab) => {
  chrome.storage.local.set({ tabId: tab.id }, () => {
    chrome.windows
      .create({
        url: chrome.runtime.getURL("recordInterface.html"),
        type: "popup",
      }).then((windowObj) => {
        chrome.storage.local.set({ popupTabId: windowObj.tabs[0].id });
      });
  });
});

chrome.runtime.onMessage.addListener((m, sender, sendResponse) => {
  if (m.action == "record page start" && m.source == "player") {
    chrome.storage.local.get(['tabId'], (result) => {
      chrome.tabs.sendMessage(result.tabId, { action: "start recording", source: "background" });
    });
  } else if (m.action == "record page stop" && m.source == "player") {
    chrome.storage.local.get(['tabId'], (result) => {
      chrome.tabs.sendMessage(result.tabId, { action: "stop recording", source: "background" });
    });
  } 
  else if (m.action == "recording stopped" && m.source == "content") {
    chrome.storage.local.get(['tabId'], (result) => {
      console.log(m.events);
      sendResponse({ response: "event log received" });
    });
  }
  return true;
});
