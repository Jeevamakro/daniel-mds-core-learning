/*
  makro-quick-order.js
  Pure JavaScript implementation
  Usage: Add an element with id="quick-order-pad" to your HTML, then call:
    makro-quick-order.js
    <script>QuickOrderPad.init({ containerId: 'quick-order-pad' });</script>

  Notes:
  - This script will fetch `/quickpad-sku-map.json` (same as the original) if available.
  - It provides the same core features: paste parsing, CSV upload, template download,
    quantity editing, remove/clear, and a simulated Add All to Cart.
*/


(function (global) {
    const create = (tag, attrs = {}, children = []) => {
      const el = document.createElement(tag);
      Object.keys(attrs).forEach((k) => {
        if (k === 'className') el.className = attrs[k];
        else if (k === 'html') el.innerHTML = attrs[k];
        else if (k.startsWith('data-')) el.setAttribute(k, attrs[k]);
        else if (k === 'dataset' && typeof attrs[k] === 'object') {
          Object.assign(el.dataset, attrs[k]);
        } else if (k === 'for') el.htmlFor = attrs[k];
        else if (k === 'checked') el.checked = attrs[k];
        else if (k === 'value') el.value = attrs[k];
        else el.setAttribute(k, attrs[k]);
      });
      (Array.isArray(children) ? children : [children]).forEach((c) => {
        if (c == null) return;
        if (typeof c === 'string') el.appendChild(document.createTextNode(c));
        else el.appendChild(c);
      });
      return el;
    };
  
    function formatCurrency(amount, currency = 'CAD') {
      try {
        return amount.toLocaleString('en-CA', { style: 'currency', currency });
      } catch (e) {
        return `${currency} ${amount.toFixed(2)}`;
      }
    }
  
    function showToast(message, type = 'info') {
      let container = document.getElementById('qop-toast-container');
      if (!container) {
        container = create('div', { id: 'qop-toast-container', className: 'qop-toast-container' });
        Object.assign(container.style, {
          position: 'fixed',
          right: '16px',
          bottom: '16px',
          zIndex: 99999,
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        });
        document.body.appendChild(container);
      }
  
      const toast = create('div', { className: `qop-toast qop-toast-${type}` }, message);
      Object.assign(toast.style, {
        background: type === 'error' ? '#f87171' : '#111827',
        color: 'white',
        padding: '8px 12px',
        borderRadius: '6px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.12)',
        fontSize: '13px',
      });
      container.appendChild(toast);
      setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => container.removeChild(toast), 300);
      }, 3000);
    }
  
    function QuickOrderPadModule() {
      let skuMapping = null;
      let orderLines = [];
      const settings = { defaultQuantity: default_qty, showPrice: true };
      let isLoading = false;
  
      const state = { container: null };

      //   async function fetchMapping() {
      //     try {
      //       const res = await fetch('/quickpad-sku-map.json');
      //       if (!res.ok) throw new Error('Network response was not ok');
      //       skuMapping = await res.json();
      //     } catch (err) {
      //       console.warn('Could not load SKU mapping:', err);
      //       showToast('Failed to load product data', 'error');
      //       skuMapping = null;
      //     }
      //   }

      // Override fetchMapping to use metafield instead of fetching /quickpad-sku-map.json

      async function fetchMapping() {
        // Use built-in json_data variable as SKU mapping
        skuMapping = json_data;
        if (!skuMapping) {
          showToast(
            'Error: Could not load order pad data from built-in variable json_data.',
            'error'
          );
          throw new Error('Failed to load SKU mapping from json_data');
        }
      }

      function lookupSKU(sku) {
        if (!skuMapping || !sku) return null;
        const upper = sku.toUpperCase().trim();
        if (skuMapping.items && skuMapping.items[upper]) return skuMapping.items[upper];
        if (skuMapping.items) {
          for (const item of Object.values(skuMapping.items)) {
            if (item.aliases && item.aliases.some(a => a.toUpperCase() === upper)) return item;
          }
        }
        return null;
      }

      function parseLines(input, csv = false) {
        const lines = String(input || '').split('\n').map(l => l.trim()).filter(Boolean);
        const parsed = [];
        const base = Date.now();
        lines.forEach((line, idx) => {

          const parts = line.split(/[,\s\t]+/);
          const sku = parts[0];
          let qty = parts[1] ? parseInt(parts[1], 10) : settings.defaultQuantity;
          if (isNaN(qty) || qty < 1) qty = settings.defaultQuantity;
          let item;
          item = lookupSKU(sku);
          // if (csv) {
          //   if (sku.includes('-')) {
          //     var lastDash = sku.lastIndexOf('-');
          //     var beforeDash = sku.substring(0, lastDash);
          //     item = lookupSKU(beforeDash);
          //   } else {
          //     item = lookupSKU(sku);
          //   }
          // } else {
          //   item = lookupSKU(sku);
          // }

          parsed.push({
            id: `${base}-${idx}`,
            //sku: String(sku).toUpperCase(),
            sku: parts[0].toUpperCase(),
            originalSku: sku,
            quantity: qty,
            originalQuantity: qty,
            status: item ? 'valid' : 'Not-found',
            item,
          });
        });
        return parsed;
      }

      function mergeOrderLines(existing, adds) {
        // Merge new lines with previous lines, combine qty for same SKU if found (case-insensitive).
        // If the combination logic should be replaced (e.g., not combine, just append), change here.
        // But default: group by SKU (case-insensitive), sum qty.
        const map = {};
        function key(line) {
          // We match by .sku normalized upper case
          return line.sku ? line.sku.toUpperCase().trim() : '';
        }
        [...existing, ...adds].forEach(line => {
          const k = key(line);
          if (!k) return;
          if (map[k]) {
            // Sum qty, but keep mainline details from previous
            map[k].quantity += line.quantity;
          } else {
            // Clone to avoid reference bugs
            map[k] = Object.assign({}, line);
          }
        });
        return Object.values(map);
      }

      function downloadTemplate() {
        const csv = 'sku,qty\n07554,10\nEM-2001,5\nTB-9950,1';
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'quick-order-template.csv';
        a.click();
        URL.revokeObjectURL(url);
        showToast('Template downloaded');
      }

      function simulateAddToCart(validLines) {
        const cartItems = validLines.map(l => ({ id: l.item.variant_id, quantity: l.quantity }));
        

        var add_obj = {
          items : cartItems
        }
        
        this.cart = document.querySelector('cart-drawer');

        const config = fetchConfig();
        //config.headers['X-Requested-With'] = 'XMLHttpRequest';
        //delete config.headers['Content-Type'];
        

        if (this.cart) {
          add_obj['sections'] = this.cart.getSectionsToRender().map((section) => section.id);
          add_obj['sections_url'] = window.location.pathname;
          this.cart.setActiveElement(document.activeElement);
        }

        config.body = JSON.stringify(add_obj);
        console.log('Adding to cart:', add_obj);

        fetch(`${routes.cart_add_url}`, config)
        .then((response) => response.json())
        .then((response) => {
          if (response.status) {
            this.error = true;
            return;
          } else if (!this.cart) {
            window.location = window.routes.cart_url;
            return;
          }

          this.error = false;
          this.cart.renderContents(response);
        })
        .catch((e) => {
          console.error(e);
        })
        .finally(() => {
          if (this.cart && this.cart.classList.contains('is-empty')) this.cart.classList.remove('is-empty');
        });
        return new Promise(resolve => setTimeout(resolve, 700));
      }

      function render(container) {
        state.container = container;
        container.innerHTML = '';

        const wrapper = create('div', { className: 'app', html: '' });

        // Header
        const header = create('div', { className: 'card-header', html: '' });
        header.appendChild(create('div'));
        header.querySelector('div').appendChild(create('h2', { className: 'h2', html: title }));
        header.querySelector('div').appendChild(create('p', { className: 'subheading', html: subheading }));
        wrapper.appendChild(header);

        // csv and direct paste buttons
        const csv_btns = create('div', { className: 'upload-bar', html: '' });
        const pastebutton = create('button', { className: 'upload-btn active', type: 'button', html: 'Paste', 'data-title': 'paste' });
        const csvbutton = create('button', { className: 'upload-btn ', type: 'button', html: 'Upload CSV', 'data-title': 'csv' });
        csv_btns.appendChild(pastebutton);
        csv_btns.appendChild(csvbutton);
        pastebutton.addEventListener('click', () => {
          pastebutton.classList.add('active');
          csvbutton.classList.remove('active');
          const pasteDiv = container.querySelector('.qop-paste');
          const uploadDiv = container.querySelector('.qop-upload');
          if (pasteDiv) pasteDiv.classList.remove('hidden');
          if (uploadDiv) uploadDiv.classList.add('hidden');
        });
        csvbutton.addEventListener('click', () => {
          csvbutton.classList.add('active');
          pastebutton.classList.remove('active');
          const pasteDiv = container.querySelector('.qop-paste');
          const uploadDiv = container.querySelector('.qop-upload');
          if (pasteDiv) pasteDiv.classList.add('hidden');
          if (uploadDiv) uploadDiv.classList.remove('hidden');
        });
        wrapper.appendChild(csv_btns);

        // Tabs (paste/upload)
        const tabs = create('div', { className: 'qop-tabs' });

        const pasteArea = create('div', { className: 'qop-paste' });
        const pasteLabel = create('label', { className: 'h4', html: 'Enter SKUs <span>(one per line: SKU,qty or SKU qty or just SKU)</span>' });
        const pasteTextarea = create('textarea', {
          rows: 8,
          placeholder: "10020SP,10\nRF178ANUX1 5\nZVWS361SRSS"
        });
        pasteArea.appendChild(pasteLabel);
        pasteArea.appendChild(pasteTextarea);

        // REPLACE: Add items button logic to merge with previous orderLines
        const parseBtn = create('button', { className: 'parse-btn', type: 'button', html: 'Add items to order' });
        parseBtn.addEventListener('click', () => {
          const text = pasteTextarea.value;
          if (!text.trim()) { showToast('Please enter SKUs to parse', 'error'); return; }
          const newLines = parseLines(text, true);
          orderLines = mergeOrderLines(orderLines, newLines);
          showToast(`Added ${newLines.length} line(s) to order`);
          update();
        });
        pasteArea.appendChild(parseBtn);

        const uploadArea = create('div', { className: 'qop-upload hidden' });
        const uploadBox = create('div', {
          className: 'qop-upload-box'
        });
          
        // upload icon (simple arrow or upload svg)
        const uploadIcon = create('div', {
          className: 'csv-upload-icon',
          html: `
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M17 18H7C5.895 18 5 17.105 5 16V13C5 12.447 5.448 12 6 12C6.552 12 7 12.447 7 13V16H17V13C17 12.447 17.448 12 18 12C18.552 12 19 12.447 19 13V16C19 17.105 18.105 18 17 18Z" fill="#8cb8e1"/>
              <path d="M12 16C11.448 16 11 15.552 11 15V8.414L9.707 9.707C9.317 10.098 8.683 10.098 8.293 9.707C7.902 9.317 7.902 8.683 8.293 8.293L11.293 5.293C11.684 4.902 12.316 4.902 12.707 5.293L15.707 8.293C16.098 8.683 16.098 9.317 15.707 9.707C15.317 10.098 14.684 10.098 14.293 9.707L13 8.414V15C13 15.552 12.552 16 12 16Z" fill="#2980d9"/>
            </svg>
          `,
          style: 'margin-bottom: 5px;'
        });

        

        // Styled file input for accessibility, remains visually hidden
        const fileInput = create('input', {
          type: 'file',
          accept: '.csv',
          style: 'display: none;'
        });

         const uploadLabel = create('div', {
          className: 'csv-update-note',
          html: 'Upload a CSV file with columns: sku,qty'
        });

        // The visible button to trigger file input
        const fileInputBtn = create('button', {
          type: 'button',
          html: 'Choose CSV',
          className: 'select-file-btn csv-file-btn'
        });
        fileInputBtn.addEventListener('click', () => fileInput.click());

        uploadBox.appendChild(uploadIcon);
        uploadBox.appendChild(uploadLabel);
        uploadBox.appendChild(fileInputBtn);
        uploadBox.appendChild(fileInput);

        uploadArea.appendChild(uploadBox);

        // REPLACE: CSV upload logic to merge with previous orderLines
        fileInput.addEventListener('change', (e) => {
          const file = e.target.files && e.target.files[0];
          if (!file) return;
          const reader = new FileReader();
          reader.onload = (ev) => {
            const text = ev.target && ev.target.result ? ev.target.result : '';
            const lines = String(text).split('\n').slice(1);
            const csvText = lines.map(line => {
              const [sku, qty] = line.split(',').map(s => s && s.trim());
              return qty ? `${sku},${qty}` : sku;
            }).join('\n');
            const newLines = parseLines(csvText, true);
            orderLines = mergeOrderLines(orderLines, newLines);
            showToast(`Uploaded ${newLines.length} line(s) from CSV`);
            update();
          };
          reader.readAsText(file);
          fileInput.value = '';
        });
        uploadArea.appendChild(fileInput);

        const downloadBtn = create('button', { type: 'button', className: 'download-temp-btn', html: 'Download Template' });
        downloadBtn.addEventListener('click', downloadTemplate);
        uploadArea.appendChild(downloadBtn);

        tabs.appendChild(pasteArea);
        tabs.appendChild(uploadArea);
        wrapper.appendChild(tabs);

        // Table area
        const tableArea = create('div', { className: 'qop-table-area' });
        wrapper.appendChild(tableArea);

        // Status
        const status = create('div', { className: 'qop-status hidden', html: '' });
        wrapper.appendChild(status);

        // Empty state
        const emptyState = create('div', { className: 'empty-state', html: '' });
        emptyState.appendChild(create('p', { html: 'No items yet. Paste or upload SKUs to get started.' }));
        emptyState.appendChild(create('span', { html: 'Try: 07554,10 or EM-2001 5 or A-07554' }));
        wrapper.appendChild(emptyState);

        // Controls footer
        const footer = create('div', { className: 'qop-footer hidden' });
        const clearBtn = create('button', {
          className: 'qop-footer-btn',
          type: 'button',
          html: `
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M6.66663 7.33337V11.3334" stroke="currentcolor" stroke-width="1.33333" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M9.33337 7.33337V11.3334" stroke="currentcolor" stroke-width="1.33333" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M12.6667 4V13.3333C12.6667 13.687 12.5262 14.0261 12.2762 14.2761C12.0261 14.5262 11.687 14.6667 11.3334 14.6667H4.66671C4.31309 14.6667 3.97395 14.5262 3.7239 14.2761C3.47385 14.0261 3.33337 13.687 3.33337 13.3333V4" stroke="currentcolor" stroke-width="1.33333" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M2 4H14" stroke="currentcolor" stroke-width="1.33333" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M5.33337 4.00004V2.66671C5.33337 2.31309 5.47385 1.97395 5.7239 1.7239C5.97395 1.47385 6.31309 1.33337 6.66671 1.33337H9.33337C9.687 1.33337 10.0261 1.47385 10.2762 1.7239C10.5262 1.97395 10.6667 2.31309 10.6667 2.66671V4.00004" stroke="currentcolor" stroke-width="1.33333" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    Clear All`
        });
        clearBtn.addEventListener('click', () => {
          orderLines = [];
          pasteTextarea.value = '';
          status.textContent = '';
          showToast('All lines cleared');
          update();
        });
        const addAllBtn = create('button', {
          className: 'qop-footer-btn',
          type: 'button',
          html: `
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none" style="vertical-align:middle;">
                  <path d="M5.33329 14.6667C5.70148 14.6667 5.99996 14.3682 5.99996 14C5.99996 13.6319 5.70148 13.3334 5.33329 13.3334C4.9651 13.3334 4.66663 13.6319 4.66663 14C4.66663 14.3682 4.9651 14.6667 5.33329 14.6667Z" stroke="white" stroke-width="1.33333" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M12.6667 14.6667C13.0349 14.6667 13.3333 14.3682 13.3333 14C13.3333 13.6319 13.0349 13.3334 12.6667 13.3334C12.2985 13.3334 12 13.6319 12 14C12 14.3682 12.2985 14.6667 12.6667 14.6667Z" stroke="white" stroke-width="1.33333" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M1.3667 1.3667H2.70003L4.47337 9.6467C4.53842 9.94994 4.70715 10.221 4.95051 10.4133C5.19387 10.6055 5.49664 10.7069 5.8067 10.7H12.3267C12.6301 10.6995 12.9244 10.5956 13.1607 10.4053C13.3971 10.215 13.5615 9.94972 13.6267 9.65336L14.7267 4.70003H3.41337" stroke="white" stroke-width="1.33333" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                Add All to Cart`
        });
        addAllBtn.addEventListener('click', async () => {
          const valid = orderLines.filter(l => l.status === 'valid');
          if (!valid.length) { showToast('No valid items to add to cart', 'error'); return; }
          isLoading = true; update();
          try {
            await simulateAddToCart(valid);
            showToast(`Added ${valid.length} items to cart`);
            orderLines = []; pasteTextarea.value = ''; status.textContent = '';
            update();
          } catch (err) {
            showToast('Failed to add items to cart', 'error');
          } finally {
            isLoading = false; update();
          }
        });
        footer.appendChild(clearBtn);
        footer.appendChild(addAllBtn);
        wrapper.appendChild(footer);

        // Keep references
        container.appendChild(wrapper);

        // keyboard shortcut
        window.addEventListener('keydown', (e) => {
          if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            parseBtn.click();
          }
        });

        // initial render
        update();

        // expose some elements for updating
        return { container, wrapper, pasteTextarea, tableArea, status, emptyState, footer };
      }

      function renderTable(tableArea) {
        tableArea.innerHTML = '';
        if (!orderLines.length) return;

        //console.log(orderLines,'orderLines');

        const table = create('table');
        table.style.borderCollapse = 'separate';

        // header
        const thead = create('thead');
        const hr = create('tr');
        
        ['SKU / Item', 'Title', 'Qty', settings.showPrice ? 'Price' : null, 'Availability', 'Status', ''].forEach(h => {
          if (h == null) return;
          const th = create('th', { html: h });
          th.style.textAlign = 'left';
          hr.appendChild(th);
        });
        thead.appendChild(hr);
        table.appendChild(thead);

        const tbody = create('tbody');
        orderLines.forEach(line => {
          const tr = create('tr');
          const skuCell = create('td', { html: '' });
          skuCell.appendChild(create('div', { html: line.sku }));
          //if (line.item) skuCell.appendChild(create('div', { html: `#${line.item.variant_id}` }));
          tr.appendChild(skuCell);

          const titleCell = create('td', { html: line.item ? line.item.title : '—' });
          titleCell.style.padding = '8px';
          tr.appendChild(titleCell);

          const qtyCell = create('td', { html: '' });
          qtyCell.style.padding = '8px';
          const qtyWrapper = create('div', { class: 'qty-wrapper' });
          const minusBtn = create('button', { 
            type: 'button', 
            class: 'qty-btn minus', 
            html: `
              <svg class="quantity__button_minus" width="8" height="2" viewBox="0 0 8 2" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M0.944 1.92V0.784H7.28V1.92H0.944Z" fill="currentColor"></path>
              </svg>`
          });
          const qtyInput = create('input', { type: 'number', value: line.quantity, min: 1 });
          // qtyInput.style.width = '64px';
          qtyInput.addEventListener('change', (e) => {
            const v = parseInt(e.target.value, 10);
            if (isNaN(v) || v < 1) { e.target.value = line.quantity; return; }
            line.quantity = v; update();
          });
          const plusBtn = create('button', { 
            type: 'button', 
            html: `<svg class="quantity__button_plus" width="8" height="8" viewBox="0 0 8 8" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0.679875 4.92V3.784H3.73588V0.872H4.93588V3.784H7.99188V4.92H4.93588V7.848H3.73588V4.92H0.679875Z" fill="currentColor"></path>
            </svg>`, 
            class: 'qty-btn plus' 
          });

          // Handle minus button click
          minusBtn.addEventListener('click', () => {
            if (line.quantity > 1) {
              line.quantity -= 1;
              qtyInput.value = line.quantity;
              update();
            }
          });

          // Handle plus button click
          plusBtn.addEventListener('click', () => {
            line.quantity += 1;
            qtyInput.value = line.quantity;
            update();
          });

          
          qtyWrapper.appendChild(minusBtn);
          qtyWrapper.appendChild(qtyInput);
          qtyWrapper.appendChild(plusBtn);
          qtyCell.appendChild(qtyWrapper);
          tr.appendChild(qtyCell);

          if (settings.showPrice) {
            const priceCell = create('td', { html: '' });
            priceCell.style.padding = '8px';
            priceCell.style.textAlign = 'left';
            priceCell.appendChild(create('div', { html: line.item ? formatCurrency(line.item.price * line.quantity, skuMapping && skuMapping.meta && skuMapping.meta.currency) : '—' }));
            if (line.item) priceCell.appendChild(create('div', { className: 'price-per-item', html: `${formatCurrency(line.item.price, skuMapping && skuMapping.meta && skuMapping.meta.currency)}/per item` }));
            tr.appendChild(priceCell);
          }

          const availCell = create('td', { html: '' });
          availCell.style.padding = '8px';
          if (line.item) {
            if (line.item.canada_qty > 0) availCell.appendChild(create('span', { html: 'Same day (CA)' }));
            else if (line.item.us_qty > 0) availCell.appendChild(create('span', { html: '1–3 days (US)' }));
            else availCell.appendChild(create('span', { html: 'Call' }));
          } else availCell.innerHTML = '—';
          tr.appendChild(availCell);

          const statusCell = create('td');
          statusCell.style.padding = '8px';
          if (line.status === 'valid') {
            statusCell.innerHTML = `<span class="valid">${line.status}</span>`;
          } else {
            statusCell.innerHTML = `<span class="not-found">${line.status}</span>`;
            tr.classList.add('not-found-data');
          }
          tr.appendChild(statusCell);

          const actions = create('td', { html: '' });
          actions.style.padding = '8px';
          const rem = create('button', {
            type: 'button',
            className: 'remove-btn',
            html: `
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M6.66663 7.33337V11.3334" stroke="currentcolor" stroke-width="1.33333" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M9.33337 7.33337V11.3334" stroke="currentcolor" stroke-width="1.33333" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M12.6667 4V13.3333C12.6667 13.687 12.5262 14.0261 12.2762 14.2761C12.0261 14.5262 11.687 14.6667 11.3334 14.6667H4.66671C4.31309 14.6667 3.97395 14.5262 3.7239 14.2761C3.47385 14.0261 3.33337 13.687 3.33337 13.3333V4" stroke="currentcolor" stroke-width="1.33333" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M2 4H14" stroke="currentcolor" stroke-width="1.33333" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M5.33337 4.00004V2.66671C5.33337 2.31309 5.47385 1.97395 5.7239 1.7239C5.97395 1.47385 6.31309 1.33337 6.66671 1.33337H9.33337C9.687 1.33337 10.0261 1.47385 10.2762 1.7239C10.5262 1.97395 10.6667 2.31309 10.6667 2.66671V4.00004" stroke="currentcolor" stroke-width="1.33333" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>`
          });
          rem.addEventListener('click', () => { orderLines = orderLines.filter(l => l.id !== line.id); showToast('Line removed'); update(); });
          actions.appendChild(rem);
          tr.appendChild(actions);

          tbody.appendChild(tr);
        });

        table.appendChild(tbody);
        tableArea.appendChild(table);
        state.container.querySelector('textarea').value = '';
      }

      function update() {
        if (!state || !state.container) return;
        const pasteTextarea = state.container.querySelector('textarea');
        const tableArea = state.container.querySelector('.qop-table-area');
        const status = state.container.querySelector('.qop-status');
        const emptyState = state.container.querySelector('.empty-state');
        const footer_div = state.container.querySelector('.qop-footer');

        // status message
        const validLines = orderLines.filter(l => l.status === 'valid');
        let statusText = `<p>${orderLines.length} lines / ${validLines.length} valid</p>`;
        if (settings.showPrice && validLines.length) {
          const total = validLines.reduce((s, l) => s + (l.item ? l.item.price * l.quantity : 0), 0);
          statusText += `<p class="total-val h4">Total: <span>${formatCurrency(total, skuMapping?.meta?.currency)}</span></p>`;
        }
        status.innerHTML = statusText;

        if (orderLines.length > 0) {
          status.classList.remove('hidden');
          footer_div.classList.remove('hidden');
        } else {
          status.classList.add('hidden');
          footer_div.classList.add('hidden');
        }

        // render table or empty
        if (orderLines.length === 0) {
          tableArea.innerHTML = '';
          emptyState.style.display = '';
        } else {
          emptyState.style.display = 'none';
          renderTable(tableArea);
        }
      }

      async function init({ containerId }) {
        const container = document.getElementById(containerId);
        if (!container) throw new Error('Container element not found: ' + containerId);
        await fetchMapping();
        const refs = render(container);
        state.container = refs.container;
        // keep references for update
        state.container = container;
        // store refs on state for update
        state.pasteTextarea = refs.pasteTextarea;
        state.tableArea = refs.tableArea;
        state.status = refs.status;
        state.emptyState = refs.emptyState;
      }

      return { init };
    }
  
    const QuickOrderPad = QuickOrderPadModule();
    global.QuickOrderPad = QuickOrderPad;
  })(window);

QuickOrderPad.init({
  containerId: 'quick-order-pad'
});

// No default export needed; QuickOrderPad is attached to the global window object above.