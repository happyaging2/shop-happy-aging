
/*
Site Video
*/

class SiteVideo extends HTMLElement {
  connectedCallback() {
    if (this.dataset.stopOnObserve === "true") {
      this.stopOnObserve();
    } else {
      this.startOnObserve();
    }

    this.playBtn = this.querySelector(".play-button-js");
    this.video = this.querySelector("video");

    if (this.playBtn) {
      this.playBtn.addEventListener("click", () => {
        this.video.play();
      });

      this.video.addEventListener("click", () => {
        if (this.video.paused) {
          this.video.play();
        } else {
          this.video.pause();
        }
      });

      this.video.addEventListener("ended", () => {
        this.playBtn.classList.add("hidden");
      });

      this.video.addEventListener("pause", () => {
        this.playBtn.classList.remove("hidden");
      });

      this.video.addEventListener("play", () => {
        this.playBtn.classList.add("hidden");
      });
    }
  }

  stopOnObserve() {
    if ("IntersectionObserver" in window) {
      const videoObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(function (video) {
          const $video = video.target;
          if (!video.isIntersecting) {
            $video.pause();
          }
        });
      });
      if (videoObserver) {
        videoObserver.observe(this.querySelector("video"));
      }
    }
  }

  startOnObserve() {
    if ("IntersectionObserver" in window) {
      const videoObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(function (video) {
          const $video = video.target;
          if (video.isIntersecting) {
            if ($video.readyState === 4) {
              $video.play();
            } else {
              [].slice.call($video.querySelectorAll("source")).forEach((source) => {
                if (source.dataset.src) {
                  source.src = source.dataset.src;
                }
              });
              $video.load();
            }
          } else {
            if (!$video.paused) {
              $video.pause();
            }
          }
        });
      });
      if (videoObserver) {
        videoObserver.observe(this.querySelector("video"));
      }
    }
  }

  play() {
    this.video.play();
  }

  pause() {
    this.video.pause();
  }
}

customElements.define("site-video", SiteVideo);

/*
Carousel Prev
*/

class CarouselPrev extends HTMLElement {
  constructor() {
    super();
    this.carousel = this.closest("site-carousel");
  }

  connectedCallback() {
    if (!this.carousel) {
      console.error("<carousel-prev> needs to be a child of <site-carousel>");
    }
    if (!this.querySelector("button")) {
      console.warn("You need to have a child button to go to previous!");
    }
    this.addEventListener("click", (e) => {
      this.carousel.previous();
    });
  }
}

customElements.define("carousel-prev", CarouselPrev);

/*
Carousel Next
*/

class CarouselNext extends HTMLElement {
  constructor() {
    super();
    this.carousel = this.closest("site-carousel");
  }

  connectedCallback() {
    if (!this.carousel) {
      console.error("<carousel-next> needs to be a child of <site-carousel>");
    }
    if (!this.querySelector("button")) {
      console.warn("You need to have a child button to go to next!");
    }
    this.addEventListener("click", (e) => {
      this.carousel.next();
    });
  }
}

customElements.define("carousel-next", CarouselNext);

/*
Carousel Pager
*/

class CarouselPager extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    const pagerButtons = Array.from(this.querySelectorAll("button"));
    const ingredientButtons = Array.from(this.querySelectorAll(".ingredient-button"));
    const selectElement = document.getElementById("select-ingredient");

    if (!pagerButtons.length > 1) {
      console.warn("No need for a pager with only one item!");
    }

    pagerButtons.forEach((pager, i) => {
      pager.addEventListener("click", (e) => {
        const carousel = e.target.closest("site-carousel");

        pagerButtons.forEach((button) => {
          button.classList.remove("active");
        });

        if (carousel) {
          carousel.slideTo(i);
        } else {
          console.error("<carousel-pager> needs to be a child of <site-carousel>");
        }
      });
    });

    const populateSelect = () => {
      ingredientButtons.forEach((button, index) => {
        const option = document.createElement("option");
        option.value = index;
        option.textContent = button.querySelector("p").textContent.toUpperCase();
        if (index === 0) {
          option.selected = true;
        }
        selectElement?.appendChild(option);
      });
    };

    if (selectElement) {
      selectElement.addEventListener("change", (event) => {
        const selectedIndex = event.target.value;
        const selectedButton = ingredientButtons[selectedIndex];
        if (selectedButton) {
          selectedButton.click();
        }
      });
    }

    populateSelect();
  }
}

