/**
 * Custom T-Shirt Upload
 * Custom element: <tshirt-upload>
 *
 * Flow:
 *   1. Customer selects image → client-side preview on mockup
 *   2. Image uploaded to imgbb (if API key configured) OR compressed to base64
 *   3. Design URL/data stored in hidden cart form property
 *   4. Customer adds to cart — order includes "Custom Design" line item property
 *   5. Merchant sees the URL in the order and clicks it to view the design
 */
class TshirtUpload extends HTMLElement {
  connectedCallback() {
    this.apiKey = this.dataset.apiKey || '';
    this.maxFileSizeMb = parseFloat(this.dataset.maxFileSize) || 10;

    this.previewImage = this.querySelector('.tshirt-upload__design-image');
    this.designHint = this.querySelector('.tshirt-upload__design-hint');
    this.fileInput = this.querySelector('.tshirt-upload__file-input');
    this.dropzone = this.querySelector('.tshirt-upload__dropzone');
    this.fileInfo = this.querySelector('.tshirt-upload__file-info');
    this.fileName = this.querySelector('.tshirt-upload__file-name');
    this.fileRemove = this.querySelector('.tshirt-upload__file-remove');
    this.statusEl = this.querySelector('.tshirt-upload__status');
    this.statusText = this.querySelector('.tshirt-upload__status-text');
    this.submitBtn = this.querySelector('.tshirt-upload__add-btn');
    this.btnIdle = this.querySelector('.tshirt-upload__btn-idle');
    this.btnLoading = this.querySelector('.tshirt-upload__btn-loading');
    this.variantInput = this.querySelector('.tshirt-upload__variant-input');
    this.designUrlInput = this.querySelector('.tshirt-upload__design-url-input');
    this.designNameInput = this.querySelector('.tshirt-upload__design-name-input');
    this.form = this.querySelector('.tshirt-upload__cart-form');

    const variantsEl = this.querySelector('.tshirt-upload__variants-data');
    this.variants = variantsEl ? JSON.parse(variantsEl.textContent) : [];

    this._bindEvents();
  }

  _bindEvents() {
    this.fileInput.addEventListener('change', (e) => {
      if (e.target.files[0]) this._processFile(e.target.files[0]);
    });

    this.dropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      this.dropzone.classList.add('tshirt-upload__dropzone--active');
    });

    this.dropzone.addEventListener('dragleave', (e) => {
      if (!this.dropzone.contains(e.relatedTarget)) {
        this.dropzone.classList.remove('tshirt-upload__dropzone--active');
      }
    });

    this.dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      this.dropzone.classList.remove('tshirt-upload__dropzone--active');
      const file = e.dataTransfer.files[0];
      if (file) this._processFile(file);
    });

    this.fileRemove?.addEventListener('click', () => this._reset());

    this.querySelectorAll('.tshirt-upload__option-input').forEach((input) => {
      input.addEventListener('change', () => this._syncVariant(input));
    });

    this.form?.addEventListener('submit', (e) => {
      if (!this.designUrlInput?.value) {
        e.preventDefault();
        this._showStatus('Please upload your design before adding to cart.', 'error');
        this.querySelector('.tshirt-upload__dropzone')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
  }

  _processFile(file) {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];
    if (!allowed.includes(file.type)) {
      this._showStatus('Please upload a PNG, JPG, WebP, or SVG image.', 'error');
      return;
    }
    if (file.size > this.maxFileSizeMb * 1024 * 1024) {
      this._showStatus(`File must be smaller than ${this.maxFileSizeMb}MB.`, 'error');
      return;
    }

    this.fileName.textContent = file.name;
    this.fileInfo.hidden = false;
    this._hideStatus();

    // Preview immediately on the mockup
    const reader = new FileReader();
    reader.onload = (e) => this._showPreview(e.target.result);
    reader.readAsDataURL(file);

    // Upload in background
    this._uploadDesign(file);
  }

  _showPreview(dataUrl) {
    this.previewImage.src = dataUrl;
    this.previewImage.hidden = false;
  }

  async _uploadDesign(file) {
    this.submitBtn.disabled = true;
    this._showStatus('Saving your design…', 'loading');

    try {
      let designValue;

      if (this.apiKey) {
        designValue = await this._uploadToImgbb(file);
      } else {
        // Fallback: compress to a small thumbnail stored as base64 in the line item property.
        // The merchant will see a data URL in the order — paste it into a browser to view.
        designValue = await this._compressToDataUrl(file);
      }

      this.designUrlInput.value = designValue;
      this.designNameInput.value = file.name;
      this.submitBtn.disabled = false;
      this._showStatus('Design ready — click "Add to cart" to place your order.', 'success');
    } catch (err) {
      console.error('[TshirtUpload] Upload failed:', err);
      this._showStatus('Could not save design. Please try again or use a smaller file.', 'error');
    }
  }

  async _uploadToImgbb(file) {
    const body = new FormData();
    body.append('image', file);
    body.append('name', file.name.replace(/\.[^.]+$/, ''));

    const res = await fetch(`https://api.imgbb.com/1/upload?key=${this.apiKey}`, {
      method: 'POST',
      body,
    });

    if (!res.ok) throw new Error(`imgbb HTTP ${res.status}`);

    const json = await res.json();
    if (!json.success) throw new Error(json.error?.message || 'imgbb upload failed');

    return json.data.url;
  }

  _compressToDataUrl(file) {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);

      img.onload = () => {
        // Resize to max 300px on the longest side for the thumbnail
        const maxDim = 300;
        let w = img.naturalWidth;
        let h = img.naturalHeight;

        if (w > h) {
          if (w > maxDim) { h = Math.round((h * maxDim) / w); w = maxDim; }
        } else {
          if (h > maxDim) { w = Math.round((w * maxDim) / h); h = maxDim; }
        }

        canvas.width = w;
        canvas.height = h;
        ctx.drawImage(img, 0, 0, w, h);
        URL.revokeObjectURL(objectUrl);
        resolve(canvas.toDataURL('image/jpeg', 0.5));
      };

      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error('Could not load image for compression'));
      };

      img.src = objectUrl;
    });
  }

  _syncVariant(changedInput) {
    const optionIndex = parseInt(changedInput.dataset.optionIndex, 10);

    // Update the visible selected-value label
    const valueLabel = this.querySelector(
      `.tshirt-upload__option[data-option-index="${optionIndex}"] .tshirt-upload__option-selected`
    );
    if (valueLabel) valueLabel.textContent = changedInput.value;

    // Collect currently selected option values in order
    const selectedOptions = [];
    this.querySelectorAll('.tshirt-upload__option').forEach((group) => {
      const checked = group.querySelector('.tshirt-upload__option-input:checked');
      selectedOptions.push(checked ? checked.value : null);
    });

    // Find matching variant
    const match = this.variants.find((v) =>
      v.options.every((opt, i) => opt === selectedOptions[i])
    );

    if (match && this.variantInput) {
      this.variantInput.value = match.id;
    }
  }

  _reset() {
    this.fileInput.value = '';
    this.previewImage.src = '';
    this.previewImage.hidden = true;
    this.fileInfo.hidden = true;
    this.designUrlInput.value = '';
    this.designNameInput.value = '';
    this.submitBtn.disabled = true;
    this._hideStatus();
  }

  _showStatus(message, type) {
    this.statusText.textContent = message;
    this.statusEl.dataset.type = type;
    this.statusEl.hidden = false;
  }

  _hideStatus() {
    this.statusEl.hidden = true;
  }
}

customElements.define('tshirt-upload', TshirtUpload);
