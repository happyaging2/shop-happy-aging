class LoginForm extends HTMLElement {
  constructor() {
    super();
    this.loginForm = null;
    this.recoverForm = null;
  }

  connectedCallback() {
    this.loginForm = this.querySelector(".login-form");
    this.recoverForm = this.querySelector(".recover-form");

    if (window.location.href.includes("#recover")) {
      this.handleRecover();
    }

    const recoverBtn = this.querySelector(".recover-button");
    const closeBtn = this.querySelector(".close-button");
    recoverBtn.addEventListener("click", () => {
      this.handleRecover();
    });
    closeBtn.addEventListener("click", () => {
      this.handleBackToLogin();
    });
  }

  handleBackToLogin() {
    this.recoverForm.style.display = "none";
    this.loginForm.style.display = "grid";
    this.querySelectorAll("[data-login]").forEach((el) => {
      el.innerHTML = el.dataset.login;
    });
  }

  handleRecover() {
    this.recoverForm.style.display = "grid";
    this.loginForm.style.display = "none";
    this.querySelectorAll("[data-recover]").forEach((el) => {
      el.innerHTML = el.dataset.recover;
    });
  }
}

customElements.define("login-form", LoginForm);

/*
Settings Selector
*/

class SettingSelector extends HTMLElement {
  constructor() {
    super();
    this.bioTestForm = null;
  }

  connectedCallback() {
    this.bioTestForm = this.querySelector(
      '.setting-container[data-setting="bio-age-test"]'
    );
    this.bioTestButton = this.querySelector(
      '.setting-option[data-setting="bio-age-test"]'
    );

    if (!this.bioTestForm || !this.bioTestButton) {
      return;
    }

    // if (window.location.href.includes("#bio-test")) {
    //   this.bioTestButton.dispatchEvent(new Event("click", { bubbles: true }));
    // }

    this.setupSelectors();
  }

  setupSelectors() {
    const options = this.querySelectorAll(".setting-option");
    const containers = this.querySelectorAll(".setting-container");
    const dropdown = this.querySelector(".m-dropdown");

    let clickCount = 1;

    if (window.innerWidth < 700) {
      options.forEach((option) => {
        option.classList.add("m-hold");
      });

      dropdown.addEventListener("click", (e) => {
        clickCount++;
        if (clickCount > 1) {
          if (
            !dropdown.classList.contains("m-full") &&
            e.target.tagName != "BUTTON" &&
            e.target.tagName != "SPAN"
          ) {
            console.log(e.target.tagName);
            dropdown.classList.add("m-full");
            options.forEach((option) => {
              option.classList.remove("m-hold");
            });
          } else if (
            e.target.tagName != "BUTTON" &&
            e.target.tagName != "SPAN"
          ) {
            console.log(e.target.tagName, 2);
            dropdown.classList.remove("m-full");
            options.forEach((option) => {
              option.classList.add("m-hold");
            });
          } else if (
            (e.target.tagName == "BUTTON" || e.target.tagName == "SPAN") &&
            !dropdown.classList.contains("m-full")
          ) {
            console.log(e.target.tagName, 3);
            dropdown.classList.add("m-full");
            options.forEach((option) => {
              option.classList.add("m-hold");
              setTimeout(() => {
                option.classList.remove("m-hold");
              }, 100);
            });
          }
        }
      });
    }

    this.addEventListener("click", (e) => {
      const button = e.target.closest("button");
      if (button && button.matches(".setting-option:not(.m-hold)")) {
        const setting = button.dataset.setting;

        options.forEach((option) => option.classList.remove("active"));
        button.classList.add("active");

        containers.forEach((cont) => cont.classList.add("d-none"));
        this.querySelector(`div[data-setting="${setting}"]`).classList.remove(
          "d-none"
        );

        if (window.innerWidth < 700) {
          dropdown.classList.remove("m-full");
          options.forEach((option) => {
            option.classList.add("m-hold");
          });
        }
      }
    });
  }
}
customElements.define("setting-selector", SettingSelector);

/*
Reset Password
*/

class ResetPassword extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.addEventListener("click", (e) => {
      e.preventDefault();
      this.handleReset();
    });
  }

  handleReset() {
    fetch("/account/logout", {
      method: "GET",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }).then((response) => {
      if (response.ok) {
        window.location.href = "/account/login#recover";
      }
    });
  }
}

customElements.define("reset-password", ResetPassword);

/*
Country Select
*/

class CountrySelect extends SelectInput {
  constructor() {
    super();
    this.select = null;
    this.activeOption = null;
  }

  connectedCallback() {
    this.select = this.querySelector("select");
    const active = this.dataset.active;

    if (active) {
      this.setActiveValue(active);
    }

    this.select.addEventListener("change", (e) => {
      const provinceSelect = document.querySelector("province-select");

      this.setActiveValue(e.target.value);
      provinceSelect.renderOptions();
    });
  }

  setActiveValue(val) {
    const textInput = this.closest(".text-input");
    const provinceSelect = document.querySelector("province-select");
    const target = this.querySelector(".select-target");
    const options = Array.from(this.querySelectorAll("option"));

    textInput.classList.add("active");

    this.activeOption = options.find((o) => o.value === val);

    if (this.activeOption) {
      this.select.value = this.activeOption.value;
      target.innerHTML = this.activeOption.value;
    }
  }
}

customElements.define("country-select", CountrySelect);

/*
Province Select
*/

class ProvinceSelect extends SelectInput {
  constructor() {
    super();
    this.select = null;
    this.target = null;
  }

  connectedCallback() {
    this.select = this.querySelector("select");
    this.target = this.querySelector(".select-target");
    this.renderOptions();
    this.setActive();
  }

  renderOptions() {
    const countrySelect = document.querySelector("country-select");
    let provinces = [];

    try {
      provinces = JSON.parse(countrySelect.activeOption.dataset.provinces);
    } catch (error) {}

    this.select.innerHTML = "";
    this.target.innerHTML = "";

    if (provinces.length > 0) {
      this.select.required = true;
      this.style.display = "block";

      provinces.forEach((province) => {
        const option = document.createElement("option");
        option.value = province[0];
        option.innerHTML = province[1];
        this.select.appendChild(option);
      });
    } else {
      this.select.required = false;
      this.style.display = "none";
    }
  }

  setActive() {
    const active = this.dataset.active;
    if (active) {
      this.target.innerHTML = active;
      this.select.value = active;
    }
  }
}

customElements.define("province-select", ProvinceSelect);
