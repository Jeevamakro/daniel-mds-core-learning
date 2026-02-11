document.addEventListener("DOMContentLoaded", (event) => {
  updateCartObj();
})

function updateCartObj(){
  if( document.querySelector('.cart--json') ){
    window.routeCartJSON = JSON.parse( document.querySelector('.cart--json').innerHTML.trim() );
  }
}

/* Update cart html */
function cartPageRender(cart_response, checkforError = false, getJson = false) {

  const n = typeof (cart_response) == 'object' ? cart_response : JSON.parse(cart_response);
  if (checkforError) {
    return n.errors;
  }

  let cart_count = n.item_count;
  if (cart_count == undefined) {
    cart_count = Number((new DOMParser).parseFromString(n.sections['cart-icon-bubble'], "text/html").querySelector('.cart-count-bubble span').innerHTML.trim());
  }

  document.querySelector("[data-cart-item-count]") && cart_count != undefined &&
    (document.querySelector("[data-cart-item-count]").innerHTML = `${cart_count} item${cart_count > 1 ? 's' : ''}`);

  document.querySelector('cart-items').getSectionsToRender().forEach((e => {
    (document.getElementById(e.id).querySelector(e.selector) ||
      document.getElementById(e.id)).innerHTML = document.querySelector('cart-items').getSectionInnerHTML(n.sections[e.section], e.selector)
  }));



  if (n.item_count != undefined && n.item_count == 0) {
    document.querySelector('cart-items').classList.add('is-empty');
  }
  updateCartObj();
}
/* Update cart html END */

/* Protection Plan */
function checkProductAdded(selected_item, plan_name) {
  let alredyAddPlan = false;
  let cart_item = {};
  let cart_protection_item = {};
  let cart_service_item = {};
  let selected_service_item = {};
  let hasDiffrentService = false;

  if (window.routeCartJSON && window.routeCartJSON.items.length) {

    const variantId = selected_item.variant_id;
    const ProtectionPlan = plan_name;
    cart_item = window.routeCartJSON.items.find(item =>
      item.variant_id === variantId && item.properties && item.properties["_Protection Plan"] == ProtectionPlan
    );
    //  console.log('selected_item', selected_item, selected_item.properties);
    if (cart_item) {
      alredyAddPlan = true;
      cart_protection_item = window.routeCartJSON.items.find(item =>
        item.properties["_protection_product"] == "" && item.properties["_plan_id"] === variantId && item.title == ProtectionPlan
      );
      cart_service_item = window.routeCartJSON.items.find(item =>
        item.properties["_service_product"] == "" && item.properties["_service_id"] === variantId && item.properties["_product_key"] == cart_item.properties["_refrence_id"]
      );
      selected_service_item = window.routeCartJSON.items.find(item =>
        item.properties["_service_product"] == "" && item.properties["_service_id"] === variantId && item.properties["_product_key"] == selected_item.properties["_refrence_id"]
      );
      if (selected_service_item == undefined && Object.entries(cart_service_item).length > 0) {
        //  console.log('selected_service_item', selected_service_item);
        selected_service_item = cart_service_item;
      }
      hasDiffrentService = selected_item.properties["_Service"] != cart_item.properties["_Service"];
      // console.log('selected_service_item', selected_service_item);
    }
  }
  return { "alredyAddPlan": alredyAddPlan, "hasDiffrentService": hasDiffrentService, "cart_item": cart_item, "cart_protection_item": cart_protection_item, "cart_service_item": cart_service_item, "selected_service_item": selected_service_item };
}

