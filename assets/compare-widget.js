/* compare widget functions */
function addCompare(e,element,c_btn=false){ 
  e.preventDefault();

  if(document.querySelectorAll('.compare-float--content .item-empty').length == 0){
    document.querySelector('.compare-bottom-wrap').classList.remove('hidden');
    document.querySelector('.compare-bottom-wrap .compare-error').classList.remove('hidden');
    document.querySelector('.compare-bottom-wrap').classList.add('active');
    return;
  }

  if(document.querySelector('body.template-product') || c_btn == true){
    var currentProductData = {
      id: element.getAttribute('data-id'),
      handle: element.getAttribute('data-handle'),
      image: element.getAttribute('data-image'),
      brand: element.getAttribute('data-brand'),
      title: element.getAttribute('data-title'),
      sku: element.getAttribute('data-sku'),
      vid: element.getAttribute('data-vid'),
      price: element.getAttribute('data-price'),
      comparePrice: element.getAttribute('data-comparePrice'),
      tags: element.getAttribute('data-tags'),
      allTags: element.getAttribute('data-all-tags')
    }
  }else{
    var currentProductData = {
      id: element.getAttribute('data-id'),
      handle: element.getAttribute('data-handle'),
      image: element.closest('li').querySelector('.media--first').getAttribute('src'),
      brand: element.closest('li').querySelector('.card-vendor').textContent,
      title: element.closest('li').querySelector('.card__title a').textContent,
      sku: element.closest('li').querySelector('.card__sku') ? element.closest('li').querySelector('.card__sku').textContent.split(':')[1] : '',
      vid: element.getAttribute('data-vid'),
      price: element.closest('li').querySelector('.card-information-block .price .price__regular') ? element.closest('li').querySelector('.card-information-block .price .price__regular .price-item--regular').textContent : 0,
      comparePrice: element.closest('li').querySelector('.card-information-block .price .price__sale') ? element.closest('li').querySelector('.card-information-block .price .price__sale .price-item--sale').textContent : null,
      tags: element.getAttribute('data-tags'),
      allTags: element.getAttribute('data-all-tags')
    }
  }

  if (localStorage.getItem('allProducts') !== null) {
    let storedProducts = JSON.parse(localStorage.getItem('allProducts'));
    if(document.querySelector('body.template-product') || c_btn == true){
      var productToFind = element.getAttribute('data-id');
    }else{
      var productToFind = element.getAttribute('data-id');
    }
    
    let foundProduct = storedProducts.find(product => product.id === productToFind);
    if (foundProduct) {
      document.querySelector('.compare-bottom-wrap').classList.add('active');
      document.querySelector('.compare-bottom-wrap').classList.remove('hidden');
    }else{
      storedProducts.push(currentProductData);
      localStorage.setItem('allProducts', JSON.stringify(storedProducts));
      appendItemHTML(element);
    }
  } else {
    var compare_products = [];
    compare_products.push(currentProductData);
    localStorage.setItem('allProducts', JSON.stringify(compare_products));
    appendItemHTML(element);
  }

  if(document.querySelectorAll('.compare-float--content .item-empty').length == 3){
    var handle_get = element.getAttribute('data-handle');
    var store_handle = toShopifyHandle(element.getAttribute('data-tags'));
    fetch('/collections/all/'+store_handle+'?view=ajax&sort_by='+handle_get)
      .then(response => response.text())
      .then(information => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(information, "text/html");
        console.log(doc.querySelector('.suggest-product').innerHTML)
        document.querySelector('.compare-float--suggestion .comFloat-sugg--content').innerHTML = doc.querySelector('.suggest-product').innerHTML;
        if(document.querySelectorAll('.compare-bottom-wrap .comFloat-sugg--content .compare-float--item').length > 0){
          document.querySelector('.compare-float--suggestion').classList.remove('hidden');
          document.querySelector('.compare-float--suggestion').classList.add('show');
        }
        setEqualHeight();
        setChatHeight();
        if(document.querySelector('.template-page-compare')){syncScroll()};
      })
  }else{
    document.querySelector('.compare-float--suggestion').classList.add('hidden');
    document.querySelector('.compare-float--suggestion').classList.remove('show');
  }

  setChatHeight();

}

