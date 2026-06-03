/**
 * Quick Order Pad – custom element <quick-order-pad>
 *
 * Tabs: Paste (textarea SKU input) | Upload CSV
 * Flow: parse SKUs → lookup via Shopify search → render results table → add to cart
 *
 * Depends on globals set by the theme (global.js / constants.js):
 *   routes.cart_update_url
 *   fetchConfig()
 *   formatMoney()
 *   publish / PUB_SUB_EVENTS  (pubsub.js)
 */

if (!customElements.get('quick-order-pad')) {
  customElements.define(
    'quick-order-pad',
    class QuickOrderPad extends HTMLElement {

      /* ── Lifecycle ──────────────────────────────────────── */
      constructor() {
        super();

        this.sectionId = this.dataset.section;
        // [{ sku, qty, found, variantId, title, variantTitle, price, available }]
        this.items = [];

        this._bindTabs();
        this._bindPaste();
        this._bindCsv();
        this._bindFooterActions();
      }

      /* ── Tab switching ──────────────────────────────────── */
      _bindTabs() {
        this.querySelectorAll('.qop__tab').forEach((tab) => {
          tab.addEventListener('click', () => this._activateTab(tab));
        });
      }

      _activateTab(activeTab) {
        this.querySelectorAll('.qop__tab').forEach((t) => {
          const isActive = t === activeTab;
          t.classList.toggle('qop__tab--active', isActive);
          t.setAttribute('aria-selected', String(isActive));
        });

        this.querySelectorAll('.qop__panel').forEach((panel) => {
          const isActive = panel.id === activeTab.getAttribute('aria-controls');
          panel.classList.toggle('hidden', !isActive);
        });
      }

      /* ── Paste tab ──────────────────────────────────────── */
      _bindPaste() {
        const textarea = this.querySelector('[data-qop-textarea]');
        const parseBtn = this.querySelector('[data-qop-parse-btn]');

        textarea?.addEventListener('keydown', (e) => {
          if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            this._parseAndLookup();
          }
        });

        parseBtn?.addEventListener('click', () => this._parseAndLookup());
      }

      /* ── CSV tab ────────────────────────────────────────── */
      _bindCsv() {
        const csvInput   = this.querySelector('[data-qop-csv-input]');
        const templateBtn = this.querySelector('[data-qop-template-btn]');

        csvInput?.addEventListener('change', (e) => this._handleCsvFile(e));
        templateBtn?.addEventListener('click', () => this._downloadTemplate());
      }

      /* ── Footer buttons ─────────────────────────────────── */
      _bindFooterActions() {
        this.querySelector('[data-qop-clear-btn]')?.addEventListener('click', () => this._clearAll());
        this.querySelector('[data-qop-add-btn]')?.addEventListener('click', () => this._addToCart());
      }

      /* ── Parse textarea → lookup ────────────────────────── */
      async _parseAndLookup() {
        const textarea = this.querySelector('[data-qop-textarea]');
        if (!textarea?.value.trim()) return;

        const parsed = this._parseLines(textarea.value);
        if (parsed.length === 0) return;

        await this._lookupAll(parsed);
      }

      /* ── Parse raw text lines ───────────────────────────── */
      _parseLines(text) {
        return text
          .split('\n')
          .map((line) => line.trim())
          .filter(Boolean)
          .map((line) => {
            // Comma-separated: SKU,QTY or SKU, QTY
            if (line.includes(',')) {
              const [rawSku, rawQty] = line.split(',');
              const sku = rawSku.trim();
              const qty = parseInt(rawQty?.trim(), 10) || 1;
              return sku ? { sku, qty } : null;
            }

            // Space-separated: SKU QTY (last token is all-digits)
            const parts = line.split(/\s+/);
            if (parts.length >= 2) {
              const last = parts[parts.length - 1];
              if (/^\d+$/.test(last)) {
                const sku = parts.slice(0, -1).join(' ').trim();
                const qty = parseInt(last, 10) || 1;
                return sku ? { sku, qty } : null;
              }
            }

            // Just SKU, qty defaults to 1
            return { sku: line.trim(), qty: 1 };
          })
          .filter(Boolean);
      }

      /* ── Lookup all SKUs in parallel ────────────────────── */
      async _lookupAll(parsedItems) {
        this._setLookupStatus(true, `Looking up ${parsedItems.length} SKU${parsedItems.length !== 1 ? 's' : ''}…`);
        this._setParseBtn(true);

        try {
          const results = await Promise.all(
            parsedItems.map(({ sku, qty }) => this._lookupSku(sku, qty))
          );
          this.items = results;
          this._renderTable();
        } finally {
          this._setLookupStatus(false);
          this._setParseBtn(false);
        }
      }

      /* ── Single SKU → Shopify search → variant match ────── */
      async _lookupSku(sku, qty) {
        const base = { sku, qty };

        try {
          const searchUrl =
            `/search/suggest.json?q=${encodeURIComponent(sku)}` +
            `&resources[type]=product` +
            `&resources[options][fields]=variants.sku` +
            `&resources[options][limit]=5`;

          const searchRes = await fetch(searchUrl);
          if (!searchRes.ok) return { ...base, found: false };

          const searchData = await searchRes.json();
          const products   = searchData?.resources?.results?.products || [];

          for (const hit of products) {
            const pRes = await fetch(`/products/${hit.handle}.js`);
            if (!pRes.ok) continue;

            const product = await pRes.json();
            const variant = (product.variants || []).find(
              (v) => v.sku && v.sku.toLowerCase() === sku.toLowerCase()
            );

            if (variant) {
              return {
                sku,
                qty,
                found:        true,
                variantId:    variant.id,
                title:        product.title,
                variantTitle: variant.title !== 'Default Title' ? variant.title : null,
                price:        variant.price,          // Shopify returns cents as integer
                available:    variant.available,
                compareAtPrice: variant.compare_at_price,
              };
            }
          }
        } catch (err) {
          console.error('[QuickOrderPad] SKU lookup error for', sku, err);
        }

        return { ...base, found: false };
      }

      /* ── CSV file handler ───────────────────────────────── */
      _handleCsvFile(event) {
        const file = event.target.files?.[0];
        if (!file) return;

        const filenameEl = this.querySelector('[data-qop-csv-filename]');
        if (filenameEl) {
          filenameEl.textContent = file.name;
          filenameEl.classList.remove('hidden');
        }

        const reader = new FileReader();
        reader.onload = async (e) => {
          const parsed = this._parseCsvText(e.target.result);
          if (parsed.length > 0) await this._lookupAll(parsed);
        };
        reader.readAsText(file);

        // Allow re-selecting the same file
        event.target.value = '';
      }

      /* ── Parse CSV text ─────────────────────────────────── */
      _parseCsvText(text) {
        const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
        const result = [];

        lines.forEach((line, idx) => {
          // Skip header row
          if (idx === 0 && /^sku/i.test(line)) return;

          const cols = line.split(',');
          const sku  = cols[0]?.trim();
          const qty  = parseInt(cols[1]?.trim(), 10) || 1;
          if (sku) result.push({ sku, qty });
        });

        return result;
      }

      /* ── Download CSV template ──────────────────────────── */
      _downloadTemplate() {
        const csv  = 'sku,qty\nSKU001,5\nSKU002,10\n';
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url  = URL.createObjectURL(blob);
        const a    = document.createElement('a');
        a.href     = url;
        a.download = 'quick-order-template.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }

      /* ── Render results table ───────────────────────────── */
      _renderTable() {
        const tbody      = this.querySelector('[data-qop-tbody]');
        const resultsEl  = this.querySelector('[data-qop-results]');
        const emptyEl    = this.querySelector('[data-qop-empty-state]');
        if (!tbody || !resultsEl) return;

        const hasItems = this.items.length > 0;
        tbody.innerHTML = this.items.map((item, idx) => this._buildRow(item, idx)).join('');
        resultsEl.classList.toggle('hidden', !hasItems);
        emptyEl?.classList.toggle('hidden', hasItems);

        this._bindRowEvents();
        this._updateFooter();
      }

      /* ── Build a single table row ───────────────────────── */
      _buildRow(item, idx) {
        const delBtn = `
          <button
            type="button"
            class="qop__delete-btn"
            data-qop-delete="${idx}"
            aria-label="Remove ${this._esc(item.sku)}"
          >${this._trashIcon()}</button>`;

        if (!item.found) {
          return `
            <tr class="qop__row qop__row--not-found" data-idx="${idx}">
              <td class="qop__td qop__td--sku">${this._esc(item.sku)}</td>
              <td class="qop__td qop__td--title">&mdash;</td>
              <td class="qop__td qop__td--qty small-hide">${this._buildStepper(idx, item.qty, true)}</td>
              <td class="qop__td qop__td--price small-hide">&mdash;</td>
              <td class="qop__td qop__td--availability small-hide">&mdash;</td>
              <td class="qop__td qop__td--status small-hide">
                <span class="qop__badge qop__badge--not-found">Not found</span>
              </td>
              <td class="qop__td qop__td--action">${delBtn}</td>
            </tr>`;
        }

        const lineTotal  = item.price * item.qty;
        const availClass = item.available ? 'qop__availability--in' : 'qop__availability--out';
        const availText  = item.available ? 'In stock' : 'Out of stock';

        return `
          <tr class="qop__row${item.available ? '' : ' qop__row--unavailable'}"
              data-idx="${idx}"
              data-variant-id="${item.variantId}"
              data-price="${item.price}">
            <td class="qop__td qop__td--sku">${this._esc(item.sku)}</td>
            <td class="qop__td qop__td--title">
              <span class="qop__item-title">${this._esc(item.title)}</span>
              ${item.variantTitle ? `<span class="qop__item-variant">${this._esc(item.variantTitle)}</span>` : ''}
            </td>
            <td class="qop__td qop__td--qty small-hide">${this._buildStepper(idx, item.qty)}</td>
            <td class="qop__td qop__td--price small-hide">
              <span class="qop__price-total" data-qop-line-total="${idx}">${this._money(lineTotal)}</span>
              <span class="qop__price-per">${this._money(item.price)}/per item</span>
            </td>
            <td class="qop__td qop__td--availability small-hide">
              <span class="qop__availability ${availClass}">${availText}</span>
            </td>
            <td class="qop__td qop__td--status small-hide">
              <span class="qop__badge qop__badge--valid">valid</span>
            </td>
            <td class="qop__td qop__td--action">${delBtn}</td>
          </tr>`;
      }

      /* ── Qty stepper HTML ───────────────────────────────── */
      _buildStepper(idx, qty, disabled = false) {
        const d = disabled ? ' disabled' : '';
        return `
          <div class="qop__stepper">
            <button type="button" class="qop__stepper-btn qop__stepper-dec"
              data-qop-dec="${idx}" aria-label="Decrease quantity"${d}>&minus;</button>
            <input type="number" class="qop__stepper-input"
              value="${qty}" min="1" data-qop-qty="${idx}" aria-label="Quantity"${d}>
            <button type="button" class="qop__stepper-btn qop__stepper-inc"
              data-qop-inc="${idx}" aria-label="Increase quantity"${d}>+</button>
          </div>`;
      }

      /* ── Bind row-level events after each render ────────── */
      _bindRowEvents() {
        // Delete buttons
        this.querySelectorAll('[data-qop-delete]').forEach((btn) => {
          btn.addEventListener('click', () => {
            const idx = parseInt(btn.dataset.qopDelete, 10);
            this.items.splice(idx, 1);
            this._renderTable();
          });
        });

        // Qty input (direct edit)
        this.querySelectorAll('[data-qop-qty]').forEach((input) => {
          input.addEventListener('change', () => {
            const idx = parseInt(input.dataset.qopQty, 10);
            const qty = Math.max(1, parseInt(input.value, 10) || 1);
            input.value      = qty;
            this.items[idx].qty = qty;
            this._updateLineTotal(idx);
            this._updateFooter();
          });
        });

        // Decrement buttons
        this.querySelectorAll('[data-qop-dec]').forEach((btn) => {
          btn.addEventListener('click', () => {
            const idx  = parseInt(btn.dataset.qopDec, 10);
            const item = this.items[idx];
            if (!item || item.qty <= 1) return;
            item.qty--;
            const inp = this.querySelector(`[data-qop-qty="${idx}"]`);
            if (inp) inp.value = item.qty;
            this._updateLineTotal(idx);
            this._updateFooter();
          });
        });

        // Increment buttons
        this.querySelectorAll('[data-qop-inc]').forEach((btn) => {
          btn.addEventListener('click', () => {
            const idx  = parseInt(btn.dataset.qopInc, 10);
            const item = this.items[idx];
            if (!item) return;
            item.qty++;
            const inp = this.querySelector(`[data-qop-qty="${idx}"]`);
            if (inp) inp.value = item.qty;
            this._updateLineTotal(idx);
            this._updateFooter();
          });
        });
      }

      /* ── Update single line total cell ─────────────────── */
      _updateLineTotal(idx) {
        const item = this.items[idx];
        if (!item?.found) return;
        const cell = this.querySelector(`[data-qop-line-total="${idx}"]`);
        if (cell) cell.textContent = this._money(item.price * item.qty);
      }

      /* ── Update footer counts and total ─────────────────── */
      _updateFooter() {
        const totalLines = this.items.length;
        const validItems = this.items.filter((i) => i.found);
        const validCount = validItems.length;
        const totalCents = validItems.reduce((sum, i) => sum + i.price * i.qty, 0);

        const linesEl = this.querySelector('[data-qop-lines-count]');
        const totalEl = this.querySelector('[data-qop-total]');

        if (linesEl) {
          linesEl.textContent =
            `${totalLines} line${totalLines !== 1 ? 's' : ''} / ${validCount} valid`;
        }
        if (totalEl) totalEl.textContent = this._money(totalCents);
      }

      /* ── Clear all rows ─────────────────────────────────── */
      _clearAll() {
        this.items = [];
        this._renderTable();

        // Clear textarea
        const textarea = this.querySelector('[data-qop-textarea]');
        if (textarea) textarea.value = '';

        // Clear filename display
        const filenameEl = this.querySelector('[data-qop-csv-filename]');
        if (filenameEl) {
          filenameEl.textContent = '';
          filenameEl.classList.add('hidden');
        }
      }

      /* ── Add all valid items to cart ────────────────────── */
      async _addToCart() {
        const validItems = this.items.filter((i) => i.found && i.available && i.qty > 0);
        if (validItems.length === 0) return;

        const addBtn = this.querySelector('[data-qop-add-btn]');
        this._setButtonLoading(addBtn, true);
        this._setError('');

        const updates = {};
        validItems.forEach(({ variantId, qty }) => {
          updates[variantId] = qty;
        });

        const body = JSON.stringify({
          updates,
          sections: ['cart-icon-bubble', 'cart-drawer'],
          sections_url: window.location.pathname,
        });

        try {
          const response    = await fetch(routes.cart_update_url, { ...fetchConfig(), body });
          const parsedState = await response.json();

          publish(PUB_SUB_EVENTS.cartUpdate, {
            source:   `qop-${this.sectionId}`,
            cartData: parsedState,
          });

          this._renderCartSections(parsedState);
          this._announce('Items added to cart.');

        } catch (err) {
          console.error('[QuickOrderPad] cart update error:', err);
          this._setError(window.cartStrings?.error || 'An error occurred. Please try again.');
        } finally {
          this._setButtonLoading(addBtn, false);
        }
      }

      /* ── Re-render cart icon / drawer sections ──────────── */
      _renderCartSections(parsedState) {
        const { sections } = parsedState;
        if (!sections) return;

        const targets = [
          { id: 'cart-icon-bubble', selector: '#shopify-section-cart-icon-bubble' },
          { id: 'CartDrawer',       selector: '.drawer__inner' },
        ];

        targets.forEach(({ id, selector }) => {
          const el = document.querySelector(selector) || document.getElementById(id);
          if (!el || !sections[id]) return;

          const parsed   = new DOMParser().parseFromString(sections[id], 'text/html');
          const fragment = parsed.querySelector(selector);
          if (!fragment) return;

          if (id === 'CartDrawer') {
            el.closest('cart-drawer')?.classList.toggle('is-empty', parsedState.item_count === 0);
          }
          el.innerHTML = fragment.innerHTML;
        });
      }

      /* ── Helpers ─────────────────────────────────────────── */
      _setButtonLoading(btn, loading) {
        if (!btn) return;
        btn.classList.toggle('loading', loading);
        btn.disabled = loading;
        btn.querySelector('.loading__spinner')?.classList.toggle('hidden', !loading);
      }

      _setParseBtn(disabled) {
        const btn = this.querySelector('[data-qop-parse-btn]');
        if (!btn) return;
        btn.disabled    = disabled;
        btn.textContent = disabled ? 'Looking up SKUs…' : 'Add items to order';
      }

      _setLookupStatus(visible, text = '') {
        const el   = this.querySelector('[data-qop-lookup-status]');
        const textEl = this.querySelector('[data-qop-lookup-text]');
        if (!el) return;
        el.classList.toggle('hidden', !visible);
        if (textEl && text) textEl.textContent = text;
      }

      _setError(msg) {
        const errEl = this.querySelector('[data-qop-error]');
        if (!errEl) return;
        errEl.textContent = msg;
        errEl.classList.toggle('hidden', !msg);
      }

      _announce(text) {
        const el = this.querySelector('[data-qop-live-region]');
        if (!el) return;
        el.textContent = '';
        // Force repaint so screen readers pick up the change
        requestAnimationFrame(() => { el.textContent = text; });
        clearTimeout(this._announceTimer);
        this._announceTimer = setTimeout(() => { el.textContent = ''; }, 4000);
      }

      _money(cents) {
        if (typeof formatMoney === 'function') return formatMoney(cents);
        return '$' + (cents / 100).toFixed(2);
      }

      _esc(str) {
        return String(str ?? '')
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;');
      }

      _trashIcon() {
        return `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" stroke-width="2"
          stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <polyline points="3 6 5 6 21 6"/>
          <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
          <path d="M10 11v6"/><path d="M14 11v6"/>
          <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
        </svg>`;
      }
    }
  );
}
