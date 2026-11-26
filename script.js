
// =============================================
// MEHRAJ STORE
// Toggle Wars 2026
// E-commerce Application
// =============================================

"use strict";

// =============================================
// PRODUCT DATABASE
// =============================================

const products = [
    {
        id: 1,
        name: "Premium Cotton T-Shirt",
        category: "fashion",
        price: 799,
        oldPrice: 1299,
        rating: 4.8,
        badge: "BESTSELLER",
        image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&auto=format&fit=crop",
        description: "Premium cotton T-shirt designed for everyday comfort and modern style."
    },
    {
        id: 2,
        name: "Urban Sneakers",
        category: "footwear",
        price: 2499,
        oldPrice: 3999,
        rating: 4.9,
        badge: "TRENDING",
        image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop",
        description: "Stylish lightweight sneakers with exceptional comfort."
    },
    {
        id: 3,
        name: "Wireless Headphones",
        category: "electronics",
        price: 1999,
        oldPrice: 3499,
        rating: 4.7,
        badge: "HOT DEAL",
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop",
        description: "Enjoy immersive sound with modern wireless headphones."
    },
    {
        id: 4,
        name: "Luxury Wrist Watch",
        category: "accessories",
        price: 2999,
        oldPrice: 4999,
        rating: 4.9,
        badge: "PREMIUM",
        image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop",
        description: "Elegant wristwatch with a timeless premium design."
    },
    {
        id: 5,
        name: "Classic Denim Jacket",
        category: "fashion",
        price: 1899,
        oldPrice: 2799,
        rating: 4.6,
        badge: "NEW",
        image: "https://images.unsplash.com/photo-1543076447-215ad9ba6923?w=600&auto=format&fit=crop",
        description: "A classic denim jacket for a confident everyday look."
    },
    {
        id: 6,
        name: "Premium Sunglasses",
        category: "accessories",
        price: 999,
        oldPrice: 1599,
        rating: 4.8,
        badge: "POPULAR",
        image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600&auto=format&fit=crop",
        description: "Modern sunglasses designed to complement your personal style."
    },
    {
        id: 7,
        name: "Smart Watch",
        category: "electronics",
        price: 3499,
        oldPrice: 5999,
        rating: 4.7,
        badge: "SMART PICK",
        image: "https://images.unsplash.com/photo-1544117519-31a4b719223d?w=600&auto=format&fit=crop",
        description: "A modern smartwatch for your connected lifestyle."
    },
    {
        id: 8,
        name: "Running Shoes",
        category: "footwear",
        price: 2199,
        oldPrice: 3299,
        rating: 4.8,
        badge: "SALE",
        image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&auto=format&fit=crop",
        description: "Comfortable footwear designed for an active lifestyle."
    }
];

// =============================================
// DOM ELEMENTS
// =============================================

const $ = (id) => document.getElementById(id);

const productGrid = $("productGrid");
const recommendationGrid = $("recommendationGrid");

const cartDrawer = $("cartDrawer");
const wishlistDrawer = $("wishlistDrawer");

const cartItems = $("cartItems");
const wishlistItems = $("wishlistItems");

const overlay = $("overlay");
const toast = $("toast");

// =============================================
// LOCAL STORAGE
// =============================================

function readStorage(key, fallback) {
    try {
        return JSON.parse(localStorage.getItem(key)) ?? fallback;
    } catch {
        return fallback;
    }
}

function saveStorage(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.warn("Storage unavailable", error);
    }
}

let cart = readStorage("mehraj_cart", []);
let wishlist = readStorage("mehraj_wishlist", []);

if (!Array.isArray(cart)) cart = [];
if (!Array.isArray(wishlist)) wishlist = [];

cart = cart.filter(item =>
    products.some(product => product.id === item.id) &&
    Number.isInteger(item.quantity) &&
    item.quantity > 0
);

wishlist = wishlist.filter(id =>
    products.some(product => product.id === id)
);

let activeCategory = "all";
let searchQuery = "";
let toastTimer;

// =============================================
// CURRENCY FORMATTER
// =============================================

