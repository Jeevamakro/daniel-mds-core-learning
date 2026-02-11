let caMoMeDr = false, caMaMeCl = false;
const appendRemoveEle = function(noscript_ele, aapend_ele, callBack = null){
  let obj_childs = new DOMParser().parseFromString(noscript_ele.innerHTML, 'text/html').querySelector('body').children;
  for (const [key, value] of Object.entries(obj_childs)) {            
    aapend_ele.append(value);
  }
  noscript_ele.remove();
  callBack != null && (callBack());
};

function callMainMenuClicks() {
  if( caMaMeCl ) return;
  document.querySelectorAll('.first-lavel > li > a:not(.anchor-link)').forEach((menu_link) => {
    menu_link.addEventListener('click',function(e){
      e.stopPropagation();
      e.preventDefault();
      const colest_li_ele = menu_link.closest('li');
      document.querySelector('.algolia-header-popup-show .autocomplete-close') && (
        document.querySelector('.algolia-header-popup-show .autocomplete-close').click()
      );

      if(colest_li_ele.classList.contains('mega-nav')){ onHover(); }
      if(colest_li_ele.getAttribute('id') != undefined && colest_li_ele.getAttribute('id') == 'brands'){ brandOnHover(); }
      
      if(colest_li_ele.classList.contains('mega-nav')){
        const noscript_ele = colest_li_ele.querySelector('noscript.contentString');
        if(noscript_ele){
          appendRemoveEle(noscript_ele, colest_li_ele, function(){
            onHover();
            callSublevelMenu();
          });          
        }
        if(colest_li_ele.querySelector('.mega-main-wrapper .child-level-one li').firstElementChild.classList.contains('open')){
          var get_first_height = colest_li_ele.querySelector('.child-level-two li.has-dropdown').firstElementChild.querySelector('.guide-and-promos').offsetHeight;
          const temp_ele = colest_li_ele.querySelector('.child-level-two li.has-dropdown').firstElementChild.querySelector('.child-level-three');          
          temp_ele.style.maxHeight = 'calc((100% - 48px) - '+get_first_height+'px)';
          //temp_ele.style.maxHeight = 'calc((100% - 48px)';
          //big-grid
        }
      }else{
        const noscript_ele = colest_li_ele.querySelector('noscript.contentString');
        if( noscript_ele ){          
          appendRemoveEle(noscript_ele, colest_li_ele, function(){
            brandOnHover();
          });
        }
      }

      if(this.closest('li').querySelectorAll('.comm-drop-menu').length > 0){
        if(this.closest('li').classList.contains('open')){
          this.closest('li').classList.remove('open');
        }else{
          document.querySelectorAll('.first-lavel > li.open').forEach((open_li) => {
            open_li.classList.remove('open');
          })
          this.closest('li').classList.add('open');          
        }
      }      
    })
  });  
  caMaMeCl = true;  
};

function callSublevelMenu(){
  document.querySelectorAll('.child-level-one li.sublevel-menu').forEach((mainmenu_sub_menu) => {
    mainmenu_sub_menu.addEventListener('click',function(event){
      event.stopPropagation();

      if(mainmenu_sub_menu.closest('.child-level-one').querySelector('.sublevel-menu.open')){
        mainmenu_sub_menu.closest('.child-level-one').querySelector('.sublevel-menu.open').classList.remove('open');
      }

      if(mainmenu_sub_menu.closest('.child-level-one').querySelector('.sublevel-menu.active')){
        mainmenu_sub_menu.closest('.child-level-one').querySelector('.sublevel-menu.active').classList.remove('active');
      }

      if(mainmenu_sub_menu.querySelector('.child-level-two')){
        mainmenu_sub_menu.querySelector('.child-level-two').classList.add('open');
        mainmenu_sub_menu.querySelector('.child-level-two').classList.add('active');
        mainmenu_sub_menu.querySelector('.child-level-three').classList.add('open');
      }

      if( mainmenu_sub_menu.querySelector('.child-level-three.open') 
        && mainmenu_sub_menu.querySelectorAll('.child-level-three.open ul li').length > 24){
        mainmenu_sub_menu.closest('.menu-wrapper').classList.add('with-child-big');
      }else{
        mainmenu_sub_menu.closest('.menu-wrapper').classList.remove('with-child-big');
      }

      if(mainmenu_sub_menu.closest('li').classList.contains('has-dropdown')){
        mainmenu_sub_menu.closest('li').classList.add('open');
      }

      if(mainmenu_sub_menu.closest('li').querySelectorAll('.guide-wrapper a').length == 0 && 
          mainmenu_sub_menu.closest('li').querySelectorAll('.child-level-three').length == 0 && 
          mainmenu_sub_menu.closest('li').querySelectorAll('.promos-wrapper a').length == 0
      ){
        mainmenu_sub_menu.closest('.menu-wrapper').classList.add('no-third-child');	
      }else{
        mainmenu_sub_menu.closest('.menu-wrapper').classList.remove('no-third-child');
      }

      mainmenu_sub_menu.closest('li').classList.add('active');
    })
  });
  document.querySelector('li.has-dropdown.sublevel-menu.open').click();
}

