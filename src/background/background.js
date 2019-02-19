// This event is fired with the user accepts the input in the omnibox.
chrome.omnibox.onInputEntered.addListener(
  function(text) {
    if (!text || !text.trim()) {
      return;
    }
    chrome.storage.local.get(['shortcuts'], function(result) {
      const shortcuts = result.shortcuts || [];

      let shortcut = null;
      let newUrl = null;

      shortcut = shortcuts.find(obj => obj.keyword === text.trim())
      if (shortcut) {
        newUrl = shortcut.url;
        chrome.tabs.update(null, {url: newUrl});
        return;
      }

      // If exactly matching shortcut is not found, remove last segment of text (delimited by
      // space) and try again, consider the last segment as URL param
      const textSegs = text.split(' ');
      text = textSegs.slice(0, -1).join(' ')
      const suffix = textSegs.slice(-1).join(' ')

      shortcut = shortcuts.find(obj => obj.keyword === text.trim())
      if (shortcut) {
        newUrl = shortcut.url + suffix;
        chrome.tabs.update(null, {url: newUrl});
      }
    });
  });