function formatPrice(price) {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0
    }).format(price);
}

// =============================================
// VISITOR ID
// =============================================

let visitorId = readStorage("mehraj_visitor_id", null);

if (!visitorId) {
    visitorId = globalThis.crypto?.randomUUID?.()
        || "visitor_" + Date.now() + "_" +
        Math.random().toString(36).slice(2);

    saveStorage("mehraj_visitor_id", visitorId);
}

// =============================================
// EVENT TRACKING PREPARATION
// =============================================

function trackEvent(eventName, properties = {}) {

    const event = {
        event: eventName,
        visitor_id: visitorId,
        timestamp: new Date().toISOString(),
        layout: document.body.classList.contains(
            "premium-layout"
        ) ? "premium" : "control",
        properties
    };

    const events = readStorage("mehraj_events", []);

    events.push(event);

    saveStorage(
        "mehraj_events",
        events.slice(-500)
    );

    console.log("MEHRAJ Analytics:", event);

    window.dispatchEvent(
        new CustomEvent("mehraj:analytics", {
            detail: event
        })
    );

}

// =============================================
// PRODUCT CARD
// =============================================

function createProductCard(product) {

    const isWishlisted = wishlist.includes(product.id);

    return `
        <article class="product-card">

            <div class="product-image">

                <img
                    src="${product.image}"
                    alt="${product.name}"
                    loading="lazy"
                >

                <span class="product-badge">
                    ${product.badge}
                </span>

                <button
                    class="wishlist-icon ${isWishlisted ? "active" : ""}"
                    data-action="wishlist"
                    data-id="${product.id}"
                    aria-label="Toggle wishlist"
                    aria-pressed="${isWishlisted}"
                >
                    <i class="${isWishlisted ? "fa-solid" : "fa-regular"} fa-heart"></i>
                </button>

            </div>

            <div class="product-info">

                <span class="product-category">
                    ${product.category}
                </span>

                <h3>${product.name}</h3>

                <div class="product-rating">
                    ★★★★★ ${product.rating}
                </div>

                <div class="product-price">

                    <span>
                        ${formatPrice(product.price)}
                    </span>

                    <span class="old-price">
                        ${formatPrice(product.oldPrice)}
                    </span>

                </div>

                <div class="product-actions">

                    <button
                        class="view-product"
                        data-action="view"
                        data-id="${product.id}"
                    >
                        View Details
                    </button>

                    <button
                        class="add-to-cart"
                        data-action="cart"
                        data-id="${product.id}"
                    >
                        <i class="fa-solid fa-bag-shopping"></i>
                        Add
                    </button>

                </div>

            </div>

        </article>
    `;
}

// =============================================
// RENDER PRODUCTS
// =============================================

function renderProducts() {

    const filteredProducts = products.filter(product => {

        const categoryMatch =
            activeCategory === "all" ||
            product.category === activeCategory;

        const searchMatch =
            product.name.toLowerCase().includes(searchQuery) ||
            product.category.toLowerCase().includes(searchQuery);

        return categoryMatch && searchMatch;

    });

    if (!filteredProducts.length) {

        productGrid.innerHTML = `
            <div class="empty-state">
                <h3>No products found</h3>
                <p>Try another search or category.</p>
            </div>
        `;

        return;
    }

    productGrid.innerHTML =
        filteredProducts.map(createProductCard).join("");

}

// =============================================
// SMART RECOMMENDATIONS
// =============================================

function renderRecommendations() {

    const recentCategory = readStorage(
        "mehraj_recent_category",
        null
    );

    const recommended = [...products]
        .sort((a, b) => {

            const aMatch =
                a.category === recentCategory ? 1 : 0;

            const bMatch =
                b.category === recentCategory ? 1 : 0;

            return bMatch - aMatch || b.rating - a.rating;

        })
        .slice(0, 4);

    recommendationGrid.innerHTML =
        recommended.map(createProductCard).join("");

}

// =============================================
// TOAST NOTIFICATION
// =============================================

