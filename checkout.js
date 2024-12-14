document.addEventListener('DOMContentLoaded', function() {
    const placeOrderBtn = document.querySelector('.place-order-btn');
    const requiredFields = {
        email: document.getElementById('email'),
        fullName: document.getElementById('fullName'),
        address: document.getElementById('address'),
        city: document.getElementById('city'),
        postcode: document.getElementById('postcode'),
        cardName: document.getElementById('cardName'),
        cardNumber: document.getElementById('cardNumber'),
        expiry: document.getElementById('expiry'),
        cvv: document.getElementById('cvv')
    };

    // Add input event listeners to all required fields
    for (let field in requiredFields) {
        requiredFields[field].addEventListener('input', checkFormValidity);
    }

    function checkFormValidity() {
        let isValid = true;
        
        // Check if all fields are filled
        for (let field in requiredFields) {
            if (!requiredFields[field].value.trim()) {
                isValid = false;
                break;
            }
        }

        // Additional validations
        if (isValid) {
            isValid = validateEmail(requiredFields.email) &&
                     validateCardNumber(requiredFields.cardNumber.value) &&
                     validateExpiry(requiredFields.expiry.value) &&
                     validateCVV(requiredFields.cvv.value);
        }

        // Enable/disable button based on validation
        placeOrderBtn.disabled = !isValid;
    }

    // Initial check
    checkFormValidity();

    displayOrderSummary();
    setupEmailValidation();
    setupCardValidation();
    setupExpiryValidation();
    setupCVVValidation();
    setupCardNameValidation();
    validateShippingFields();

    // Add event listener for storage changes
    window.addEventListener('storage', function(e) {
        if (e.key === 'cart') {
            displayOrderSummary();
        }
    });
});

document.querySelector('.place-order-btn').addEventListener('click', function(e) {
    e.preventDefault();
    
    // Get all required form fields
    const requiredFields = {
        email: document.getElementById('email'),
        fullName: document.getElementById('fullName'),
        address: document.getElementById('address'),
        city: document.getElementById('city'),
        postcode: document.getElementById('postcode'),
        cardName: document.getElementById('cardName'),
        cardNumber: document.getElementById('cardNumber'),
        expiry: document.getElementById('expiry'),
        cvv: document.getElementById('cvv')
    };

    // Check if any required field is empty
    let isValid = true;
    for (let field in requiredFields) {
        if (!requiredFields[field].value.trim()) {
            requiredFields[field].classList.add('invalid');
            isValid = false;
        } else {
            requiredFields[field].classList.remove('invalid');
        }
    }

    // Additional validation for email format
    if (!validateEmail(requiredFields.email)) {
        isValid = false;
    }

    // Additional validation for card number format
    if (!validateCardNumber(requiredFields.cardNumber.value)) {
        requiredFields.cardNumber.classList.add('invalid');
        isValid = false;
    }

    // Additional validation for expiry date format
    if (!validateExpiry(requiredFields.expiry.value)) {
        requiredFields.expiry.classList.add('invalid');
        isValid = false;
    }

    // Additional validation for CVV format
    if (!validateCVV(requiredFields.cvv.value)) {
        requiredFields.cvv.classList.add('invalid');
        isValid = false;
    }

    // If any validation fails, stop here
    if (!isValid) {
        alert('Please fill in all required fields correctly.');
        return;
    }

    // If all validations pass, proceed with purchase
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const purchasedItemsList = document.querySelector('.purchased-items-list');
    let total = 0;
    
    purchasedItemsList.innerHTML = '';
    
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        
        purchasedItemsList.innerHTML += `
            <div class="purchased-item">
                <span>${item.name} × ${item.quantity}</span>
                <span>£${itemTotal.toLocaleString('en-GB', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                })}</span>
            </div>
        `;
    });
    
    document.querySelector('.total-amount').textContent = `£${total.toLocaleString('en-GB', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })}`;
    
    document.getElementById('checkout-content').style.display = 'none';
    document.getElementById('thank-you-content').style.display = 'block';
    
    localStorage.removeItem('cart');
});

function validateCardNumber(number) {
    // Remove spaces and check if it's exactly 16 digits
    const cleanNumber = number.replace(/\s/g, '');
    return /^\d{16}$/.test(cleanNumber);
}