customElements.define("carousel-pager", CarouselPager);

/*
 * Site Carousel
 */

class SiteCarousel extends HTMLElement {
  constructor() {
    super();
    this.swiper = null;
    setTimeout(() => {
      this.classList.remove("invisible");
      this.classList.remove("opacity-0");
    }, 400);
  }

  connectedCallback() {
    const config = this.dataset.config ? JSON.parse(this.dataset.config) : { slidesPerView: 3, spaceBetween: 20 };

    this.swiper = new Swiper(`#${this.dataset.id} .swiper`, config);
    this.fadeVideosCarouselEffect();

    this.handleSlideChange();
    this.refreshButtons();
  }

  fadeVideosCarouselEffect() {
    if (this.classList.contains("opacity-0")) {
      this.classList.remove("opacity-0");
    }
  }

  previous() {
    if (this.swiper) {
      this.swiper.slidePrev();
    }
  }

  next() {
    if (this.swiper) {
      this.swiper.slideNext();
    }
  }

  slideTo(i) {
    if (this.swiper) {
      this.swiper.slideTo(i);
    }
  }

  scrollToBullet(button) {
    if (button.dataset.disableScroll) return;
    button.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  }

  handleSlideChange() {
    // we can have multiple pagers in one carousel
    const pagers = Array.from(this.querySelectorAll("carousel-pager"));

    if (this.swiper) {
      this.swiper.on("slideChange", () => {
        const formatTwoDigits = (number) => (number < 10 ? `0${number}` : number);

        const carouselIndexEl = this.querySelector(".carousel-index");
        if (carouselIndexEl && carouselIndexEl.dataset.disableZero) {
          carouselIndexEl.innerHTML = this.swiper.realIndex + 1;
        } else if (carouselIndexEl) {
          carouselIndexEl.innerHTML = formatTwoDigits(this.swiper.realIndex + 1);
        }

        pagers.forEach((pager) => {
          const bullets = this.querySelectorAll(".carousel-bullet");
          const defaultBullets = this.querySelectorAll(".swiper-pagination-bullet");
          const buttons = pager.querySelectorAll("button");
          const nextPager = bullets[this.swiper.realIndex];
          const bulletsName = pager.querySelectorAll("p");
          const nextBulletName = bulletsName[this.swiper.realIndex];

          if (defaultBullets && defaultBullets.length > 0) {
            defaultBullets.forEach((bullet) => {
              bullet.classList.remove("swiper-pagination-bullet-active", "bg-black");
              defaultBullets[this.swiper.realIndex].classList.add("swiper-pagination-bullet-active", "bg-black");
            });
            return;
          }

          bullets.forEach((bullet) => bullet.classList.remove("active"));
          bulletsName.forEach((bulletName) => bulletName.classList.remove("active"));
          buttons.forEach((button) => button.addEventListener("click", () => this.scrollToBullet(button)));

          nextPager?.classList.add("active");
          nextBulletName && nextBulletName.classList.add("active");

          this.scrollToBullet(buttons[this.swiper.realIndex]);
        });

        this.dispatchEvent(
          new CustomEvent("slideChange", {
            detail: { index: this.swiper.realIndex },
          }),
        );
        this.refreshButtons();
      });
    }
  }

