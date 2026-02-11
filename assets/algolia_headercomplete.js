const headerClient = algoliasearch('59OEDVD9PR','9081840ec084703d98e09b407daaa870').initIndex('shopify_products');
let autocompleteContainer = window.innerWidth > 640 ? $("#header_autocomplete") : $("#header_autocomplete_mobile");

$('.autocomplete-close').on('click', function(e){
    e.preventDefault();
    $('.header_right .header-search,.popup-modal-mobile-search .header-search').val("");
    autocompleteContainer.html("");
    autocompleteContainer.hide();
    document.body.classList.remove('algolia-header-popup-show')
    $('.autocomplete-close').hide();
});
$('.header_right .header-search,.popup-modal-mobile-search .header-search').on("input", function() {
    console.log('dsf');
  if($(this).val().length > 2){
    $('.autocomplete-close').show();
    headerClient
        .search($(this).val(), {
            hitsPerPage: 4,
            filters: "NOT product_type:Rebate"
          })
        .then(({ hits }) => {
            let autolist = $(`<ul class="autocomplete_results"></ul>`);
            document.querySelectorAll('.mega-nav.open, .brands.open').forEach((ele) => ele.classList.remove('open'));
            hits.forEach((hit) => {                
                let prod_image = "https://cdn.shopify.com/s/files/1/0576/7803/7155/files/imageless.jpg";
                let prod_title = hit.title;
                if(window.routes.rootUrlWithoutSlash == "/en"){
                    if(hit.meta.algolia && hit.meta.algolia.translation && hit.meta.algolia.translation[0] && hit.meta.algolia.translation[0].title){
                        prod_title = hit.meta.algolia.translation[0].title;
                    }
                }
                if(hit.image){
                    prod_image = hit.image;
                }
                autolist.append(`
                <li class="autocomplete_result">
                    <a href="${window.routes.rootUrlWithoutSlash}/products/${hit.handle}">
                        <img src="${prod_image}" class="autocomplete_image" /><div class="autocomplete_text"><div class="autocomplete_title">${prod_title}</div><div class="autocomplete_vendor">${hit.vendor}</div></div>
                    </a>
                </li>`);
            });
            autocompleteContainer.html(`<div class="autocomplete_label">Suggestions...</div>`);
            if(hits.length > 0){
                autocompleteContainer.append(autolist);
            }else{
                autocompleteContainer.append(`<div class="autocomplete_noresults">No Results Found</div>`);
            }
            autocompleteContainer.show();
            document.body.classList.add('algolia-header-popup-show')
        })
        .catch(err => {
            console.log(err);
        });
  }else{
    $('.autocomplete-close').hide();
    autocompleteContainer.html("");
    autocompleteContainer.hide();
  }
});