function appendItemHTML(element){
  if(!document.querySelector('.compare-bottom-wrap').classList.contains('hide-chat')){
    document.querySelector('.compare-bottom-wrap').classList.add('hide-chat')
  }

  if(element.closest('.collection-product-card') == null){
    var id=element.getAttribute('data-id'),
      image=element.getAttribute('data-image'),
      brand=element.getAttribute('data-brand'),
      title=element.getAttribute('data-title'),
      sku=element.getAttribute('data-sku');
  }else{
    var id=element.getAttribute('data-id'),
      image=element.closest('li').querySelector('.media--first').getAttribute('src'),
      brand=element.closest('li').querySelector('.card-vendor').textContent,
      title=element.closest('li').querySelector('.card__title a').textContent,
      sku=element.closest('li').querySelector('.card__sku') ? element.closest('li').querySelector('.card__sku').textContent.split(':')[1] : '';
  }
  

  if(document.querySelectorAll('.compare-float--content .item-empty').length > 0){
    document.querySelectorAll('.compare-float--content .item-empty')[0].innerHTML = `
      <span class="remove-compare-item" onclick="removeProduct(this)" data-id="${id}">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M12.5 3.5L3.5 12.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M12.5 12.5L3.5 3.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
      </span>
      <div class="comFloat-item--image">
          <img src="${image}" loading="lazy" width="70" height="70" alt="" />
      </div>
      <div class="comFloat-item--content">
          <h6 class="comFloat-item--title p-brand h-m-tb">${brand}</h6>
          <h6 class="comFloat-item--title p-title h-m-tb">${title}</h6>
          <span class="comFloat-item--sku">${sku}</span>
      </div>`
      document.querySelectorAll('.compare-float--content .item-empty')[0].classList.remove('item-empty');
      if(document.querySelectorAll('.compare-float--content .item-empty').length == 0){
        //document.querySelector('.compare-bottom-wrap').classList.add('compare-added-full');
      }
  }else{
    document.querySelector('.compare-bottom-wrap .compare-error').classList.remove('hidden');
  }

  document.querySelector('.compare-bottom-wrap').classList.remove('hidden');
  document.querySelector('.compare-bottom-wrap').classList.add('active');

  if(document.querySelector('.compare-bottom-wrap [data-toggle-text]').getAttribute('data-toggle-text') == 'Hide'){
    document.querySelector('.compare-bottom-wrap [data-toggle-text]').setAttribute('data-toggle-text','Show');
    document.querySelector('.compare-bottom-wrap [data-toggle-text]').textContent = 'Show';
  }else{
    document.querySelector('.compare-bottom-wrap [data-toggle-text]').setAttribute('data-toggle-text','Hide');
    document.querySelector('.compare-bottom-wrap [data-toggle-text]').textContent = 'Hide';
  }

  var get_item = document.querySelectorAll('.compare-bottom-wrap .compare-float--content .compare-float--item:not(.item-empty)').length
  document.querySelector('.compare-bottom-wrap .added-count .limit-text').textContent = get_item + ' of 4';

  if(get_item == 4){
    document.querySelector('.info-add-pro.order-last').classList.add('hidden');
  }else{
    document.querySelector('.info-add-pro.order-last').classList.remove('hidden');
  }

}

function removeProduct(element){
  if(!document.querySelector('.compare-bottom-wrap .compare-error').classList.contains('hidden')){
    document.querySelector('.compare-bottom-wrap .compare-error').classList.add('hidden');
  }

  if (localStorage.getItem('allProducts') !== null) {
    let storedProducts = JSON.parse(localStorage.getItem('allProducts'));
    let productToFind = element.getAttribute('data-id');
    let foundProduct = storedProducts.find(product => product.id === productToFind);
    var indexToDelete = storedProducts.findIndex(product => product.id === productToFind)
    if (foundProduct) {
      storedProducts.splice(indexToDelete, 1);
      localStorage.setItem('allProducts', JSON.stringify(storedProducts));
    }
  }
  var CurrParent = element.closest('.compare-float--content');
  element.closest('.compare-float--item').remove();
  CurrParent.innerHTML += `<div class="compare-float--item item-empty">
          <span>You can select up to 4 products</span>
        </div>`;
  if(document.querySelector('.compare-bottom-wrap').classList.contains('compare-added-full')){
    document.querySelector('.compare-bottom-wrap').classList.remove('compare-added-full');
  }

  var get_item = document.querySelectorAll('.compare-bottom-wrap .compare-float--content .compare-float--item:not(.item-empty)').length;
  document.querySelector('.compare-bottom-wrap .added-count .limit-text').textContent = get_item + ' of 4';
  if(get_item == 0){
    document.querySelector('.compare-bottom-wrap').classList.remove('active');
    document.querySelector('.compare-bottom-wrap').classList.remove('hide-chat');
    document.querySelector('.compare-bottom-wrap').classList.add('hidden');
  }else if(get_item == 1){
    var avail_data = JSON.parse(localStorage.getItem('allProducts'));
    var handle_get = avail_data[0].handle;
    var store_handle = toShopifyHandle(avail_data[0].tags);
    fetch('/collections/all/'+store_handle+'?view=ajax&sort_by='+handle_get)
      .then(response => response.text())
      .then(information => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(information, "text/html");
        // console.log(doc.querySelector('.suggest-product').innerHTML)
        document.querySelector('.compare-float--suggestion .comFloat-sugg--content').innerHTML = doc.querySelector('.suggest-product').innerHTML;
        if(document.querySelectorAll('.compare-bottom-wrap .comFloat-sugg--content .compare-float--item').length > 0){
          document.querySelector('.compare-float--suggestion').classList.remove('hidden');
          document.querySelector('.compare-float--suggestion').classList.add('show');
        }
        setEqualHeight();
        if(document.querySelector('.template-page-compare')){syncScroll()};
      });
  }

  if(get_item == 4){
    document.querySelector('.info-add-pro.order-last').classList.add('hidden');
  }else{
    document.querySelector('.info-add-pro.order-last').classList.remove('hidden');
  }

  setChatHeight();

}

function goToCompare(){
  window.location.href = '/pages/compare';
}

function clearCompare(){
  document.querySelectorAll('.compare-float--content .compare-float--item:not(.item-empty)').forEach((filledDiv) => {
    filledDiv.innerHTML = `<span>You can select up to 4 products</span>`;
    filledDiv.classList.add('item-empty');
  })
  if(document.querySelector('.compare-bottom-wrap').classList.contains('compare-added-full')){
    document.querySelector('.compare-bottom-wrap').classList.remove('compare-added-full');
  }
  var get_item = document.querySelectorAll('.compare-bottom-wrap .compare-float--content .compare-float--item:not(.item-empty)').length
  document.querySelector('.compare-bottom-wrap .added-count .limit-text').textContent = get_item + ' of 4';
  localStorage.removeItem("allProducts");
  document.querySelector('.compare-bottom-wrap').classList.remove('active');
  document.querySelector('.compare-bottom-wrap').classList.remove('hide-chat');
  document.querySelector('.compare-bottom-wrap').classList.add('hidden');
}