function addProtection(event, ele) {  
  const checked_input_el = ele.closest('label').querySelector('input:checked'),
    selectedEle = ele.closest('.cart-item'),
    item_key = selectedEle.getAttribute('data-item-key'),
    protection_el = ele.closest('[data-protection-key]');

  if( selectedEle.querySelector('.loading-overlay') ){
    selectedEle.querySelector('.loading-overlay').classList.remove('hidden');    
  }
  if (checked_input_el) {    
    if (checked_input_el.value == 'Declined Protection Plan' || 
        checked_input_el.value == 'Declined Replacement Plan') {
      if (protection_el != null && protection_el.getAttribute('data-protection-key') != null) {
        const selectedEle = ele.closest('.cart-item');
        const item_key = selectedEle.getAttribute('data-item-key');
        const item = { ...JSON.parse(selectedEle.querySelector('.cart-item-json').innerHTML), line_index: Number(selectedEle.querySelector('.quantity__input').dataset.index) };
        const input_obj = {};
        let item_properties = item.properties;
        item_properties["_Protection Plan"] = 'Declined Protection Plan';
        item_properties["_plan_price"] = '0.00';
        // delete item_properties["_plan_id"];
        item_properties = Object.keys(item_properties).length == 0 ? { '_': '' } : item_properties;

        let updates = {};
        if (protection_el != null && !protection_el.dataset.protectionKey) return;
        updates[protection_el.dataset.protectionKey] = 0;
        const removeProtection = JSON.stringify({ updates });

        document.body.classList.add('cart--loading');
        fetch(`${routes.cart_update_url}`, {
          ...fetchConfig(),
          body: removeProtection
        }).then((e => e.text())).then((t => {

          let hasError = cartPageRender(t, true);

          if (hasError != undefined && hasError != '') {
            const a = document.getElementById(`Quantity-${item.line_index}`) || document.getElementById(`Drawer-quantity-${item.line_index}`),
              i = document.querySelectorAll(".cart-item");
            document.querySelector('cart-items').updateLiveRegions(item.line_index, hasError);
            //console.log('-------------------------------------hasError');
            return;
          };

          const o = JSON.stringify({
            id: item_key,
            quantity: item.quantity,
            properties: item_properties,
            sections: document.querySelector('cart-items').getSectionsToRender().map((e => e.section)),
            sections_url: window.location.pathname
          });

          //console.log('Remove plan properties form main item', o);
          fetch(`${routes.cart_change_url}`, {
            ...fetchConfig(),
            body: o
          }).then((e => e.text())).then((t => {
            cartPageRender(t);
          })).catch((() => {
            //console.log('removeProtectionPlan error 2');
            document.body.classList.remove('cart--loading');
          })).finally((() => {
            //console.log('finally PER PER');
          }));
          //console.log('Remove plan properties form main item END');
        })).catch((() => {
          //console.log('removeProtectionPlan error');
          document.body.classList.remove('cart--loading');
        })).finally((() => {
          //console.log('finally PER');
        }));
        //console.log('Remove Protection plan product END');
      }
    } else {
      if (protection_el != null && protection_el.getAttribute('data-protection-key') != null) {
        console.log('in if')        
        const value = checked_input_el.value;
        const value_id = checked_input_el.dataset.variant;
        const item = { ...JSON.parse(selectedEle.querySelector('.cart-item-json').innerHTML), line_index: Number(selectedEle.querySelector('.quantity__input').dataset.index) };
        const input_obj = {};
        let item_properties = item.properties;
        item_properties["_Protection Plan"] = value;
        item_properties["_plan_price"] = checked_input_el.dataset.price;
        item_properties["_plan_id"] = Number(item.variant_id);

        let updates = {};
        if (!protection_el.dataset.protectionKey) return;
        updates[protection_el.dataset.protectionKey] = 0;
        const removeProtection = JSON.stringify({ updates });

        document.body.classList.add('cart--loading');
        fetch(`${routes.cart_update_url}`, {
          ...fetchConfig(),
          body: removeProtection
        }).then((e => e.text())).then((t => {

          console.log('insuces');

          let hasError = cartPageRender(t, true);

          if (hasError != undefined && hasError != '') {
            const a = document.getElementById(`Quantity-${item.line_index}`) || document.getElementById(`Drawer-quantity-${item.line_index}`),
              i = document.querySelectorAll(".cart-item");
            document.querySelector('cart-items').updateLiveRegions(item.line_index, hasError);
            console.log('-------------------------------------hasError');
            return;
          };

          let renderPro = {
            sections: document.querySelector('cart-items').getSectionsToRender().map((e => e.section)),
            sections_url: window.location.pathname
          };

          let add_protection_body_data = {
            id: value_id,
            quantity: item.quantity,
            properties: {
              _plan_id: item.variant_id,
              _protection_product: "",
              For: item.title,
            }
          };

          add_protection_body_data = { ...add_protection_body_data, ...renderPro };

          console.log(add_protection_body_data,'add_protection_body_data');

          return

          const o = JSON.stringify({
            id: item_key,
            quantity: item.quantity,
            properties: item_properties,
            sections: document.querySelector('cart-items').getSectionsToRender().map((e => e.section)),
            sections_url: window.location.pathname
          });

          fetch(`${routes.cart_add_url}`, {
            ...fetchConfig(),
            body: JSON.stringify(add_protection_body_data)
          }).then((e => e.text())).then((t => {

            console.log('added protection plan item', add_protection_body_data);
            fetch(`${routes.cart_change_url}`, {
              ...fetchConfig(),
              body: o
            }).then((e => e.text())).then((t => {
              cartPageRender(t);
            })).catch((() => {
              console.log('update main product properties error 2');
              document.body.classList.remove('cart--loading');
            })).finally((() => {
              console.log('finally PER PER');
            }));

          })).catch((() => {
            console.log('addProtectionPlanProduct error 2');
            document.body.classList.remove('cart--loading');
          })).finally((() => {
            console.log('finally PE PE');
          }));

        })).catch(((error) => {
          console.log('removeProtectionPlan error', error);
          document.body.classList.remove('cart--loading');
        })).finally((() => {
          console.log('finally PER');
        }));
        console.log('Remove Protection plan product END');
      } else {
        //console.log('in else')
        const input_this = this;        
        const value = checked_input_el.value;
        const value_id = checked_input_el.dataset.variant;        
        if (selectedEle) {
          const item = { ...JSON.parse(selectedEle.querySelector('.cart-item-json').innerHTML), line_index: Number(selectedEle.querySelector('.quantity__input').dataset.index) };
          const input_obj = {};
          let item_properties = item.properties;
          item_properties["_Protection Plan"] = value;
          item_properties["_plan_price"] = checked_input_el.dataset.price;
          item_properties["_plan_id"] = Number(item.variant_id);

          //console.log(item_properties, 'item_properties');

          let checkProduct = checkProductAdded(item, value);

          checkProduct.selected_service_item = checkProduct.selected_service_item == undefined ? {} : checkProduct.selected_service_item;
          // console.log(checkProduct, 'checkProductAdded');         

          let body_data = {
            id: item_key,
            quantity: item.quantity,
            properties: item_properties
          }

          // if(ele.closest('tr').dataset.warranty == 'true'){
          //    body_data.properties['warranty-extension'] = "1 Year Warranty Extension";
          // }

          if (checkProduct.alredyAddPlan) {
            input_this.qty = Number(item.quantity) + Number(checkProduct.cart_item.quantity);
            body_data = {
              id: item.key,
              properties: checkProduct.cart_item.properties
            };
          }
          // console.log('body_data', body_data);
          const n = JSON.stringify(body_data);

          document.body.classList.add('cart--loading');

          /* Change API 1 */
          fetch(`${!checkProduct.alredyAddPlan ? routes.cart_change_url : routes.cart_change_url}`, {
            ...fetchConfig(),
            body: n
          }).then((e => e.text())).then((t => {
            //  console.log('First resposnse', JSON.parse(t));
            let renderPro = {
              sections: document.querySelector('cart-items').getSectionsToRender().map((e => e.section)),
              sections_url: window.location.pathname
            };
            let second_body_data = {
              id: value_id,
              quantity: item.quantity,
              properties: {
                _plan_id: item.variant_id,
                _protection_product: "",
                For: item.title,
              }
            };

            if (checkProduct.alredyAddPlan) {
              second_body_data = { updates: {} };
              checkProduct.cart_protection_item && (second_body_data.updates[checkProduct.cart_protection_item.key] = input_this.qty);
              /*checkProduct.cart_service_item && (second_body_data.updates[ checkProduct.cart_service_item.key ] = input_this.qty);*/
              if (!Object.entries(checkProduct.selected_service_item).length) {
                second_body_data = { ...second_body_data, ...renderPro };
              }
            } else {
              second_body_data = { ...second_body_data, ...renderPro };
            }            

            /* Change/Add API 2*/
            //  console.log('second_body_data', second_body_data);
            const o = JSON.stringify(second_body_data);
            fetch(`${!checkProduct.alredyAddPlan ? routes.cart_add_url : routes.cart_update_url}`, {
              ...fetchConfig(),
              body: o
            }).then((e => e.text())).then((t => {
              // console.log('Second resposnse', JSON.parse(t));
              if (!Object.entries(checkProduct.selected_service_item).length) {
                cartPageRender(t);
              } else {
                /* Change API 3*/
                let thid_body_data = {
                  id: checkProduct.cart_service_item.key,
                  quantity: input_this.qty,
                  properties: checkProduct.cart_service_item.properties
                };
                if (!checkProduct.hasDiffrentService) {
                  thid_body_data = { ...thid_body_data, ...renderPro };
                }
                //  console.log('thid_body_data', thid_body_data);                  
                fetch(`${routes.cart_change_url}`, {
                  ...fetchConfig(),
                  body: JSON.stringify(thid_body_data)
                }).then((e => e.text())).then((t => {
                  if (!checkProduct.hasDiffrentService) {
                    cartPageRender(t);
                  } else {
                    /* Change API 4*/
                    let fourth_body_data = {
                      id: checkProduct.selected_service_item.key,
                      quantity: 0,
                      ...renderPro
                    };
                    //  console.log('fourth_body_data', fourth_body_data);
                    fetch(`${routes.cart_change_url}`, {
                      ...fetchConfig(),
                      body: JSON.stringify(fourth_body_data)
                    }).then((e => e.text())).then((t => {
                      cartPageRender(t);
                    }))
                    /* Change API 4*/
                  }
                })).catch((() => {
                  //console.log('addProtectionPlanProduct error 3');
                  document.body.classList.remove('cart--loading');
                })).finally((() => {
                  //console.log('finally PE PE PE');
                }));
                /* Change API 3*/
              }
            })).catch((() => {
              //console.log('addProtectionPlanProduct error 2');
              document.body.classList.remove('cart--loading');
            })).finally((() => {
              //console.log('finally PE PE');
            }));
            /* Change/Add API 2*/
          })).catch((() => {
            //console.log('addProtectionPlanProduct error');
            document.body.classList.remove('cart--loading');
          })).finally((() => {
            //console.log('finally PE');
          }));
          /* Change API 1 */
        } else {
          //console.log('else', item_key);
        }
      }
    }

  }
}

