const search = instantsearch({
    indexName: 'shopify_products',
    searchClient: algoliasearch('ZBKX0KGQ37', 'd6f88b7d3c54b03af71c7b5305628f25'),
  });
  
  
  const customHits = instantsearch.connectors.connectHits(function renderHits(params, isFirstRender) {
    const { hits, widgetParams } = params;
    const container = widgetParams.container;
    container.innerHTML = '';
  
    const year = document.getElementById('filter-year').value;
    const make = document.getElementById('filter-make').value;
    const model = document.getElementById('filter-model').value;

    // instock Code 
    // <div class="product-price-stock">
    //   <span class="product-stock ${getStockLabelClass(getStockLevel(product))}">
    //     ${getStockLevel(product)}
    //   </span>
    // </div>
  
    const cardsHTML = `<div class="products-grid"><div class="collection collection-product"><div class="loading-overlay"><div class="loading-overlay__spinner">
        <svg aria-hidden="true" focusable="false" role="presentation" class="spinner" viewBox="0 0 66 66" xmlns="http://www.w3.org/2000/svg">
          <circle class="path" fill="none" stroke-width="6" cx="33" cy="33" r="30" stroke="currentColor"></circle>
        </svg>
      </div>
    </div>
    <ul class="collection-product-list collection-product-list--2-mobile load-more-grid  ">
      ${hits.map(product => `
        <li class="collection-product-card quickview--hover">
          <div class="product-card card-wrapper js-color-swatches-wrapper quickview--hover">
            <div class="card card--product square">
              <a href="/products/toyota-corolla-2025" class="media media--hover-effect js-color-swatches-link" aria-label="Product link" style="padding-bottom: 100%;">
                <img src="${product.image}" alt="${product.title}" width="1000" loading="lazy" sizes="(max-width: 576px) 100vw, (max-width: 1200px) 50vw, 100vw" class="motion-reduce media--first" style="object-position: 50.0% 50.0%;object-fit : cover;">
              </a>
              <div class="card__badge"></div>
            </div>
            
            <div class="card-information">
              <div class="card-information__wrapper">
                <div class="group-wrapper"><span class="visually-hidden">Vendor:</span>
                  <div class="caption-with-letter-spacing subtitle card-vendor">${product.vendor}</div>
                </div>
                <div class="card-information-block">
                  <h3 class="card__title">
                    <a class="unstyled-link " href="/products/${product.handle}" title="Honda Accord 2025">${product.title}</a>
                  </h3>
                  <div class="price">
                    <dl>
                      <div class="price__regular">
                        <dt><span class="visually-hidden visually-hidden--inline">Regular price</span></dt>
                        <dd><span class="price-item price-item--regular">${formatPrice(product.price)}</span></dd>
                      </div>
                      <div class="price__sale">
                        <dt class="visually-hidden"><span class="visually-hidden visually-hidden--inline">Sale price</span></dt>
                        <dd><span class="price-item price-item--sale">${formatPrice(product.price)}</span></dd>
                        <dt class="visually-hidden"><span class="visually-hidden visually-hidden--inline">Regular price</span></dt>
                        <dd class="price__compare"><s class="price-item price-item--regular"></s></dd>
                      </div>
                      <dl class="unit-price caption hidden">
                        <dt class="visually-hidden">Unit price</dt>
                        <dd>
                          <span></span>
                          <span aria-hidden="true">/</span>
                          <span class="visually-hidden">&nbsp;per&nbsp;</span>
                          <span></span>
                        </dd>
                      </dl>
                    </dl>
                  </div>
                  <div class="product-info">
                    <p class="product-meta">
                      ${year && make && model ? `This part fits your vehicle: ${year} ${model} ${make}` : ''}
                    </p>
                  </div>
                  
                </div>
              </div>
            </div>
            <a href="/products/${product.handle}" class="card-link--overlay"></a>
          </div>
          </li>
        `).join('')}
      </ul></div></div>
    `;
  
    container.insertAdjacentHTML('beforeend', cardsHTML);
  });
  
  
  search.addWidgets([
    instantsearch.widgets.configure({
      hitsPerPage: 50,
      distinct: 1,
      // 👇 Make these facetable so refinements work
      disjunctiveFacets: [
        'meta.custom.algolia_filters.year',
        'meta.custom.algolia_filters.make',
        'meta.custom.algolia_filters.model'
      ]
    }),
    customHits({
      container: document.querySelector('#products-listing')
    })
  ]);
  
  search.start();
  
  function formatPrice(price) {
    if (typeof price !== 'number') return price || '';
  
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  }
  
  
  function getStockLevel(hit) {
    if (hit.inventory_quantity === 0) return 'Out of Stock';
    if (hit.inventory_quantity <= 5) return 'Low Stock';
    return 'In Stock';
  }
  
  function getStockLabelClass(level) {
    switch (level.toLowerCase()) {
      case 'out of stock': return 'out-stock';
      case 'low stock': return 'low-stock';
      default: return 'in-stock';
    }
  }
  