/*
Subscription Widget
*/

class SubscriptionWidget extends HTMLElement {
  constructor() {
    super();
    this.state = {
      cadence: null,
      quantity: 1,
      selectedPlanId: null,
      timestamp: null,
    };

    this.elements = {
      form: this.closest("form"),
      inputs: {
        quantity: this.querySelector('input[name="quantity"]'),
        sellingPlan: this.querySelector('input[name="selling_plan"]'),
        timestamp: this.querySelector(".js-prop-timestamp"),
        supply: this.querySelector('input[name="properties[Supply]"]'),
        bundleItems: {
          0: {
            id: this.querySelector('input[name="items[0][id]"]'),
            quantity: this.querySelector('input[name="items[0][quantity]"]'),
            sellingPlan: this.querySelector('input[name="items[0][selling_plan]"]'),
            kitId: this.querySelector('input[name="items[0][properties][_kit_id]"]'),
          },
          1: {
            id: this.querySelector('input[name="items[1][id]"]'),
            quantity: this.querySelector('input[name="items[1][quantity]"]'),
            sellingPlan: this.querySelector('input[name="items[1][selling_plan]"]'),
            kitId: this.querySelector('input[name="items[1][properties][_kit_id]"]'),
          },
          2: {
            id: this.querySelector('input[name="items[2][id]"]'),
            quantity: this.querySelector('input[name="items[2][quantity]"]'),
            sellingPlan: this.querySelector('input[name="items[2][selling_plan]"]'),
            kitId: this.querySelector('input[name="items[2][properties][_kit_id]"]'),
          },
        },
      },
      prices: {
        subscription: {
          current: this.querySelector(".js-subscription-price"),
          compare: this.querySelector(".js-subscription-price-compare"),
          save: this.querySelector(".js-subscription-save"),
          period: this.querySelector(".js-subscription-period-price"),
        },
        onetime: {
          current: this.querySelector(".js-onetime-price"),
          compare: this.querySelector(".js-onetime-price-compare"),
          save: this.querySelector(".js-onetime-save-custom"),
        },
      },
    };

    this.config = null;
  }

  connectedCallback() {
    this.initializeConfig();
    this.initializeEventListeners();
    this.refresh();
    this.updateMobileValueProps();
  }

  initializeConfig() {
    const configJson = this.querySelector("[data-widget-config]").innerText;
    this.config = JSON.parse(configJson);

    // Set initial state from config
    this.state.cadence = this.config.defaults.cadence;
    this.state.quantity = this.config.defaults.quantity;
    this.state.selectedPlanId = this.config.defaults.plan_id;
  }

  initializeEventListeners() {
    this.elements.form?.querySelector('[type="submit"]')?.addEventListener("click", (e) => {
      e.preventDefault();

      // Set timestamp only on add to cart click
      const timestamp = new Date().getTime();
      this.state.timestamp = timestamp;

      // Update timestamp inputs
      if (this.elements.inputs.timestamp) {
        this.elements.inputs.timestamp.value = timestamp;
      }

      // Update kit IDs for bundle items
      if (this.config.product.is_bundle) {
        Object.entries(this.config.product.bundle_items).forEach(([index, item]) => {
          const bundleInputs = this.elements.inputs.bundleItems[Number(index) - 1];
          if (bundleInputs?.kitId) {
            bundleInputs.kitId.value = timestamp;
          }
        });
      }

      this.updateFormInputs();
      this.elements.form.dispatchEvent(new CustomEvent("submit", { bubbles: true, cancelable: true, returnValue: false, defaultPrevented: true }));
    });
  }

  getCurrentVariant() {
    return this.config.product.current_variant;
  }

  getCurrentPlan() {
    if (!this.state.selectedPlanId) return null;
    return this.getCurrentVariant().selling_plan_allocations.find((plan) => plan.selling_plan_id === this.state.selectedPlanId);
  }

