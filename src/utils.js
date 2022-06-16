const CUSTOM_ELEMENT_CLASS_NAME = 'pvi--open-in-new';

function isMobile() {
  return location.hostname == 'm.youtube.com';
}

function isPlaylistPage(url) {
  return url.includes('youtube.com/playlist');
}

function waitForElement(selector) {
  return new Promise((resolve) => {
    if (document.querySelector(selector)) {
      return resolve(document.querySelector(selector));
    }

    const observer = new MutationObserver((mutations) => {
      if (document.querySelector(selector)) {
        resolve(document.querySelector(selector));
        observer.disconnect();
      }
    });

    observer.observe(document.body, {
      subtree: true,
      childList: true,
    });
  });
}
