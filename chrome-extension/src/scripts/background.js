chrome.webNavigation.onCompleted.addListener((details) => {
  if (details.frameId === 0) {
    chrome.tabs.get(details.tabId, (tab) => {
      chrome.tabs.sendMessage(
        tab.id,
        { action: "initial load", tab: tab },
        (response) => {
          console.log("Response received!");
        }
      );
    });
  }
});

chrome.contextMenus.create(
  {
    checked: false,
    id: "toggle-emulation",
    title: "Toggle Emulation"
  }
)

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "toggle-emulation") {
    chrome.tabs.sendMessage(
      tab.id,
      { action: "toggle emulation", tab: tab },
      (response) => {
        console.log("Response received!");
      }
    )
  }
})