function showToast(message) {

    toast.textContent = message;
    toast.classList.add("show");

    clearTimeout(toastTimer);

    toastTimer = setTimeout(() => {
        toast.classList.remove("show");
    }, 2800);

}

// =============================================
// SHOPPING CART
// =============================================

function addToCart(id) {

    const product = products.find(item => item.id === id);

    if (!product) return;

    const existingItem = cart.find(item => item.id === id);

    if (existingItem) {

        existingItem.quantity += 1;

    } else {

        cart.push({
            id: id,
            quantity: 1
        });

    }

    saveStorage("mehraj_cart", cart);

    updateCart();

    showToast(product.name + " added to cart");

    trackEvent("add_to_cart", {
        product_id: id,
        product_name: product.name,
        price: product.price
    });

}

// =============================================
// UPDATE CART
// =============================================

function updateCart() {

    const totalQuantity = cart.reduce(
        (total, item) => total + item.quantity,
        0
    );

    $("cartCount").textContent = totalQuantity;

    let totalPrice = 0;

    if (!cart.length) {

        cartItems.innerHTML = `
            <div class="empty-state">
                <i class="fa-solid fa-bag-shopping"></i>
                <h3>Your cart is empty</h3>
                <p>Start exploring our collection.</p>
            </div>
        `;

        $("cartTotal").textContent = formatPrice(0);

        return;
    }

    cartItems.innerHTML = cart.map(item => {

        const product = products.find(
            product => product.id === item.id
        );

        totalPrice += product.price * item.quantity;

        return `
            <div class="cart-item">

                <img
                    src="${product.image}"
                    alt="${product.name}"
                >

                <div class="cart-item-info">

                    <h3>${product.name}</h3>

                    <p>
                        ${formatPrice(product.price * item.quantity)}
                    </p>

                    <div class="quantity-controls">

                        <button
                            data-action="decrease"
                            data-id="${product.id}"
                            aria-label="Decrease quantity"
                        >
                            −
                        </button>

                        <span>${item.quantity}</span>

                        <button
                            data-action="increase"
                            data-id="${product.id}"
                            aria-label="Increase quantity"
                        >
                            +
                        </button>

                    </div>

                </div>

                <button
                    class="remove-item"
                    data-action="remove-cart"
                    data-id="${product.id}"
                    aria-label="Remove product"
                >
                    <i class="fa-solid fa-trash"></i>
                </button>

            </div>
        `;

    }).join("");

    $("cartTotal").textContent = formatPrice(totalPrice);

}

// =============================================
// CART QUANTITY
// =============================================

function changeQuantity(id, amount) {

    const item = cart.find(product => product.id === id);

    if (!item) return;

    item.quantity += amount;

    if (item.quantity <= 0) {

        cart = cart.filter(product => product.id !== id);

    }

    saveStorage("mehraj_cart", cart);

    updateCart();

}

function removeFromCart(id) {

    cart = cart.filter(item => item.id !== id);

    saveStorage("mehraj_cart", cart);

    updateCart();

    showToast("Product removed from cart");

}

// =============================================
// WISHLIST
// =============================================

function toggleWishlist(id) {

    const product = products.find(item => item.id === id);

    if (!product) return;

    if (wishlist.includes(id)) {

        wishlist = wishlist.filter(item => item !== id);

        showToast("Removed from wishlist");

    } else {

        wishlist.push(id);

        showToast("Added to wishlist");

        trackEvent("add_to_wishlist", {
            product_id: id
        });

    }

    saveStorage("mehraj_wishlist", wishlist);

    updateWishlist();

    renderProducts();

    renderRecommendations();

}