  refreshButtons() {
    const carouselNext = this.querySelector("carousel-next");
    const carouselPrev = this.querySelector("carousel-prev");
    if (carouselNext) {
      carouselNext.classList.remove("opacity-50");
      if (this.swiper.isEnd) {
        carouselNext.classList.add("opacity-50");
      }
    }
    if (carouselPrev) {
      carouselPrev.classList.remove("opacity-50");
      if (this.swiper.isBeginning) {
        carouselPrev.classList.add("opacity-50");
      }
    }
  }
}

customElements.define("site-carousel", SiteCarousel);

/*
Flyout Toggle
*/

class FlyoutToggle extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    if (!this.querySelector("button")) {
      console.warn("Flyout toggle component should have a button as a child!");
    }

    this.addEventListener("click", (e) => {
      const flyout = this.closest("site-flyout");
      if (flyout) {
        if (flyout.classList.contains("active")) {
          flyout.close();
        } else {
          flyout.open();
        }
      }
    });
  }
}

customElements.define("flyout-toggle", FlyoutToggle);

/*
Site Flyout
*/

class SiteFlyout extends HTMLElement {
  constructor() {
    super();
    this.flyout = null;
  }

  connectedCallback() {
    this.flyout = document.querySelector("site-flyout");
    this.loader = this.flyout.querySelector(".flyout-loader");
    this.target = this.flyout.querySelector(".flyout-target");
    this.content = this.flyout.querySelector(".flyout-content");
  }

  showLoader() {
    this.loader.classList.remove("hidden");
  }

  hideLoader() {
    this.loader.classList.add("hidden");
  }

  open() {
    document.body.style.overflow = "hidden";
    this.flyout.classList.add("active");
  }

  close() {
    document.body.removeAttribute("style");
    this.flyout.classList.remove("active");
    this.empty();
  }

  empty() {
    this.content.classList.remove("active");
    this.target.innerHTML = "";
  }

  render(html) {
    this.target.innerHTML = html;
    this.content.classList.add("active");
  }
}

customElements.define("site-flyout", SiteFlyout);

/*
Number Input
*/

class NumberInput extends HTMLElement {
  constructor() {
    super();
    this.input = this.querySelector("input");
    this.changeEvent = new Event("change", { bubbles: true });

    this.querySelectorAll("button").forEach((button) => button.addEventListener("click", this.onButtonClick.bind(this)));
  }

  onButtonClick(e) {
    e.preventDefault();
    const previousValue = this.input.value;
    const button = e.target.closest("button");

    if (button) {
      button.name === "increment" ? this.input.stepUp() : this.input.stepDown();

      if (previousValue !== this.input.value) {
        this.input.dispatchEvent(this.changeEvent);
      }
    }
  }
}

customElements.define("number-input", NumberInput);

/*
Newsletter Form
*/

class NewsletterForm extends HTMLElement {
  connectedCallback() {
    const listId = this.dataset.listId;

    this.addEventListener("submit", (e) => {
      e.preventDefault();
      const $form = this.querySelector("form");
      const $email = this.querySelector('[type="email"]');
      const $submit = this.querySelector('[type="submit"]');
      const $success = this.querySelector(".success");
      const $error = this.querySelector(".error");
      const submitText = $submit.innerHTML;
      const email = $form.email.value;
      const body = { email, listId };

      $submit.innerHTML = this.dataset.loadingText;
      $success.classList.add("hidden");
      $error.classList.add("hidden");

      const config = {
        body: JSON.stringify(body),
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: `application/json`,
        },
      };

      if (listId) {
        try {
          fetch("https://happy-aging-sls.vercel.app/api/subscribe", config)
            .then((res) => res.json())
            .then((data) => {
              $form.reset();
              $email.blur();
              $submit.innerHTML = submitText;
              $success.classList.remove("hidden");
            });
        } catch (e) {
          $submit.innerHTML = submitText;
          $error.classList.remove("hidden");
        }
      }
    });
  }
}

customElements.define("newsletter-form", NewsletterForm);

/*
Select Input
*/

