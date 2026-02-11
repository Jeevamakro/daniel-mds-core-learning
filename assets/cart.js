class CartRemoveButton extends HTMLElement {
	constructor() {
		super()

		this.addEventListener('click', (event) => {
			event.preventDefault()
			const cartItems =
				this.closest('cart-items') || this.closest('cart-drawer-items')
				cartItems.updateQuantity(this.dataset.index, 0, null, event)
			
		})
	}
}

customElements.define('cart-remove-button', CartRemoveButton)

class CartItems extends HTMLElement {
	constructor() {
		super()
		this.lineItemStatusElement =
			document.getElementById('shopping-cart-line-item-status') ||
			document.getElementById('CartDrawer-LineItemStatus')

		if (document.querySelector('.cart-shipping')) {
			this.minSpend = document.querySelector('.cart-shipping').dataset.minSpend;
			this.minTotal = Math.round(this.minSpend * (Shopify.currency.rate || 1));
			this.cartShipping();
		}

			const debouncedOnChange = debounce((event) => {
			this.onChange(event)
		}, ON_CHANGE_DEBOUNCE_TIMER)

		this.addEventListener('change', debouncedOnChange.bind(this))

		
    
    this.checkout_btn = document.querySelector('cart-drawer button[name="checkout"]');
    if( qtyCondition.first_time ){
      this.callAddRemove();
    }
	}

	cartUpdateUnsubscriber = undefined

	cartShipping() {
    let progressPrev = getComputedStyle(document.querySelector('.cart-shipping__progress-current')).getPropertyValue('width');    
    document.documentElement.style.setProperty('--progress-prev', progressPrev);

    this.total = document.querySelector('.cart-shipping').dataset.total;
    this.progress = this.total / this.minTotal * 100;
    if (this.progress > 100)
      this.progress = 100;

		if (this.minTotal > this.total) {
      let amount = this.minTotal - this.total;
      let message = document.querySelector('.cart-shipping').dataset.message.replace('||amount||', formatMoney(amount));
      document.querySelector('.cart-shipping__message_default').innerText = message;
      document.querySelector('.cart-shipping__message_success').classList.remove('active');
      document.querySelector('.cart-shipping__message_default').classList.add('active');
    }
    else {
      document.querySelector('.cart-shipping__message_default').classList.remove('active');
      document.querySelector('.cart-shipping__message_success').classList.add('active');
    }

    document.querySelector('.cart-shipping__progress-current').style.width = this.progress+'%';
  }

	connectedCallback() {
		this.cartUpdateUnsubscriber = subscribe(
			PUB_SUB_EVENTS.cartUpdate,
			(event) => {
				if (event.source === 'cart-items') {
					return
				}
				this.onCartUpdate()
			}
		)
	}

	disconnectedCallback() {
		if (this.cartUpdateUnsubscriber) {
			this.cartUpdateUnsubscriber()
		}
	}

	onChange(event) {

		if(event.target.closest('.protection_service') != null){
			return;
		};

		this.updateQuantity(
			event.target.dataset.index,
			event.target.value,
			document.activeElement.getAttribute('name'),
			event
		)
	}

	onCartUpdate() {
		fetch(`${routes.cart_url}?section_id=main-cart-items`)
			.then((response) => response.text())
			.then((responseText) => {
				const html = new DOMParser().parseFromString(responseText, 'text/html')
				const sourceQty = html.querySelector('cart-items')
				this.innerHTML = sourceQty.innerHTML
			})
			.catch((e) => {
				console.error(e)
			})
	}

	getSectionsToRender() {
		return [
			{
				id: 'main-cart-items',
				section: document.getElementById('main-cart-items').dataset.id,
				selector: '.js-contents',
			},
			{
				id: 'cart-icon-bubble',
				section: 'cart-icon-bubble',
				selector: '.shopify-section',
			},
			{
				id: 'cart-live-region-text',
				section: 'cart-live-region-text',
				selector: '.shopify-section',
			},
			{
				id: 'main-cart-footer',
				section: document.getElementById('main-cart-footer').dataset.id,
				selector: '.js-contents-totals',
			},
			{
        id: 'main-cart-shipping',
        section: document.getElementById('main-cart-shipping')?.dataset.id || null,
        selector: '.js-contents-shipping'
      }
		]
	}

