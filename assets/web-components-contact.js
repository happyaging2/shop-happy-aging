/*
Contact Form
*/

class ContactForm extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.addEventListener("submit", (e) => {
      e.preventDefault();

      const form = e.target;
      const submit = form.querySelector('[type="submit"]');
      const consent = form.querySelector('[type="checkbox"]');
      const email = form.querySelector('[type="email"]').value;
      const listId = this.dataset.listId;
      const body = { email, listId };
      const config = {
        body: JSON.stringify(body),
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: `application/json`,
        },
      };

      submit.innerHTML = "Submitting...";

      if (consent.checked) {
        try {
          fetch(
            "https://happy-aging-sls.vercel.app/api/subscribe",
            config
          )
            .then((res) => res.json())
            .then((data) => {
              form.submit();
            });
        } catch (e) {
          alert("Error submitting the contact form");
        }
      } else {
        form.submit();
      }
    });
  }
}

customElements.define("contact-form", ContactForm);