function onHover(){
  document.querySelectorAll('.child-level-two li.inner-li').forEach((hover_second_menu)=>{
    hover_second_menu.addEventListener('mouseover', e => {
      e.stopPropagation();
      const parent_ele = hover_second_menu.closest('.sublevel-menu');       
      const hover_arr = hover_second_menu.getAttribute('data-hover-content');      
      const hover_ele = parent_ele.querySelector('.child-level-two--childs .child-level-three[data-hover="'+hover_arr+'"]');
      // var chk_height = hover_second_menu.querySelector('.guide-and-promos') && hover_second_menu.querySelector('.guide-and-promos').offsetHeight;
      // if(chk_height != undefined && chk_height != 0){
      //   hover_second_menu.querySelector('.child-level-three').style.maxHeight = 'calc((100% - 48px) - '+chk_height+'px)';
      // }
      parent_ele.querySelectorAll('li.open').forEach((ele) => {
        ele.classList.remove('open')        
      });
      parent_ele.querySelectorAll('.child-level-three.open').forEach((ele) => {
        ele.classList.remove('open')        
      });
        
      hover_second_menu.closest('.menu-wrapper').classList.add('no-third-child');
      if(hover_second_menu.classList.contains('has-dropdown')){
        hover_second_menu.classList.add('open');
        hover_second_menu.closest('.menu-wrapper').classList.remove('no-third-child');
        hover_ele.classList.add('open');
      }
      if(hover_ele){
        if(hover_ele.querySelectorAll('ul li').length > 12){
          hover_second_menu.closest('.menu-wrapper').classList.add('with-child-big');
        }else{
          hover_second_menu.closest('.menu-wrapper').classList.remove('with-child-big');
        }
      }
    })
  })
  return;
}

function brandOnHover(){
  document.querySelectorAll('.brand-mega-menu-sidebar ul li a').forEach((hover_brand) => {
    hover_brand.addEventListener('mouseover', e => {
      e.target.closest('ul').querySelector('li.active')?.classList.remove('active');
      e.target.parentNode.classList.add('active');
      var chk_handle = e.target.getAttribute('data-tab-title');
      document.querySelectorAll('.brand-mega-menu-content .inner_div_wrap.active').forEach((active_inner_brand) => {
        active_inner_brand.classList.remove('active');
      })
      document.querySelector('.brand-mega-menu-content .inner_div_wrap[data-tab-title="'+chk_handle+'"]')?.classList.add('active');
    })
  })
  return;
}

function callMobileMenuDrawer(){
  if( caMoMeDr ) return;
  document.querySelector('.header__mobile-nav-toggle').addEventListener('click',function(){
    document.querySelector('body.search-mobile-open .mobile-search-close') && (
      document.querySelector('body.search-mobile-open .mobile-search-close').click()
    );

    if(document.querySelector('html').classList.contains('overflow-hide')){
      document.querySelectorAll('.is-open').forEach((openClass)=>{
        openClass.classList.remove('is-open');
      })
      document.querySelector('sticky-header').classList.toggle('sticky-header');
      document.querySelector('html').classList.toggle('overflow-hide');
      document.querySelector('.mobile-menu').style.maxHeight = 0;
      document.querySelector('.mobile-menu').setAttribute('aria-hidden','true');
    }else{
      document.querySelector('sticky-header').classList.toggle('sticky-header');
      document.querySelector('html').classList.toggle('overflow-hide');
      document.querySelector('.mobile-menu').style.maxHeight = "".concat(window.innerHeight - document.querySelector('sticky-header').getBoundingClientRect().bottom, "px");
      document.querySelector('.mobile-menu').setAttribute('aria-hidden','false');
    }      
  });
  callMobileMenuClicks();
  caMoMeDr = true;  
}