function validateExpiry(expiry) {
    const regex = /^(0[1-9]|1[0-2])\/([0-9]{2})$/;
    if (!regex.test(expiry)) return false;
    
    const [month, year] = expiry.split('/');
    const now = new Date();
    const currentYear = now.getFullYear() % 100;
    const currentMonth = now.getMonth() + 1;
    
    if (parseInt(year) < currentYear) return false;
    if (parseInt(year) === currentYear && parseInt(month) < currentMonth) return false;
    
    return true;
}

function validateCVV(cvv) {
    const regex = /^\d{3}$/;
    return regex.test(cvv);
}

function validateEmail(input) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValid = emailRegex.test(input.value);
    
    if (!isValid) {
        input.classList.add('invalid');
        input.nextElementSibling.classList.add('show');
    } else {
        input.classList.remove('invalid');
        input.nextElementSibling.classList.remove('show');
    }
    
    return isValid;
}

function displayOrderSummary() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const orderItemsContainer = document.querySelector('.order-items');
    let subtotal = 0;

    // Clear existing items
    orderItemsContainer.innerHTML = '';

    // Display each item from cart and calculate total
    cart.forEach(item => {
        const price = parseFloat(item.price);
        const itemTotal = price * item.quantity;
        subtotal += itemTotal;

        orderItemsContainer.innerHTML += `
            <div class="order-item">
                <span>${item.name} × ${item.quantity}</span>
                <span>£${itemTotal.toLocaleString('en-GB', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                })}</span>
            </div>
        `;
    });

    // Update summary amounts
    const summaryLines = document.querySelectorAll('.summary-line');
    summaryLines[0].querySelector('span:last-child').textContent = `£${subtotal.toLocaleString('en-GB', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })}`;
    
    // Update shipping (if applicable)
    if (summaryLines[1]) {
        const shipping = 0; // or your shipping calculation
        summaryLines[1].querySelector('span:last-child').textContent = `£${shipping.toLocaleString('en-GB', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })}`;
    }
    
    // Update total
    const totalLine = document.querySelector('.total-line span:last-child');
    const total = subtotal; // + shipping if applicable
    totalLine.textContent = `£${total.toLocaleString('en-GB', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })}`;

    // Update display if cart is empty
    if (cart.length === 0) {
        orderItemsContainer.innerHTML = '<div class="empty-order-message">Your cart is empty</div>';
        summaryLines[0].querySelector('span:last-child').textContent = '£0.00';
        if (summaryLines[1]) {
            summaryLines[1].querySelector('span:last-child').textContent = '£0.00';
        }
        totalLine.textContent = '£0.00';
    }
}

function setupEmailValidation() {
    const emailInput = document.getElementById('email');
    const errorMessage = document.createElement('div');
    errorMessage.className = 'error-message';
    errorMessage.textContent = 'Please enter a valid email address';
    emailInput.parentNode.appendChild(errorMessage);

    emailInput.addEventListener('input', function() {
        validateEmail(this);
    });

    emailInput.addEventListener('blur', function() {
        validateEmail(this);
    });
}

function setupCardValidation() {
    const cardNumberInput = document.getElementById('cardNumber');
    const errorMessage = document.createElement('div');
    errorMessage.className = 'error-message';
    errorMessage.textContent = 'Please enter a valid 16-digit card number';
    cardNumberInput.parentNode.appendChild(errorMessage);

    cardNumberInput.addEventListener('input', function(e) {
        // Remove any non-digit characters
        let value = this.value.replace(/\D/g, '');
        
        // Add spaces every 4 digits
        let formattedValue = '';
        for (let i = 0; i < value.length; i++) {
            if (i > 0 && i % 4 === 0) {
                formattedValue += ' ';
            }
            formattedValue += value[i];
        }
        
        // Limit to exactly 16 digits (19 characters including spaces)
        if (value.length > 16) {
            value = value.slice(0, 16);
            formattedValue = formattedValue.slice(0, 19);
        }
        
        // Update input value
        this.value = formattedValue;
        
        // Validate the card number
        const isValid = validateCardNumber(this.value);
        if (!isValid) {
            this.classList.add('invalid');
            errorMessage.classList.add('show');
        } else {
            this.classList.remove('invalid');
            errorMessage.classList.remove('show');
        }
    });

    cardNumberInput.addEventListener('keypress', function(e) {
        // Only allow numbers
        if (!/^\d$/.test(e.key)) {
            e.preventDefault();
        }
    });
}

