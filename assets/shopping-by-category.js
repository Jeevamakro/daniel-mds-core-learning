(function () {
  'use strict';

  function initShoppingByCategory(container) {
    // No interactive JS required — layout is purely CSS-driven.
    // This function exists as an extension point and to confirm
    // the section loaded correctly in the theme editor.
    container.querySelectorAll('.shopping-by-category__item').forEach(function (item) {
      item.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          item.click();
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.section-shopping-by-category').forEach(function (section) {
      initShoppingByCategory(section);
    });
  });

  document.addEventListener('shopify:section:load', function (e) {
    var section = e.target;
    if (section.classList.contains('section-shopping-by-category')) {
      initShoppingByCategory(section);
    }
  });
})();
