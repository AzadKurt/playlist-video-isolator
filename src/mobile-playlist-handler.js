const MOBILE_PLAYLIST_SELECTOR = 'ytm-playlist-video-list-renderer';
const MOBILE_PLAYLIST_VIDEO_SELECTOR = 'ytm-playlist-video-renderer';

class MobilePlaylistHandler {
  constructor() {
    this.videosObserver;
  }

  async handlePlaylist() {
    await this.processPlaylist();
    this.addUrlObserver();
  }

  async processPlaylist() {
    let playlist = await waitForElement(MOBILE_PLAYLIST_SELECTOR);
    let videos = playlist.getElementsByTagName(MOBILE_PLAYLIST_VIDEO_SELECTOR);

    for (const video of videos) {
      this.addOpenButton(video);
    }

    if (this.videosObserver) this.videosObserver.disconnect();

    this.addVideosObserver(playlist);
  }

  addOpenButton(video) {
    const menu = video.querySelector('ytm-menu');
    menu.style.display = 'flex';
    menu.style.flexDirection = 'column';

    const buttonElement = this.getButtonElement(this.getVideoLink(video));

    menu.insertAdjacentHTML('afterbegin', buttonElement);
  }

  getVideoLink(video) {
    return video.querySelector('.compact-media-item-metadata-content').getAttribute('href').split('&list')[0];
  }

  addVideosObserver(playlist) {
    const self = this;

    const videosObserverCallback = function (mutations, observer) {
      mutations.forEach((mutation) => {
        if (mutation.addedNodes.length > 0) {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeName.toLowerCase() === MOBILE_PLAYLIST_VIDEO_SELECTOR) self.addOpenButton(node);
          });
        }

        // playlist videos are completely re-rendered when, for example, an icon is clicked that grays out the background
        // (e.g.the search icon); therefore, the removed buttons must be added again
        if (mutation.removedNodes[0]?.className === CUSTOM_ELEMENT_CLASS_NAME) {
          const buttonElement = self.getButtonElement(mutation.removedNodes[0].href);

          mutation.previousSibling.parentElement.insertAdjacentHTML('afterbegin', buttonElement);
        }
      });
    };

    this.videosObserver = new MutationObserver(videosObserverCallback);

    this.videosObserver.observe(playlist, {
      childList: true,
      subtree: true,
      attributes: true,
    });
  }

  addUrlObserver() {
    const self = this;
    let lastUrl = location.href;

    const urlObserverCallback = function (mutations, observer) {
      const newUrl = location.href;
      if (lastUrl !== newUrl) {
        const lastUrlAnchorSplit = lastUrl.split('#')[0];
        const newUrlAnchorSplit = newUrl.split('#')[0];
        if (lastUrlAnchorSplit !== newUrlAnchorSplit && isPlaylistPage(newUrl)) self.processPlaylist();
        lastUrl = newUrl;
      }
    };

    this.urlObserver = new MutationObserver(urlObserverCallback);
    this.urlObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  getButtonElement(videoLink) {
    return `
    <a class="${CUSTOM_ELEMENT_CLASS_NAME}" href="${videoLink}" target="_blank">
      <button class="icon-button">
        <c3-icon>
          <svg xmlns="http://www.w3.org/2000/svg" enable-background="new 0 0 24 24" height="24" viewBox="0 0 24 24" width="24">
            <path d="M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z" />
          </svg>
        </c3-icon>
      </button>
    </a>
    `;
  }
}
