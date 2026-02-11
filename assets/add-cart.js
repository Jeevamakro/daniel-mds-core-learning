document.addEventListener("DOMContentLoaded", function () {

  const addButtons = document.querySelectorAll(".product-form__submit");
  if (addButtons.length > 0) {
    addButtons.forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        e.preventDefault(); // prevent form submission

        const id = btn.dataset.productId; // get the product id
        console.log("Clicked product ID:", id);
        fetch('/cart/add.js', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ id: id, quantity: 1 })
        })
        .then(response => response.json())
        .then(data => {
          console.log('Product added successfully:', data);
          window.location.href = '/cart'; // redirect to cart
        })
        .catch(error => {
          console.error('Error in adding product:', error);
        });
      });
    });
  } else {
    console.warn("No add-to-cart buttons found!");
  }
});