class SelectInput extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    const select = this.querySelector("select");
    const input = select.closest(".text-input");
    if (select.value && input) {
      input.classList.add("active");
    }
    select.addEventListener("change", (e) => {
      this.setActiveValue(e.target.value);
      if (input) {
        input.classList.add("active");
      }
    });
  }

  setActiveValue(val) {
    const options = Array.from(this.querySelectorAll("option"));
    const activeOption = options.find((o) => o.value === val);
    const target = this.querySelector(".select-target");

    if (activeOption) {
      target.innerHTML = activeOption.innerHTML;
    }
  }
}

customElements.define("select-input", SelectInput);

/*
Site Marquee
*/

class SiteMarquee extends HTMLElement {
  constructor() {
    super();
    const duration = this.dataset.duration;
    const shadowRoot = this.attachShadow({ mode: "open" });
    shadowRoot.innerHTML = this.getInnerHTML();

    const width = this.querySelector('[slot="content"]').scrollWidth / 5;
    shadowRoot.innerHTML = this.getInnerHTML(width, duration);

    setTimeout(() => {
      this.classList.remove("opacity-0");
      this.classList.remove("invisible");
    }, 400);
  }

  getInnerHTML(width = 0, duration = "20s") {
    return `
      <style>
        ::slotted([slot="content"]) {
          display: grid;
          grid-auto-flow: column;
          align-items: center;
          height: 100%;
        }
        .marquee-list {
          display: grid;
          grid-auto-flow: column;
          align-items: center;
          white-space: nowrap;
          animation: marquee ${duration} linear infinite;
          height: 100%;
        }

        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-${width}px);
          }
        }
      </style>
      <div class="marquee-cont">
        <div class="marquee-list">
          <slot name="content"></slot>
        </div>
      </div>
    `;
  }
}

customElements.define("site-marquee", SiteMarquee);

/*
Vertical Marquee
*/

class VerticalMarquee extends HTMLElement {
  constructor() {
    super();
    const duration = this.dataset.duration;
    const shadowRoot = this.attachShadow({ mode: "open" });
    shadowRoot.innerHTML = this.getInnerHTML();

    const height = this.querySelector('[slot="content"]').scrollHeight / 5;
    console.log("h", height);

    shadowRoot.innerHTML = this.getInnerHTML(height, duration);

    setTimeout(() => {
      this.classList.remove("opacity-0");
      this.classList.remove("invisible");
    }, 400);
  }

  getInnerHTML(height = 0, duration = "20s") {
    return `
      <style>
        ::slotted([slot="content"]) {
          display: grid;
          grid-auto-flow: column;
          align-items: center;
          height: 100%;
        }
        .marquee-vertical-list {
          display: grid;
          grid-auto-flow: column;
          align-items: center;
          white-space: nowrap;
          animation: marqueeV ${duration} linear infinite;
          height: 100%;
        }

        @keyframes marqueeV {
          0% {
            transform: translateY(0);
          }
          100% {
            transform: translateY(-${height}px);
          }
        }
      </style>
      <div class="marquee-cont">
        <div class="marquee-vertical-list">
          <slot name="content"></slot>
        </div>
      </div>
    `;
  }
}

customElements.define("vertical-marquee", VerticalMarquee);

/*
Hover Media
*/

class HoverMedia extends HTMLElement {
  constructor() {
    super();
    this.image = this.querySelector("img");
    this.video = this.querySelector("video");
  }

  connectedCallback() {
    if (this.video) {
      this.addEventListener("mouseenter", (e) => {
        if (this.image) {
          this.image.style.opacity = 0;
        }
        this.video.currentTime = 0;
        this.video.play();
      });
      this.addEventListener("mouseleave", (e) => {
        if (this.image) {
          this.image.style.opacity = 1;
        }
        this.video.currentTime = 0;
        this.video.pause();
      });
    }
  }
}

customElements.define("hover-media", HoverMedia);

