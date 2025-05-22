/*
  Product Form
*/

class ProductForm extends HTMLElement {
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

    this.planInput.value = this.planId;
    this.variantInput.value = this.variantId;
  }

  setPlan(planId) {
    if (this.cadence === "subscription") {
      this.planId = planId;
      this.planInput.value = planId;
    } else {
      this.planId = null;
      this.planInput.value = "";
    }

    this.updateAtcPrice();
  }

  updateAtcPrice() {
    const variant = this.variants.find(
      (v) => v.variantId === Number(this.variantId)
    );
    const atcPrices = document.querySelector(".atc-price");
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

customElements.define("product-form", ProductForm);

/*
  Variant Selector
*/

class VariantSelector extends HTMLElement {
  connectedCallback() {
    this.productForm = this.closest("product-form");
    this.addEventListener("click", (e) => {
      const button = e.target.closest("button");

      if (button) {
        const variantId = button.dataset.variantId;

        this.hideValueProps();
        this.removeActiveVariant();

        this.productForm
          .querySelectorAll(`[data-variant-id="${variantId}"]`)
          .forEach((el) => {
            el.parentElement
              .querySelector(".value-props")
              .classList.remove("!hidden");
            el.querySelector(".bg-transparent").classList.add("!bg-black");
          });

        this.updateProductForm(button);
      }
    });
  }

  updateProductForm(button) {
    const variantId = button.dataset.variantId;
    const planId = button.dataset.sellingPlanId;
    const productForm = button.closest("product-form");

    productForm.setVariant(variantId);
    productForm.setPlan(planId);
  }

  removeActiveVariant() {
    this.querySelectorAll(".bg-transparent").forEach((el) => {
      el.classList.remove("!bg-black");
    });
  }

  hideValueProps() {
    this.querySelectorAll(".value-props").forEach((vp) => {
      vp.classList.add("!hidden");
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
    this.productForm = this.closest("product-form");
    this.addEventListener("click", (e) => this.handleClick(e));
  }

  handleClick(e) {
    const button = e.target.closest("button");
    if (!button) return;

    const cadence = button.dataset.cadence;

    this.updateProductForm(cadence);
    this.updateButtonStyles(button);
    this.updateCadenceDisplay(cadence);
  }

  updateProductForm(cadence) {
    this.productForm.cadence = cadence;

    const variantId = this.productForm.variantId;
    const matchedVariant = this.productForm.querySelector(
      `[data-variant-id="${variantId}"]`
    );

    if (matchedVariant) {
      const planId = matchedVariant.dataset.sellingPlanId;
      console.log(matchedVariant);
      this.productForm.setPlan(planId);
    }
  }

  updateButtonStyles(activeButton) {
    this.querySelectorAll("button").forEach((button) => {
      button.classList.remove("!border-black");
    });
    activeButton.classList.add("!border-black");
  }

  updateCadenceDisplay(cadence) {
    document.querySelectorAll("div[data-cadence]").forEach((el) => {
      el.classList.add("!hidden");
    });

    const match = document.querySelector(`div[data-cadence="${cadence}"]`);
    if (!match) return;

    match.classList.remove("!hidden");
  }
}

customElements.define("cadence-selector", CadenceSelector);