  updateFormInputs() {
    if (this.config.product.is_bundle) {
      // Handle bundle items
      Object.entries(this.config.product.bundle_items).forEach(([index, item]) => {
        const bundleInputs = this.elements.inputs.bundleItems[Number(index) - 1];
        if (bundleInputs) {
          if (bundleInputs.id) bundleInputs.id.value = item.id;
          if (bundleInputs.quantity) bundleInputs.quantity.value = item.quantity;
          if (bundleInputs.sellingPlan && this.state.cadence === "subscription") {
            bundleInputs.sellingPlan.value = this.state.selectedPlanId;
          } else {
            bundleInputs.sellingPlan.value = null;
          }
        }
      });
    } else {
      // Handle single product
      if (this.elements.inputs.quantity) {
        this.elements.inputs.quantity.value = this.state.quantity;
      }
      if (this.elements.inputs.sellingPlan) {
        console.log("this.state.selectedPlanId", this.getCurrentPlan());
        this.elements.inputs.sellingPlan.value = this.state.cadence === "subscription" ? this.state.selectedPlanId : "";
      }

      // Update Supply property from active quantity block
      const activeBlock = this.querySelector(".quantity-block.active, .radio-option.active");
      if (activeBlock && this.elements.inputs.supply) {
        this.elements.inputs.supply.value = activeBlock.dataset.supply || "";
      }

      //alert("changed" + activeBlock.dataset.subsinfoa + " | "  + activeBlock.dataset.subsinfob + " | "  + activeBlock.dataset.subsinfoc + " | "  + activeBlock.dataset.subsinfod + " | "  + activeBlock.dataset.subsinfoe + " | "  + activeBlock.dataset.subsinfof + " | " );

      if (activeBlock && activeBlock.dataset.shipsevery) {
          document.querySelectorAll(".js-ships-every").forEach(function(e) {
              e.innerHTML = activeBlock.dataset.shipsevery;
              e.classList.add("cdone");
          });
      }else{
        //alert("not 0");
      }

      if (activeBlock && activeBlock.dataset.subsinfoa) {
          document.querySelectorAll(".js-subs-info-1").forEach(function(e) {
              e.innerHTML = activeBlock.dataset.subsinfoa;
              e.classList.add("cdone");
          });
      }else{
       // alert("not 1");
      }


      if (activeBlock && activeBlock.dataset.subsinfob) {
          document.querySelectorAll(".js-subs-info-2").forEach(function(e) {
              e.innerHTML = activeBlock.dataset.subsinfob;
              e.classList.add("cdone");
          });
      }else{
        //alert("not 2");
      }


      if (activeBlock && activeBlock.dataset.subsinfoc) {
          document.querySelectorAll(".js-subs-info-3").forEach(function(e) {
              e.innerHTML = activeBlock.dataset.subsinfoc;
              e.classList.add("cdone");
          });
      }else{
        //alert("not 3");
      }


      if (activeBlock && activeBlock.dataset.subsinfod) {
          document.querySelectorAll(".js-subs-info-4").forEach(function(e) {
              e.innerHTML = activeBlock.dataset.subsinfod;
              e.classList.add("cdone");
          });
      }else{
       // alert("not 4");
      }


      if (activeBlock && activeBlock.dataset.subsinfoe) {
          document.querySelectorAll(".js-subs-info-5").forEach(function(e) {
              e.innerHTML = activeBlock.dataset.subsinfoe;
              e.classList.add("cdone");
          });
      }else{
        //alert("not 5");
      }


      if (activeBlock && activeBlock.dataset.subsinfof) {
          document.querySelectorAll(".js-subs-info-6").forEach(function(e) {
              e.innerHTML = activeBlock.dataset.subsinfof;
              e.classList.add("cdone");
          });
      }else{
        //alert("not 6");
      }

      if (activeBlock && activeBlock.dataset.subsinfog) {
          document.querySelectorAll(".js-subs-info-7").forEach(function(e) {
              e.innerHTML = activeBlock.dataset.subsinfog;
              e.classList.add("cdone");
          });
      }else{
        //alert("not 6");
      }

      if (activeBlock && activeBlock.dataset.oneinfoa) {
          document.querySelectorAll(".js-one-included-text").forEach(function(e) {
              e.innerHTML = activeBlock.dataset.oneinfoa;
              e.classList.add("cdone");
          });
      }else{
        //alert("not 6");
      }

      

    }
  }



  updatePrices() {
    if (this.config.product.is_bundle) {
      this.updateBundlePrices();
    } else {
      this.updateSingleProductPrices();
    }
  }