function updateWishlist() {

    $("wishlistCount").textContent = wishlist.length;

    if (!wishlist.length) {

        wishlistItems.innerHTML = `
            <div class="empty-state">
                <i class="fa-regular fa-heart"></i>
                <h3>Your wishlist is empty</h3>
                <p>Save your favourite products here.</p>
            </div>
        `;

        return;
    }

    wishlistItems.innerHTML = wishlist.map(id => {

        const product = products.find(item => item.id === id);

        return `
            <div class="wishlist-item">

                <img
                    src="${product.image}"
                    alt="${product.name}"
                >

                <div class="cart-item-info">

                    <h3>${product.name}</h3>

                    <p>${formatPrice(product.price)}</p>

                    <button
                        class="add-to-cart"
                        data-action="cart"
                        data-id="${id}"
                    >
                        Add to Cart
                    </button>

                </div>

                <button
                    class="remove-item"
                    data-action="wishlist"
                    data-id="${id}"
                    aria-label="Remove from wishlist"
                >
                    <i class="fa-solid fa-trash"></i>
                </button>

            </div>
        `;

    }).join("");

}

// =============================================
// PRODUCT DETAILS
// =============================================

function viewProduct(id) {

    const product = products.find(item => item.id === id);

    if (!product) return;

    $("productDetails").innerHTML = `
        <div class="product-detail-grid">

            <img
                src="${product.image}"
                alt="${product.name}"
            >

            <div>

                <span class="product-category">
                    ${product.category}
                </span>

                <h2>${product.name}</h2>

                <div class="product-rating">
                    ★★★★★ ${product.rating}
                </div>

                <p>${product.description}</p>

                <div class="product-price">

                    <strong>
                        ${formatPrice(product.price)}
                    </strong>

                    <span class="old-price">
                        ${formatPrice(product.oldPrice)}
                    </span>

                </div>

                <div class="product-actions">

                    <button
                        class="primary-btn"
                        data-action="cart"
                        data-id="${product.id}"
                    >
                        Add to Cart
                    </button>

                    <button
                        class="secondary-btn"
                        data-action="wishlist"
                        data-id="${product.id}"
                    >
                        Wishlist
                    </button>

                </div>

            </div>

        </div>
    `;

    $("productModal").hidden = false;

    saveStorage(
        "mehraj_recent_category",
        product.category
    );

    renderRecommendations();

    // Primary A/B testing metric
    trackEvent("product_explored", {
        product_id: product.id,
        product_name: product.name,
        category: product.category
    });

}

function closeProductModal() {

    $("productModal").hidden = true;

}

// =============================================
// CATEGORY FILTERS
// =============================================

function filterProducts(category) {

    activeCategory = category;

    document.querySelectorAll(".filter-btn")
        .forEach(button => {

            button.classList.toggle(
                "active",
                button.dataset.filter === category
            );

        });

    renderProducts();

    trackEvent("category_selected", {
        category
    });

}

document.querySelectorAll(".filter-btn")
    .forEach(button => {

        button.addEventListener("click", () => {

            filterProducts(button.dataset.filter);

        });

    });

document.querySelectorAll(".category-card")
    .forEach(button => {

        button.addEventListener("click", () => {

            filterProducts(button.dataset.category);

            $("products").scrollIntoView({
                behavior: "smooth"
            });

        });

    });

// =============================================
// LIVE SEARCH
// =============================================

$("searchBtn").addEventListener("click", () => {

    $("searchPanel").classList.toggle("active");

    $("searchInput").focus();

});

$("closeSearch").addEventListener("click", () => {

    $("searchPanel").classList.remove("active");

    $("searchInput").value = "";

    searchQuery = "";

    renderProducts();

});

$("searchInput").addEventListener("input", event => {

    searchQuery = event.target.value.toLowerCase().trim();

    renderProducts();

});

// =============================================
// DRAWERS
// =============================================

function openDrawer(drawer) {

    closeDrawers();

    drawer.classList.add("active");

    overlay.classList.add("active");

    document.body.style.overflow = "hidden";

}

function closeDrawers() {

    cartDrawer.classList.remove("active");

    wishlistDrawer.classList.remove("active");

    overlay.classList.remove("active");

    document.body.style.overflow = "";

}

$("cartBtn").addEventListener("click", () => {

    openDrawer(cartDrawer);

});

$("wishlistBtn").addEventListener("click", () => {

    openDrawer(wishlistDrawer);

});

$("closeCart").addEventListener("click", closeDrawers);

$("closeWishlist").addEventListener("click", closeDrawers);

overlay.addEventListener("click", closeDrawers);

