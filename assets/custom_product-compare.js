// if (localStorage.getItem('allProducts') == null) {
//     window.location.href = "/";
//   }else if(JSON.parse(localStorage.getItem('allProducts')).length == 0){
//     window.location.href = "/";
//   }


window.addEventListener("scroll", windowScrollCP);
  function windowScrollCP(){
    const header_height = document.querySelector('sticky-header.header-wrapper').offsetHeight;
    const element = document.querySelector('.product-card-tr:not(.product-card-tr-placeholder)'),
     element_placeholder = document.querySelector('.product-card-tr.product-card-tr-placeholder');
    const top_1 = element.getBoundingClientRect().top,
    top_2 = element_placeholder.getBoundingClientRect().top;
    let off_top = (top_1 + 411), off_top_2 = (top_2 + 411);
    off_top = off_top - header_height;
    off_top_2 = off_top_2 - header_height;
    const has_class = element.classList.contains('header-fixed');
    
    if( off_top < 149 && !has_class ){
      element_placeholder.style.minHeight = element.offsetHeight + 'px';      
      element.classList.add('header-fixed');
      element_placeholder.classList.remove('hidden');
      console.log(off_top, top_1);
    }else if( off_top_2 > 150 && has_class ) {
      element.classList.remove('header-fixed');
      element_placeholder.classList.add('hidden');
      console.log(off_top_2, top_2);
    }
    

    if( has_class ){
      const main_parent = document.querySelector('.product-compare'),
        mp_top = main_parent.getBoundingClientRect().top,
        mp_offset = main_parent.offsetTop * 2,
        mp_offset_h = main_parent.offsetHeight,
        fixed_ele_height = element.offsetHeight,
        has_visi_class = element.classList.contains('visibility-hidden');
      const diff = mp_offset_h - ( Math.abs(mp_top) + mp_offset + fixed_ele_height)
      if( diff < 50 && !has_visi_class ){
        console.log(diff)
        element.classList.add('visibility-hidden')
      }else if ( diff > 50 && has_visi_class ){
        console.log(diff)
        element.classList.remove('visibility-hidden')
      }
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    card_EqualHeight();    
  });

  function card_EqualHeight(){
    let max_height = 0;
    document.querySelectorAll('.product-card-tr .card__title').forEach(function(ele){
      ele.style.minHeight = '';
      max_height = ele.offsetHeight > max_height ? ele.offsetHeight : max_height
    })
    document.querySelectorAll('.product-card-tr .card__title').forEach(function(ele){
      ele.style.minHeight = max_height+ 'px';
    })
  }

  function syncScroll(){
    const fixedDiv = document.querySelector('.product-card-tr:not(.product-card-tr-placeholder)');
    const syncDiv = document.querySelector('.compare-table');

    if (!fixedDiv || !syncDiv) return;

    let isSyncingScroll = false;

    // Sync scroll from fixedDiv to syncDiv
    fixedDiv.addEventListener('scroll', () => {
      if (isSyncingScroll) return;
      isSyncingScroll = true;
      syncDiv.scrollLeft = fixedDiv.scrollLeft;
      isSyncingScroll = false;
    });

    // Sync scroll from syncDiv to fixedDiv
    syncDiv.addEventListener('scroll', () => {
      if (isSyncingScroll) return;
      isSyncingScroll = true;
      fixedDiv.scrollLeft = syncDiv.scrollLeft;
      isSyncingScroll = false;
    });
  }