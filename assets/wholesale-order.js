// variant-togle
document.addEventListener("DOMContentLoaded", () => {
  const productItems = document.querySelectorAll(".product-item.has-variants");

  productItems.forEach(item => {
    const toggleBtn = item.querySelector(".variant-toggle");
    const innerWrapper = item.querySelector(".inner-variant-pro-wrapper");

    if (!toggleBtn || !innerWrapper) return;

    toggleBtn.addEventListener("click", () => {

    
      document.querySelectorAll(".product-item.has-variants").forEach(allItem => {
        if (allItem !== item) {
          allItem.classList.remove("active");
          const otherInner = allItem.querySelector(".inner-variant-pro-wrapper");
          const otherBtn = allItem.querySelector(".variant-toggle");

          if (otherInner) otherInner.classList.remove("active");
          if (otherBtn) {
            otherBtn.classList.remove("active");
            otherBtn.querySelector("span").textContent = "Select a variant";
          }
        }
      });

      const isActive = innerWrapper.classList.contains("active");

      if (isActive) {
        innerWrapper.classList.remove("active");
        toggleBtn.classList.remove("active");
        toggleBtn.querySelector("span").textContent = "Select a variant";
      } else {
        innerWrapper.classList.add("active");
        toggleBtn.classList.add("active");
        toggleBtn.querySelector("span").textContent = "Hide variants";
      }

    });
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const modal = document.querySelector("#PopupModal-wholesale-filter-mobile");

  document.addEventListener("click", (e) => {
    const opener = e.target.closest("[data-modal='#PopupModal-wholesale-filter-mobile']");
    if (opener) {
     
      setTimeout(() => {
        if (modal && modal.hasAttribute("aria-hidden")) {
          modal.removeAttribute("aria-hidden"); 
        }
      }, 10);
    }
  });


  document.addEventListener("click", (e) => {
    if (!modal) return;

    const filterDropdown = modal.querySelector(".wholesale-filter-dropdown");
    if (!filterDropdown) return;

    const menu = filterDropdown.querySelector(".filter-menu");

    if (e.target.closest(".wholesale-filter-dropdown .filter-btn.button")) {
      menu?.classList.add("active");
      modal.removeAttribute("aria-hidden");
    }

    if (e.target.closest(".wholesale-filter-dropdown .back-button")) {
      menu?.classList.remove("active");
    }
  });

});


// laptop filter
const btn = document.querySelector(".desktop-filter.filter-btn");
const menu = document.querySelector(".desktop-filter-menu.filter-menu");

btn.addEventListener("click", (e) => {
  e.stopPropagation();
  btn.classList.toggle("active");
  menu.classList.toggle("active");
});

document.addEventListener("click", (e) => {
  if (!menu.contains(e.target) && !btn.contains(e.target)) {
    btn.classList.remove("active");
    menu.classList.remove("active");
  }
});


// desktop sortby filter
document.addEventListener("DOMContentLoaded", function () {
  const styledSelect = document.querySelector(".select-styled");
  const selectOptions = document.querySelector(".select-options");

  styledSelect.addEventListener("click", function (event) {
    event.stopPropagation();
    const isOpen = selectOptions.classList.toggle("active");
    styledSelect.classList.toggle("active");

    selectOptions.style.display = isOpen ? "block" : "none";
  });


  document.addEventListener("click", function () {
    styledSelect.classList.remove("active");
    selectOptions.classList.remove("active");
    selectOptions.style.display = "none";
  });
});


// mobile sortby filter
document.addEventListener("DOMContentLoaded", function () {
  const styledSelect = document.querySelector(".mobile-sort-by .select-hidden");
  const selectOptions = document.querySelector(".mobile-sort-by .select-options");

  // Toggle on click
  styledSelect.addEventListener("click", function (e) {
    e.stopPropagation();
    styledSelect.classList.toggle("active");
    selectOptions.classList.toggle("active");

    if (selectOptions.classList.contains("active")) {
      selectOptions.style.display = "block";
    } else {
      selectOptions.style.display = "none";
    }
  });

  document.addEventListener("click", function () {
    styledSelect.classList.remove("active");
    selectOptions.classList.remove("active");
    selectOptions.style.display = "none";
  });
});



