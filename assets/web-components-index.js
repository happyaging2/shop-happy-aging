class WordsChanger extends HTMLElement {
  connectedCallback() {
    let pointer = 0;
    setInterval(() => {
      const target = this.querySelector(".target-js");
      const words = this.dataset.words.split(",");
      target.innerHTML = words[pointer % words.length];
      pointer++;
    }, 1000);
  }
}

customElements.define("words-changer", WordsChanger);
