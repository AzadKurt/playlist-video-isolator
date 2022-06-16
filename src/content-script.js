window.addEventListener('load', main, false);

async function main() {
  var playlistHandler = isMobile() ? new MobilePlaylistHandler() : new DesktopPlaylistHandler();

  if (isPlaylistPage(location.href)) {
    playlistHandler.handlePlaylist();
  } else {
    const urlObserverCallback = function (mutations, observer) {
      if (isPlaylistPage(location.href)) {
        playlistHandler.handlePlaylist();
        observer.disconnect();
      }
    };

    const urlObserver = new MutationObserver(urlObserverCallback);
    urlObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }
}
