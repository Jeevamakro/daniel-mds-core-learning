  document.addEventListener("DOMContentLoaded", function () {
    var swiper = new Swiper(".collList-wrapper  .swiper", {
      slidesPerView: 7,
      spaceBetween: 16,
      loop: false,
      navigation: false,
      breakpoints: {
        0: {
           slidesPerView: 3.8,
           spaceBetween: 10,
           navigation: false, // Disable navigation below 767px
        },
        // For screens below 767px
        768: {
          slidesPerView: 6,
           spaceBetween: 16,
        },
         1025: {
          slidesPerView: 6,
           spaceBetween: 16,
        },
         1440: {
          slidesPerView: 7,
           spaceBetween: 16,
        },
      }
    });
  });