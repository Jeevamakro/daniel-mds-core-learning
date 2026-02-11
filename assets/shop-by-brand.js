document.addEventListener("DOMContentLoaded", function() {
  const section = document.querySelector("#shop-by-brand");
  const tabs = section?.querySelectorAll(".tab");
  const filter = section?.querySelector(".alphabet-tabs");

  if (!section || !tabs.length || !filter) return;

  let lastScrollY = window.scrollY;
  let disableSticky = false;

  tabs.forEach(tab => {
    tab.addEventListener("click", function() {
      if (tab.classList.contains("disabled")) return;

      const letter = tab.dataset.letter.toUpperCase();

      tabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");

      if (letter === "ALL") {
        disableSticky = true; 
        filter.classList.remove("sticky-filter"); 

        section.scrollIntoView({ behavior: "smooth", block: "start" });
        setTimeout(() => {
          disableSticky = false;
        }, 1000);

        return;
      }

      const targetBlock = section.querySelector(`.alphabet-block[data-letter="${letter}"]`);
      if (targetBlock) {
        targetBlock.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });

  window.addEventListener("scroll", function() {
    if (disableSticky) return; 

    const currentScrollY = window.scrollY;
    const scrollingUp = currentScrollY < lastScrollY;
    const sectionTop = section.offsetTop;
    const sectionBottom = sectionTop + section.offsetHeight;

    if (scrollingUp && currentScrollY >= sectionTop && currentScrollY < sectionBottom) {
      filter.classList.add("sticky-filter");
    } else {
      filter.classList.remove("sticky-filter");
    }

    lastScrollY = currentScrollY;
  });
});
