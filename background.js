//leftover file, probably don't need this anymore
browser.browserAction.onClicked.addListener((tab) => {
  browser.tabs.executeScript(tab.id, {
    file: "humblextractor.js"
  });
});

