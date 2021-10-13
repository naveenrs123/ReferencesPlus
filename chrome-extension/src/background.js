let testText = 'This is some test text.'

chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.sync.set({ testText });
    console.log("The test text has been saved:", `${testText}`);
});