function removeProtection(event, ele) {
  // console.log('in',ele.closest('.cart-item'));
  const selectedEle = ele.closest('.cart-item');
  if (selectedEle) {
    if( selectedEle.querySelector('.loading-overlay') ){
      selectedEle.querySelector('.loading-overlay').classList.remove('hidden');    
    }
    const item_key = selectedEle.getAttribute('data-item-key');
    const item = { ...JSON.parse(selectedEle.querySelector('.cart-item-json').innerHTML), line_index: Number(selectedEle.querySelector('.quantity__input').dataset.index) };
    const input_obj = {};
    let item_properties = item.properties;
    item_properties["_Protection Plan"] = 'Declined Protection Plan';
    item_properties["_plan_price"] = '0.00';
    // delete item_properties["_plan_id"];
    item_properties = Object.keys(item_properties).length == 0 ? { '_': '' } : item_properties;


    let updates = {};
    // console.log('ele.dataset.protectionKey', ele.dataset.protectionKey, ele);
    if (!ele.dataset.protectionKey) return;
    updates[ele.dataset.protectionKey] = 0;
    // if(selectedEle.querySelector('.cart_pro_extended')){
    //    delete item_properties["warranty-extension"];
    //    updates[selectedEle.querySelector('.cart_pro_extended').dataset.key] = 0;
    // }
    let renderPro = {
      sections: document.querySelector('cart-items').getSectionsToRender().map((e => e.section)),
      sections_url: window.location.pathname
    };
    const removeProtection = JSON.stringify({ updates });
    // console.log('Remove Protection plan product', removeProtection);

    // window.cart_items.enableLoading(item.line_index);
    document.body.classList.add('cart--loading');
    fetch(`${routes.cart_update_url}`, {
      ...fetchConfig(),
      body: removeProtection
    }).then((e => e.text())).then((t => {

      let hasError = cartPageRender(t, true);
      //console.log('hasError', hasError);
      if (hasError != undefined && hasError != '') {
        const a = document.getElementById(`Quantity-${item.line_index}`) || document.getElementById(`Drawer-quantity-${item.line_index}`),
          i = document.querySelectorAll(".cart-item");
        document.querySelector('cart-items').updateLiveRegions(item.line_index, hasError);
        //console.log('-------------------------------------hasError');
        return;
      };

      const o = JSON.stringify({
        id: item_key,
        quantity: item.quantity,
        properties: item_properties,
        sections: document.querySelector('cart-items').getSectionsToRender().map((e => e.section)),
        sections_url: window.location.pathname
      });
      //console.log('Remove plan properties form main item', o);
      fetch(`${routes.cart_change_url}`, {
        ...fetchConfig(),
        body: o
      }).then((e => e.text())).then((t => {
        cartPageRender(t);
      })).catch((() => {
        //console.log('removeProtectionPlan error 2');
        document.body.classList.remove('cart--loading');
      })).finally((() => {
        //console.log('finally PER PER');
        // document.body.classList.remove('cart--loading');
      }));
      //console.log('Remove plan properties form main item END');
    })).catch((() => {
      //console.log('removeProtectionPlan error');
      document.body.classList.remove('cart--loading');
    })).finally((() => {
      //console.log('finally PER');
      //window.cart_items.disableLoading(item.line_index);
    }));
    //console.log('Remove Protection plan product END');
  }
}