class InfoMediaSlider extends HTMLElement {
  constructor() {
    super();
    this.infoSlider = this.querySelector(".js-info-slider");
    this.mediaSlider = this.querySelector(".js-media-slider");
    this.visible = false;
  }

  connectedCallback() {
    this.startOnObserve();
    const slide = this.querySelector(`[data-slider-index="0`);
    if (slide) {
      const info = slide.querySelector(".js-slide-info");
      this.infoSlider.innerHTML = info.innerHTML;
    }
    this.mediaSlider.addEventListener("slideChange", (e) => {
      const slide = this.querySelector(`[data-slider-index="${e.detail.index}"]`);

      if (slide) {
        const info = slide.querySelector(".js-slide-info");
        this.infoSlider.innerHTML = info.innerHTML;
        this.playVideo(e.detail.index);
      }
    });
  }
  playVideo(index) {
    this.currentVideo = this.querySelector(`[data-slider-index="${index}"] video`);
    if (this.currentVideo) {
      this.videoPlayPromise = this.currentVideo.play();
      this.videoPlayPromise.then(() => {
        this.querySelectorAll("video").forEach((video) => {
          if (video != this.currentVideo) {
            video.pause();
            video.currentTime = 0;
          }
        });
      });
    }
  }

  startOnObserve() {
    if (this.querySelector("video") && "IntersectionObserver" in window) {
      const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach((element) => {
          const $video = element.target.querySelector("video");
          if (element.isIntersecting) {
            this.visible = true;
            if ($video.readyState === 4) {
              this.playVideo(0);
            } else {
              [].slice.call($video.querySelectorAll("source")).forEach((source) => {
                if (source.dataset.src) {
                  source.src = source.dataset.src;
                }
              });
              $video.load();
            }
          } else {
            if (!$video.paused) {
              $video.pause();
              $video.currentTime = 0;
            }
          }
        });
      });
      if (observer) {
        observer.observe(this);
      }
    }
  }
}

customElements.define("info-media-slider", InfoMediaSlider);



/*
Aside Content
*/

class AsideContent extends HTMLElement {
  constructor() {
    super();
  }
  connectedCallback() {
    this.asideContent = this.querySelectorAll(".aside-content");
    this.flyoutContent = this.querySelector(".flyout__content");
    this.buttons = document.querySelectorAll("button[data-index]");
    this.contents = document.querySelectorAll(".aside-content[data-index]");
    this.closeButton = this.querySelectorAll(".close-button-js");
    this.initButtons();
    this.initCloseButton();
    this.initDocumentClick();
    this.asideContent.forEach(aside => document.body.appendChild(aside));
  }
  initButtons() {
    this.buttons.forEach((button) => {
      button.addEventListener("click", () => {
        const index = button.getAttribute("data-index");
        const contentToShow = document.querySelector(
          `.aside-content[data-index="${index}"]`
        );
        this.contents.forEach((content) => {
          if (content !== contentToShow) {
            this.closeAsideContent();
          }
        });
        this.showContent(contentToShow);
      });
    });
  }
  initCloseButton() {
    if (this.closeButton) {
      this.closeButton.forEach((button) => {
        button.addEventListener("click", () => {
          this.closeAsideContent();
        });
      });
    }
  }
  initDocumentClick() {
    document.addEventListener("click", (event) => {
      if (
        !event.target.closest(".flyout__content") &&
        !event.target.closest("button[data-index]")
      ) {
        this.closeAsideContent();
      }
    });
    this.contents.forEach((content) => {
      content
        .querySelector(".flyout__content")
        .addEventListener("click", (event) => {
          event.stopPropagation();
        });
    });
  }
  showContent(content) {
    if (content) {
      content.classList.add("active");
      document.body.style.overflow = "hidden";
    }
  }
  closeAsideContent() {
    this.contents.forEach((content) => {
      content.classList.remove("active");
    });
    document.body.removeAttribute("style");
  }
}
customElements.define("aside-content", AsideContent);