// 1. Data Setup
// I'm using a simple array of objects to act as my database
const products = [
    { id: 1, name: "Wireless Headphones", price: 99.99, category: "electronics", image: "https://via.placeholder.com/150" },
    { id: 2, name: "Smart Watch", price: 199.99, category: "electronics", image: "https://via.placeholder.com/150" },
    { id: 3, name: "Denim Jacket", price: 49.99, category: "fashion", image: "https://via.placeholder.com/150" },
    { id: 4, name: "Running Shoes", price: 79.99, category: "fashion", image: "https://via.placeholder.com/150" },
    { id: 5, name: "Coffee Maker", price: 89.99, category: "home", image: "https://via.placeholder.com/150" },
    { id: 6, name: "Desk Lamp", price: 29.99, category: "home", image: "https://via.placeholder.com/150" },
];

// Load cart from local storage or start empty
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let discountRate = 0; // 0 means no discount

// 2. Select Elements
const productContainer = document.getElementById('products-container');
const cartListContainer = document.getElementById('cart-list');
const cartCountSpan = document.getElementById('cart-count');
const themeBtn = document.getElementById('theme-btn');

// 3. Core Functions

// Function to save current cart to local storage
function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
}

// Update the little number in the navbar
function updateCartCount() {
    let totalItems = 0;
    cart.forEach(item => {
        totalItems += item.quantity;
    });
    if(cartCountSpan) {
        cartCountSpan.innerText = totalItems;
    }
}

// Display products on the main page
function displayProducts(itemsToShow) {
    // Clear existing content
    productContainer.innerHTML = "";

    itemsToShow.forEach(product => {
        // Create the card HTML
        const productHTML = `
            <div class="product-card">
                <img src="${product.image}" alt="${product.name}">
                <h3>${product.name}</h3>
                <p>$${product.price.toFixed(2)}</p>
                <button onclick="addToCart(${product.id})">Add to Cart</button>
            </div>
        `;
        productContainer.innerHTML += productHTML;
    });
}

// Logic to add item to cart
function addToCart(productId) {
    // Find the product details
    const product = products.find(p => p.id === productId);
    
    // Check if it's already in the cart
    const itemInCart = cart.find(item => item.id === productId);

    if (itemInCart) {
        itemInCart.quantity += 1; // Just increase amount
    } else {
        // Add new item with quantity 1
        cart.push({ ...product, quantity: 1 });
    }

    saveCart();
    showToast();
}

// Show a small popup message
function showToast() {
    const toast = document.getElementById('toast-message');
    toast.classList.remove('hidden');
    setTimeout(() => {
        toast.classList.add('hidden');
    }, 2000); // Hide after 2 seconds
}

// Render the Cart Page
function displayCart() {
    if (cart.length === 0) {
        cartListContainer.innerHTML = "<p>Your cart is empty.</p>";
        calculateTotal();
        return;
    }

    cartListContainer.innerHTML = "";
    
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        
        cartListContainer.innerHTML += `
            <div class="cart-item">
                <div style="display:flex; align-items:center; gap:10px;">
                    <img src="${item.image}" style="width:50px; height:50px; object-fit:cover">
                    <div>
                        <h4>${item.name}</h4>
                        <small>Price: $${item.price}</small>
                    </div>
                </div>
                
                <div class="qty-controls">
                    <button onclick="changeQuantity(${item.id}, -1)">-</button>
                    <span>${item.quantity}</span>
                    <button onclick="changeQuantity(${item.id}, 1)">+</button>
                </div>

                <p><strong>$${itemTotal.toFixed(2)}</strong></p>
                
                <button style="background:red;" onclick="removeItem(${item.id})">Remove</button>
            </div>
        `;
    });

    calculateTotal();
}

// Handle quantity changes (+ or -)
function changeQuantity(id, amount) {
    const item = cart.find(i => i.id === id);
    
    if (item) {
        item.quantity += amount;
        
        // If quantity drops to 0, remove it
        if (item.quantity <= 0) {
            removeItem(id);
        } else {
            saveCart();
            displayCart(); // Refresh screen
        }
    }
}

function removeItem(id) {
    cart = cart.filter(item => item.id !== id);
    saveCart();
    displayCart();
}

// Calculate Prices
function calculateTotal() {
    let subtotal = 0;
    
    // Loop through cart to get subtotal
    cart.forEach(item => {
        subtotal += (item.price * item.quantity);
    });

    const discountAmount = subtotal * discountRate;
    const finalTotal = subtotal - discountAmount;

    // Update HTML
    document.getElementById('subtotal-display').innerText = "$" + subtotal.toFixed(2);
    document.getElementById('total-display').innerText = "$" + finalTotal.toFixed(2);
}

// Dark Mode Toggle
function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    
    // Save preference
    if(document.body.classList.contains('dark-mode')) {
        localStorage.setItem('theme', 'dark');
    } else {
        localStorage.setItem('theme', 'light');
    }
}

// 4. Initialization & Event Listeners

// Run on page load
updateCartCount();

// Check for saved theme
if(localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark-mode');
}

// Listen for theme button click
if(themeBtn) {
    themeBtn.addEventListener('click', toggleTheme);
}

// Specific logic for Index Page (Search/Filter)
if (productContainer) {
    displayProducts(products); // Show all initially

    const searchBar = document.getElementById('search-bar');
    const catSelect = document.getElementById('category-select');

    // Filter function
    function filterItems() {
        const searchText = searchBar.value.toLowerCase();
        const category = catSelect.value;

        const filtered = products.filter(product => {
            const matchesSearch = product.name.toLowerCase().includes(searchText);
            const matchesCategory = category === 'all' || product.category === category;
            return matchesSearch && matchesCategory;
        });

        displayProducts(filtered);
    }

    searchBar.addEventListener('input', filterItems);
    catSelect.addEventListener('change', filterItems);
}

// Specific logic for Cart Page (Discount)
if (cartListContainer) {
    displayCart();

    const applyBtn = document.getElementById('apply-btn');
    applyBtn.addEventListener('click', () => {
        const codeInput = document.getElementById('promo-code').value;
        
        if(codeInput === "SAVE10") {
            discountRate = 0.10; // 10%
            alert("Success! 10% discount applied.");
            calculateTotal();
        } else {
            alert("Invalid code.");
        }
    });

    document.getElementById('checkout-btn').addEventListener('click', () => {
        alert("Proceeding to checkout...");
    });
}