  updateBundlePrices() {
    let subscriptionPrice = 0;
    let subscriptionComparePrice = 0;
    let onetimePrice = 0;
    let onetimeComparePrice = 0;

    // Calculate total price for all bundle items
    Object.entries(this.config.product.bundle_items).forEach(([_, item]) => {
      const variant = item.variant;

      // Calculate subscription price if we have a selected plan
      if (this.state.selectedPlanId) {
        const planAllocation = variant.selling_plan_allocations?.find((allocation) => allocation.selling_plan_id === this.state.selectedPlanId);

        if (planAllocation) {
          subscriptionPrice += planAllocation.per_delivery_price * item.quantity;
          subscriptionComparePrice += variant.price * item.quantity;
        } else {
          subscriptionPrice += variant.price * item.quantity;
          subscriptionComparePrice += variant.price * item.quantity;
        }
      }

      // Calculate one-time price
      onetimePrice += variant.price * item.quantity;
      onetimeComparePrice += (variant.compare_at_price || variant.price) * item.quantity;
    });

    // Update subscription prices only if in subscription mode
    if (this.state.cadence === "subscription") {
      this.updatePriceElement(this.elements.prices.subscription, subscriptionPrice, subscriptionComparePrice);
      if (this.elements.prices.subscription.period) {
        this.elements.prices.subscription.period.innerText = this.formatPrice(subscriptionPrice) + "/mo";
      }
    }

    // Update one-time prices
    this.updatePriceElement(this.elements.prices.onetime, onetimePrice, onetimeComparePrice);
  }

  updateSingleProductPrices() {
    const variant = this.getCurrentVariant();
    const plan = this.getCurrentPlan();

    // Always update subscription prices if plan exists
    if (plan) {
      const subscriptionPrice = plan.price * this.state.quantity;
      const subscriptionComparePrice = variant.price * this.state.quantity;
      this.updatePriceElement(this.elements.prices.subscription, subscriptionPrice, subscriptionComparePrice);
      if (this.elements.prices.subscription.period) {
        this.elements.prices.subscription.period.innerText = this.formatPrice(subscriptionPrice / this.state.quantity) + "/mo";
      }
    }

    // Always update one-time prices
    const activeBlock = this.querySelector(".quantity-block.active");
    const onetimePrice = (activeBlock ? Number(activeBlock.dataset.onetimePrice) : variant.price) * this.state.quantity;
    const compareAtPrice = (variant.compare_at_price || variant.price) * this.state.quantity;

    this.updatePriceElement(this.elements.prices.onetime, onetimePrice, compareAtPrice);
  }

  updatePriceElement(elements, price, comparePrice) {
    if (!elements) return;

    if (elements.current) {
      elements.current.innerText = this.formatPrice(price);
    }

    if (elements.compare) {
      if (comparePrice && comparePrice > price) {
        elements.compare.innerText = this.formatPrice(comparePrice);
        elements.compare.classList.remove("hidden");
      } else {
        elements.compare.classList.add("hidden");
      }
    }

    if (elements.save) {
      if (comparePrice && comparePrice > price) {
        elements.save.innerText = this.getSaveText(price, comparePrice);
        //elements.save.innerText = this.getSaveText(price, comparePrice);
        
        //const oneTime = document.querySelector('.quantity-grid-mobile .radio-option.active .js-onetime-save');
        //oneTime.innerHTML = this.getSaveText(price, comparePrice);

        if(document.querySelector('.cadence-selector .radio-option.active .js-subscription-save')){
          const subsTime = document.querySelector('.cadence-selector .radio-option.active .js-subscription-save');
          //subsTime.innerHTML = this.getSaveText(price, comparePrice);          
        }

        elements.save.classList.remove("hidden");
      } else {
        elements.save.classList.add("hidden");
      }
    }
  }

