/*
Floating CTA
*/

class FloatingCta extends HTMLElement {
  connectedCallback() {
    this.init();
  }

  init() {
    window.addEventListener("scroll", () => {
      if (window.scrollY > 800) {
        this.classList.add("active");
      } else {
        this.classList.remove("active");
      }
    });

    this.querySelector("button").addEventListener("click", () => {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    });
  }
}

customElements.define("floating-cta", FloatingCta);

