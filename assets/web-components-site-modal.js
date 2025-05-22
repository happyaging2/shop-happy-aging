/*
Site Modal
*/

class SiteModal extends HTMLElement {
  connectedCallback() {
    this.registerEvents();
    this.modal = this.querySelector(".modal");
  }

  openModal() {
    if (this.modal) {
      this.modal.classList.add("active");
    }
  }

  closeModal() {
    if (this.modal) {
      this.modal.classList.remove("active");
    }

    const videos = this.querySelectorAll("site-video");
    if (videos) {
      videos.forEach((video) => {
        video.pause();
      });
    }
  }

  registerEvents() {
    const opens = this.querySelectorAll(".modal-open");
    const closes = this.querySelectorAll(".modal-close");
    const triggerClass = this.dataset.trigger;
    const trigger = document.querySelector(triggerClass);

    if (trigger) {
      trigger.addEventListener("click", (e) => {
        this.openModal();
      });
    }

    Array.from(opens).forEach((open) => {
      open.addEventListener("click", (e) => {
        console.log("open");
        this.openModal();
      });
    });

    Array.from(closes).forEach((close) => {
      close.addEventListener("click", (e) => {
        this.closeModal();
      });
    });
  }
}

customElements.define("site-modal", SiteModal);