function setupExpiryValidation() {
    const expiryInput = document.getElementById('expiry');
    const errorMessage = document.createElement('div');
    errorMessage.className = 'error-message';
    errorMessage.textContent = 'Please enter a valid expiry date (MM/YY)';
    expiryInput.parentNode.appendChild(errorMessage);

    expiryInput.addEventListener('input', function(e) {
        // Store cursor position and current value length before change
        const cursorPos = this.selectionStart;
        const lengthBeforeChange = this.value.length;
        
        // Remove any non-digit characters
        let value = this.value.replace(/\D/g, '');
        
        // Format as MM/YY
        if (value.length >= 2) {
            value = value.slice(0, 2) + '/' + value.slice(2);
        }
        
        // Limit to 4 digits (5 characters including /)
        if (value.length > 5) {
            value = value.slice(0, 5);
        }
        
        // Update input value
        this.value = value;
        
        // Handle cursor position
        if (cursorPos === 2 && value.length > lengthBeforeChange) {
            // If typing and cursor at position where slash will be added, move cursor after slash
            this.setSelectionRange(3, 3);
        } else if (e.inputType === 'deleteContentBackward' && cursorPos === 3) {
            // If backspacing the slash, move cursor before where slash was
            this.setSelectionRange(2, 2);
        } else if (cursorPos === 2 && value.length === 2) {
            // Keep cursor at end when typing second digit
            this.setSelectionRange(2, 2);
        } else {
            // For all other cases, keep cursor position
            this.setSelectionRange(cursorPos, cursorPos);
        }
        
        // Validate the expiry date
        const isValid = validateExpiry(this.value);
        if (!isValid) {
            this.classList.add('invalid');
            errorMessage.classList.add('show');
        } else {
            this.classList.remove('invalid');
            errorMessage.classList.remove('show');
        }
    });

    expiryInput.addEventListener('keypress', function(e) {
        // Only allow numbers
        if (!/^\d$/.test(e.key)) {
            e.preventDefault();
        }
    });
}

function setupCVVValidation() {
    const cvvInput = document.getElementById('cvv');
    const errorMessage = document.createElement('div');
    errorMessage.className = 'error-message';
    errorMessage.textContent = 'Please enter a valid 3-digit CVV';
    cvvInput.parentNode.appendChild(errorMessage);

    cvvInput.addEventListener('input', function(e) {
        // Remove any non-digit characters
        let value = this.value.replace(/\D/g, '');
        
        // Limit to 3 digits
        if (value.length > 3) {
            value = value.slice(0, 3);
        }
        
        // Update input value
        this.value = value;
        
        // Validate the CVV
        const isValid = validateCVV(this.value);
        if (!isValid) {
            this.classList.add('invalid');
            errorMessage.classList.add('show');
        } else {
            this.classList.remove('invalid');
            errorMessage.classList.remove('show');
        }
    });

    cvvInput.addEventListener('keypress', function(e) {
        // Only allow numbers
        if (!/^\d$/.test(e.key)) {
            e.preventDefault();
        }
    });
}

function setupCardNameValidation() {
    const cardNameInput = document.getElementById('cardName');
    const errorMessage = document.createElement('div');
    errorMessage.className = 'error-message';
    errorMessage.textContent = 'Name must start and end with letters (spaces, periods, and hyphens allowed between names)';
    cardNameInput.parentNode.appendChild(errorMessage);

    cardNameInput.addEventListener('keypress', function(e) {
        // Only allow letters, spaces, periods, and hyphens
        if (!/^[A-Za-z\s.-]$/.test(e.key)) {
            e.preventDefault();
        }
        
        // Prevent multiple consecutive spaces, periods, or hyphens
        const currentValue = this.value;
        const currentChar = currentValue[this.selectionStart - 1];
        if ((e.key === ' ' && currentChar === ' ') ||
            (e.key === '.' && currentChar === '.') ||
            (e.key === '-' && currentChar === '-')) {
            e.preventDefault();
        }
        
        // Prevent spaces, periods, or hyphens at the start
        if (currentValue.length === 0 && (e.key === ' ' || e.key === '.' || e.key === '-')) {
            e.preventDefault();
        }
    });

    cardNameInput.addEventListener('input', function() {
        validateCardName(this);
    });

    cardNameInput.addEventListener('blur', function() {
        validateCardName(this);
    });
}

