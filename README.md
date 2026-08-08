# GEMI WEARS Storefront

A responsive fashion e-commerce starter for GEMI WEARS, built with plain HTML, CSS and JavaScript. It runs locally without a build process or server.

## Open the site

Open `index.html` in a browser. The store includes the uploaded hero photograph and logo, real product images, premium Coming Soon cards for unavailable products, product options, a local shopping bag, Nigeria and worldwide delivery choices at checkout, Paystack-only payment UI, filtering, sorting, and form feedback.

## Where to edit your images

| What you want to change | Folder or file to open |
| --- | --- |
| Logo in the header, footer and About page | `assets/brand/gemi-wears-logo.png` |
| Homepage model photo | `assets/brand/model-hero.jpeg` |
| Product images | `assets/products/` |
| Which image belongs to each product | `js/products.js` |

Keep the existing file name when replacing an image, or add a new file to `assets/products/` and change that product's `image:` value in `js/products.js`.

Every product is listed in `js/products.js`. Change its `name`, `price`, `description`, `sizes`, `colors` or `image` there. Products set to `image: null` automatically show the premium **Coming Soon** card.

## Project structure

```text
index.html       Homepage
shop.html        Catalogue with category filters and sorting
product.html     Reusable product page
cart.html        Local shopping bag
checkout.html    Checkout form and order confirmation state
about.html       Brand story
contact.html     Contact form and WhatsApp button
login.html       Sign-in UI
register.html    Account-creation UI
css/styles.css   Shared responsive design system
js/products.js   Product names, prices, options and image paths
js/store.js      Local-cart helper
js/main.js       Shared header/footer, interactions and page rendering
assets/brand/    Logo and model hero photo
assets/products/ Product image library
```

## Before publishing

1. Update the placeholder email address and social-media links.
2. Add a real backend for accounts, contact messages, stock and order processing.
3. Connect the checkout to your live Paystack account before accepting real payment.

The current checkout and account forms deliberately simulate confirmation only; they do not collect, send or charge real customer data. A Paystack public key and a secure server-side verification endpoint are still required before payments can be taken live.