  updateQuantityPrices() {
    if (this.config.product.is_bundle) {
      return;
    }

    const variant = this.getCurrentVariant();

    this.querySelectorAll("[data-qty-block]").forEach((block) => {
      console.warn("block.dataset.qty ===== ", block.dataset.qty);
      const qty = Number(block.dataset.qty);
      const planId = Number(block.dataset.planId);
      const onetimePrice = Number(block.dataset.onetimePrice);

      const plan = planId ? variant.selling_plan_allocations.find((p) => p.selling_plan_id === planId) : null;
      const price = this.state.cadence === "subscription" && plan ? plan.price : onetimePrice;
      const comparePrice = variant.compare_at_price || variant.price;


      const priceEl = block.querySelector(".js-qty-price");
      const comparePriceEl = block.querySelector(".js-qty-price-compare");
      const savingTextEl = block.querySelector(".js-saving-text");


      if (comparePriceEl) {
        comparePriceEl.innerText = this.formatPrice(comparePrice * qty);
        comparePriceEl.classList.toggle("hidden", comparePrice <= price);
      }

      if (savingTextEl) {
        const totalComparePrice = comparePrice * qty;
        const totalCurrentPrice = price * qty;

        savingTextEl.innerText = this.getSaveText(totalCurrentPrice, totalComparePrice);
        savingTextEl.classList.toggle("hidden", totalComparePrice <= totalCurrentPrice);
      }


        //const elementX = document.querySelector('[data-cadence="one-time-purchase"]');
  
        const optionBtns = document.querySelectorAll('.cadence-selector .radio-option__button');
      
        optionBtns.forEach(function(e) {
          e.addEventListener("click", function () {
            document.querySelectorAll('.quantity-grid-mobile .js-onetime-save').forEach(function(d){
              console.warn("clicked =======================================");
              console.warn("clicked ==", d);
              //d.classList.add('hidden');
              d.classList.add('did');
            });
          });
        });
      
        

      
      if (priceEl) {
        //alert( price +"-"+ qty);
        console.warn( price +"-"+ qty + "-" + comparePrice);

        if(document.querySelectorAll('.quantity-grid-mobile .radio-option').length == 1 ){
          //alert("same");
          console.warn("same - length = 1");
          setTimeout(function() {

            const oneTime = document.querySelector('.quantity-grid-mobile .radio-option.active .js-onetime-save');
            const oneTimeTxt = document.querySelector('.quantity-grid-mobile .radio-option.active .js-onetime-save').innerHTML;

            const subsTime = document.querySelector('.cadence-selector .radio-option.active .js-subscription-save');
            const subsTimeTxt = document.querySelector('.cadence-selector .radio-option.active .js-subscription-save').innerHTML;
            
            console.warn("one time = ", oneTimeTxt);
            console.warn("subs el = ", subsTimeTxt);
      
            
            //document.querySelector('.current-price.cp1').innerHTML = document.querySelector('.atc-price').innerHTML;
            if(document.querySelector('.cadence-selector .radio-option.active .js-subscription-save')){
              console.warn("element TRUE >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
              
              oneTime.innerHTML = subsTimeTxt;
              oneTime.classList.remove("hidden");
              
            }else{
              console.warn("element else");
            }
            
          }, 100);
            
        }else if(document.querySelectorAll('.quantity-grid-mobile .radio-option').length > 1){

                        console.warn("same - length > 1");
                        setTimeout(function() {
              
                          const oneTime = document.querySelector('.quantity-grid-mobile .radio-option.active .js-onetime-save');
                          const oneTimeTxt = document.querySelector('.quantity-grid-mobile .radio-option.active .js-onetime-save').innerHTML;
              
                          const subsTime = document.querySelector('.cadence-selector .radio-option.active .js-subscription-save');
                          const subsTimeTxt = document.querySelector('.cadence-selector .radio-option.active .js-subscription-save').innerHTML;
                          
                          console.warn("one time = ", oneTimeTxt);
                          console.warn("subs el = ", subsTimeTxt);
                    
                          
                          //document.querySelector('.current-price.cp1').innerHTML = document.querySelector('.atc-price').innerHTML;
                          if(document.querySelector('.cadence-selector .radio-option.active .js-subscription-save')){
                            console.warn("element TRUE >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
                            
                            oneTime.innerHTML = subsTimeTxt;
                            oneTime.classList.remove("hidden");
                            
                          }else{
                            console.warn("element else");
                          }
                          
                        }, 1000);
          
        }
        
        priceEl.innerText = this.formatPrice(price * qty);
      }


      
    });
  }

  setCadence(cadence) {
    this.state.cadence = cadence;

    // Reset to default plan when switching to subscription
    if (cadence === "subscription") {
      // Get the active quantity block's plan ID first
      const activeBlock = this.querySelector(".quantity-block.active");
      if (activeBlock && activeBlock.dataset.planId) {
        this.state.selectedPlanId = Number(activeBlock.dataset.planId);
      } else {
        // Fallback to default plan ID if no active block or no plan ID
        this.state.selectedPlanId = this.config.defaults.plan_id;
      }
    } else if (cadence === "one-time-purchase") {
      // Clear selected plan ID when switching to one-time purchase
      this.state.selectedPlanId = null;
    }

    this.refresh();
    this.updateMobileValueProps();
  }

  updateMobileValueProps() {
    // Get active cadence value props

    console.warn(" mobile props *****************");
    
    const activeCadence =
      this.state.cadence === "subscription"
        ? this.querySelector('[data-cadence="subscription"]')?.closest(".radio-option")
        : this.querySelector('[data-cadence="one-time-purchase"]')?.closest(".radio-option");

    const valueProps = activeCadence?.querySelector(".value-props")?.innerHTML || "";

    // Copy to active quantity block on mobile
    const activeQtyBlock = this.querySelector(".quantity-grid-mobile .radio-option.active");
    if (activeQtyBlock) {
      const mobileValueProps = activeQtyBlock.querySelector(".js-mobile-value-props");
      if (mobileValueProps) {
        mobileValueProps.innerHTML = valueProps;
      }
    }
  }

  setQuantityBlock(block) {
    if (!block || this.config.product.is_bundle) return;

    //console.log("block = ", block);

    this.state.block = block;
    this.state.quantity = Number(block.dataset.qty);
    this.state.selectedPlanId = Number(block.dataset.planId) || this.config.defaults.plan_id;

    this.refresh();
    this.updateMobileValueProps();
  }

  refresh() {
    this.updateFormInputs();
    this.updatePrices();
    this.updateQuantityPrices();
    this.updateBottles();
    this.updateAtcPrice();
  }

  updateAtcPrice() {
    const atcPrice = this.elements.form.querySelector(".atc-price");
    if (!atcPrice) return;

    let price;
    if (this.state.cadence === "subscription" && this.getCurrentPlan()) {
      //alert("subs");
      // Get subscription price
      if (this.config.product.is_bundle) {
        price = this.elements.prices.subscription.current.textContent;
      } else {
        price = this.formatPrice(this.getCurrentPlan().price * this.state.quantity);
      }
    } else {
      //alert("one");
      // Get one-time price
      if (this.config.product.is_bundle) {
        price = this.elements.prices.onetime.current.textContent;
      } else {
        const activeBlock = this.querySelector(".quantity-block.active");
        const basePrice = activeBlock ? Number(activeBlock.dataset.onetimePrice) : this.getCurrentVariant().price;
        price = this.formatPrice(basePrice * this.state.quantity);
      }
    }

    atcPrice.textContent = price;
    this.querySelector('.quantity-grid-mobile .radio-option.active .current-price').textContent = price;
  }

  updateBottles() {
    if (this.config.product.is_bundle) {
      // For bundles, the bottles count is set by liquid and doesn't change
      return;
    }

    // For non-bundles, multiply current quantity by 10
    const bottles = this.state.quantity * 10;
    const cblock = this.state.block;

    // Update all bottles text elements

    //alert(this);
    console.log("cblock =  this ", cblock);
    if (cblock && cblock.querySelector('.js-bottles')) {
      cblock.querySelector('.js-bottles').textContent = `${bottles}${this.config.bottles_suffix}`;
    } else {
      // alert("else");
    }

    
    this.querySelectorAll(".js-bottles").forEach((el) => {
      //el.textContent = `${bottles}${this.config.bottles_suffix}`;
      console.warn("Bottles suffix updated");
    });
  }

  formatPrice(cents) {
    const dollars = cents / 100;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: Shopify.currency.active,
    })
      .format(dollars)
      .replace(/\.00$/, "");
  }