$("closeModal").addEventListener("click", closeProductModal);

$("productModal").addEventListener("click", event => {

    if (event.target === $("productModal")) {

        closeProductModal();

    }

});

// =============================================
// DYNAMIC BUTTON HANDLER
// =============================================

document.addEventListener("click", event => {

    const button = event.target.closest("[data-action]");

    if (!button) return;

    const id = Number(button.dataset.id);

    switch (button.dataset.action) {

        case "cart":
            addToCart(id);
            break;

        case "wishlist":
            toggleWishlist(id);
            break;

        case "view":
            viewProduct(id);
            break;

        case "increase":
            changeQuantity(id, 1);
            break;

        case "decrease":
            changeQuantity(id, -1);
            break;

        case "remove-cart":
            removeFromCart(id);
            break;

    }

});

// =============================================
// MOBILE NAVIGATION
// =============================================

$("menuBtn").addEventListener("click", () => {

    const menu = $("navLinks");

    menu.classList.toggle("active");

    $("menuBtn").setAttribute(
        "aria-expanded",
        menu.classList.contains("active")
    );

});

document.querySelectorAll(".nav-links a")
    .forEach(link => {

        link.addEventListener("click", () => {

            $("navLinks").classList.remove("active");

            $("menuBtn").setAttribute(
                "aria-expanded",
                "false"
            );

        });

    });

// =============================================
// HERO BUTTON
// =============================================

$("heroButton").addEventListener("click", () => {

    $("products").scrollIntoView({
        behavior: "smooth"
    });

    trackEvent("hero_cta_clicked");

});

// =============================================
// DEMO CHECKOUT
// =============================================

$("checkoutBtn").addEventListener("click", () => {

    if (!cart.length) {

        showToast("Your shopping cart is empty");

        return;
    }

    trackEvent("checkout_started", {
        cart_items: cart.reduce(
            (total, item) => total + item.quantity,
            0
        )
    });

    showToast(
        "Demo checkout — payment integration is not connected."
    );

});

// =============================================
// DEMO NEWSLETTER
// =============================================

$("newsletterForm").addEventListener("submit", event => {

    event.preventDefault();

    showToast(
        "Demo newsletter — no email has been submitted."
    );

    event.target.reset();

});

// =============================================
// KEYBOARD CONTROLS
// =============================================

document.addEventListener("keydown", event => {

    if (event.key === "Escape") {

        closeDrawers();

        closeProductModal();

        $("searchPanel").classList.remove("active");

        $("navLinks").classList.remove("active");

    }

});

// =============================================
// A/B TESTING LAYOUT CONTROLLER
// =============================================

function applyShoppingLayout(configuration = {}) {

    const layout =
        configuration.layout === "premium"
            ? "premium"
            : "control";

    document.body.classList.remove(
        "control-layout",
        "premium-layout"
    );

    document.body.classList.add(layout + "-layout");

    $("heroTitle").textContent =
        configuration.title ||
        (
            layout === "premium"
                ? "Discover the Premium Collection"
                : "Welcome to Mehraj Store"
        );

    $("heroButton").textContent =
        configuration.button_text ||
        (
            layout === "premium"
                ? "Explore Now"
                : "Shop Now"
        );

    $("experimentStatus").textContent =
        "Local Preview: " + layout.toUpperCase();

}

function setRecommendationsEnabled(enabled) {

    $("recommendations").hidden = !enabled;

    if (enabled) {

        renderRecommendations();

    }

}

// =============================================
// EXPOSE FUNCTIONS FOR FLAGSMITH INTEGRATION
// =============================================

window.MehrajStore = {
    visitorId,
    applyShoppingLayout,
    setRecommendationsEnabled,
    trackEvent
};

// =============================================
// APPLICATION INITIALIZATION
// =============================================

function initializeStore() {

    renderProducts();

    updateCart();

    updateWishlist();

    renderRecommendations();

    applyShoppingLayout({
        layout: "control"
    });

    console.log("MEHRAJ STORE initialized");

}

initializeStore();

// =============================================
// END OF MEHRAJ STORE APPLICATION
// =============================================