function addServicePlan(event, ele) {
  if (ele.closest('label').querySelector('input:checked')) {
    if (ele.closest('label').querySelector('input:checked').value == 'Declined Service Plan') {
      const selectedEle = ele.closest('.cart-item');
      const item_key = selectedEle.getAttribute('data-item-key');
      const item = { ...JSON.parse(selectedEle.querySelector('.cart-item-json').innerHTML), line_index: Number(selectedEle.querySelector('.quantity__input').dataset.index) };
      const input_obj = {};
      let item_properties = item.properties;
      item_properties["_service_plan"] = 'Declined Service Plan';
      item_properties["_plan_price"] = '0.00';
      // delete item_properties["_plan_id"];
      item_properties = Object.keys(item_properties).length == 0 ? { '_': '' } : item_properties;

      let updates = {};
      if (!ele.dataset.protectionKey) return;
      updates[ele.dataset.protectionKey] = 0;
      const removeServicePlan = JSON.stringify({ updates });


      document.body.classList.add('cart--loading');
      fetch(`${routes.cart_update_url}`, {
        ...fetchConfig(),
        body: removeServicePlan
      }).then((e => e.text())).then((t => {

        let hasError = cartPageRender(t, true);
        //console.log('hasError', hasError);
        if (hasError != undefined && hasError != '') {
          const a = document.getElementById(`Quantity-${item.line_index}`) || document.getElementById(`Drawer-quantity-${item.line_index}`),
            i = document.querySelectorAll(".cart-item");
          document.querySelector('cart-items').updateLiveRegions(item.line_index, hasError);
          //console.log('-------------------------------------hasError');
          return;
        };

        const o = JSON.stringify({
          id: item_key,
          quantity: item.quantity,
          properties: item_properties,
          sections: document.querySelector('cart-items').getSectionsToRender().map((e => e.section)),
          sections_url: window.location.pathname
        });
        //console.log('Remove plan properties form main item', o);
        fetch(`${routes.cart_change_url}`, {
          ...fetchConfig(),
          body: o
        }).then((e => e.text())).then((t => {
          cartPageRender(t);
        })).catch((() => {
          //console.log('removeServicePlan error 2');
          document.body.classList.remove('cart--loading');
        })).finally((() => {
          //console.log('finally PER PER');
          // document.body.classList.remove('cart--loading');
        }));
        //console.log('Remove plan properties form main item END');
      })).catch((() => {
        //console.log('removeServicePlan error');
        document.body.classList.remove('cart--loading');
      })).finally((() => {
        //console.log('finally PER');
        //window.cart_items.disableLoading(item.line_index);
      }));
      //console.log('Remove Protection plan product END');

    } else {
      const input_this = this;
      const checked_input = ele.closest('label').querySelector('input:checked');
      const item_key = ele.closest('[data-item-key]').getAttribute('data-item-key');
      const value = checked_input.value;
      const value_id = checked_input.dataset.variant;
      const selectedEle = document.querySelector('.cart-items .cart-item[data-item-key="' + item_key + '"]');
      if (selectedEle) {
        const item = { ...JSON.parse(selectedEle.querySelector('.cart-item-json').innerHTML), line_index: Number(selectedEle.querySelector('.quantity__input').dataset.index) };
        const input_obj = {};
        let item_properties = item.properties;
        item_properties["_service_plan"] = value;
        item_properties["_plan_price"] = checked_input.dataset.price;
        item_properties["_plan_id"] = item.variant_id.toString();
        item_properties["_service_plan_price"] = parseInt(checked_input.dataset.price.trim());
        //console.log(item_properties, 'item_properties');

        let checkProduct = checkProductAdded(item, value);

        checkProduct.selected_service_item = checkProduct.selected_service_item == undefined ? {} : checkProduct.selected_service_item;
        // console.log(checkProduct, 'checkProductAdded');         

        let body_data = {
          id: item_key,
          quantity: item.quantity,
          properties: item_properties
        }        

        // console.log('body_data', body_data);
        const n = JSON.stringify(body_data);

        document.body.classList.add('cart--loading');

        /* Change API 1 */
        fetch(`${!checkProduct.alredyAddPlan ? routes.cart_change_url : routes.cart_change_url}`, {
          ...fetchConfig(),
          body: n
        }).then((e => e.text())).then((t => {
          //  console.log('First resposnse', JSON.parse(t));
          let renderPro = {
            sections: document.querySelector('cart-items').getSectionsToRender().map((e => e.section)),
            sections_url: window.location.pathname
          };
          let second_body_data = {
            id: value_id,
            quantity: item.quantity,
            properties: {
              _plan_id: item.variant_id,
              _protection_product: "",
              For: item.title,
              _service_product: "",
              _lineID: item_properties['_lineID'],
              _timestamp: item_properties['_timestamp'],
              _plan_price: checked_input.dataset.price,
            }
          };

          second_body_data = { ...second_body_data, ...renderPro };

          

          /* Change/Add API 2*/
          //  console.log('second_body_data', second_body_data);
          const o = JSON.stringify(second_body_data);
          fetch(`${!checkProduct.alredyAddPlan ? routes.cart_add_url : routes.cart_update_url}`, {
            ...fetchConfig(),
            body: o
          }).then((e => e.text())).then((t => {
            // console.log('Second resposnse', JSON.parse(t));
            if (!Object.entries(checkProduct.selected_service_item).length) {
              cartPageRender(t);
            } else {
              /* Change API 3*/
              let thid_body_data = {
                id: checkProduct.cart_service_item.key,
                quantity: input_this.qty,
                properties: checkProduct.cart_service_item.properties
              };
              if (!checkProduct.hasDiffrentService) {
                thid_body_data = { ...thid_body_data, ...renderPro };
              }
              //  console.log('thid_body_data', thid_body_data);                  
              fetch(`${routes.cart_change_url}`, {
                ...fetchConfig(),
                body: JSON.stringify(thid_body_data)
              }).then((e => e.text())).then((t => {
                if (!checkProduct.hasDiffrentService) {
                  cartPageRender(t);
                } else {
                  /* Change API 4*/
                  let fourth_body_data = {
                    id: checkProduct.selected_service_item.key,
                    quantity: 0,
                    ...renderPro
                  };
                  //  console.log('fourth_body_data', fourth_body_data);
                  fetch(`${routes.cart_change_url}`, {
                    ...fetchConfig(),
                    body: JSON.stringify(fourth_body_data)
                  }).then((e => e.text())).then((t => {
                    cartPageRender(t);
                  }))
                  /* Change API 4*/
                }
              })).catch((() => {
                //console.log('addProtectionPlanProduct error 3');
                document.body.classList.remove('cart--loading');
              })).finally((() => {
                //console.log('finally PE PE PE');
              }));
              /* Change API 3*/
            }
          })).catch((() => {
            //console.log('addProtectionPlanProduct error 2');
            document.body.classList.remove('cart--loading');
          })).finally((() => {
            //console.log('finally PE PE');
          }));
          /* Change/Add API 2*/
        })).catch((() => {
          //console.log('addProtectionPlanProduct error');
          document.body.classList.remove('cart--loading');
        })).finally((() => {
          //console.log('finally PE');
        }));
        /* Change API 1 */
      } else {
        //console.log('else', item_key);
      }
    }

  }
}

