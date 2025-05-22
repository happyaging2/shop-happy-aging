/*
Wines Scroll
*/

class WinesScroll extends HTMLElement {
  constructor() {
    super();
    this.handleScroll = this.handleScroll.bind(this);
  }

  connectedCallback() {
    this.wineElements = this.querySelectorAll(".wine .wine--fill");
    this.scrollContainer = this.querySelector(".wine-container");
    this.activationPoints = Array.from(this.wineElements).map((_, index) => {
      return this.scrollContainer.offsetTop + index * 10;
    });

    this.handleScroll();
    window.addEventListener("scroll", this.handleScroll);
  }

  handleScroll() {
    const scrollPosition = window.scrollY + window.innerHeight;
    this.wineElements.forEach((fillElement, index) => {
      if (scrollPosition > this.activationPoints[index]) {
        fillElement.classList.add("active");
      }
    });
  }

  disconnectedCallback() {
    window.removeEventListener("scroll", this.handleScroll);
  }
}

customElements.define("wines-scroll", WinesScroll);
