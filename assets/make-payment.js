document.addEventListener("DOMContentLoaded", function () {
  const paymentBlocks = document.querySelectorAll(".payment-block");
  paymentBlocks.forEach((block) => {
    const checkbox = block.querySelector('input[type="checkbox"][name="payment"]');
    const fields = block.querySelector(".payment-fields");
    if (fields) fields.style.display = "none";
    checkbox.addEventListener("change", function () {
      if (checkbox.checked) {
        paymentBlocks.forEach((otherBlock) => {
          if (otherBlock !== block) {
            const otherCheckbox = otherBlock.querySelector('input[type="checkbox"][name="payment"]');
            const otherFields = otherBlock.querySelector(".payment-fields");
            if (otherCheckbox) otherCheckbox.checked = false;
            if (otherFields) otherFields.style.display = "none";
          }
        });
        if (fields) fields.style.display = "block";
      } else {
        if (fields) fields.style.display = "none";
      }
    });
  });
});