function removeServicePlan(event, ele) {
  // console.log('in',ele.closest('.cart-item'));
  const selectedEle = ele.closest('.cart-item');
  if (selectedEle) {
    const item_key = selectedEle.getAttribute('data-item-key');
    const item = { ...JSON.parse(selectedEle.querySelector('.cart-item-json').innerHTML), line_index: Number(selectedEle.querySelector('.quantity__input').dataset.index) };
    const input_obj = {};
    let item_properties = item.properties;
    item_properties["_service_plan"] = 'Declined Service Plan';
    item_properties["_plan_price"] = '0.00';
    delete item_properties["_plan_id"];
    item_properties = Object.keys(item_properties).length == 0 ? { '_': '' } : item_properties;


    let updates = {};
    // console.log('ele.dataset.protectionKey', ele.dataset.protectionKey, ele);
    if (!ele.dataset.protectionKey) return;
    updates[ele.dataset.protectionKey] = 0;
    // if(selectedEle.querySelector('.cart_pro_extended')){
    //    delete item_properties["warranty-extension"];
    //    updates[selectedEle.querySelector('.cart_pro_extended').dataset.key] = 0;
    // }
    const removeServicePlan = JSON.stringify({ updates });
    // console.log('Remove Protection plan product', removeServicePlan);

    // window.cart_items.enableLoading(item.line_index);
    document.body.classList.add('cart--loading');
    fetch(`${routes.cart_update_url}`, {
      ...fetchConfig(),
      body: removeServicePlan
    }).then((e => e.text())).then((t => {

      let hasError = cartPageRender(t, true);
      //console.log('hasError', hasError);
      if (hasError != undefined && hasError != '') {
        const a = document.getElementById(`Quantity-${item.line_index}`) || document.getElementById(`Drawer-quantity-${item.line_index}`),
          i = document.querySelectorAll(".cart-item");
        document.querySelector('cart-items').updateLiveRegions(item.line_index, hasError);
        //console.log('-------------------------------------hasError');
        return;
      };

      const o = JSON.stringify({
        id: item_key,
        quantity: item.quantity,
        properties: item_properties,
        sections: document.querySelector('cart-items').getSectionsToRender().map((e => e.section)),
        sections_url: window.location.pathname
      });
      //console.log('Remove plan properties form main item', o);
      fetch(`${routes.cart_change_url}`, {
        ...fetchConfig(),
        body: o
      }).then((e => e.text())).then((t => {
        cartPageRender(t);
      })).catch((() => {
        //console.log('removeServicePlan error 2');
        document.body.classList.remove('cart--loading');
      })).finally((() => {
        //console.log('finally PER PER');
        // document.body.classList.remove('cart--loading');
      }));
      //console.log('Remove plan properties form main item END');
    })).catch((() => {
      //console.log('removeServicePlan error');
      document.body.classList.remove('cart--loading');
    })).finally((() => {
      //console.log('finally PER');
      //window.cart_items.disableLoading(item.line_index);
    }));
    //console.log('Remove Protection plan product END');
  }
}
/* Protection Plan */







