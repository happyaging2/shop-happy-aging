/*
Product Form
*/

class ProductFormV1 extends HTMLElement {
  constructor() {
    super();
    this.cadence = "subscription";
    this.variantInput = null;
    this.planInput = null;
  }

  connectedCallback() {
    const variantsJson = document.getElementById("product-variants").innerText;

    this.variants = JSON.parse(variantsJson);
    this.variantId = this.variants[0].variantId;
    this.planId = this.variants[0].planId;
    this.planInput = this.querySelector('input[name="selling_plan"]');
    this.variantInput = this.querySelector('input[name="id"]');

    if (this.planId) {
      if (this.planInput) this.planInput.value = this.planId;
    } else {
      if (this.planInput) this.planInput.value = "";
    }
    this.variantInput.value = this.variantId;
  }

  setPlan(planId) {
    if (this.cadence === "subscription") {
      this.planId = planId;
      if (this.planInput) this.planInput.value = planId;
    } else {
      this.planId = null;
      if (this.planInput) this.planInput.value = "";
    }

    this.updateAtcPrice();
  }

  updateAtcPrice() {
    const variant = this.variants.find(
      (v) => v.variantId === Number(this.variantId)
    );
    
    const atcPrices = document.querySelectorAll(".atc-price");
    const price = this.planId ? variant.planPrice : variant.variantPrice;
    const finalPrice = this.fmtPrice(price);

    atcPrices.forEach((atcPrice) => {
      atcPrice.innerText = finalPrice;
    });
  }

  fmtPrice(price) {
    const variantPrice = price / 100;
    const formatter = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: Shopify.currency.active,
    });
    return formatter.format(variantPrice).replace(/\.00$/, "");
  }

  setVariant(variantId) {
    this.variantId = variantId;
    this.variantInput.value = variantId;
  }
}

customElements.define("product-form-v1", ProductFormV1);

/*
Variant Selector
*/

class VariantSelector extends HTMLElement {
  connectedCallback() {
    this.addEventListener("click", (e) => {
      const button = e.target.closest("button");
      const title = button.dataset.variantTitle;

      this.updateButtonStyles(button);
      this.updateVariantDivs(title);
      this.updateProductForm(button);
    });
  }

  updateProductForm(button) {
    const variantId = button.dataset.variantId;
    const planId = button.dataset.sellingPlanId;
    const productForm = button.closest("product-form-v1");

    productForm.setVariant(variantId);
    productForm.setPlan(planId);
  }

  updateButtonStyles(activeButton) {
    this.querySelectorAll("button").forEach((button) => {
      button.classList.remove("!opacity-100");
    });
    activeButton.classList.add("!opacity-100");
  }

  updateVariantDivs(title) {
    document.querySelectorAll("div[data-variant-title]").forEach((div) => {
      div.classList.toggle("!hidden", div.dataset.variantTitle !== title);
    });
  }
}

customElements.define("variant-selector", VariantSelector);

/*
Cadence Selector
*/

class CadenceSelector extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.addEventListener("click", (e) => {
      const button = e.target.closest("button");
      const parentBox = button.parentElement;
      const productForm = button.closest("product-form-v1");

      productForm.cadence = button.dataset.cadence;

      const variantId = productForm.variantId;
      const match = productForm.querySelector(
        `[data-variant-id="${variantId}"]`
      );
      if (match) {
        const planId = match.dataset.sellingPlanId;
        productForm.setPlan(planId);
      }

      this.hideValueProps();
      this.resetButtons();
      this.activateSelected(parentBox, button);
    });
  }

  hideValueProps() {
    this.querySelectorAll(".value-props").forEach((vp) => {
      vp.classList.add("!hidden");
    });
  }

  resetButtons() {
    this.querySelectorAll("button").forEach((button) => {
      button.parentElement.classList.remove("!border-black");
      button.querySelector(".bg-transparent").classList.remove("!bg-black");
    });
  }

  activateSelected(parentBox, button) {
    parentBox.classList.add("!border-black");
    parentBox.querySelector(".value-props").classList.remove("!hidden");
    button.querySelector(".bg-transparent").classList.add("!bg-black");
  }
}

customElements.define("cadence-selector", CadenceSelector);

/*
Label Width Equalizer
*/

class LabelWidthEqualizer extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    const labels = Array.from(this.querySelectorAll('label[id^="Option-"]'));
    if (labels.length === 0) return;

    let maxWidth = 0;
    labels.forEach((label) => {
      const labelWidth = label.offsetWidth;
      if (labelWidth > maxWidth) {
        maxWidth = labelWidth;
      }
    });

    labels.forEach((label) => {
      label.parentElement.style.gridTemplateColumns = `${maxWidth}px 1fr`;
    });
  }
}

