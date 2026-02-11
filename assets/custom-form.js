document.getElementById("contactForm").addEventListener("submit", function(event) {
  event.preventDefault();

  let valid = true;

  const fields = [
    ["fname", "nameError"],
    ["bname", "bnameError"],
    ["taxnumber", "taxnumberError"],
    ["resale_certificate_number", "rcnumberError"],
    ["shipping_address", "addressError"],
    ["zipcode", "zipcodeError"],
    ["country", "countryError"],
    ["state", "stateError"],
    ["city", "cityError"],
    ["countryCode", "countryCodeError"],
    ["phoneNumber", "phoneNumberError"]

  ];

  fields.forEach(field => {
    let value = document.getElementById(field[0]).value.trim();
    let error = document.getElementById(field[1]);

    if (value === "") {
      error.style.display = "block";
      valid = false;
    } else {
      error.style.display = "none";
    }
  });

  // email (special validation)
  let email = document.getElementById("email").value.trim();
  let emailPattern = /^[^ ]+@[^ ]+\.[a-z]{2,3}$/;

  if (!emailPattern.test(email)) {
    document.getElementById("emailError").style.display = "block";
    valid = false;
  } else {
    document.getElementById("emailError").style.display = "none";
  }

  if (valid) {
    alert("Form submitted successfully!");
    this.reset();
  }
});
