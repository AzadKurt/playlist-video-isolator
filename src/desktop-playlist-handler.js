const DESKTOP_PLAYLIST_SELECTOR = '#contents.ytd-playlist-video-list-renderer';
const DESKTOP_PLAYLIST_VIDEO_SELECTOR = 'ytd-playlist-video-renderer';

class DesktopPlaylistHandler {
  constructor() {
    this.addedButtons = 0;
  }

  async handlePlaylist() {
    let playlist = await waitForElement(DESKTOP_PLAYLIST_SELECTOR);
    let videos = playlist.getElementsByTagName(DESKTOP_PLAYLIST_VIDEO_SELECTOR);

    for (const video of videos) {
      this.addOpenButton(video);
      this.addedButtons++;
    }

    this.addVideosObserver(playlist, videos);
  }

  addOpenButton(video) {
    const menu = video.querySelector('#menu');

    const buttonElement = this.getButtonElement(this.getVideoLink(video));

    menu.insertAdjacentHTML('beforebegin', buttonElement);
  }

  getVideoLink(video) {
    return video.querySelector('#video-title').getAttribute('href').split('&list')[0];
  }

  addVideosObserver(playlist, videos) {
    let lastUrl = location.href;
    const self = this;

    const videosObserverCallback = function (mutations, observer) {
      mutations.forEach((mutation) => {
        const newUrl = location.href;

        if (mutation.addedNodes.length > 0 && videos.length > self.addedButtons) {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeName.toLowerCase() === DESKTOP_PLAYLIST_VIDEO_SELECTOR) self.addOpenButton(node);
          });
        }

        if (lastUrl !== newUrl && isPlaylistPage(newUrl)) {
          lastUrl = newUrl;
          self.updateButtonLinks(videos);
        }
      });
    };

    const videosObserver = new MutationObserver(videosObserverCallback);

    videosObserver.observe(playlist, {
      childList: true,
    });
  }

  updateButtonLinks(videos) {
    for (const video of videos) {
      video.querySelector(`.${CUSTOM_ELEMENT_CLASS_NAME}`).href = this.getVideoLink(video);
    }
  }

  getButtonElement(videoLink) {
    return `
    <a id="endpoint" class="${CUSTOM_ELEMENT_CLASS_NAME} yt-simple-endpoint style-scope ytd-button-renderer" tabindex="-1" href="${videoLink}" target="_blank">
      <yt-icon-button id="button" class="style-scope ytd-button-renderer style-default size-default">
        <!--css-build:shady-->
        <button id="button" class="style-scope yt-icon-button" style="color: var(--yt-spec-icon-inactive);">
          <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="currentColor" class="style-scope yt-icon">
            <path d="M0 0h24v24H0z" fill="none" />
            <path d="M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z" />
          </svg>
        </button>
        <yt-interaction id="interaction" class="circular style-scope yt-icon-button">
          <!--css-build:shady-->
          <div class="stroke style-scope yt-interaction"></div>
          <div class="fill style-scope yt-interaction"></div>
        </yt-interaction>
      </yt-icon-button>
    </a>
    `;
  }
}