function validateCardName(input) {
    // Must start and end with letters
    // Spaces, periods, and hyphens only allowed between letters
    const nameRegex = /^[A-Za-z]+(?:[.\s-]+[A-Za-z]+)*$/;
    const isValid = nameRegex.test(input.value) && input.value.length >= 2;
    
    if (!isValid) {
        input.classList.add('invalid');
        input.nextElementSibling.classList.add('show');
    } else {
        input.classList.remove('invalid');
        input.nextElementSibling.classList.remove('show');
    }
    
    return isValid;
}

function validateShippingFields() {
    const fullName = document.getElementById('fullName');
    const address = document.getElementById('address');
    const city = document.getElementById('city');
    const postcode = document.getElementById('postcode');

    // Full Name validation (at least two words, letters only)
    fullName.addEventListener('input', function() {
        const nameRegex = /^[A-Za-z]+(?:\s[A-Za-z]+)+$/;
        const isValid = nameRegex.test(this.value.trim());
        
        if (!isValid) {
            this.classList.add('invalid');
            if (!this.nextElementSibling?.classList.contains('error-message')) {
                const error = document.createElement('div');
                error.className = 'error-message';
                error.textContent = 'Please enter your full name (first and last name)';
                this.parentNode.appendChild(error);
            }
            this.nextElementSibling.classList.add('show');
        } else {
            this.classList.remove('invalid');
            this.nextElementSibling?.classList.remove('show');
        }
    });

    // Address validation (minimum length and format)
    address.addEventListener('input', function() {
        const addressRegex = /^[A-Za-z0-9\s,.'-]{5,}$/;
        const isValid = addressRegex.test(this.value.trim());
        
        if (!isValid) {
            this.classList.add('invalid');
            if (!this.nextElementSibling?.classList.contains('error-message')) {
                const error = document.createElement('div');
                error.className = 'error-message';
                error.textContent = 'Please enter a valid address (minimum 5 characters)';
                this.parentNode.appendChild(error);
            }
            this.nextElementSibling.classList.add('show');
        } else {
            this.classList.remove('invalid');
            this.nextElementSibling?.classList.remove('show');
        }
    });

    // City validation (letters and spaces only)
    city.addEventListener('input', function() {
        const cityRegex = /^[A-Za-z\s]{2,}$/;
        const isValid = cityRegex.test(this.value.trim());
        
        if (!isValid) {
            this.classList.add('invalid');
            if (!this.nextElementSibling?.classList.contains('error-message')) {
                const error = document.createElement('div');
                error.className = 'error-message';
                error.textContent = 'Please enter a valid city name (letters only)';
                this.parentNode.appendChild(error);
            }
            this.nextElementSibling.classList.add('show');
        } else {
            this.classList.remove('invalid');
            this.nextElementSibling?.classList.remove('show');
        }
    });

    // UK Postcode validation
    postcode.addEventListener('input', function() {
        // Convert to uppercase for validation
        this.value = this.value.toUpperCase();
        
        // UK postcode format
        const postcodeRegex = /^[A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2}$/;
        const isValid = postcodeRegex.test(this.value.trim());
        
        if (!isValid) {
            this.classList.add('invalid');
            if (!this.nextElementSibling?.classList.contains('error-message')) {
                const error = document.createElement('div');
                error.className = 'error-message';
                error.textContent = 'Please enter a valid UK postcode';
                this.parentNode.appendChild(error);
            }
            this.nextElementSibling.classList.add('show');
        } else {
            this.classList.remove('invalid');
            this.nextElementSibling?.classList.remove('show');
        }
    });
}