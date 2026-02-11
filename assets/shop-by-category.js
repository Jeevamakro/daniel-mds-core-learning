document.addEventListener('DOMContentLoaded', function () {
  if (window.innerWidth <= 575) {
    document.querySelectorAll('.card-list__swiper').forEach((slider) => {
      new Swiper(slider, {
        slidesPerView: 2,
        spaceBetween: 10,
        loop: false,
      })
    })
  }
})