function callMobileMenuClicks(){
  document.querySelectorAll('.mobile-menu__inner .mobile-menu__panel ul li.mobile-menu__nav-item').forEach((mobile_menu_item)=>{
    if(mobile_menu_item.querySelectorAll('button').length > 0){
      mobile_menu_item.querySelectorAll('button').forEach((inner_btns) => {
        inner_btns.addEventListener('click',function(e){
          const active_ele = document.querySelector('#'+this.getAttribute('aria-controls'));
          const noscript_ele = active_ele.querySelector('noscript.contentString');
          document.querySelector('#'+this.getAttribute('aria-controls')).classList.add('is-open');
          if( noscript_ele ){
            appendRemoveEle(noscript_ele, active_ele, function(){ 
              active_ele.querySelectorAll('button').forEach((act_btns) => {
                act_btns.addEventListener('click',function(e){
                  const act_ele = document.querySelector('#'+this.getAttribute('aria-controls'));
                  act_ele && act_ele.classList.add('is-open');
                })
              });
              active_ele.querySelectorAll('.mobile-menu__panel>.mobile-menu__section .mobile-menu__back-button').forEach((submenu_close_btn)=>{
                submenu_close_btn.addEventListener('click',(e)=>{
                  submenu_close_btn.closest('.mobile-menu__panel').classList.remove('is-open');
                })
              })
            });
          }
        })
      })
    } 
  })

  document.querySelectorAll('.mobile-menu__panel>.mobile-menu__section .mobile-menu__back-button').forEach((submenu_close_btn)=>{
    submenu_close_btn.addEventListener('click',(e)=>{
      submenu_close_btn.closest('.mobile-menu__panel').classList.remove('is-open');
    })
  })
}

function handleResize() {  
  if(window.innerWidth < 1000 && caMoMeDr == false ){        
    //caMoMeDr = true;
    callMobileMenuDrawer();
  } else if( window.innerWidth > 999 && caMaMeCl == false ) {        
    //caMaMeCl = true;    
    callMainMenuClicks()
  }
}
const debouncedHandleResize = debounce(handleResize, 500);
window.addEventListener('resize', debouncedHandleResize);


document.addEventListener("DOMContentLoaded", (event) => {
  /* mobilemenu JS */
  if(window.innerWidth < 1000 ){    
    callMobileMenuDrawer();
    // callMobileMenuClicks();
  }else{        
    callMainMenuClicks();  
  }
  /* mobilemenu JS End */
});



$(document).ready(function () {
  // Close navigation when clicking outside of it
  document.addEventListener("click", function(event) {
    if(event.target.closest('.main-navigation') == null && document.querySelectorAll('.mega-nav.open').length > 0){
      document.querySelectorAll('.mega-nav.open').forEach(function(megaNav){
        megaNav.classList.remove('open');
      });
    }
  });
});

// js for mobile search modal toggle
(function () {
  const headerMobileNav = document.querySelector('.header__mobile-nav');
  if (!headerMobileNav) return;

  const searchToggle = document.querySelector('.header__search .modal__toggle');
  const mobileSearchToggle = document.querySelector('.header__mobile-search-toggle');
  const modalCloseBtn = document.querySelector('.search__container .modal-close-button');

  searchToggle?.addEventListener('click', function () {
    headerMobileNav.classList.add('search_modal_open');
  });

  mobileSearchToggle?.addEventListener('click', function () {
    headerMobileNav.classList.remove('search_modal_open');
  });

  modalCloseBtn?.addEventListener('click', function () {
    headerMobileNav.classList.remove('search_modal_open');
  });
})();
