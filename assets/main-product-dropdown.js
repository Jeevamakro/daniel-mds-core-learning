document.querySelectorAll('.dropdown').forEach(drop => {
    const header = drop.querySelector('.dropdown-header');
    const list = drop.querySelector('.dropdown-list');
    header.addEventListener('click', () => {
        document.querySelectorAll('.dropdown').forEach(d => {
            if (d !== drop) {
                d.classList.remove('open');
                d.querySelector('.dropdown-list').style.display = "none";
            }
        });

        const isOpen = drop.classList.contains('open');
        drop.classList.toggle('open');
        list.style.display = isOpen ? "none" : "block";
    });
    list.querySelectorAll('li').forEach(item => {
        item.addEventListener('click', () => {
            header.childNodes[0].textContent = item.textContent + " ";
            list.style.display = "none";
            drop.classList.remove('open');
            drop.classList.add('selected');

        });
    });

});