	updateQuantity(line, quantity, name, event = null) {
		this.enableLoading(line, event.target)
		/* New changes */
		let haProtectionPlan = false;
		let haServicePlan = false;
		let hasProSer = false;		
		if( event != null ){
			this.eleCartItem = event.target.closest('.cart-item');			
			haProtectionPlan = this.eleCartItem.dataset.protectionPlan == "true" ? true : false;
			haServicePlan = this.eleCartItem.querySelector('.services-list input[data-has-services="true"]') != null ? true : false;
			console.log(haProtectionPlan || haServicePlan)	
		}

		let body_data = {
			line: line,
			quantity: quantity,
			sections: this.getSectionsToRender().map((e => e.section)),
			sections_url: window.location.pathname
		}	
		//console.log(haProtectionPlan || haServicePlan)	
		if( haProtectionPlan || haServicePlan ){			
			hasProSer = true;
			body_data = {
				updates: {},
				sections: this.getSectionsToRender().map((e => e.section)),
				sections_url: window.location.pathname
			}			
			let item_key = this.eleCartItem.dataset.itemKey;
			body_data.updates[item_key] = quantity;

			if( haProtectionPlan ){
				let protection_key = this.eleCartItem.querySelector('[data-protection-key]')?.dataset.protectionKey;
				if(protection_key){body_data.updates[protection_key] = quantity};
			}
			if( haServicePlan ){
				let inputs = this.eleCartItem.querySelectorAll('.services-list input[data-has-services="true"]');
				if(inputs.length){
					inputs.forEach((input)=>{
						body_data.updates[input.dataset.itemKey] = quantity
					})
				};
			}			
		}
		/* New changes */

		this.querySelectorAll('.quantity__button').forEach((button) =>
			button.classList.add('disabled')
		)

		if (
			document.querySelectorAll(
				'.card--product card__add-to-cart button[name="add"]'
			)
		) {
			document
				.querySelectorAll(
					'.card--product .card__add-to-cart button[name="add"]'
				)
				.forEach((button) => {
					button.setAttribute('aria-disabled', false)
					if (button.querySelector('span')) {
						button.querySelector('span').classList.remove('hidden')
						button.querySelector('.sold-out-message').classList.add('hidden')
					}
				})
		}

		if (document.querySelector('.cart-shipping')) {
		let progressPrev = getComputedStyle(document.querySelector('.cart-shipping__progress-current')).getPropertyValue('width');    
		document.documentElement.style.setProperty('--progress-prev', progressPrev);
		}

		/*
			const body = JSON.stringify({
				line,
				quantity,
				sections: this.getSectionsToRender().map((section) => section.section),
				sections_url: window.location.pathname,
			})
		*/		
		const n = JSON.stringify(body_data);		
		fetch(`${ hasProSer ? routes.cart_update_url : routes.cart_change_url}`,
			{ ...fetchConfig(), body: n })
			.then((response) => {
				return response.text()
			})
			.then((state) => {
				const parsedState = JSON.parse(state)
				const quantityElement =
					document.getElementById(`Quantity-${line}`) ||
					document.getElementById(`Drawer-quantity-${line}`)
				const items = document.querySelectorAll('.cart-item')
				if (parsedState.errors) {
					quantityElement.value = quantityElement.getAttribute('value')
					this.updateLiveRegions(line, parsedState.errors)
					return
				}
				typeof updateCartObj == 'function' ? updateCartObj(): '';
				this.classList.toggle('is-empty', parsedState.item_count === 0)
				const cartDrawerWrapper = document.querySelector('cart-drawer')
				const cartFooter = document.getElementById('main-cart-footer')

				if (cartFooter)
					cartFooter.classList.toggle('is-empty', parsedState.item_count === 0)
				if (cartDrawerWrapper)
					cartDrawerWrapper.classList.toggle(
						'is-empty',
						parsedState.item_count === 0
					)

				this.getSectionsToRender().forEach((section) => {
					const elementToReplace =
						document
							.getElementById(section.id)
							.querySelector(section.selector) ||
						document.getElementById(section.id)
					elementToReplace.innerHTML = this.getSectionInnerHTML(
						parsedState.sections[section.section],
						section.selector
					)
				})
				const updatedValue = parsedState.items[line - 1]
					? parsedState.items[line - 1].quantity
					: undefined
				let message = ''
				if (
					items.length === parsedState.items.length && quantityElement &&
					updatedValue !== parseInt(quantityElement.value)
				) {
					if (typeof updatedValue === 'undefined') {
						message = window.cartStrings.error
					} else {
						message = window.cartStrings.quantityError.replace(
							'[quantity]',
							updatedValue
						)
					}
				}
				this.updateLiveRegions(line, message)

				const lineItem =
					document.getElementById(`CartItem-${line}`) ||
					document.getElementById(`CartDrawer-Item-${line}`)
				if (lineItem && lineItem.querySelector(`[name="${name}"]`)) {
					cartDrawerWrapper
						? trapFocus(
								cartDrawerWrapper,
								lineItem.querySelector(`[name="${name}"]`)
						  )
						: lineItem.querySelector(`[name="${name}"]`).focus()
				} else if (parsedState.item_count === 0 && cartDrawerWrapper) {
					trapFocus(
						cartDrawerWrapper.querySelector('.drawer__inner-empty'),
						cartDrawerWrapper.querySelector('a')
					)
				} else if (document.querySelector('.cart-item') && cartDrawerWrapper) {
					trapFocus(
						cartDrawerWrapper,
						document.querySelector('.cart-item__name')
					)
				}
				publish(PUB_SUB_EVENTS.cartUpdate, { source: 'cart-items' })
			})
			.catch(() => {
				this.querySelectorAll('.loading-overlay').forEach((overlay) =>
					overlay.classList.add('hidden')
				)
				this.querySelectorAll('.quantity__button').forEach((button) =>
					button.classList.remove('disabled')
				)
				const errors =
					document.getElementById('cart-errors') ||
					document.getElementById('CartDrawer-CartErrors')
				if (errors) errors.textContent = window.cartStrings.error
			})
			.finally(() => {
				this.querySelectorAll('.quantity__button').forEach((button) =>
					button.classList.remove('disabled')
				)
				if (document.querySelector('.cart-shipping')) {
				this.cartShipping();
				}
				this.disableLoading(line)
			})
	}