/* Services */
function serviceInputChange(event, element) {
  const ele_input = element.querySelector('input');
  const selected_inputs = element.closest('.services-list').querySelectorAll('input.swapped:checked');
  const inputChecked = ele_input.checked;
  ele_input.checked = false;  
  
  if( ele_input.closest('.cart-item').querySelector('.loading-overlay') ){
    ele_input.closest('.cart-item').querySelector('.loading-overlay').classList.remove('hidden');
  }

  // if (document.querySelector('.opt-box.active').hasAttribute('data-method') == false || document.querySelector('.opt-box.active').dataset.method == 'pickup') {
  //   return;
  // }

  if (element.closest('.additional-services').classList.contains('disabled_services')) {
    if (document.querySelectorAll('.temp-active').length > 0) {
      for (var i = 0; i < document.querySelectorAll('.temp-active').length; i++) {
        document.querySelectorAll('.temp-active')[i].classList.remove('temp-active');
      }
      element.classList.add('temp-active');
    } else {
      element.classList.add('temp-active');
    }
    var service_selector = `#${element.dataset.service}-services`;
    document.querySelector(service_selector).show();
    return;
  }



  const selectedEle = element.closest('.cart-item');
  const item_key = selectedEle.getAttribute('data-item-key');
  const item = { ...JSON.parse(selectedEle.querySelector('.cart-item-json').innerHTML), line_index: Number(selectedEle.querySelector('.quantity__input').dataset.index) };
  //   console.log('item', item);   

  let hasServiceChecked = false;
  let prevoiusCheckedElement;


  if (selected_inputs.length > 1) {
    element.closest('.services-list').querySelectorAll('input.swapped:checked').forEach((temp_input) => {
      if (ele_input == temp_input) return;
      hasServiceChecked = true;
      prevoiusCheckedElement = temp_input;
      //temp_input.checked = false;
    });
  }

  document.body.classList.add('cart--loading');
  //   console.log('inputChecked',inputChecked,hasServiceChecked);
  if (inputChecked) {
    if (!hasServiceChecked) {
      const properties = addOrRemoveServicePro(ele_input, item, item.properties, true);
      const item_data = {
        id: item_key,
        quantity: item.quantity,
        properties: properties
      };
      const service_data = {
        id: ele_input.dataset.val,
        quantity: item.quantity,
        properties: {
          _service_id: item.variant_id,
          _service_product: "",
          _product_key: properties["_refrence_id"],
          Product_Name: item.title,
          For: item.sku
        },
        sections: document.querySelector('cart-items').getSectionsToRender().map((e => e.section)),
        sections_url: window.location.pathname
      };
      //console.log('Add Service >>>');
      addUpdateService(item, item_data, service_data);
      //console.log('Add Service <<<');
    } else {
      /* Swaaped Service */

      const item_properties = item.properties;
      item_properties["_Service"] = ele_input.value;
      item_properties["_service_price"] = ele_input.dataset.price;
      const item_change_data = {
        id: item_key,
        quantity: item.quantity,
        properties: item_properties
      };

      const properties = addOrRemoveServicePro(ele_input, item, item.properties, true, true);
      const add_data = {
        id: ele_input.dataset.val,
        quantity: item.quantity,
        properties: properties,
        sections: document.querySelector('cart-items').getSectionsToRender().map((e => e.section)),
        sections_url: window.location.pathname
      };

      const change_data = {
        id: prevoiusCheckedElement.dataset.itemKey,
        quantity: 0
      };
      //console.log('Swapped Service >>>');
      addUpdateService(item, item_change_data, change_data, false, add_data);
      //console.log('Swapped Service <<<');
      /* Swaaped Service */
    }
  } else {
    /* Removed Service */
    if (ele_input.dataset.hasServices == "false" || ele_input.dataset.itemKey == undefined) return;
    const properties = addOrRemoveServicePro(ele_input, item, item.properties, false);
    const item_data = {
      id: item_key,
      quantity: item.quantity,
      properties: Object.keys(properties).length == 0 ? { '_': '' } : properties,
      sections: document.querySelector('cart-items').getSectionsToRender().map((e => e.section)),
      sections_url: window.location.pathname
    };

    const service_data = {
      id: ele_input.dataset.itemKey,
      quantity: 0
    };
    //console.log('Removed Service >>>', item_data);
    addUpdateService(item, service_data, item_data, true);
    //console.log('Removed Service <<<');
    /* Removed Service */
  }
}

