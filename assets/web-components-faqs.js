/*
FAQs
*/

class Faqs extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.renderAnswer();
    this.isTwoBar = this.dataset.twoBar;
  }

  removeActiveClassFromOtherElements(clickedContainer) {
    const containers = document.querySelectorAll(".faqs__item-container");
    containers.forEach((container) => {
      if (
        container !== clickedContainer &&
        container.classList.contains("active")
      ) {
        container.classList.remove("active");
        container.querySelector(".faqs__answer").style.maxHeight = "0";
        container.querySelector(".faqs__item-plus").classList.remove("hidden");
        container.querySelector(".faqs__item-minus").classList.add("hidden");
      }
    });
  }

  renderAnswer() {
    const question = this.querySelector(".faqs__item");
    const container = this.querySelector(".faqs__item-container");
    const answer = this.querySelector(".faqs__answer");
    const plus = this.querySelector(".faqs__item-plus");
    const minus = this.querySelector(".faqs__item-minus");

    question.addEventListener("click", () => {
      this.removeActiveClassFromOtherElements(container);
      container.classList.toggle("active");

      if (container.classList.contains("active")) {
        answer.style.maxHeight = answer.scrollHeight + "px";
        plus.classList.add("hidden");
        minus.classList.remove("hidden");

        if (this.isTwoBar == "true") {
          container.style.borderBottom = "4px solid #000";
        }
      } else {
        answer.style.maxHeight = "0";
        plus.classList.remove("hidden");
        minus.classList.add("hidden");

        if (this.isTwoBar == "true") {
          container.style.borderBottom = "hidden";
        }
      }
    });
  }
}

customElements.define("question-answer", Faqs);
