# StoryCraft (KalaSaga) - Testing Guide

This guide provides step-by-step instructions on how to test the core features and functionality of the StoryCraft application locally.

## Prerequisites
Ensure the application is running locally:
```bash
npm install
npm run dev # or: node server.js
```
Open `http://localhost:3000` in your browser.

---

## 1. Cinematic Storytelling & Landing Page
**Objective:** Verify the animations, scrolling, and theme transitions.
* **Steps:**
  1. Navigate to the homepage (`/`).
  2. Scroll down slowly. Observe the GSAP and Lenis scroll animations.
  3. Verify that sections transition smoothly from the dark documentary-style opening to the ivory e-commerce sections.
  4. Check hover states on images and buttons to confirm Framer Motion interactive micro-animations are working.

## 2. User Authentication (Registration & Login)
**Objective:** Verify that users can sign up, log in, and manage sessions securely.
* **Steps:**
  1. Go to the Sign Up page (`/register` or via the Auth modal).
  2. Create a new user account with a test email and password.
  3. Verify successful redirection and that the user's name/avatar appears in the navigation bar.
  4. Log out.
  5. Go to the Login page (`/login` or Auth modal) and sign in with the same credentials.
  6. **Security Check:** Intentionally enter wrong credentials to ensure proper error messages appear.

## 3. Browsing the Catalog & Artisan Bios
**Objective:** Ensure product listings and artisan connections display correctly.
* **Steps:**
  1. Navigate to the Shop page (`/shop` or `/products`).
  2. Test the filters and search functionality (if applicable) to see if the product list updates.
  3. Click on a specific product to view its details.
  4. Verify the Artisan section on the product page. Click on the Artisan's name/profile to navigate to their dedicated bio/portfolio page.

## 4. 3D Product Viewer
**Objective:** Verify that 3D models load from DigitalOcean Spaces and are interactive.
* **Steps:**
  1. Find a product in the shop that has a 3D model attached.
  2. Click the "View in 3D" or interactive 3D canvas on the product details page.
  3. Click and drag your mouse to rotate the product.
  4. Scroll or pinch to zoom in and out.
  5. **Note:** This requires `DO_SPACES_ENDPOINT` and related S3 environment variables to be correctly configured and models to exist in the bucket.

## 5. E-Commerce functionalities (Cart & Wishlist)
**Objective:** Test state management for items in the shopping bag.
* **Steps:**
  1. Add multiple different products to the Cart.
  2. Add some products to the Wishlist (using the heart icon).
  3. Navigate to the Cart (`/cart`) and verify the items, quantities, and total price calculation.
  4. Increase/decrease quantities and check if the total updates.
  5. Remove an item from the cart.
  6. Navigate to the Wishlist and verify the saved items.

## 6. Checkout Process (Razorpay Integration)
**Objective:** Ensure the payment gateway initializes and processes test transactions.
* **Steps:**
  1. Proceed to checkout from your Cart.
  2. Fill in the shipping and billing details.
  3. Click "Pay" to trigger the Razorpay modal.
  4. Since you are in a test environment (using `rzp_test_...` keys), select a test payment method (Netbanking > "Success" bank, or any test card number provided by Razorpay).
  5. Complete the payment. 
  6. You should be redirected to an Order Success page.

## 7. Order History & Dashboard
**Objective:** Verify that orders are successfully saved to the database.
* **Steps:**
  1. After successful checkout, navigate to your User Dashboard or Order History (`/dashboard` or `/orders`).
  2. Confirm that the recent order is listed with the correct items, total price, and status (e.g., "Paid").

## 8. Real-Time Chat (Socket.io)
**Objective:** Test real-time messaging between Buyer and Artisan.
* **Steps (Requires Two Browser Windows/Sessions):**
  1. Open a regular browser window and log in as a **Buyer**.
  2. Open an Incognito/Private window and log in as an **Artisan** (or another test user).
  3. From the Buyer account, go to an Artisan's profile or product page and click "Message Artisan" or "Chat".
  4. Send a test message.
  5. Check the Artisan's window (Incognito). The message should appear instantly without refreshing the page.
  6. Reply from the Artisan account and ensure it appears on the Buyer's screen.

## 9. Progressive Web App (PWA) functionality
**Objective:** Test offline caching and installation.
* **Steps:**
  1. Open Chrome.
  2. Look for the "Install Application" icon in the right side of the URL address bar. Click to install it on your desktop.
  3. **Note:** PWA features are disabled in development mode by default. To test it, you need to run `npm run build` and then `npm run start`.

## 10. AI Features (Google Gemini)
**Objective:** Test the integrated AI functionalities (if configured).
* **Steps:**
  1. Identify the pages/components utilizing the Gemini API (e.g., smart descriptions, recommendations, or search enhancements).
  2. Trigger the action and verify the AI returns a coherent response.
  3. **Note:** Ensure `GEMINI_API_KEY` is present in your `.env`.