customElements.define("label-width-equalizer", LabelWidthEqualizer);

/*
Product Form
*/

class StandardForm extends HTMLElement {
  constructor() {
    super();
    this.variants = [];
    this.activeVariant = null;
  }

  connectedCallback() {
    this.loadVariants();
    this.redirectToFirstVariant();
    this.updateOptionInputs(this.activeVariant);
    this.updatePrices(this.activeVariant);
    this.attachListeners();

    window.addEventListener("popstate", () => this.onPopState());
  }

  onPopState() {
    const url = new URL(window.location.href);
    const variantId = url.searchParams.get("variant");

    if (variantId) {
      const matchedVariant = this.variants.find(
        (variant) => variant.id === parseInt(variantId, 10)
      );

      if (matchedVariant) {
        this.activeVariant = matchedVariant;
        this.updateOptionInputs(this.activeVariant);
        this.updatePrices(this.activeVariant);
      }
    }
  }

  updatePrices(variant) {
    if (!variant) return;

    this.querySelectorAll(".price").forEach((priceElement) => {
      priceElement.textContent = `$${variant.price / 100}`;
    });

    this.querySelectorAll(".compare-at-price").forEach(
      (comparePriceElement) => {
        comparePriceElement.textContent = variant.compare_at_price
          ? `$${variant.compare_at_price / 100}`
          : "";
      }
    );
  }

  loadVariants() {
    const jsonScript = this.querySelector('script[type="application/json"]');
    if (jsonScript) {
      this.variants = JSON.parse(jsonScript.textContent);

      const url = new URL(window.location.href);
      const variantId = url.searchParams.get("variant");

      this.activeVariant = variantId
        ? this.variants.find(
            (variant) => variant.id === parseInt(variantId, 10)
          )
        : this.variants.find((variant) => variant.available);

      if (!this.activeVariant || !this.activeVariant.available) {
        this.activeVariant = this.variants.find((variant) => variant.available);
      }
    }
  }

  redirectToFirstVariant() {
    const url = new URL(window.location.href);
    if (!url.searchParams.has("variant") && this.activeVariant) {
      url.searchParams.set("variant", this.activeVariant.id);
      window.location.replace(url.toString());
    }
  }

  updateOptionInputs(variant) {
    if (!variant) return;

    if (variant.available) {
      this.querySelector(".available").classList.remove("hidden");
      this.querySelector(".not-available").classList.add("hidden");
    } else {
      this.querySelector(".available").classList.add("hidden");
      this.querySelector(".not-available").classList.remove("hidden");
    }

    variant.options.forEach((value, index) => {
      const radioInput = this.querySelector(
        `input[type="radio"][name="option${index + 1}"][value="${value}"]`
      );

      if (radioInput) {
        radioInput.checked = true;

        const selector = radioInput.closest("color-selector");
        const colors = selector.querySelectorAll(".color");
        colors.forEach((color) => color.classList.remove("active"));
        radioInput.nextElementSibling.classList.add("active");
      }

      const selectInput = this.querySelector(
        `select[name="option${index + 1}"]`
      );
      if (selectInput) {
        selectInput.value = value;
        selectInput.parentElement.querySelector(".select-target").innerText =
          value;
      }
    });

    const variantInput = this.querySelector('input[name="id"]');
    if (variantInput) variantInput.value = variant.id;
  }

  attachListeners() {
    this.querySelectorAll('input[type="radio"], select').forEach((input) => {
      input.addEventListener("change", (event) => this.onOptionChange(event));
    });
  }

  onOptionChange(event) {
    const selectedOptions = this.getSelectedOptions();
    const matchedVariant = this.findMatchingVariant(selectedOptions);

    this.updateOptionInputs(matchedVariant);
    this.updatePrices(matchedVariant);

    if (matchedVariant) {
      this.updateVariantSelection(matchedVariant);
      this.updateURL(matchedVariant);
    }
  }

  getSelectedOptions() {
    const options = {};
    this.querySelectorAll('input[type="radio"]:checked, select').forEach(
      (input) => {
        options[input.name] = input.value;
      }
    );
    return options;
  }

  findMatchingVariant(selectedOptions) {
    return this.variants.find((variant) =>
      Object.keys(selectedOptions).every((key) =>
        variant.options.includes(selectedOptions[key])
      )
    );
  }

  updateVariantSelection(variant) {
    const variantInput = this.querySelector('input[name="id"]');
    if (variantInput) variantInput.value = variant.id;
  }

  updateURL(variant) {
    const url = new URL(window.location.href);
    url.searchParams.set("variant", variant.id);
    window.history.pushState(null, "", url.toString());
  }
}

customElements.define("standard-form", StandardForm);
