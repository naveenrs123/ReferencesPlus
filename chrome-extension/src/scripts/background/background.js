chrome.webNavigation.onCompleted.addListener((details) => {
  if (details.frameId === 0) {
    chrome.tabs.get(details.tabId, (tab) => {
      chrome.tabs.sendMessage(tab.id, { action: "initial load", source: "background" });
    });
  }
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  let matchUrl = /https:\/\/github.com\/.+\/.+\/pull\/\d+/;
  if (tab.status == "complete" && matchUrl.test(tab.url)) {
    console.log(tab);
    chrome.tabs.sendMessage(tab.id, { action: "[GITHUB] Load Content", source: "background" });
  }
});

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    checked: false,
    id: "toggle-emulation",
    title: "Toggle Emulation",
  });

  chrome.contextMenus.create({
    checked: false,
    id: "record-page-start",
    title: "Record Page",
  });

  chrome.contextMenus.create({
    checked: false,
    id: "record-page-stop",
    title: "Stop Recording",
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "toggle-emulation") {
    chrome.tabs.sendMessage(tab.id, { action: "toggle emulation", source: "background" });
  } else if (info.menuItemId === "record-page-start") {
    chrome.tabs.sendMessage(tab.id, { action: "start recording", source: "background" });
  } else if (info.menuItemId === "record-page-stop") {
    chrome.tabs.sendMessage(tab.id, { action: "stop recording", source: "background" });
  }
});

chrome.action.onClicked.addListener((tab) => {
  chrome.storage.local.set({ tabId: tab.id }, () => {
    chrome.windows
      .create({
        url: chrome.runtime.getURL("recordInterface.html"),
        type: "popup",
      })
      .then((windowObj) => {
        chrome.storage.local.set({ popupTabId: windowObj.tabs[0].id });
      });
  });
});

chrome.runtime.onMessage.addListener((m, sender, sendResponse) => {
  if (m.action == "record page start" && m.source == "player") {
    chrome.storage.local.get(["tabId"], (result) => {
      chrome.tabs.sendMessage(result.tabId, { action: "start recording", source: "background" });
    });
  } else if (m.action == "record page stop" && m.source == "player") {
    chrome.storage.local.get(["tabId"], (result) => {
      chrome.tabs.sendMessage(result.tabId, { action: "stop recording", source: "background" });
    });
  } else if (m.action == "recording stopped" && m.source == "content") {
    // replace with popupTabId for popup implementation.
    chrome.storage.local.get(["githubTabId"], (result) => {
      console.log(result);
      sendResponse({ response: "event log received" });
      chrome.tabs.sendMessage(result.githubTabId, {
        action: "send log", // replace with [GITHUB] Send Log for github implementation
        source: "background",
        events: m.events,
      });
    });
  } else if (m.action == "[GITHUB] Ready to Receive" && m.source == "github_content") {
    chrome.storage.local.set({ githubTabId: sender.tab.id });
  }
  return true;
});