	updateLiveRegions(line, message) {
		const lineItemError =
			document.getElementById(`Line-item-error-${line}`) ||
			document.getElementById(`CartDrawer-LineItemError-${line}`)

		if (lineItemError) {
			if (message) {
				lineItemError.style.display = 'flex'
				lineItemError.querySelector('.cart-item__error-text').innerHTML =
					message
			} else {
				lineItemError.style.display = 'none'
				lineItemError.querySelector('.cart-item__error-text').innerHTML = ''
			}
		}

		this.lineItemStatusElement.setAttribute('aria-hidden', true)

		const cartStatus =
			document.getElementById('cart-live-region-text') ||
			document.getElementById('CartDrawer-LiveRegionText')
		cartStatus.setAttribute('aria-hidden', false)

		setTimeout(() => {
			cartStatus.setAttribute('aria-hidden', true)
		}, 1000)
	}

	getSectionInnerHTML(html, selector) {
		return new DOMParser()
			.parseFromString(html, 'text/html')
			.querySelector(selector).innerHTML
	}

	enableLoading(line, ele_target = null) {
		const mainCartItems =
			document.getElementById('main-cart-items') ||
			document.getElementById('CartDrawer-CartItems')
		if (mainCartItems) mainCartItems.classList.add('cart__items--disabled')

		line = ele_target && ele_target.closest('[data-line-index]') ? ele_target.closest('[data-line-index]').dataset.lineIndex : line;

		const cartItemElements = this.querySelectorAll(
			`#CartItem-${line} .loading-overlay`
		)
		const cartDrawerItemElements = this.querySelectorAll(
			`#CartDrawer-Item-${line} .loading-overlay`
		)

		;[...cartItemElements, ...cartDrawerItemElements].forEach((overlay) =>{
			if( ele_target != null && ele_target.closest('.cart-item__bottom') ){
				if(ele_target.closest('.cart-item__bottom').querySelector('.loading-overlay')){
					ele_target.closest('.cart-item__bottom').querySelector('.loading-overlay').classList.remove('hidden')
				}else{
					ele_target.closest('.cart-item__details').querySelector('.loading-overlay').classList.remove('hidden')
				}
			}else{
				overlay.classList.remove('hidden')
			}
		})

		document.activeElement.blur()
		this.lineItemStatusElement.setAttribute('aria-hidden', false)
	}

