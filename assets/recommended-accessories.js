document.addEventListener('DOMContentLoaded', function() {
    new Swiper('.accessories-swiper', {
      slidesPerView: 3,
      spaceBetween: 20,
      navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
      },
      breakpoints: {
        320: { slidesPerView: 1.2, spaceBetween: 12 },
        640: { slidesPerView: 2.2, spaceBetween: 16 },
        1024: { slidesPerView: 3, spaceBetween: 16 },
      },
    });
  });