function addOrRemoveServicePro(input_elemnt, item, ser_pro, addOrRemove, getServicePro = false) {
  delete ser_pro['Free box'];
  if (getServicePro) {
    let service_pro = {
      _service_id: item.variant_id,
      _service_product: "",
      _product_key: ser_pro["_refrence_id"],
      Product_Name: item.title,
      For: item.sku
    }
    return service_pro;
  } else {
    if (addOrRemove) {
      ser_pro["_Service"] = input_elemnt.value;
      ser_pro["_service_price"] = input_elemnt.dataset.price;
      ser_pro["_service_id"] = item.variant_id.toString();
      ser_pro["_refrence_id"] = (Math.random() + 1).toString(36).substr(2, 10);
    } else {
      delete ser_pro["_Service"];
      delete ser_pro["_service_price"];
      delete ser_pro["_service_id"];
      delete ser_pro["_refrence_id"];
    }
    return ser_pro;
  }
}

function addUpdateService(cartItem, item_data, service_data, removeService = false, change_data = {}) {
  //console.log('addUpdateService Start');
  //console.log('------removeService has', removeService, service_data);
  //   console.log('item_data', item_data);   

  fetch(`${removeService ? routes.cart_change_url : routes.cart_change_url}`, {
    ...fetchConfig(),
    body: JSON.stringify(item_data)
  }).then((e => e.text())).then((t => {

    let hasError = cartPageRender(t, true);
    //console.log('hasError', hasError);
    if (hasError != undefined && hasError != '') {
      const a = document.getElementById(`Quantity-${cartItem.line_index}`) || document.getElementById(`Drawer-quantity-${cartItem.line_index}`),
        i = document.querySelectorAll(".cart-item");
      document.querySelector('cart-items').updateLiveRegions(cartItem.line_index, hasError);
      return;
    };

    //   console.log('service_data', service_data,Object.keys(change_data).length);
    const o = service_data;
    const innerURL = removeService ? routes.cart_change_url :
      Object.keys(change_data).length > 1 ? routes.cart_change_url : routes.cart_add_url;
    fetch(`${innerURL}`, {
      ...fetchConfig(),
      body: JSON.stringify(o)
    }).then((e => e.text())).then((t2 => {

      //   console.log('change_data', change_data,Object.keys(change_data).length);
      if (Object.keys(change_data).length > 1) {
        fetch(`${routes.cart_add_url}`, {
          ...fetchConfig(),
          body: JSON.stringify(change_data)
        }).then((e => e.text())).then((t3 => {
          cartPageRender(t3);
        })).catch((() => {
          document.body.classList.remove('cart--loading');
        })).finally((() => {
          //console.log('finally SE SE SE');
        }));
      } else {
        cartPageRender(t2);
      }

    })).catch((() => {
      //console.log('finally SE SE1111');
      document.body.classList.remove('cart--loading');
    })).finally((() => {
      if (Object.keys(change_data).length == 0) {
        //console.log('finally SE SE');
      }
    }));
  })).catch((() => {
    //console.log('finally SE SE2222');
    document.body.classList.remove('cart--loading');
  })).finally((() => {
    //console.log('finally SE');
  }));
  //console.log('addUpdateService End');
}
/* Services */