	disableLoading(line) {
		const mainCartItems =
			document.getElementById('main-cart-items') ||
			document.getElementById('CartDrawer-CartItems')
		if (mainCartItems) mainCartItems.classList.remove('cart__items--disabled')

		const cartItemElements = this.querySelectorAll(
			`#CartItem-${line} .loading-overlay`
		)
		const cartDrawerItemElements = this.querySelectorAll(
			`#CartDrawer-Item-${line} .loading-overlay`
		)

		cartItemElements.forEach((overlay) => overlay.classList.add('hidden'))
		cartDrawerItemElements.forEach((overlay) => overlay.classList.add('hidden'))
	}	
  
  callAddRemove(){    
    this.checkoutDiabled(true);
    setTimeout(()=>{
      if( this.querySelector('.freeProductJson') ){
        const freeJson = JSON.parse(this.querySelector('.freeProductJson').textContent);      
        if( freeJson.addFreePro == true ){
          this.addRemoveFreeProduct(true, freeJson);          
        } else if ( freeJson.removeFreePro == true ){
          this.addRemoveFreeProduct(false, freeJson);          
        } else {
        this.checkoutDiabled()
      	}
      }else{              
        this.checkoutDiabled()
      }
    }, 500);
  }

  checkoutDiabled(removeDisabled = false){
    if( !this.checkout_btn ) return;
    if( !removeDisabled ){
      this.checkout_btn.removeAttribute('disabled');      
    } else {
      this.checkout_btn.setAttribute('disabled', 'disabled');
    }
  }

	addRemoveFreeProduct(product_add, jsonData) {		
		if( product_add ){
      let qty = 1;      
			const body = {
				id: jsonData.variant_id,
        quantity: qty,
        properties: {
          _free_product: '',
          _reference_product: jsonData.cart_refrence_product.title
        }
			};
      
      this.cart = document.querySelector('cart-drawer');
      
      body['sections'] = this.cart.getSectionsToRender().map((section) => section.id);
      body['sections_url'] = window.location.pathname;      
      
			const config = fetchConfig();
			config.body = JSON.stringify(body);

      this.checkoutDiabled(true);
			fetch(`${routes.cart_add_url}`, config)
        .then((response) => response.json())
        .then((response) => {
					const parsedState = response;          
					if( !parsedState.errors) {
						this.cart.getSectionsToRender().forEach((section => {
              const sectionElement = section.selector ? document.querySelector(section.selector) : document.getElementById(section.id);
              if( section.id != 'cart-type-count' ){
                sectionElement.innerHTML =
                   this.cart.getSectionInnerHTML(parsedState.sections[section.id], section.selector);
              }else{
                const json_content = this.cart.getSectionInnerHTML(parsedState.sections[section.id], section.selector);        
                if( json_content ){
                  const obj = {...window.qtyCondition}
                  delete obj['cart_type'];
                  delete obj['type_to_cart'];							
                  window.qtyCondition = { ...obj, ...JSON.parse(json_content)};            
                }else{
                  delete window.qtyCondition['cart_type'];
                  delete window.qtyCondition['type_to_cart'];
                }
              }
            }));
					}
				})
        .catch((e) => {
          console.error(e);
        })
        .finally(() => {          
          this.checkoutDiabled();
        });    
		}else{
      if( jsonData.variant_index ){
        this.updateQuantity(jsonData.variant_index, 0);
      }
		}
	}
}

customElements.define('cart-items', CartItems)

if (!customElements.get('cart-note')) {
	customElements.define(
		'cart-note',
		class CartNote extends HTMLElement {
			constructor() {
				super()

				this.addEventListener(
					'change',
					debounce((event) => {
						const body = JSON.stringify({ note: event.target.value })
						fetch(`${routes.cart_update_url}`, {
							...fetchConfig(),
							...{ body },
						})
					}, ON_CHANGE_DEBOUNCE_TIMER)
				)
			}
		}
	)
}