  getSaveText(price, comparePrice) {
    const saving = Math.floor((100 * (comparePrice - price)) / comparePrice);

    return `Save ${saving}%`;
  }
}

class QuantityPicker extends HTMLElement {
  connectedCallback() {
    this.widget = this.closest("subscription-widget");
    this.addEventListener("click", (e) => {
      const button = e.target.closest("[data-qty-block]");
      if (!button) return;

      // Update both desktop and mobile buttons
      this.querySelectorAll("[data-qty-block]").forEach((block) => {
        //if (block.dataset.qty === button.dataset.qty) {
        if (block === button) {
          block.classList.add("active");
        } else {
          block.classList.remove("active");
        }
      });

      this.widget.setQuantityBlock(button);
    });
  }
}

class CadenceSelector extends HTMLElement {
  connectedCallback() {
    this.widget = this.closest("subscription-widget");
    this.addEventListener("click", (e) => {
      const button = e.target.closest("[data-cadence]");
      if (!button) return;

      const cadence = button.dataset.cadence;
      const parentBox = button.closest(".radio-option");

      this.updateUI(parentBox);
      this.widget.setCadence(cadence);
    });
  }
  

  updateUI(selectedBox) {
    this.querySelectorAll(".radio-option").forEach((box) => {
      box.classList.remove("active");
    });

    selectedBox.classList.add("active");
  }
}

customElements.define("subscription-widget", SubscriptionWidget);
customElements.define("quantity-picker", QuantityPicker);
customElements.define("cadence-selector", CadenceSelector);
