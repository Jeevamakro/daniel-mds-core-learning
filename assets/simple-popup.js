document.querySelectorAll('.modal-close-button').forEach(button => {
  button.addEventListener('click', () => {
    const dialog = button.closest('.simpled-popup-modal__dialog');
    if (!dialog) return;

    dialog.classList.add('is-closing');

    setTimeout(() => {
      dialog.closest('modal-dialog')?.hide();
    }, 400);
  });
});
