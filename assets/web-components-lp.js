/*
LP Subscribe
*/

class LPSubscribe extends HTMLElement {
  connectedCallback() {
    this.listId = this.dataset.klaviyoListId;
    this.form = this.querySelector("form");
    this.form.addEventListener("submit", (e) => {
      e.preventDefault();
      this.submitForm(e);
    });
  }

  async submitForm(e) {
    const email = this.form.querySelector('[type="email"]');
    const firstName = this.form.querySelector('[name="first_name"]');
    const phone = this.form.querySelector('[name="phone"]');
    const submit = this.form.querySelector('[type="submit"]');
    const submitText = submit.innerHTML;

    submit.innerHTML = "Submitting...";

    const body = {
      email: email.value,
      phone: phone.value,
      firstName: firstName.value,
      listId: this.listId,
    };

    const config = {
      body: JSON.stringify(body),
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: `application/json`,
      },
    };

    if (this.listId) {
      try {
        fetch(
          "https://happy-aging-sls.vercel.app/api/lp-subscribe",
          config
        )
          .then((res) => res.json())
          .then((data) => {
            this.form.reset();
            submit.innerHTML = submitText;
            this.querySelector(".success").classList.remove("hidden");
          });
      } catch (e) {
        console.log(e.message);
      }
    }
  }
}

customElements.define("lp-subscribe", LPSubscribe);

/*
Phone Input
*/

class PhoneInput extends HTMLElement {
  constructor() {
    super();
    const overlay = document.createElement("div");
    overlay.className = "overlay";
    this.overlay = overlay;
  }

  connectedCallback() {
    this.input = this.querySelector('input[type="tel"]');
    if (this.input) {
      this.input.addEventListener("input", this.onInput.bind(this));
      this.input.addEventListener("keydown", this.onKeyDown.bind(this));
      this.appendChild(this.overlay);
      this.onInput();
    }
  }

  onInput() {
    const rawValue = this.input.value.replace(/\D/g, "");

    let formattedValue = "";
    if (rawValue.length > 0) {
      formattedValue += "(" + rawValue.substring(0, 3);
    }
    if (rawValue.length > 3) {
      formattedValue += ") " + rawValue.substring(3, 6);
    }
    if (rawValue.length > 6) {
      formattedValue += "-" + rawValue.substring(6, 10);
    }

    this.input.value = formattedValue;
  }

  onKeyDown(event) {
    if (!this.isValidKey(event)) {
      event.preventDefault();
    }
  }

  isValidKey(event) {
    const validKeys = [
      "Backspace",
      "ArrowLeft",
      "ArrowRight",
      "ArrowUp",
      "ArrowDown",
      "Tab",
      "Delete",
    ];

    if (validKeys.includes(event.key)) {
      return true;
    }

    return /^[0-9]$/.test(event.key);
  }
}

customElements.define("phone-input", PhoneInput);
