# StoryCraft (KalaSaga)

StoryCraft (also known as KalaSaga) is a cinematic, scroll-driven e-commerce platform designed to bring the rich heritage of Visakhapatnam's artisans to the world. Prioritizing emotional connection over purely transactional interactions, the platform transitions gracefully from a documentary-style storytelling opening to a clean, modern SaaS e-commerce website. 

It aims to elevate traditional crafts into premium experiences through immersive full-screen visuals, dynamic 3D elements, and intimate artisan storytelling. 

---

## 🌟 Key Features & Functionality

### 1. Cinematic Storytelling Interface
- **Scroll-Driven Narrative:** Built with **GSAP** and **Lenis** for ultra-smooth scroll animations that guide users through artisan stories.
- **Micro-interactions:** Fine-tuned hover effects and dynamic transitions powered by **Framer Motion**.
- **Dark & Ivory Themes:** Thoughtfully calibrated typography and color palettes for maximum visual impact.

### 2. Artisan Bios & Portfolios
- Dedicated sections for artisans to tell their origin stories, detail their craft, and showcase high-resolution galleries.
- Seamless bridge connecting the buyer to the creator behind the product.

### 3. Fully-Featured E-commerce Layer
- **Product Management:** Browse diverse product catalogs with detailed specifications.
- **Cart & Wishlist:** Intuitive state-management for user's favorite items and shopping bags.
- **Payments:** Seamless checkout process integrated with **Razorpay**.
- **Order History:** Track orders natively within user dashboards.

### 4. 3D Product Viewer
- Interactive 3D visualization using **React Three Fiber** and **Drei**, allowing users to spin, zoom, and inspect products from every angle.

### 5. Real-Time Chat System
- Built-in **Socket.io** integration enabling live, instant communication between buyers and artisans for custom orders or inquiries.

### 6. AI Integration
- Powered by **Google Generative AI** (Gemini) for dynamic smart functionalities and intelligent content structuring.

### 7. Progressive Web App (PWA)
- Fully installable and responsive on desktop and mobile devices via `@ducanh2912/next-pwa`.

---

## 🛠 Tech Stack

**Frontend Framework:** Next.js (App Router), React 19  
**Styling:** Tailwind CSS  
**Animations:** GSAP, Framer Motion, Lenis Scroll  
**3D Elements:** Three.js, React Three Fiber, React Three Drei  
**Backend & APIs:** Next.js API Routes, Node.js (`server.js`)  
**Database:** MongoDB via Mongoose  
**Real-time:** Socket.io  
**Payment Gateway:** Razorpay  
**Media Storage:** Cloudinary, DigitalOcean Spaces (via AWS SDK)
**Security/Auth:** JSON Web Tokens (JWT), bcryptjs, NextAuth logic, CSRF protection  

---

## 🚀 Getting Started Guide

### Prerequisites
Make sure you have Node.js and `npm` (or `yarn` / `pnpm`) installed on your system.
You will also need a running instance of MongoDB and access credentials for AWS S3, Cloudinary, and Razorpay.

### 1. Installation

Clone the repository and install the required dependencies:

```bash
npm install
```

### 2. Environment Variables

Create a `.env` file in the root directory. You will need to supply the following values based on your platform configurations:

```env
# Database
MONGODB_URI=your_mongodb_connection_string

# Authentication Secrets
JWT_SECRET=your_jwt_secret
NEXTAUTH_SECRET=your_nextauth_secret

# Storage
CLOUDINARY_URL=your_cloudinary_url
# DigitalOcean Spaces (S3-compatible storage for 3D models)
DO_SPACES_KEY=your_do_spaces_key
DO_SPACES_SECRET=your_do_spaces_secret
DO_SPACES_ENDPOINT=your_do_spaces_endpoint
DO_SPACES_BUCKET=your_do_spaces_bucket

# Payments
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret

# AI Processing
GEMINI_API_KEY=your_gemini_api_key
```
*(Check `.env.example` if available for an exhaustive list of variables).*

### 3. Running the App locally

Since this build uses a custom server file to accommodate Socket.io integration alongside Next.js, run:

```bash
npm run dev
# or explicitly:
node server.js
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### 4. Build for Production

To create an optimized production build:

```bash
npm run build
npm run start
```

---

## 📂 Project Structure Overview

- `/src/app`: Contains the core Next.js App Router folders, views, and API routes.
- `/src/components`: UI components, sections, 3D elements, and reusable layouts.
- `/src/models`: Mongoose schemas (`User.js`, `Artisan.js`, `Product.js`, `Order.js`, `Chat.js`).
- `/public`: Static assets (images, fonts, PWA manifests).
- `server.js`: Custom Next.js + Socket.io initialization server script.

---

## 🛡 Security & Best Practices

The app utilizes robust web security implementations:
- **`dompurify` & `mongo-sanitize`**: Ensures payloads are aggressively cleaned against XSS and NoSQL injection attempts.
- **CSRF Tokens**: Mitigates Cross-Site Request Forgery.
- **JWT & bcrypt**: Ensures secure password hashing and stateless authorization.

Enjoy building and exploring the stories with **StoryCraft**!
