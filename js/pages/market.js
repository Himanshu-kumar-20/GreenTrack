// js/pages/market.js
import { showToast, showModal, hideModal, flyPoints } from '../components.js';
import { formatCurrency, sleep } from '../utils.js';
import { firebaseDB, currentUser, addEcoPoints } from '../firebase.js';


let cart = [];

const products = [
    { id: '1', name: 'Organic Heirloom Tomatoes', category: 'Vegetables', price: 80, farmer: 'Green Earth Farm', rating: 4.8, img: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=500' },
    { id: '2', name: 'Raw Forest Honey', category: 'Pantry', price: 450, farmer: 'Bhive Organics', rating: 4.9, img: 'https://images.unsplash.com/photo-1587049352847-4d4b1f83bd60?w=500' },
    { id: '3', name: 'Fresh Spinach Bundle', category: 'Vegetables', price: 40, farmer: 'Urban Roots', rating: 4.5, img: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=500' },
    { id: '4', name: 'Free Range Eggs (Dozen)', category: 'Dairy', price: 120, farmer: 'Happy Hens', rating: 4.7, img: 'https://images.unsplash.com/photo-1506976785307-8732e854ad03?w=500' },
    { id: '5', name: 'Farm Fresh Apples', category: 'Fruits', price: 150, farmer: 'Orchard Valley', rating: 4.6, img: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6bcc6?w=500' },
    { id: '6', name: 'Organic Turmeric Powder', category: 'Spices', price: 200, farmer: 'Spice Route', rating: 4.9, img: 'https://images.unsplash.com/photo-1627308595229-7830f5c9c66e?w=500' },
    { id: '7', name: 'Homemade Desi Ghee', category: 'Dairy', price: 800, farmer: 'Nandi Farms', rating: 5.0, img: 'https://images.unsplash.com/photo-1627483262112-039e9a0a0916?w=500' },
    { id: '8', name: 'Bamboo Toothbrush (Pack of 4)', category: 'Eco', price: 160, farmer: 'Eco Basics', rating: 4.8, img: 'https://images.unsplash.com/photo-1600180769396-85dc02580a6d?w=500' }
];

export const initMarket = async (container) => {
    cart = []; // Reset cart on init

    container.innerHTML = `
        <div class="page-entry">
            <header style="margin-bottom: var(--space-xl); display: flex; justify-content: space-between; align-items: flex-end;">
                <div class="staggered-fade">
                    <h1 class="text-neon glow-pulse">Farmer's Market</h1>
                    <p class="text-muted">Buy fresh, local, and organic produce directly from farmers.</p>
                </div>
                <div style="display: flex; gap: var(--space-md);" class="staggered-fade">
                    <button class="btn btn-outline hover-lift tap-scale" id="cart-toggle-btn">
                        <span class="material-symbols-outlined">shopping_cart</span> Cart (<span id="cart-count">0</span>)
                    </button>
                </div>
            </header>

            <div class="filter-bar staggered-fade">
                <input type="text" class="input-field hover-lift" placeholder="Search products..." style="flex:1; max-width: 300px; margin:0;">
                <select class="input-field hover-lift" style="width:auto; margin:0;">
                    <option value="all">All Categories</option>
                    <option value="veg">Vegetables</option>
                    <option value="fruits">Fruits</option>
                    <option value="dairy">Dairy</option>
                </select>
            </div>

            <div class="product-grid" id="market-grid">
                <!-- Render products here -->
            </div>
        </div>

        <!-- Cart Sidebar Overlay -->
        <div class="cart-sidebar-overlay glass-fade" id="cart-sidebar">
            <div style="display: flex; justify-content: space-between; margin-bottom: var(--space-lg); align-items: center;">
                <h2 class="text-neon glow-pulse">Your Cart</h2>
                <button class="btn btn-ghost tap-scale" id="close-cart"><span class="material-symbols-outlined">close</span></button>
            </div>
            <div id="cart-items" style="flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: var(--space-md); margin-bottom: var(--space-md);">
                <p class="text-muted">Your cart is empty.</p>
            </div>
            <div class="cart-footer" style="border-top: 1px solid rgba(255,255,255,0.1); padding-top: var(--space-md);">
                <div style="display: flex; justify-content: space-between; margin-bottom: var(--space-md);">
                    <span style="font-size: 1.2rem;">Total:</span>
                    <span class="text-neon" id="cart-total" style="font-size: 1.5rem; font-weight: 700;">₹0.00</span>
                </div>
                <button class="btn btn-primary hover-lift tap-scale" id="checkout-btn" style="width: 100%;" disabled>Proceed to Checkout</button>
            </div>
        </div>
    `;

    const grid = document.getElementById('market-grid');
    
    products.forEach((p, index) => {
        const card = document.createElement('div');
        // Add staggering animation classes
        card.className = `glass-card hover-lift tap-scale staggered-fade`;
        card.style.animationDelay = `${(index * 0.05) + 0.3}s`;
        card.style.display = 'flex';
        card.style.flexDirection = 'column';
        card.innerHTML = `
            <img src="${p.img}" class="product-image" loading="lazy">
            <span class="badge badge-green" style="position:absolute; top:var(--space-md); right:var(--space-md); backdrop-filter:blur(10px); background: rgba(0,255,135,0.2);">${p.category}</span>
            <h3 style="margin-bottom: var(--space-xs); flex: 1;">${p.name}</h3>
            <p class="text-muted" style="font-size: 0.9rem; margin-bottom: var(--space-sm);">By ${p.farmer} 
                <span class="material-symbols-outlined" style="font-size:1rem; color:var(--warning); vertical-align:middle;">star</span> ${p.rating}
            </p>
            <div class="product-meta">
                <span class="product-price">${formatCurrency(p.price)}<span style="font-size:0.9rem;color:var(--text-muted);font-weight:400;">/unit</span></span>
                <button class="btn btn-primary buy-btn hover-lift tap-scale" style="padding: var(--space-sm) var(--space-md);" data-id="${p.id}">Add <span class="material-symbols-outlined glow-pulse" style="font-size: 1.2rem; margin-left:4px;">shopping_cart</span></button>
            </div>
        `;
        grid.appendChild(card);
    });

    // Add To Cart Logic
    document.querySelectorAll('.buy-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const btnEl = e.currentTarget;
            const id = btnEl.dataset.id;
            const product = products.find(p => p.id === id);
            
            const existing = cart.find(c => c.id === id);
            if (existing) {
                existing.qty += 1;
            } else {
                cart.push({ ...product, qty: 1 });
            }
            showToast(`${product.name} added to cart!`, 'success');
            updateCartUI();
        });
    });

    // Sidebar Toggles
    const sidebar = document.getElementById('cart-sidebar');
    document.getElementById('cart-toggle-btn').addEventListener('click', () => {
        sidebar.classList.add('open');
    });
    document.getElementById('close-cart').addEventListener('click', () => {
        sidebar.classList.remove('open');
    });

    const updateCartUI = () => {
        const cartItemsContainer = document.getElementById('cart-items');
        document.getElementById('cart-count').innerText = cart.reduce((acc, c) => acc + c.qty, 0);
        
        const total = cart.reduce((acc, c) => acc + (c.price * c.qty), 0);
        document.getElementById('cart-total').innerText = formatCurrency(total);
        
        document.getElementById('checkout-btn').disabled = cart.length === 0;

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p class="text-muted">Your cart is empty.</p>';
            return;
        }

        cartItemsContainer.innerHTML = cart.map(c => `
            <div style="display: flex; gap: var(--space-md); align-items: center; background: rgba(255,255,255,0.05); padding: var(--space-sm); border-radius: var(--radius-md);">
                <img src="${c.img}" style="width: 50px; height: 50px; border-radius: var(--radius-sm); object-fit: cover;">
                <div style="flex: 1;">
                    <p style="font-size: 0.9rem; font-weight: 500; margin:0;">${c.name}</p>
                    <p class="text-neon" style="font-size: 0.9rem; margin:0;">${formatCurrency(c.price)} x ${c.qty}</p>
                </div>
            </div>
        `).join('');
    };

    // Checkout Logic
    document.getElementById('checkout-btn').addEventListener('click', () => {
        sidebar.classList.remove('open');
        const total = cart.reduce((acc, c) => acc + (c.price * c.qty), 0);
        
        const invoiceHTML = cart.map(c => `
            <div style="display:flex; justify-content:space-between; font-size: 0.9rem; margin-bottom: 4px;">
                <span>${c.name} (x${c.qty})</span>
                <span class="text-muted">${formatCurrency(c.price * c.qty)}</span>
            </div>
        `).join('');

        showModal('Confirm Checkout', `
            <div style="text-align:left; margin-bottom: var(--space-md);">
                <div style="background: rgba(0,0,0,0.3); padding: var(--space-md); border-radius: var(--radius-md); border: 1px solid rgba(255,255,255,0.1);">
                    <p class="text-muted" style="margin-bottom: var(--space-sm); font-size: 0.8rem; text-transform: uppercase;">Order Summary</p>
                    ${invoiceHTML}
                    <hr style="border:0; border-top:1px dashed rgba(255,255,255,0.2); margin: var(--space-sm) 0;">
                    <div style="display:flex; justify-content:space-between; font-weight: 700; font-size: 1.1rem;">
                        <span>Final Total</span>
                        <span class="text-neon">${formatCurrency(total)}</span>
                    </div>
                </div>
            </div>
        `, `
            <button class="btn btn-primary" id="confirm-buy" style="width:100%; font-size: 1.1rem; box-shadow: 0 4px 15px rgba(0,255,135,0.3);">Secure Payment (Demo Mode)</button>
        `);

        document.getElementById('confirm-buy').addEventListener('click', async (ev) => {
            const btnBuy = document.getElementById('confirm-buy');
            const originalText = btnBuy.innerHTML;
            btnBuy.innerHTML = '<span class="material-symbols-outlined spin" style="animation: spin 1s linear infinite;">sync</span> Processing...';
            btnBuy.disabled = true;

            try {
                // Realistic payment simulation
                await sleep(1500);
                
                // Save Order to Firestore
                if (currentUser) {
                    await firebaseDB.addDocument('market_orders', {
                        userId: currentUser.uid,
                        items: cart.map(i => ({ id: i.id, name: i.name, price: i.price, qty: i.qty })),
                        total,
                        status: 'paid',
                        gateway: 'mock-razorpay',
                        timestamp: new Date().toISOString()
                    });
                }
                
                hideModal();
                showToast('Payment successful! Your fresh produce is on its way.', 'success');
                
                const xp = 50 * cart.length;
                addEcoPoints(xp);
                flyPoints(xp, ev.clientX, ev.clientY); 

                cart = []; // Empty cart

                updateCartUI();
            } catch (err) {
                btnBuy.innerHTML = originalText;
                btnBuy.disabled = false;
                showToast("Payment failed: " + err.message, "error");
            }
        });
    });
};