function toggleWidget(element){
  if(!document.querySelector('.compare-bottom-wrap .compare-error').classList.contains('hidden')){
    document.querySelector('.compare-bottom-wrap .compare-error').classList.add('hidden');
  }
  if(element.querySelector('[data-toggle-text]').getAttribute('data-toggle-text') == 'Hide'){
    element.querySelector('[data-toggle-text]').setAttribute('data-toggle-text','Show');
    element.querySelector('[data-toggle-text]').textContent = 'Show';
  }else{
    element.querySelector('[data-toggle-text]').setAttribute('data-toggle-text','Hide');
    element.querySelector('[data-toggle-text]').textContent = 'Hide';
  }
  element.closest('.compare-bottom-wrap').classList.toggle('active');
  setChatHeight();
}

function CheckCompareProducts(){ 
  if (localStorage.getItem('allProducts') !== null && !document.body.classList.contains('template-cart')) {
    // console.log('infunction');
    
    let storedProducts = JSON.parse(localStorage.getItem('allProducts'));
    if(document.querySelector('.template-page-compare')){
      if(JSON.parse(localStorage.getItem('allProducts')).length == 0){
        // window.location.href = "/";
        BrowseProd();
      }
      for(var i=0;i<storedProducts.length;i++){

        if(i == 0){
          document.querySelectorAll('.product-compare .compare-table table .product-card-tr')[1].innerHTML = '';
          document.querySelectorAll('.product-compare .compare-table table .product-card-tr')[1].innerHTML = `<th class="first-th small-hide">
              
              <label class="compare-checkbox">
                <input type="checkbox" onchange="checkDiff(this)"> Only Show Differences
              </label>
              <div class="compare-count"><span class="c-count">2 of 4</span> selected</div>
            </th>`;
        }

        if(storedProducts[i].comparePrice != null){
          var price_html  = `<div class="price-wrap">
            <div class="price  price--on-sale ">
            <dl>
              <div class="price__regular">
                <dt><span class="visually-hidden visually-hidden--inline">Regular price</span></dt>
                <dd><span class="price-item price-item--regular">${storedProducts[i].price} </span></dd>
              </div>
              <div class="price__sale">
                <dt class="visually-hidden">
                  <span class="visually-hidden visually-hidden--inline">Sale price</span>
                </dt>
                <dd>
                  <span class="price-item price-item--sale">${storedProducts[i].price} </span>
                </dd>
                <dt class="visually-hidden">
                  <span class="visually-hidden visually-hidden--inline">Regular price</span>
                </dt>
                <dd class="price__compare">
                  <s class="price-item price-item--regular">${storedProducts[i].comparePrice} </s>
                </dd>
              </div>
            </dl>
          </div>`;
        }else{
          if(storedProducts[i].price != 0){
            var price_html  = `<div class="price-wrap">
              <div class="price">
              <dl>
                <div class="price__regular">
                  <dt><span class="visually-hidden visually-hidden--inline">Regular price</span></dt>
                  <dd><span class="price-item price-item--regular">${storedProducts[i].price} </span></dd>
                </div>
              </dl>
            </div>`;
          }else{
            var price_html  = `<div class="price-wrap empty">
              <div class="price">
              <dl>
                <div class="price__regular">
                  <dt><span class="visually-hidden visually-hidden--inline">Regular price</span></dt>
                  <dd><span class="price-item price-item--regular"></span></dd>
                </div>
              </dl>
            </div>`;
          }
          
        }

        var sku_html = ``;
        if(storedProducts[i].sku != ''){
          sku_html = `<p class="card__sku">SKU: ${storedProducts[i].sku}</p>`;
        }

        document.querySelectorAll('.product-compare .compare-table table .product-card-tr')[1].innerHTML += `<th class="card-th">          
            <div class="product-card--placeholder"></div>
              <div class="product-card card-wrapper js-color-swatches-wrapper" data-product="whirlpool-24in-55db-built-in-dishwasher-wdp540hamz"> 
                <span class="remove-product" onclick="removeCompareItem(this)" data-id="${storedProducts[i].id}">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none" class="icon icon-close">
                  <path d="M12.5 3.5L3.5 12.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
                  <path d="M12.5 12.5L3.5 3.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
                  </svg>
                </span>         
                <div class="card card--product">
                  <a href="${window.routes.rootUrlWithoutSlash}/products/${storedProducts[i].handle}" class="media media--hover-effect js-color-swatches-link" aria-label="Product link" style="padding-bottom: ;">
                    <img src="${storedProducts[i].image}" alt="${storedProducts[i].title}" width="3474" loading="lazy" class="motion-reduce media--first" style="object-position: 50.0% 50.0%; object-fit : ;">                      
                  </a> 
                </div>
                <div class="card-information">
                  <div class="card-information__wrapper">                    
                    <div class="card-information-block">
                      <h3 class="card__title" style="min-height: 38px;">
                        <a class="unstyled-link " href="${window.routes.rootUrlWithoutSlash}/products/${storedProducts[i].handle}" title="">${storedProducts[i].title}</a><span class="mobile-brand">${storedProducts[i].brand}</span>
                      </h3>
                      ${sku_html}
                      ${price_html}
                    </div>
                    <div class="rating">
                      <div class="" data-bv-show="inline_rating" data-bv-product-id="${storedProducts[i].id}" data-bv-redirect-url="${window.routes.rootUrlWithoutSlash}/products/${storedProducts[i].handle}" data-bv-seo="false"></div>
                    </div>                                   
                    
                  </div>
                </div>
              </div>
              <product-form class="card__add-to-cart card__button">
                  <form method="post" action="/cart/add" accept-charset="UTF-8" class="form" enctype="multipart/form-data" novalidate="novalidate" data-type="add-to-cart-form">
                    <input type="hidden" name="form_type" value="product">
                    <input type="hidden" name="utf8" value="✓">
                    <input type="hidden" name="id" value="${storedProducts[i].vid}">
                    <input type="hidden" name="quantity" value="1" />
                    <button id="${storedProducts[i].id}-id" type="button" data-id="${storedProducts[i].id}" onclick="add_cart_cmp(this)" class="dot_active add_cart_cmp _card__link button button--secondary card__link--hover card-focused" name="add" aria-haspopup="dialog" >
                      <span class="card__quickview-text">Add to Cart</span>
                      <span class="sold-out-message hidden">Sold Out</span>
                      <b class="loading-overlay__spinner hidden">
                        <svg aria-hidden="true" focusable="false" role="presentation" class="spinner" viewBox="0 0 66 66" xmlns="http://www.w3.org/2000/svg">
                          <circle class="path" fill="none" stroke-width="6" cx="33" cy="33" r="30"></circle>
                        </svg>
                      </b>
                    </button>
                    <input type="hidden" name="product-id" value="${storedProducts[i].id}"><input type="hidden" name="section-id" value="template--18994272665779__main">
                  </form>
                </product-form>
              <a class="card-link--overlay" href="/products/${storedProducts[i].handle}" aria-label="Product link"></a>
              </div>
              </th>`;


        if(i==(JSON.parse(localStorage.getItem('allProducts')).length - 1)){
          var set_remain_item = 4 - document.querySelectorAll('.product-compare .compare-table table .product-card-tr')[1].querySelectorAll('.card-th').length;
          if(set_remain_item > 0){
            for(var j=0;j<set_remain_item;j++){
              document.querySelectorAll('.product-compare .compare-table table .product-card-tr')[1].innerHTML += `
                <th class="empty-th">                             
                  <div class="product-card product-card-empty">
                    <p class="link" onclick="BrowseProd()">Browse Products
                      <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 15 15" fill="none" class="icon icon-arrow">
                        <path d="M2.34375 7.5H12.6562" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
                        <path d="M8.4375 3.28125L12.6562 7.5L8.4375 11.7188" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
                      </svg>
                    </p>
                    <span>You can select up to 4 products for comparison</span>
                  </div>
                </th>
              `;
            }
          }
          document.querySelectorAll('.product-compare .compare-count .c-count').forEach((count_item) => {
            count_item.innerHTML = (i+1) + ' of 4';
          })
        }
      }

      var get_handles = '';
      for(var m=0;m<storedProducts.length;m++){
        
        if(m==0){
          get_handles = storedProducts[m].handle;
        }else{
          get_handles += ',' + storedProducts[m].handle;
        }

        
        
        if(m == (storedProducts.length - 1)){
          fetch('/collections/all?view=ajax&sort_by='+get_handles)
          .then(response => response.text())
          .then(information => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(information, "text/html");
            var check_product_data = doc.querySelectorAll('body div[data-information]');
            
            for(b=0;b<check_product_data.length;b++){
              var currentJson = JSON.parse(check_product_data[b].innerHTML);
              var store_tag_val = check_product_data[b].getAttribute('data-tags');
              var lookup = {};
              var result = [];
              var Values = currentJson['Values'];
              for (var Values, i = 0; item = Values[i++];) {
                let has_additional = false;
                if(item[1] == 'Additional Information' || item[1] == 'additional information'){
                  has_additional = true;          
                  lookup[item[1]] = [];          
                  lookup[item[1]]["hideKey"] = [];
                  if(item[2].includes("•")){
                      var removeDotFromData = item[2].replace(/<br\/?>/gi,'').replace(/[\r\n]+/g,'');
                      removeDotFromData = removeDotFromData.split("•");
                      for(let j=1; j<removeDotFromData.length; j++){
                      lookup[item[1]]["hideKey"].push(removeDotFromData[j].trim());
                      }
                  }else{
                      lookup[item[1]]["hideKey"].push(item[2]);
                  }
                }

                if( !has_additional ){
                  var name = item[0];
                  if (!(name in lookup)) {
                      lookup[name] = [];
                      result.push(name);
                      lookup[name].push({ [item[1]]: item[2] });
                  }else{
                      lookup[name].push({ [item[1]]: item[2] });
                  }
                }        
              }

              html = '';
              for( key in lookup ){

                  if(key == "Additional Information" || key == "Shipping Dimensions" || key == "UPC"){}else{
                      const keyValue = lookup[key];
                      const keyHeading = key;
                      
                      let excludeAttributes = [];
                      let includeAttributes = [];

                      if (typeof window.excludeAttributesForCompare === "string" && window.excludeAttributesForCompare.trim() !== "") {
                        excludeAttributes = window.excludeAttributesForCompare.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
                      }
                      if (typeof window.includeAttributesForCompare === "string" && window.includeAttributesForCompare.trim() !== "") {
                        includeAttributes = window.includeAttributesForCompare.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
                      }

                      if(document.querySelectorAll('[data-chkhandle="'+keyHeading+'"]').length == 0){
                        html += `<tr class="type-table-tr"><td colspan="0"><table class="inner-compare-table" data-chkHandle="${keyHeading}">
                                            <tbody>
                                                <tr class="type-title-tr"><td class="type-title" colspan="100%"><h2 class="h4 h-m-tb section-title">${keyHeading}</h2></td></tr>`;

                        if( keyValue.length ){
                            for (let i = 0; i < keyValue.length; i++ ){
                                var html_td = ``;
                                for (const [key, value] of Object.entries(keyValue[i])) {

                                    let keyValueAttributes = key.trim().toLowerCase();
                                    if (includeAttributes.length > 0) {
                                      if (includeAttributes.includes(keyValueAttributes) == false) {
                                        continue;
                                      }
                                      // If excludeAttributes also contains this attribute, skip it
                                      if (excludeAttributes.length > 0 && excludeAttributes.includes(keyValueAttributes)) {
                                        continue;
                                      }
                                    } else if (excludeAttributes.length > 0) {
                                      if (excludeAttributes.includes(keyValueAttributes)) {
                                        continue;
                                      }
                                    }

                                    // Check if window.accentuateTags exists and is an array
                                    let tooltipHtml = '';
                                    if (window.accentuateTags && Array.isArray(window.accentuateTags) && typeof value === 'string' && typeof store_tag_val === 'string') {
                                      
                                      let allTagsArr = store_tag_val.split(',').map(t => t.trim().toLowerCase()).filter(Boolean);
                                      
                                      for (let i = 0; i < window.accentuateTags.length; i++) {
                                        const tagGroup = window.accentuateTags[i];
                                        const attrName = window.accentuateattr[i];
                                        const ToolContent = window.accentuateToolContent[i];
                                        
                                        let groupTags = [];
                                        if (Array.isArray(tagGroup)) {
                                          groupTags = tagGroup.map(t => t.trim().toLowerCase());
                                        } else if (typeof tagGroup === 'string') {
                                          groupTags = tagGroup.split(',').map(t => t.trim().toLowerCase()).filter(Boolean);
                                        }
                                        
                                        const hasMatchingTag = groupTags.some(tag => allTagsArr.includes(tag));
                                        
                                        const groupAttribute = (attrName || '').trim().toLowerCase();
                                        const currentAttribute = (key || '').trim().toLowerCase();
                                        if (hasMatchingTag && groupAttribute && groupAttribute === currentAttribute) {
                                          const tooltipContent = ToolContent || 'ToolTip';
                                          tooltipHtml = `<div class="additional-tooltip">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 11 11" fill="none" class="icon icon-tooltip">
                                              <path d="M5.5 11C6.95869 11 8.35764 10.4205 9.38909 9.38909C10.4205 8.35764 11 6.95869 11 5.5C11 4.04131 10.4205 2.64236 9.38909 1.61091C8.35764 0.579463 6.95869 0 5.5 0C4.04131 0 2.64236 0.579463 1.61091 1.61091C0.579463 2.64236 0 4.04131 0 5.5C0 6.95869 0.579463 8.35764 1.61091 9.38909C2.64236 10.4205 4.04131 11 5.5 11ZM6.13938 4.52925L5.45187 7.76394C5.40375 7.99769 5.47181 8.13037 5.66088 8.13037C5.79425 8.13037 5.99569 8.08225 6.1325 7.96125L6.072 8.24725C5.87469 8.48513 5.4395 8.65837 5.06481 8.65837C4.5815 8.65837 4.37594 8.36825 4.50931 7.75156L5.01669 5.36731C5.06069 5.16587 5.02081 5.093 4.81938 5.04419L4.50931 4.9885L4.56569 4.72656L6.14006 4.52925H6.13938ZM5.5 3.78125C5.31766 3.78125 5.1428 3.70882 5.01386 3.57989C4.88493 3.45095 4.8125 3.27609 4.8125 3.09375C4.8125 2.91141 4.88493 2.73655 5.01386 2.60761C5.1428 2.47868 5.31766 2.40625 5.5 2.40625C5.68234 2.40625 5.8572 2.47868 5.98614 2.60761C6.11507 2.73655 6.1875 2.91141 6.1875 3.09375C6.1875 3.27609 6.11507 3.45095 5.98614 3.57989C5.8572 3.70882 5.68234 3.78125 5.5 3.78125Z" fill="currentColor"></path>
                                            </svg>
                                            <div class="tooltip-content rte"><span>${tooltipContent}</span></div>
                                          </div>`;
                                        }
                                      }
                                    }

                                    if(document.querySelectorAll('[data-chktitle="'+key+'"]').length == 0){
                                      html_td += `<tr class="data-tr only-title large-up-hide medium-hide"><th class="first-th">${key}${tooltipHtml}</th></tr>
                                      <tr class="data-tr" data-chktitle="${key}">
                                          <th class="first-th small-hide">${key}${tooltipHtml}</th>
                                          <td class="data">${value}</td>
                                          <td class="no-data"></td>
                                          <td class="no-data"></td>
                                          <td class="no-data"></td>
                                      </tr>`;
                                    } 
                                }
                                html += `${html_td}`;
                            }
                        }       
                        html += `</tbody></table></td></tr></td></tr>`;
                      }else{
                        if( keyValue.length ){
                          for (let i = 0; i < keyValue.length; i++ ){
                            var html_td = ``;
                            for (const [key, value] of Object.entries(keyValue[i])) {

                                let keyValueAttributes = key.trim().toLowerCase();
                                      
                                if (includeAttributes.length > 0) {
                                  if (includeAttributes.includes(keyValueAttributes) == false) {
                                    continue;
                                  }
                                  // If excludeAttributes also contains this attribute, skip it
                                  if (excludeAttributes.length > 0 && excludeAttributes.includes(keyValueAttributes)) {
                                    continue;
                                  }
                                } else if (excludeAttributes.length > 0) {
                                  if (excludeAttributes.includes(keyValueAttributes)) {
                                    continue;
                                  }
                                }

                                // Check if window.accentuateTags exists and is an array
                                let tooltipHtml = '';
                                if (window.accentuateTags && Array.isArray(window.accentuateTags) && typeof value === 'string' && typeof store_tag_val === 'string') {
                                  
                                  let allTagsArr = store_tag_val.split(',').map(t => t.trim().toLowerCase()).filter(Boolean);
                                  
                                  for (let i = 0; i < window.accentuateTags.length; i++) {
                                    const tagGroup = window.accentuateTags[i];
                                    const attrName = window.accentuateattr[i];
                                    const ToolContent = window.accentuateToolContent[i];
                                    
                                    let groupTags = [];
                                    if (Array.isArray(tagGroup)) {
                                      groupTags = tagGroup.map(t => t.trim().toLowerCase());
                                    } else if (typeof tagGroup === 'string') {
                                      groupTags = tagGroup.split(',').map(t => t.trim().toLowerCase()).filter(Boolean);
                                    }
                                    
                                    const hasMatchingTag = groupTags.some(tag => allTagsArr.includes(tag));
                                    
                                    const groupAttribute = (attrName || '').trim().toLowerCase();
                                    const currentAttribute = (key || '').trim().toLowerCase();
                                    if (hasMatchingTag && groupAttribute && groupAttribute === currentAttribute) {
                                      const tooltipContent = ToolContent || 'ToolTip';
                                      tooltipHtml = `<div class="additional-tooltip">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 11 11" fill="none" class="icon icon-tooltip">
                                          <path d="M5.5 11C6.95869 11 8.35764 10.4205 9.38909 9.38909C10.4205 8.35764 11 6.95869 11 5.5C11 4.04131 10.4205 2.64236 9.38909 1.61091C8.35764 0.579463 6.95869 0 5.5 0C4.04131 0 2.64236 0.579463 1.61091 1.61091C0.579463 2.64236 0 4.04131 0 5.5C0 6.95869 0.579463 8.35764 1.61091 9.38909C2.64236 10.4205 4.04131 11 5.5 11ZM6.13938 4.52925L5.45187 7.76394C5.40375 7.99769 5.47181 8.13037 5.66088 8.13037C5.79425 8.13037 5.99569 8.08225 6.1325 7.96125L6.072 8.24725C5.87469 8.48513 5.4395 8.65837 5.06481 8.65837C4.5815 8.65837 4.37594 8.36825 4.50931 7.75156L5.01669 5.36731C5.06069 5.16587 5.02081 5.093 4.81938 5.04419L4.50931 4.9885L4.56569 4.72656L6.14006 4.52925H6.13938ZM5.5 3.78125C5.31766 3.78125 5.1428 3.70882 5.01386 3.57989C4.88493 3.45095 4.8125 3.27609 4.8125 3.09375C4.8125 2.91141 4.88493 2.73655 5.01386 2.60761C5.1428 2.47868 5.31766 2.40625 5.5 2.40625C5.68234 2.40625 5.8572 2.47868 5.98614 2.60761C6.11507 2.73655 6.1875 2.91141 6.1875 3.09375C6.1875 3.27609 6.11507 3.45095 5.98614 3.57989C5.8572 3.70882 5.68234 3.78125 5.5 3.78125Z" fill="currentColor"></path>
                                        </svg>
                                        <div class="tooltip-content rte"><span>${tooltipContent}</span></div>
                                      </div>`;
                                    }
                                  }
                                }

                                if(document.querySelectorAll('[data-chktitle="'+key+'"]').length == 0){
                                  document.querySelector('[data-chkhandle="'+keyHeading+'"] tbody').innerHTML += `<tr class="data-tr only-title large-up-hide medium-hide"><th class="first-th">${key}${tooltipHtml}</th></tr>
                                  <tr class="data-tr" data-chktitle="${key}">
                                      <th class="first-th small-hide">${key}${tooltipHtml}</th>
                                      <td class="data">${value}</td>
                                      <td class="no-data"></td>
                                      <td class="no-data"></td>
                                      <td class="no-data"></td>
                                  </tr>`;
                                }else{
                                  // Check if tooltip is not already present and if eligible, add tooltip
                                  let thElem = document.querySelector('[data-chktitle="'+key+'"]').querySelector('.first-th');
                                  if (thElem && !thElem.querySelector('.additional-tooltip') && tooltipHtml) {
                                    thElem.innerHTML = thElem.innerHTML + tooltipHtml;
                                  }
                                  document.querySelector('[data-chktitle="'+key+'"]').querySelectorAll('.no-data')[0].innerHTML = `${value}`;
                                  document.querySelector('[data-chktitle="'+key+'"]').querySelectorAll('.no-data')[0].classList.remove('no-data');
                                } 
                            }
                            html += `${html_td}`;
                          }
                        }
                      }
                  }
                  
              }

              document.querySelector('.product-compare .compare-table tbody').innerHTML += html;
              card_EqualHeight();
              if(b == (check_product_data.length - 1)){
                document.querySelectorAll('.type-table-tr').forEach((all_trs) => {
                  let nextElem = all_trs.querySelector('.type-title-tr').nextElementSibling;
                  if(nextElem == null){
                    all_trs.classList.add('hide');
                  }else{
                    all_trs.classList.remove('hide');
                    all_trs.closest('.type-table-tr').classList.remove('hide');
                  }
                })

                var get_diff_val = localStorage.getItem('ShowDiff');
                console.log('get_diff_val',get_diff_val);
                if(window.outerWidth > 898){
                  var diff_selector = document.querySelector('.compare-table .compare-checkbox [onchange="checkDiff(this)"]');
                }else{
                  var diff_selector = document.querySelector('.page-header .compare-checkbox [onchange="checkDiff(this)"]');
                  // console.log(diff_selector.checked,'else')
                }
                if (get_diff_val !== null){
                  if(get_diff_val == 'true' && diff_selector.checked == false){
                    diff_selector.click();
                  }
                }
              }
            }
            
          })
          .catch(error => console.error('Error fetching data:', error));
        }
      }
    }else{
      for(var i=0;i<storedProducts.length;i++){
        if(i==0){
          document.querySelector('.compare-float--content').innerHTML = ``;  
        }
        document.querySelector('.compare-float--content').innerHTML += `
          <div class="compare-float--item">
            <span class="remove-compare-item" onclick="removeProduct(this)" data-id="${storedProducts[i].id}">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M12.5 3.5L3.5 12.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M12.5 12.5L3.5 3.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </span>
            <div class="comFloat-item--image">
              <img src="${storedProducts[i].image}" loading="lazy" width="70" height="70" alt="" />
            </div>
            <div class="comFloat-item--content">
              <h6 class="comFloat-item--title p-brand h-m-tb">${storedProducts[i].brand}</h6>
              <h6 class="comFloat-item--title p-title h-m-tb">${storedProducts[i].title}</h6>
              <span class="comFloat-item--sku">${storedProducts[i].sku}</span>
            </div>
          </div>
        `
        if(i==(JSON.parse(localStorage.getItem('allProducts')).length - 1)){
  
          var set_remain_item = 4 - document.querySelectorAll('.compare-bottom-wrap .compare-float--content .compare-float--item').length;
          if(set_remain_item > 0){
            for(var j=0;j<set_remain_item;j++){
              document.querySelector('.compare-float--content').innerHTML += `
                <div class="compare-float--item item-empty">
                  <span>You can select up to 4 products</span>
                </div>
              `;
            }
          }
          document.querySelector('.compare-bottom-wrap .added-count .limit-text').textContent = (i+1) + ' of 4';
          document.querySelector('.compare-bottom-wrap').classList.remove('hidden');
          // document.querySelector('.compare-bottom-wrap').classList.add('active');
          if(!document.querySelector('.compare-bottom-wrap').classList.contains('hide-chat')){
            document.querySelector('.compare-bottom-wrap').classList.add('hide-chat')
          }

          if(document.querySelectorAll('.compare-bottom-wrap .compare-float--content .compare-float--item:not(.item-empty)').length == 1){
            var avail_data = JSON.parse(localStorage.getItem('allProducts'));
            var handle_get = avail_data[0].handle;
            var store_handle = toShopifyHandle(avail_data[0].tags);
            fetch('/collections/all/'+store_handle+'?view=ajax&sort_by='+handle_get)
              .then(response => response.text())
              .then(information => {
                const parser = new DOMParser();
                const doc = parser.parseFromString(information, "text/html");
                document.querySelector('.compare-float--suggestion .comFloat-sugg--content').innerHTML = doc.querySelector('.suggest-product').innerHTML;
                if(document.querySelector('.compare-bottom-wrap').classList.contains('active')){
                  if(document.querySelectorAll('.compare-bottom-wrap .comFloat-sugg--content .compare-float--item').length > 0){
                    document.querySelector('.compare-float--suggestion').classList.remove('hidden');
                    document.querySelector('.compare-float--suggestion').classList.add('show');
                  }
                }
                setEqualHeight();
                if(document.querySelector('.template-page-compare')){syncScroll()};
              });
          }
        }
      }
    }
  }
}

