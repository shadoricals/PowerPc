document.addEventListener('DOMContentLoaded', function() {
    const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');
    
    addToCartButtons.forEach(button => {
        button.addEventListener('click', function() {
            const productCard = this.closest('.product-card');
            const productImage = productCard.querySelector('.product-image');
            
            // Remove £ symbol and commas from price before storing
            const priceString = productImage.dataset.price.replace(/[£,]/g, '');
            
            const product = {
                id: productCard.dataset.id,
                name: productImage.dataset.name,
                price: priceString,
                image: productImage.src,
                specs: productCard.querySelector('p').textContent,
                quantity: 1
            };

            // Add to cart
            let cart = JSON.parse(localStorage.getItem('cart')) || [];
            const existingProduct = cart.find(item => item.id === product.id);
            
            if (existingProduct) {
                existingProduct.quantity += 1;
            } else {
                cart.push(product);
            }
            
            localStorage.setItem('cart', JSON.stringify(cart));

            // Update button
            this.textContent = 'Added to Cart';
            this.classList.add('added');
            
            setTimeout(() => {
                this.textContent = 'Add to Cart';
                this.classList.remove('added');
            }, 2000);
        });
    });

    // Setup horizontal scroll arrows for featured products
    const productGrid = document.querySelector('.product-grid');
    const scrollLeftBtn = document.createElement('button');
    const scrollRightBtn = document.createElement('button');
    
    scrollLeftBtn.className = 'scroll-arrow scroll-left';
    scrollRightBtn.className = 'scroll-arrow scroll-right';
    scrollLeftBtn.innerHTML = '‹';
    scrollRightBtn.innerHTML = '›';
    
    const productContainer = document.querySelector('.product-container');
    if (productContainer) {
        productContainer.insertBefore(scrollLeftBtn, productGrid);
        productContainer.appendChild(scrollRightBtn);
        
        const scrollAmount = 300;
        
        scrollLeftBtn.addEventListener('click', () => {
            productGrid.scrollBy({
                left: -scrollAmount,
                behavior: 'smooth'
            });
        });
        
        scrollRightBtn.addEventListener('click', () => {
            productGrid.scrollBy({
                left: scrollAmount,
                behavior: 'smooth'
            });
        });
    }
});
