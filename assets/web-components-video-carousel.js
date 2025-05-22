/*
Video Carousel
*/

class VideoCarousel extends HTMLElement {
  constructor() {
    super();
    this.siteVideoEls = null;
    this.onVideoStateChange = this.onVideoStateChange.bind(this);
  }

  connectedCallback() {
    this.siteVideoEls = this.querySelectorAll("site-video video");

    this.siteVideoEls.forEach((siteVideoEl) => {
      siteVideoEl.addEventListener("play", this.onVideoStateChange);
    });
  }

  onVideoStateChange(event) {
    const currentVideo = event.target;
    this.siteVideoEls.forEach((siteVideoEl) => {
      if (siteVideoEl !== currentVideo) {
        siteVideoEl.pause();
      }
      currentVideo.play();
    });
  }
}

customElements.define("video-carousel", VideoCarousel);
