document.addEventListener('DOMContentLoaded', function () {
  if (window.innerWidth <= 575) {
    document.querySelectorAll('.category-list__swiper').forEach((slider) => {
      const paginationEl = slider.querySelector('.card-list-pagination');

      new Swiper(slider, {
        slidesPerView: 1.05,
        spaceBetween: 10,
        loop: false,
        pagination: {
          el: paginationEl,
          clickable: true,
        },
      });
    });
  }
});