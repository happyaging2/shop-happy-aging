class CartRemoveButton extends HTMLElement {
  constructor() {
    super();

    this.addEventListener("click", (event) => {
      event.preventDefault();
      const cartItems = this.closest("cart-items") || this.closest("cart-drawer-items");
      cartItems.updateQuantity(this.dataset.key, 0);
    });
  }
}

customElements.define("cart-remove-button", CartRemoveButton);

class CartItems extends HTMLElement {
  constructor() {
    super();
    this.lineItemStatusElement = document.getElementById("shopping-cart-line-item-status") || document.getElementById("CartDrawer-LineItemStatus");

    const debouncedOnChange = debounce((event) => {
      this.onChange(event);
    }, ON_CHANGE_DEBOUNCE_TIMER);

    this.addEventListener("change", debouncedOnChange.bind(this));
  }

  cartUpdateUnsubscriber = undefined;

  connectedCallback() {
    this.cartUpdateUnsubscriber = subscribe(PUB_SUB_EVENTS.cartUpdate, (event) => {
      if (event.source === "cart-items") {
        return;
      }
      this.onCartUpdate();
    });
  }

  disconnectedCallback() {
    if (this.cartUpdateUnsubscriber) {
      this.cartUpdateUnsubscriber();
    }
  }

  resetQuantityInput(id) {
    const input = this.querySelector(`#Quantity-${id}`);
    input.value = input.getAttribute("value");
    this.isEnterPressed = false;
  }

  setValidity(event, index, message) {
    event.target.setCustomValidity(message);
    event.target.reportValidity();
    this.resetQuantityInput(index);
    event.target.select();
  }

  validateQuantity(event) {
    const inputValue = parseInt(event.target.value);
    const key = event.target.dataset.key;
    let message = "";

    if (inputValue < event.target.dataset.min) {
      message = window.quickOrderListStrings.min_error.replace("[min]", event.target.dataset.min);
    } else if (inputValue > parseInt(event.target.max)) {
      message = window.quickOrderListStrings.max_error.replace("[max]", event.target.max);
    } else if (inputValue % parseInt(event.target.step) !== 0) {
      message = window.quickOrderListStrings.step_error.replace("[step]", event.target.step);
    }

    if (message) {
      this.setValidity(event, key, message);
    } else {
      event.target.setCustomValidity("");
      event.target.reportValidity();
      this.updateQuantity(key, inputValue, document.activeElement.getAttribute("name"), event.target.dataset.quantityVariantId);
    }
  }

  onChange(event) {
    this.validateQuantity(event);
  }

  onCartUpdate() {
    if (this.tagName === "CART-DRAWER-ITEMS") {
      fetch(`${routes.cart_url}?section_id=cart-drawer`)
        .then((response) => response.text())
        .then((responseText) => {
          const html = new DOMParser().parseFromString(responseText, "text/html");
          const selectors = ["cart-drawer-items", ".cart-drawer__footer"];
          for (const selector of selectors) {
            const targetElement = document.querySelector(selector);
            const sourceElement = html.querySelector(selector);
            if (targetElement && sourceElement) {
              targetElement.replaceWith(sourceElement);
            }
          }
          // Clear any errors on successful update
          const errors = document.getElementById("CartDrawer-CartErrors");
          if (errors) {
            errors.textContent = "";
            errors.classList.add("d-none");
          }
        })
        .catch((e) => {
          console.error(e);
          const errors = document.getElementById("CartDrawer-CartErrors");
          if (errors) {
            errors.textContent = window.cartStrings.error;
            // errors.classList.remove("d-none");
          }
        });
    } else {
      fetch(`${routes.cart_url}?section_id=main-cart-items`)
        .then((response) => response.text())
        .then((responseText) => {
          const html = new DOMParser().parseFromString(responseText, "text/html");
          const sourceQty = html.querySelector("cart-items");
          this.innerHTML = sourceQty.innerHTML;
          // Clear any errors on successful update
          const errors = document.getElementById("cart-errors");
          if (errors) {
            errors.textContent = "";
            errors.classList.add("d-none");
          }
        })
        .catch((e) => {
          console.error(e);
          const errors = document.getElementById("cart-errors");
          if (errors) {
            errors.textContent = window.cartStrings.error;
            errors.classList.remove("d-none");
          }
        });
    }
  }

  getSectionsToRender() {
    return [
      {
        id: "main-cart-items",
        section: document.getElementById("main-cart-items").dataset.id,
        selector: ".js-contents",
      },
      {
        id: "cart-icon-bubble",
        section: "cart-icon-bubble",
        selector: ".shopify-section",
      },
      {
        id: "cart-live-region-text",
        section: "cart-live-region-text",
        selector: ".shopify-section",
      },
      {
        id: "main-cart-footer",
        section: document.getElementById("main-cart-footer").dataset.id,
        selector: ".js-contents",
      },
    ];
  }

  async updateQuantity(key, quantity, name, variantId) {
    this.enableLoading(key);

    try {
      const cartResponse = await fetch(`${routes.cart_url}.js`);
      const cart = await cartResponse.json();
      const currentItem = cart.items.find((item) => item.key === key);

      if (quantity === 0 && currentItem?.properties?._kit_id) {
        const result = await this.handleKitRemoval(cart, currentItem.properties._kit_id);
        if (!result) {
          this.handleError();
        }
        return;
      }

      await this.updateCartItems(
        {
          updates: { [key]: quantity },
          sections: this.getSectionsToRender().map((section) => section.section),
          sections_url: window.location.pathname,
        },
        name,
        variantId,
      );
    } catch (error) {
      this.handleError();
    } finally {
      this.disableLoading(key);
    }
  }