function toShopifyHandle(input) {
  return input
    .toLowerCase()                        // Convert to lowercase
    .trim()                               // Trim whitespace
    .replace(/['"]/g, '')                 // Remove quotes
    .replace(/[^a-z0-9_\s-]/g, '')        // Allow underscores, spaces, and hyphens only
    .replace(/\s+/g, '-')                 // Replace spaces with hyphens
    .replace(/-+/g, '-');              // Replace multiple hyphens with a single one
}

function removeCompareItem(element){
  if (localStorage.getItem('allProducts') !== null) {
    let storedProducts = JSON.parse(localStorage.getItem('allProducts'));
    let productToFind = element.getAttribute('data-id');
    let foundProduct = storedProducts.find(product => product.id === productToFind);
    var indexToDelete = storedProducts.findIndex(product => product.id === productToFind)
    if (foundProduct) {
      storedProducts.splice(indexToDelete, 1);
      localStorage.setItem('allProducts', JSON.stringify(storedProducts));
      document.querySelector('.compare-table tbody').querySelectorAll('.type-table-tr').forEach((all_tr)=>{
        all_tr.remove();
      })
      CheckCompareProducts();
    }
  }
}

function setEqualHeight() {
  const div1 = document.querySelector('.compare-float--content');
  const div1Children = div1.querySelectorAll('.compare-float--item');
  const div2 = document.querySelector('.compare-float--suggestion.show');

  const ele_sugge = document.querySelector('.compare-float.active .compare-float--suggestion.show')
  if( window.innerWidth > 989 ){
    const container = document.querySelector('.compare-float .container').clientWidth;
    const padding = Number((window.getComputedStyle(document.querySelector('.compare-float .container')).paddingLeft).replace('px','')) * 2;
    const first_child = document.querySelector('.compare-float--content .compare-float--item:not(.item-empty)')      
    if( first_child && ele_sugge ){
      ele_sugge.style.width = ((container - padding) - first_child.clientWidth - 10) + 'px';
    }
  }else{
    ele_sugge && (ele_sugge.style.width = '');
  }

  if (!div1 || !div2) return;
  
  div1.style.minHeight = '';
  div2.style.minHeight = '';
  if( window.innerWidth < 990 ){
    return;
  }
  let max_Height = 0;
  div1Children.forEach(function(d1C){
    max_Height = max_Height > d1C.offsetHeight ? max_Height : d1C.offsetHeight;
  });
  
  const maxHeight = Math.max(max_Height, div2.offsetHeight);
  
  div1.style.minHeight = `${maxHeight}px`;
  div2.style.minHeight = `${maxHeight}px`;
}

if(document.querySelector('.template-page-compare') == null){
  document.addEventListener("DOMContentLoaded", setEqualHeight);  
  window.addEventListener("load", setEqualHeight);  
  window.addEventListener("resize", setEqualHeight);
}

function add_cart_cmp(ele){
  const config = fetchConfig('javascript');
  config.headers['X-Requested-With'] = 'XMLHttpRequest';
  delete config.headers['Content-Type'];
  const formData = new FormData(ele.closest('form'));
  config.body = formData;

  fetch(`${routes.cart_add_url}`, config)
    .then((response) => response.json())
    .then((response) => {
      // let storedProducts = JSON.parse(localStorage.getItem('allProducts'));
      // let productToFind = ele.getAttribute('data-id');
      // let foundProduct = storedProducts.find(product => product.id === productToFind);
      // var indexToDelete = storedProducts.findIndex(product => product.id === productToFind)
      // if (foundProduct) {
      //   storedProducts.splice(indexToDelete, 1);
      //   localStorage.setItem('allProducts', JSON.stringify(storedProducts));
      //   location.reload();
      // }else{
      //   location.reload();
      // }
      location.reload();
    })
    .catch(error => {
			console.error('Error fetching Shopify cart:', error);
		});
}

function clearComparePage(){
  if (localStorage.getItem('allProducts') !== null) {
    localStorage.removeItem("allProducts");
    // window.location.href = "/";
    BrowseProd();
  }
}

function checkDiff(ele){
  var table = document.querySelector('.compare-table table');
  if (!table) return;

  table.querySelectorAll('tr.data-tr[data-chktitle]').forEach(function(row) {
    
    if (row.classList.contains('type-title-tr')) return;

    var cells = Array.from(row.querySelectorAll('td, th')).slice(1);
    var values = cells
      .map(function(cell) {
        return cell.textContent.trim().toLowerCase();
      })
      .filter(function(val) {
        return val !== '-' && val !== '';
      });

    var allSame = values.length > 1 && values.every(function(val) {
      return val === values[0];
    });
    
    if (ele.checked) {
      if (allSame) {
        row.style.display = 'none';
        // Also hide the previous tr with only-title class if present
        var prevRow = row.previousElementSibling;
        if (prevRow && prevRow.classList.contains('only-title')) {
          prevRow.style.display = 'none';
        }
      } else {
        row.style.display = '';
        // Also show the previous tr with only-title class if present
        var prevRow = row.previousElementSibling;
        if (prevRow && prevRow.classList.contains('only-title')) {
          prevRow.style.display = '';
        }
      }
    } else {
      row.style.display = '';
      // Also show the previous tr with only-title class if present
      var prevRow = row.previousElementSibling;
      if (prevRow && prevRow.classList.contains('only-title')) {
        prevRow.style.display = '';
      }
    }
  });

  var groupHeaders = table.querySelectorAll('table.inner-compare-table tbody>.type-title-tr');
  groupHeaders.forEach(function(headerRow) {

    var groupRows = headerRow.closest('tbody').querySelectorAll('tr.data-tr');
  
    var anyVisible = false;
    for (var i = 0; i < groupRows.length; i++) {
      if (window.getComputedStyle(groupRows[i]).display !== 'none') {
        anyVisible = true;
        break;
      }
    }

    if (ele.checked) {
      if (!anyVisible) {
        headerRow.style.display = 'none';
      } else {
        headerRow.style.display = '';
      }
    } else {
      headerRow.style.display = '';
    }
  });

  if(window.outerWidth > 898){
    var diff_selector = document.querySelector('.compare-table .compare-checkbox [onchange="checkDiff(this)"]');
    // console.log(diff_selector.checked,'if')
  }else{
    var diff_selector = document.querySelector('.page-header .compare-checkbox [onchange="checkDiff(this)"]');
    // console.log(diff_selector.checked,'else')
  }
  localStorage.setItem('ShowDiff',diff_selector.checked);
}

function BrowseProd(){
  var get_coll_link_val = localStorage.getItem('CollectionLink');
  if (get_coll_link_val !== null){
    window.location.href = get_coll_link_val;
  }else{
    window.location.href = "/collections/all";
  }
}

function setChatHeight(){
  var setbottomHeight = 0;
  if(document.querySelector('.filters-short-bar-fixed')){
    setbottomHeight = setbottomHeight + document.querySelector('.filters-short-bar-fixed').offsetHeight;
  }
  
  if(document.querySelector('.compare-bottom-wrap')){
    setbottomHeight = setbottomHeight + document.querySelector('.compare-bottom-wrap').offsetHeight;
  }

  document.documentElement.style.setProperty('--live_chat_height', `${setbottomHeight}px`);
}

document.addEventListener("DOMContentLoaded", CheckCompareProducts);
/* compare widget functions End */