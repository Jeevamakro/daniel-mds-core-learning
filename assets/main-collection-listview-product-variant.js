document.querySelectorAll('.variant-item').forEach(item => {
    const toggleBtn = item.querySelector('.varint-text');
    const productItems = item.querySelectorAll('.product-items-inner');
    toggleBtn.addEventListener('click', function (e) {
        e.preventDefault();
        const isOpen = item.classList.contains('show');
        toggleBtn.textContent = isOpen ? "Show" : "Hide";
        item.classList.toggle('show');
        productItems.forEach(pi => pi.classList.toggle('show'));
    });
});