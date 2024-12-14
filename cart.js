class Cart {
    constructor() {
        this.items = JSON.parse(localStorage.getItem('cart')) || [];
        this.updateCartDisplay();
    }

    addItem(product) {
        const existingItem = this.items.find(item => item.id === product.id);
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.items.push({ ...product, quantity: 1 });
        }
        this.saveCart();
        this.updateCartDisplay();
    }

    removeItem(productId) {
        this.items = this.items.filter(item => item.id !== productId);
        this.saveCart();
        this.updateCartDisplay();
    }

    updateQuantity(productId, quantity) {
        const item = this.items.find(item => item.id === productId);
        if (item) {
            item.quantity = Math.min(Math.max(parseInt(quantity) || 1, 1), 100);
            if (item.quantity <= 0) {
                this.removeItem(productId);
            }
        }
        this.saveCart();
        this.updateCartDisplay();
    }

    saveCart() {
        localStorage.setItem('cart', JSON.stringify(this.items));
    }

    updateCartDisplay() {
        const cartItems = document.querySelector('.cart-items');
        const cartSummary = document.querySelector('.cart-summary');
        const checkoutButton = document.querySelector('.checkout-button');
        
        if (!cartItems) return;

        if (this.items.length === 0) {
            cartItems.innerHTML = '<div class="empty-cart-message">Your cart is empty</div>';
            updateCartSummary(0);
            cartSummary.style.display = 'block';
            
            if (checkoutButton) {
                checkoutButton.disabled = true;
                checkoutButton.classList.add('disabled');
                checkoutButton.title = 'Add items to your cart to checkout';
            }
            return;
        }

        if (checkoutButton) {
            checkoutButton.disabled = false;
            checkoutButton.classList.remove('disabled');
            checkoutButton.title = 'Proceed to checkout';
        }

        let total = 0;
        cartItems.innerHTML = this.items.map(item => {
            const unitPrice = parseFloat(item.price);
            total += unitPrice * item.quantity;
            
            return `
                <div class="cart-item" data-id="${item.id}">
                    <img src="${item.image}" alt="${item.name}" class="cart-item-image">
                    <div class="cart-item-details">
                        <h3>${item.name}</h3>
                        <p>${item.specs || ''}</p>
                        <span class="price">£${unitPrice.toLocaleString('en-GB', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                        })}</span>
                    </div>
                    <div class="cart-item-actions">
                        <div class="quantity-controls">
                            <button class="quantity-btn minus">-</button>
                            <input type="number" class="quantity-input" value="${item.quantity}" min="1" max="100">
                            <button class="quantity-btn plus">+</button>
                        </div>
                        <button class="remove-item">Remove</button>
                    </div>
                </div>
            `;
        }).join('');

        cartSummary.style.display = 'block';
        updateCartSummary(total);
        setupQuantityButtonHold();
    }
}

function updateCartSummary(total) {
    const formattedTotal = total.toLocaleString('en-GB', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });

    document.querySelector('.summary-item span:last-child').textContent = `£${formattedTotal}`;
    document.querySelector('.summary-item.total span:last-child').textContent = `£${formattedTotal}`;
}

function setupQuantityButtonHold() {
    let intervalId = null;
    let timeoutId = null;
    let activeButton = null;
    let isHolding = false;

    // Helper to check if it's a mobile device
    const isMobile = () => window.matchMedia('(max-width: 768px)').matches;

    function updateQuantity(input, isIncrement) {
        const currentValue = parseInt(input.value) || 1;
        const newValue = isIncrement ? 
            Math.min(currentValue + 1, 100) : 
            Math.max(currentValue - 1, 1);
        
        if (newValue !== currentValue) {
            input.value = newValue;
            const productId = input.closest('.cart-item').dataset.id;
            cart.updateQuantity(productId, newValue);
        }
        return newValue;
    }

    function startHolding(button, input, isIncrement) {
        // Don't start holding on mobile
        if (isMobile()) {
            updateQuantity(input, isIncrement);
            return;
        }

        isHolding = true;
        activeButton = button;
        updateQuantity(input, isIncrement);
        
        timeoutId = setTimeout(() => {
            if (isHolding) {
                intervalId = setInterval(() => {
                    const value = updateQuantity(input, isIncrement);
                    if (value >= 100 || value <= 1) {
                        stopHolding();
                    }
                }, 100);
            }
        }, 500);
    }

    function stopHolding() {
        isHolding = false;
        activeButton = null;
        if (intervalId) {
            clearInterval(intervalId);
            intervalId = null;
        }
        if (timeoutId) {
            clearTimeout(timeoutId);
            timeoutId = null;
        }
    }

    document.querySelectorAll('.quantity-btn').forEach(button => {
        button.addEventListener('mousedown', (e) => {
            e.preventDefault();
            const input = button.parentElement.querySelector('.quantity-input');
            startHolding(button, input, button.classList.contains('plus'));
        });

        button.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const input = button.parentElement.querySelector('.quantity-input');
            startHolding(button, input, button.classList.contains('plus'));
        });
    });

    document.addEventListener('mouseup', stopHolding);
    document.addEventListener('touchend', stopHolding);
    document.addEventListener('mouseleave', stopHolding);
}

const cart = new Cart();

document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('.checkout-button')) {
        document.querySelector('.checkout-button').addEventListener('click', () => {
            window.location.href = 'checkout.html';
        });
    }

    document.querySelector('.cart-items')?.addEventListener('click', (e) => {
        if (e.target.classList.contains('remove-item')) {
            const cartItem = e.target.closest('.cart-item');
            if (cartItem) {
                const productId = cartItem.dataset.id;
                cart.removeItem(productId);
            }
        }
    });

    document.querySelectorAll('.quantity-input').forEach(input => {
        input.addEventListener('input', (e) => {
            let value = parseInt(e.target.value) || 1;
            value = Math.min(Math.max(value, 1), 100);
            e.target.value = value;
        });

        input.addEventListener('change', (e) => {
            let value = parseInt(e.target.value) || 1;
            value = Math.min(Math.max(value, 1), 100);
            e.target.value = value;
            const productId = e.target.closest('.cart-item').dataset.id;
            cart.updateQuantity(productId, value);
        });
    });
});