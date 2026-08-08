/* Shared UI components and page behaviour for the G.E.M.I. storefront. */
(function () {
  const page = document.body.dataset.page || "home";
  const currency = (value) => GEMI_CURRENCY.format(value);
  const icon = {
    user: '<svg aria-hidden="true" viewBox="0 0 24 24"><circle cx="12" cy="8" r="3.4"/><path d="M4.5 20c.7-3.6 3.2-5.5 7.5-5.5s6.8 1.9 7.5 5.5"/></svg>',
    cart: '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M3.5 5h2l1.5 10.5h10.8l1.8-7.4H6.2"/><circle cx="9" cy="19.1" r="1"/><circle cx="17" cy="19.1" r="1"/></svg>',
    menu: '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
    close: '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="m6 6 12 12M18 6 6 18"/></svg>'
  };
  const navItems = [
    ["home", "Home", "index.html"], ["shop", "Shop", "shop.html"],
    ["shop", "Collections", "shop.html#collections"], ["shop", "New arrivals", "shop.html?new=true"],
    ["about", "About", "about.html"], ["contact", "Contact", "contact.html"]
  ];

  function productArt(product, extraClass = "") {
    if (!product) return '';
    if (product.image) return `<div class="product-media ${extraClass}"><img src="${product.image}" alt="${product.name}" loading="lazy"></div>`;
    return `<div class="product-media product-media--coming ${extraClass}" aria-label="${product.name} visual placeholder"><span>${product.mediaMessage || 'Coming<br>soon'}</span><small>${product.mediaCaption || product.category}</small></div>`;
  }

  function productCard(product) {
    return `<article class="product-card">
      <a class="product-card__visual" href="product.html?id=${product.id}" aria-label="View ${product.name}">
        <span class="product-badge">${product.badge}</span>${productArt(product)}
      </a>
      <div class="product-card__meta">
        <h3>${product.name}</h3><p>${product.category}</p><span class="product-card__price">${product.price ? currency(product.price) : 'Coming soon'}</span>
      </div>
      <a class="product-card__link" href="product.html?id=${product.id}">View piece →</a>
    </article>`;
  }
  window.GemiUI = { productArt, productCard, currency };

  function renderShell() {
    const header = document.querySelector("#site-header");
    const footer = document.querySelector("#site-footer");
    if (header) header.innerHTML = `
      <div class="announcement">Nigeria delivery &amp; worldwide shipping available</div>
      <header class="site-header">
        <div class="header-inner">
          <nav class="main-nav" aria-label="Main navigation">${navItems.map(([id, label, href]) => `<a href="${href}" class="${page === id ? 'is-active' : ''}">${label}</a>`).join('')}</nav>
          <div class="header-actions">
            <a class="icon-button" href="login.html" aria-label="Your account">${icon.user}</a>
            <a class="icon-button" href="cart.html" aria-label="View bag">${icon.cart}<span class="cart-count" data-cart-count>0</span></a>
            <button class="icon-button menu-toggle" type="button" aria-label="Open menu" aria-expanded="false">${icon.menu}</button>
            <a class="brand brand--header" href="index.html" aria-label="GEMI WEARS home"><img class="brand-logo" src="${GEMI_BRAND.logo}" alt="GEMI WEARS logo"><span class="brand-name">${GEMI_BRAND.name}</span></a>
          </div>
        </div>
      </header>
      <nav class="mobile-menu" aria-label="Mobile navigation">${navItems.map(([id, label, href]) => `<a href="${href}" class="${page === id ? 'is-active' : ''}">${label}</a>`).join('')}<a href="login.html">My account</a></nav>`;
    if (footer) footer.innerHTML = `
      <footer class="site-footer">
        <div class="newsletter"><div class="newsletter-inner"><div><h3>Stay in the circle.</h3><p>Early access to releases, stories and private events.</p></div><form class="email-form" data-newsletter><input type="email" aria-label="Email address" placeholder="Your email address" required><button type="submit">Join us →</button></form></div></div>
        <div class="footer-top">
          <div class="footer-brand"><a class="brand" href="index.html"><img class="brand-logo" src="${GEMI_BRAND.logo}" alt="GEMI WEARS logo"><span class="brand-name">${GEMI_BRAND.name}</span></a><p>Premium Nigerian streetwear for the people moving forward together.</p></div>
          <div class="footer-column"><h3 class="footer-title">Explore</h3><ul class="footer-list"><li><a href="shop.html">Shop all</a></li><li><a href="shop.html?category=Shoes">Shoes</a></li><li><a href="shop.html?category=Hoodies">Hoodies</a></li><li><a href="about.html">Our story</a></li></ul></div>
          <div class="footer-column"><h3 class="footer-title">Help</h3><ul class="footer-list"><li><a href="contact.html">Contact us</a></li><li><a href="contact.html">Delivery & returns</a></li><li><a href="contact.html">Size guide</a></li><li><a href="contact.html">FAQs</a></li></ul></div>
          <div class="footer-column"><h3 class="footer-title">Follow</h3><ul class="footer-list"><li><a href="#" aria-label="Instagram">Instagram</a></li><li><a href="#" aria-label="TikTok">TikTok</a></li><li><a href="#" aria-label="WhatsApp">WhatsApp</a></li></ul></div>
        </div>
        <div class="footer-bottom"><span>© <span data-year></span> GEMI WEARS. All rights reserved.</span><div class="social-links"><a href="#">Privacy</a><a href="#">Terms</a></div></div>
      </footer>`;
  }

  function updateCartCount() {
    document.querySelectorAll("[data-cart-count]").forEach((el) => { el.textContent = GemiStore.count(); });
  }
  function showToast(message) {
    let toast = document.querySelector(".toast");
    if (!toast) { document.body.insertAdjacentHTML("beforeend", `<div class="toast" role="status"><span></span><button type="button" aria-label="Dismiss">×</button></div>`); toast = document.querySelector(".toast"); toast.querySelector("button").addEventListener("click", () => toast.classList.remove("is-visible")); }
    toast.querySelector("span").textContent = message;
    toast.classList.add("is-visible");
    clearTimeout(window.gemiToastTimer);
    window.gemiToastTimer = setTimeout(() => toast.classList.remove("is-visible"), 4000);
  }

  function initMenu() {
    const toggle = document.querySelector(".menu-toggle");
    const menu = document.querySelector(".mobile-menu");
    if (!toggle || !menu) return;
    toggle.addEventListener("click", () => {
      const open = menu.classList.toggle("is-open");
      document.body.classList.toggle("menu-open", open);
      toggle.setAttribute("aria-expanded", open);
      toggle.innerHTML = open ? icon.close : icon.menu;
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });
  }

  function initHome() {
    const grid = document.querySelector("[data-home-products]");
    if (grid) grid.innerHTML = GEMI_PRODUCTS.filter((product) => product.image && (product.isNew || product.id === "unity-01")).slice(0, 3).map(productCard).join("");
  }

  function initShop() {
    const grid = document.querySelector("[data-shop-grid]");
    const count = document.querySelector("[data-result-count]");
    const sort = document.querySelector("[data-sort]");
    const inputs = [...document.querySelectorAll("[data-category-filter]")];
    if (!grid) return;
    const query = new URLSearchParams(location.search);
    const queryCategory = query.get("category");
    if (queryCategory) inputs.forEach((input) => { input.checked = input.value === queryCategory; });
    function draw() {
      const selected = inputs.filter((input) => input.checked).map((input) => input.value);
      let products = GEMI_PRODUCTS.filter((product) => !selected.length || selected.includes(product.category));
      if (query.get("new") === "true") products = products.filter((product) => product.isNew);
      if (sort?.value === "price-low") products = [...products].sort((a, b) => a.price - b.price);
      if (sort?.value === "price-high") products = [...products].sort((a, b) => b.price - a.price);
      if (sort?.value === "name") products = [...products].sort((a, b) => a.name.localeCompare(b.name));
      grid.innerHTML = products.length ? products.map(productCard).join("") : `<div class="empty-state" style="grid-column:1/-1"><h2>No pieces found.</h2><p>Try another collection.</p><a class="button" href="shop.html">View all pieces</a></div>`;
      if (count) count.textContent = `${products.length} piece${products.length === 1 ? '' : 's'}`;
    }
    inputs.forEach((input) => input.addEventListener("change", draw));
    sort?.addEventListener("change", draw);
    draw();
  }

  function initProduct() {
    const root = document.querySelector("[data-product-root]");
    if (!root) return;
    const id = new URLSearchParams(location.search).get("id") || "unity-01";
    const product = GemiStore.getProduct(id) || GEMI_PRODUCTS[0];
    document.title = `GEMI WEARS | ${product.name}`;
    const gallery = product.images?.length ? product.images : [];
    const canPurchase = Boolean(product.price);
    root.innerHTML = `
      <div class="product-detail">
        <div class="product-gallery ${gallery.length ? 'has-thumbs' : 'no-thumbs'}"><div class="gallery-thumbs">${gallery.length ? gallery.map((image, index) => `<button class="gallery-thumb ${index === 0 ? 'is-active' : ''}" type="button" aria-label="View ${product.name} angle ${index + 1}" data-gallery-thumb data-gallery-image="${image}"><img src="${image}" alt="${product.name} angle ${index + 1}"></button>`).join('') : ''}</div><div class="product-main-visual" data-main-product-visual>${productArt(product)}</div></div>
        <section class="product-info"><p class="product-info__category">${product.category} / ${product.badge}</p><h1>${product.name}</h1><p class="product-info__price">${product.price ? currency(product.price) : 'Coming soon'}</p><p class="product-info__description">${product.description}</p><hr>
          <div><p class="option-label">Color <b data-selected-color>${product.colors[0]}</b></p><div class="swatches">${product.colors.map((color, i) => `<button class="swatch ${i === 0 ? 'is-active' : ''}" type="button" data-color="${color}">${color}</button>`).join('')}</div></div>
          <div style="margin-top:24px"><p class="option-label">Select size <b data-selected-size>Choose a size</b></p><div class="size-options">${product.sizes.map((size) => `<button class="size-option" type="button" data-size="${size}">${size}</button>`).join('')}</div></div>
          <div class="purchase-row">${canPurchase ? `<div class="quantity-control"><button type="button" data-quantity-minus aria-label="Decrease quantity">−</button><span data-quantity>1</span><button type="button" data-quantity-plus aria-label="Increase quantity">+</button></div><button class="button" type="button" data-add-to-bag>Add to bag</button>` : `<a class="button" href="contact.html">Ask about this release</a>`}</div>
          <div class="product-promise"><span>◇ Nigeria delivery &amp; worldwide shipping</span><span>◇ Easy size exchanges within 7 days</span><span>◇ Secure checkout</span></div>
        </section>
      </div>
      <section class="related"><p class="eyebrow">Continue the story</p><h2 class="section-heading">More from the <em>collection.</em></h2><div class="product-grid">${GEMI_PRODUCTS.filter((entry) => entry.id !== product.id && entry.image).slice(0,3).map(productCard).join('')}</div></section>`;
    let selectedColor = product.colors[0]; let selectedSize = ""; let quantity = 1;
    root.querySelectorAll("[data-color]").forEach((button) => button.addEventListener("click", () => { selectedColor = button.dataset.color; root.querySelectorAll("[data-color]").forEach((item) => item.classList.toggle("is-active", item === button)); root.querySelector("[data-selected-color]").textContent = selectedColor; }));
    root.querySelectorAll("[data-size]").forEach((button) => button.addEventListener("click", () => { selectedSize = button.dataset.size; root.querySelectorAll("[data-size]").forEach((item) => item.classList.toggle("is-active", item === button)); root.querySelector("[data-selected-size]").textContent = selectedSize; }));
    if (canPurchase) {
      root.querySelector("[data-quantity-minus]").addEventListener("click", () => { quantity = Math.max(1, quantity - 1); root.querySelector("[data-quantity]").textContent = quantity; });
      root.querySelector("[data-quantity-plus]").addEventListener("click", () => { quantity += 1; root.querySelector("[data-quantity]").textContent = quantity; });
      root.querySelector("[data-add-to-bag]").addEventListener("click", () => {
        if (!selectedSize) { showToast("Please select a size before adding this piece."); return; }
        GemiStore.add({ id: product.id, size: selectedSize, color: selectedColor, quantity });
        showToast(`${product.name} is in your bag.`);
      });
    }
    root.querySelectorAll("[data-gallery-thumb]").forEach((button, index) => button.addEventListener("click", () => {
      root.querySelectorAll("[data-gallery-thumb]").forEach((item) => item.classList.toggle("is-active", item === button));
      root.querySelector("[data-main-product-visual]").innerHTML = `<div class="product-media"><img src="${button.dataset.galleryImage}" alt="${product.name} angle ${index + 1}"></div>`;
    }));
  }

  function cartItem(item, index) {
    const product = GemiStore.getProduct(item.id); if (!product) return '';
    return `<article class="cart-item"><div class="cart-item__visual">${productArt(product)}</div><div><h2>${product.name}</h2><p>${item.color} / Size ${item.size}</p><div class="cart-item__controls"><div class="quantity-control"><button type="button" aria-label="Decrease ${product.name}" data-cart-minus="${index}">−</button><span>${item.quantity}</span><button type="button" aria-label="Increase ${product.name}" data-cart-plus="${index}">+</button></div><button class="remove-item" type="button" data-cart-remove="${index}">Remove</button></div></div><b class="cart-item__price">${currency(product.price * item.quantity)}</b></article>`;
  }
  function summaryHtml({ checkout = false, delivery = "nigeria" } = {}) {
    const total = GemiStore.total();
    const items = GemiStore.getCart();
    const deliveryLabel = delivery === "worldwide" ? "Worldwide · 5–10 days" : "Nigeria · 2–5 days";
    const deliveryNote = delivery === "worldwide" ? "Worldwide shipping is calculated from your destination country." : "Nigeria delivery is calculated from your location.";
    return `<aside class="order-summary ${checkout ? 'checkout-summary' : ''}"><h2>${checkout ? 'Order summary' : 'Bag summary'}</h2>${checkout ? `<div class="summary-products">${items.map((item) => { const p = GemiStore.getProduct(item.id); return `<div class="checkout-product"><div class="checkout-product__visual">${productArt(p)}</div><div><h3>${p.name}</h3><p>${item.color} · ${item.size} · ×${item.quantity}</p></div><b>${currency(p.price * item.quantity)}</b></div>`; }).join('')}</div>` : ''}<div class="summary-line"><span>Subtotal</span><span>${currency(total)}</span></div><div class="summary-line"><span>Delivery</span><span>${checkout ? deliveryLabel : 'Nigeria &amp; worldwide options'}</span></div><div class="summary-line summary-line--total"><span>Total before shipping</span><span>${currency(total)}</span></div>${checkout ? '' : `<a class="button button--full" href="checkout.html" style="margin-top:20px">Proceed to checkout</a>`}<p class="summary-note">${checkout ? deliveryNote : 'Choose Nigeria delivery or worldwide shipping at checkout. Shipping is calculated from your location.'}</p></aside>`;
  }
  function initCart() {
    const root = document.querySelector("[data-cart-root]"); if (!root) return;
    function draw() {
      const cart = GemiStore.getCart();
      root.innerHTML = cart.length ? `<div class="cart-layout"><section><div class="cart-list">${cart.map(cartItem).join('')}</div><a class="text-link" href="shop.html" style="margin-top:25px">Continue shopping</a></section>${summaryHtml()}</div>` : `<div class="empty-state"><h2>Your bag is waiting.</h2><p>Start with a piece that moves with you.</p><a class="button" href="shop.html">Explore the collection</a></div>`;
      root.querySelectorAll("[data-cart-minus]").forEach((button) => button.addEventListener("click", () => GemiStore.update(+button.dataset.cartMinus, GemiStore.getCart()[+button.dataset.cartMinus].quantity - 1)));
      root.querySelectorAll("[data-cart-plus]").forEach((button) => button.addEventListener("click", () => GemiStore.update(+button.dataset.cartPlus, GemiStore.getCart()[+button.dataset.cartPlus].quantity + 1)));
      root.querySelectorAll("[data-cart-remove]").forEach((button) => button.addEventListener("click", () => GemiStore.remove(+button.dataset.cartRemove)));
    }
    window.addEventListener("gemi:cart-updated", draw); draw();
  }

  function initCheckout() {
  const root = document.querySelector("[data-checkout-summary]");
  const form = document.querySelector("[data-checkout-form]");

  if (!root || !form) return;

  function draw() {
    root.innerHTML = GemiStore.getCart().length
      ? summaryHtml({ checkout: true })
      : `<div class="empty-state">
          <h2>Your bag is empty.</h2>
          <p>Add a piece before checkout.</p>
          <a class="button" href="shop.html">Shop now</a>
        </div>`;
  }

  window.addEventListener("gemi:cart-updated", draw);
  draw();

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!GemiStore.getCart().length) {
      showToast("Your bag is empty. Add a piece before checkout.");
      return;
    }

    if (!form.reportValidity()) return;

    // Make sure Paystack is loaded
    if (typeof PaystackPop === "undefined") {
      showToast("Paystack is not available. Please refresh the page.");
      return;
    }

    const formData = new FormData(form);
    const email = formData.get("email");

    if (!email) {
      showToast("Please enter your email address.");
      return;
    }

    // Get the total amount from the GEMI cart
    const total = GemiStore.total();

    if (!total || total <= 0) {
      showToast("Unable to calculate your order total.");
      return;
    }

    const paystack = new PaystackPop();

    paystack.newTransaction({
      key: "pk_test_2cc397636d8a3cd5164bffe53f015d618964bd78",

      email: email,

      // Paystack expects the amount in kobo
      amount: Math.round(total * 100),

      currency: "NGN",

      metadata: {
        brand: "GEMI WEARS",
        customer_name: `${formData.get("firstName") || ""} ${formData.get("lastName") || ""}`.trim(),
        phone: formData.get("phone") || "",
        delivery_method: formData.get("delivery") || ""
      },

      onSuccess: function (transaction) {
        console.log("Paystack payment successful:", transaction);

        GemiStore.clear();

        form.closest(".checkout-layout").innerHTML = `
          <div class="empty-state" style="grid-column:1 / -1">
            <p class="eyebrow">Payment successful</p>

            <h2>Thank you for moving with us.</h2>

            <p>
              Your payment has been received successfully.
              Your GEMI WEARS order is being processed.
            </p>

            <p>
              <strong>Transaction reference:</strong><br>
              ${transaction.reference}
            </p>

            <a class="button" href="index.html">Return home</a>
          </div>
        `;
      },

      onCancel: function () {
        showToast("Payment cancelled. Your order has not been placed.");
      },

      onError: function (error) {
        console.error("Paystack error:", error);
        showToast("Payment could not be completed. Please try again.");
      }
    });
  });
}

  function initForms() {
    document.querySelectorAll("[data-newsletter]").forEach((form) => form.addEventListener("submit", (event) => { event.preventDefault(); if (form.reportValidity()) { showToast("You’re on the list. Welcome to the circle."); form.reset(); } }));
    document.querySelectorAll("[data-contact-form]").forEach((form) => form.addEventListener("submit", (event) => { event.preventDefault(); if (form.reportValidity()) { showToast("Message received. We’ll get back to you soon."); form.reset(); } }));
    document.querySelectorAll("[data-account-form]").forEach((form) => form.addEventListener("submit", (event) => { event.preventDefault(); if (form.reportValidity()) showToast(form.dataset.accountForm === 'register' ? "Account created locally — connect a backend to make it live." : "Demo sign-in complete — connect a backend to authenticate users."); }));
  }

  renderShell(); initMenu(); updateCartCount(); initHome(); initShop(); initProduct(); initCart(); initCheckout(); initForms();
  document.querySelectorAll("[data-year]").forEach((el) => el.textContent = new Date().getFullYear());
  window.addEventListener("gemi:cart-updated", updateCartCount);
  if (new URLSearchParams(location.search).get("order")) showToast("Your order has been placed.");
})();