  async handleKitRemoval(cart, kitId) {
    const updates = {};
    cart.items.forEach((item) => {
      if (item.properties?._kit_id === kitId) {
        updates[item.key] = 0;
      }
    });

    if (Object.keys(updates).length > 0) {
      try {
        const response = await fetch(routes.cart_update_url, {
          ...fetchConfig(),
          body: JSON.stringify({
            updates,
            sections: this.getSectionsToRender().map((section) => section.section),
            sections_url: window.location.pathname,
          }),
        });

        const state = await response.text();
        const parsedState = JSON.parse(state);

        if (!response.ok || parsedState.errors) {
          const errors = document.getElementById("cart-errors") || document.getElementById("CartDrawer-CartErrors");
          if (errors) {
            errors.textContent = parsedState.errors || window.cartStrings.error;
            // errors.classList.remove("d-none"); // Remove d-none class to show error
          }
          return false;
        }

        // Clear any existing errors
        const errors = document.getElementById("cart-errors") || document.getElementById("CartDrawer-CartErrors");
        if (errors) {
          errors.textContent = "";
          errors.classList.add("d-none"); // Add d-none class to hide error
        }

        this.updateCartUI(parsedState, null, null, null);
        return true;
      } catch (error) {
        return false;
      }
    }
    return true;
  }

  async updateCartItems(body, name, variantId) {
    try {
      const response = await fetch(routes.cart_update_url, {
        ...fetchConfig(),
        body: JSON.stringify(body),
      });

      const state = await response.text();
      const parsedState = JSON.parse(state);

      // Always clear existing errors first
      const errors = document.getElementById("cart-errors") || document.getElementById("CartDrawer-CartErrors");
      if (errors) {
        errors.textContent = "";
        errors.classList.add("d-none");
      }

      if (!response.ok || parsedState.errors) {
        if (errors) {
          errors.textContent = parsedState.errors || window.cartStrings.error;
          // errors.classList.remove("d-none");
        }
        return;
      }

      this.updateCartUI(parsedState, name, variantId);
    } catch (error) {
      this.handleError();
    }
  }

  updateCartUI(parsedState, name, variantId) {
    this.classList.toggle("is-empty", parsedState.item_count === 0);
    const cartDrawerWrapper = document.querySelector("cart-drawer");
    const cartFooter = document.getElementById("main-cart-footer");

    if (cartFooter) cartFooter.classList.toggle("is-empty", parsedState.item_count === 0);
    if (cartDrawerWrapper) cartDrawerWrapper.classList.toggle("is-empty", parsedState.item_count === 0);

    this.getSectionsToRender().forEach((section) => {
      const elementToReplace = document.getElementById(section.id).querySelector(section.selector) || document.getElementById(section.id);
      elementToReplace.innerHTML = this.getSectionInnerHTML(parsedState.sections[section.section], section.selector);
    });

    if (cartDrawerWrapper) {
      if (parsedState.item_count === 0) {
        trapFocus(cartDrawerWrapper.querySelector(".drawer__inner-empty"), cartDrawerWrapper.querySelector("a"));
      } else if (name) {
        trapFocus(cartDrawerWrapper, document.querySelector(`[name="${name}"]`));
      } else {
        trapFocus(cartDrawerWrapper, document.querySelector(".cart-item__name"));
      }
    }

    publish(PUB_SUB_EVENTS.cartUpdate, { source: "cart-items", cartData: parsedState, variantId });
  }

  handleError() {
    const errors = document.getElementById("cart-errors") || document.getElementById("CartDrawer-CartErrors");
    if (errors) {
      errors.textContent = window.cartStrings.error;
      // errors.classList.remove("d-none");
    }
    this.updateLiveRegions(window.cartStrings.error);
  }

  updateLiveRegions(message) {
    this.lineItemStatusElement.setAttribute("aria-hidden", true);
    const cartStatus = document.getElementById("cart-live-region-text") || document.getElementById("CartDrawer-LiveRegionText");
    cartStatus.setAttribute("aria-hidden", false);
    cartStatus.textContent = message;

    setTimeout(() => {
      cartStatus.setAttribute("aria-hidden", true);
    }, 1000);
  }

  getSectionInnerHTML(html, selector) {
    return new DOMParser().parseFromString(html, "text/html").querySelector(selector).innerHTML;
  }

  enableLoading(key) {
    const mainCartItems = document.getElementById("main-cart-items") || document.getElementById("CartDrawer-CartItems");
    mainCartItems.classList.add("cart__items--disabled");

    const cartItemElements = this.querySelectorAll(`[data-key="${key}"] .loading__spinner`);
    cartItemElements.forEach((overlay) => overlay.classList.remove("hidden"));

    document.activeElement.blur();
    this.lineItemStatusElement.setAttribute("aria-hidden", false);
  }

  disableLoading(key) {
    const mainCartItems = document.getElementById("main-cart-items") || document.getElementById("CartDrawer-CartItems");
    mainCartItems.classList.remove("cart__items--disabled");

    const cartItemElements = this.querySelectorAll(`[data-key="${key}"] .loading__spinner`);
    cartItemElements.forEach((overlay) => overlay.classList.add("hidden"));
  }
}

customElements.define("cart-items", CartItems);

if (!customElements.get("cart-note")) {
  customElements.define(
    "cart-note",
    class CartNote extends HTMLElement {
      constructor() {
        super();

        this.addEventListener(
          "input",
          debounce((event) => {
            const body = JSON.stringify({ note: event.target.value });
            fetch(`${routes.cart_update_url}`, { ...fetchConfig(), ...{ body } });
          }, ON_CHANGE_DEBOUNCE_TIMER),
        );
      }
    },
  );
}
