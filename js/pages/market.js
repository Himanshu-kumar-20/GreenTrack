// js/pages/market.js
import { showToast, showModal, hideModal, flyPoints } from '../components.js';
import { formatCurrency, sleep } from '../utils.js';
import { firebaseDB, currentUser, addEcoPoints } from '../firebase.js';
import CONFIG from '../config.js';
let cart = [];

const products = [
    { id: '1', name: 'Bamboo Toothbrush (Pack of 4)', category: 'Eco', price: 160, farmer: 'Eco Basics', rating: 4.8, img: 'https://images.unsplash.com/photo-1570913149827-d2ac84ab3f9a?w=400&h=300&fit=crop' },
    { id: '2', name: 'Organic Cotton T-Shirt', category: 'Clothing', price: 850, farmer: 'Earth Threads', rating: 4.9, img: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=300&fit=crop' },
    { id: '3', name: 'Solar Power Bank 10000mAh', category: 'Gadgets', price: 1450, farmer: 'SunTech', rating: 4.5, img: 'https://images.unsplash.com/photo-1585338107529-13afc5f02586?w=400&h=300&fit=crop' },
    { id: '4', name: 'Reusable Coffee Cup', category: 'Eco', price: 350, farmer: 'Zero Waste Shop', rating: 4.7, img: 'https://images.unsplash.com/photo-1544415843-85bbfe9c9162?w=400&h=300&fit=crop' },
    { id: '5', name: 'Upcycled Denim Wallet', category: 'Accessories', price: 420, farmer: 'ReWear', rating: 4.6, img: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=400&h=300&fit=crop' },
    { id: '6', name: 'Hemp Tote Bag', category: 'Clothing', price: 200, farmer: 'Nandi Farms', rating: 4.9, img: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=400&h=300&fit=crop' },
    { id: '7', name: 'Smart Water Bottle (Tracks Hydration)', category: 'Gadgets', price: 1800, farmer: 'HydroSmart', rating: 5.0, img: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400&h=300&fit=crop' },
    { id: '8', name: 'Bamboo Sunglasses', category: 'Accessories', price: 890, farmer: 'EcoVibe', rating: 4.8, img: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=400&h=300&fit=crop' },
    { id: '9', name: 'Beeswax Food Wraps (Set of 3)', category: 'Eco', price: 380, farmer: 'Bhive Organics', rating: 4.7, img: 'https://images.unsplash.com/photo-1616401037704-5f1118150f14?w=400&h=300&fit=crop' },
    { id: '10', name: 'Recycled Polyester Jacket', category: 'Clothing', price: 3400, farmer: 'Green Gear', rating: 4.8, img: 'https://images.unsplash.com/photo-1559551409-dadc959f76b8?w=400&h=300&fit=crop' },
    { id: '11', name: 'LED Solar Lantern', category: 'Gadgets', price: 650, farmer: 'SunTech', rating: 4.9, img: 'https://images.unsplash.com/photo-1515238210350-a7342880c54e?w=400&h=300&fit=crop' },
    { id: '12', name: 'Cork Yoga Mat', category: 'Eco', price: 1250, farmer: 'ZenEarth', rating: 4.6, img: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400&h=300&fit=crop' },
    { id: '13', name: 'Wooden Watch', category: 'Accessories', price: 2100, farmer: 'ForestTime', rating: 4.5, img: 'https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=400&h=300&fit=crop' },
    { id: '14', name: 'Organic Linen Shirt', category: 'Clothing', price: 1100, farmer: 'Earth Threads', rating: 4.4, img: 'https://images.unsplash.com/photo-1596755094514-f87e32f05c45?w=400&h=300&fit=crop' },
    { id: '15', name: 'Bamboo Cutlery Set', category: 'Eco', price: 250, farmer: 'Eco Basics', rating: 4.7, img: 'https://images.unsplash.com/photo-1584346133934-a3afd2a33c4c?w=400&h=300&fit=crop' },
    { id: '16', name: 'Windup Emergency Radio (No Battery)', category: 'Gadgets', price: 1400, farmer: 'SurvivalEco', rating: 4.8, img: 'https://images.unsplash.com/photo-1590740907297-f5da1752b123?w=400&h=300&fit=crop' },
];

// Per-card qty state
const cardQtys = {};
products.forEach(p => cardQtys[p.id] = 1);

export const initMarket = async (container) => {
    cart = []; // Reset cart on init

    const allCategories = [...new Set(products.map(p => p.category))];

    container.innerHTML = `
        <div>
            <header style="margin-bottom: var(--space-xl); display: flex; justify-content: space-between; align-items: flex-end;">
                <div>
                    <h1 class="text-neon">Eco Store</h1>
                    <p class="text-muted">Buy sustainable gear, clothing, gadgets and eco-friendly accessories.</p>
                </div>
                <div style="display: flex; gap: var(--space-md);">
                    <button class="btn btn-outline" id="cart-toggle-btn">
                        <span class="material-symbols-outlined">shopping_cart</span> Cart (<span id="cart-count">0</span>)
                    </button>
                </div>
            </header>

            <div class="filter-bar">
                <input type="text" class="input-field" placeholder="Search products..." id="market-search" style="flex:1; max-width: 300px; margin:0;">
                <select class="input-field" id="market-category" style="width:auto; margin:0;">
                    <option value="all">All Categories</option>
                    ${allCategories.map(c => `<option value="${c}">${c}</option>`).join('')}
                </select>
            </div>

            <div class="product-grid" id="market-grid">
                <!-- Products rendered by JS -->
            </div>
        </div>

        <!-- Cart Sidebar Overlay -->
        <div class="cart-sidebar-overlay" id="cart-sidebar">
            <div style="display: flex; justify-content: space-between; margin-bottom: var(--space-lg); align-items: center;">
                <h2 class="text-neon">Your Cart</h2>
                <button class="btn btn-ghost" id="close-cart"><span class="material-symbols-outlined">close</span></button>
            </div>
            <div id="cart-items" style="flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: var(--space-md); margin-bottom: var(--space-md);">
                <p class="text-muted">Your cart is empty.</p>
            </div>
            <div class="cart-footer" style="border-top: 1px solid rgba(255,255,255,0.1); padding-top: var(--space-md);">
                <div style="display: flex; justify-content: space-between; margin-bottom: var(--space-md);">
                    <span style="font-size: 1.2rem;">Total:</span>
                    <span class="text-neon" id="cart-total" style="font-size: 1.5rem; font-weight: 700;">₹0.00</span>
                </div>
                <button class="btn btn-primary" id="checkout-btn" style="width: 100%;" disabled>Proceed to Checkout</button>
            </div>
        </div>
    `;

    const grid = document.getElementById('market-grid');

    const renderProducts = (list) => {
        grid.innerHTML = '';
        list.forEach((p, index) => {
            const card = document.createElement('div');
            card.className = `glass-card`;
            card.style.display = 'flex';
            card.style.flexDirection = 'column';
            card.innerHTML = `
                <img src="${p.img}" class="product-image" loading="lazy" onerror="this.style.background='linear-gradient(135deg, rgba(0,255,135,0.1), rgba(127,255,0,0.05))'; this.style.display='flex'; this.alt='${p.name}';">
                <span class="badge badge-green" style="position:absolute; top:var(--space-md); right:var(--space-md); backdrop-filter:blur(10px); background: rgba(0,255,135,0.2);">${p.category}</span>
                <h3 style="margin-bottom: var(--space-xs); flex: 1; font-size: 0.95rem;">${p.name}</h3>
                <p class="text-muted" style="font-size: 0.85rem; margin-bottom: var(--space-sm);">By ${p.farmer}
                    <span class="material-symbols-outlined" style="font-size:0.9rem; color:var(--warning); vertical-align:middle;">star</span> ${p.rating}
                </p>
                <div class="product-meta">
                    <span class="product-price">${formatCurrency(p.price)}<span style="font-size:0.8rem;color:var(--text-muted);font-weight:400;">/unit</span></span>
                </div>
                <div style="display:flex; align-items:center; gap:var(--space-sm); margin-top:var(--space-sm);">
                    <div style="display:flex; align-items:center; gap:2px; background:rgba(255,255,255,0.04); border-radius:var(--radius-sm); border:var(--border-glass); overflow:hidden;">
                        <button class="qty-btn qty-minus" data-id="${p.id}" style="background:none; border:none; color:var(--text-muted); cursor:pointer; padding:0.3rem 0.5rem; font-size:1.1rem; transition:color 0.2s;">−</button>
                        <span class="qty-val" id="qty-${p.id}" style="min-width:24px; text-align:center; font-weight:600; font-size:0.9rem; color:var(--text-main);">${cardQtys[p.id]}</span>
                        <button class="qty-btn qty-plus" data-id="${p.id}" style="background:none; border:none; color:var(--primary); cursor:pointer; padding:0.3rem 0.5rem; font-size:1.1rem; transition:color 0.2s;">+</button>
                    </div>
                    <button class="btn btn-primary buy-btn" style="padding: var(--space-xs) var(--space-md); font-size:0.85rem; flex:1;" data-id="${p.id}">Add <span class="material-symbols-outlined" style="font-size: 1rem; margin-left:2px;">shopping_cart</span></button>
                </div>
            `;
            grid.appendChild(card);
        });
        wireUpCardButtons();
    };

    renderProducts(products);

    // Search & filter
    const searchEl = document.getElementById('market-search');
    const catEl = document.getElementById('market-category');
    const filterProducts = () => {
        const q = searchEl.value.toLowerCase();
        const cat = catEl.value;
        const filtered = products.filter(p => {
            const matchesSearch = p.name.toLowerCase().includes(q) || p.farmer.toLowerCase().includes(q);
            const matchesCat = cat === 'all' || p.category === cat;
            return matchesSearch && matchesCat;
        });
        renderProducts(filtered);
    };
    searchEl.addEventListener('input', filterProducts);
    catEl.addEventListener('change', filterProducts);

    function wireUpCardButtons() {
        // Qty buttons
        document.querySelectorAll('.qty-minus').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = btn.dataset.id;
                cardQtys[id] = Math.max(1, (cardQtys[id] || 1) - 1);
                document.getElementById(`qty-${id}`).textContent = cardQtys[id];
            });
        });
        document.querySelectorAll('.qty-plus').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = btn.dataset.id;
                cardQtys[id] = Math.min(99, (cardQtys[id] || 1) + 1);
                document.getElementById(`qty-${id}`).textContent = cardQtys[id];
            });
        });

        // Add To Cart Logic
        document.querySelectorAll('.buy-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const btnEl = e.currentTarget;
                const id = btnEl.dataset.id;
                const product = products.find(p => p.id === id);
                const qty = cardQtys[id] || 1;

                const existing = cart.find(c => c.id === id);
                if (existing) {
                    existing.qty += qty;
                } else {
                    cart.push({ ...product, qty });
                }
                showToast(`${qty}x ${product.name} added to cart!`, 'success');
                updateCartUI();
                // Reset card qty
                cardQtys[id] = 1;
                const el = document.getElementById(`qty-${id}`);
                if (el) el.textContent = '1';
            });
        });
    }

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
                <img src="${c.img}" style="width: 50px; height: 50px; border-radius: var(--radius-sm); object-fit: cover;" onerror="this.style.background='rgba(0,255,135,0.1)'">
                <div style="flex: 1;">
                    <p style="font-size: 0.9rem; font-weight: 500; margin:0;">${c.name}</p>
                    <p class="text-neon" style="font-size: 0.9rem; margin:0;">${formatCurrency(c.price)} × ${c.qty}</p>
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
                <span>${c.name} (×${c.qty})</span>
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
            btnBuy.innerHTML = '<span class="material-symbols-outlined spin" style="animation: spin 1s linear infinite;">sync</span> Processing...';
            btnBuy.disabled = true;

            try {
                if (!window.Razorpay) {
                    throw new Error("Razorpay SDK not loaded");
                }

                const options = {
                    key: CONFIG.RAZORPAY_KEY_ID || "rzp_test_dummy", // Enter the Key ID generated from the Dashboard
                    amount: total * 100, // Amount is in currency subunits. 50000 refers to 50000 paise
                    currency: "INR",
                    name: "GreenTrack Marketplace",
                    description: "GreenTrack Secure Checkout",
                    handler: async function (response) {
                        try {
                            if (currentUser) {
                                await firebaseDB.addDocument('market_orders', {
                                    userId: currentUser.uid,
                                    items: cart.map(i => ({ id: i.id, name: i.name, price: i.price, qty: i.qty })),
                                    total,
                                    status: 'paid',
                                    paymentId: response.razorpay_payment_id,
                                    timestamp: new Date().toISOString()
                                });
                            }
                            hideModal();
                            showToast('Payment successful! Your items are on their way.', 'success');
                            const xp = 50 * cart.length;
                            addEcoPoints(xp);
                            flyPoints(xp, window.innerWidth/2, window.innerHeight/2);
                            cart = [];
                            updateCartUI();
                        } catch(e) {
                            showToast("Error saving order: " + e.message, "error");
                        }
                    },
                    prefill: {
                        name: currentUser?.displayName || "Guest User",
                        email: currentUser?.email || "guest@greentrack.com",
                    },
                    theme: {
                        color: "#00FF87"
                    }
                };

                const rzp1 = new window.Razorpay(options);
                rzp1.on('payment.failed', function (response){
                    btnBuy.disabled = false;
                    btnBuy.innerText = 'Try Again';
                    showToast("Payment failed: " + response.error.description, "error");
                });
                rzp1.open();
                
            } catch (err) {
                btnBuy.innerText = 'Pay via Razorpay';
                btnBuy.disabled = false;
                showToast("Payment error: " + err.message, "error");
            }
        });
    });
};

