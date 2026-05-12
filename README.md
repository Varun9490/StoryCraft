<div align="center">

<img src="https://img.shields.io/badge/StoryCraft-KalaSaga-D97706?style=for-the-badge&labelColor=1a1a1a" alt="StoryCraft"/>

# 🪔 StoryCraft — KalaSaga

### *A Cinematic Artisan Commerce Platform*

Connecting buyers directly to verified craftspeople from Visakhapatnam and across India.  
Every product is a story — the artisan who made it, the technique behind it, and the cultural legacy it carries.

<br/>

<a href="https://www.loom.com/share/e7b6087558374d818d2b6dc3e37b47fe">
  <img src="https://img.shields.io/badge/Watch-Demo-orange?style=for-the-badge&logo=loom&logoColor=white" alt="Demo Video"/>
</a>

</div>



## 🧭 The Problem

Over **7 million artisan households** in India produce heritage-grade goods but lack digital presence. Middlemen capture **40–60% of sale prices**. Buyers cannot verify authenticity. Existing platforms treat crafts as commodity listings — no story, no identity, no heritage.

**StoryCraft fixes this.** Direct artisan-to-buyer commerce with AI-powered tools, real-time communication, cinematic storytelling, and a comprehensive seller dashboard — all designed to preserve cultural heritage while generating sustainable income for craftspeople.

---

## ✨ Features

### 🎬 Cinematic Storytelling Landing Page

Scroll-driven documentary-style narrative using **GSAP ScrollTrigger** and **Lenis smooth scroll**. Full-viewport transitions from aerial Visakhapatnam views to artisan workshops to product close-ups.

| Section | Description |
|---------|-------------|
| Hero | Animated text reveal and custom cursor with spring physics |
| Globe | WebGL-rendered Earth with artisan location markers and satellite zoom |
| Story Panels | Parallax image reveals with scroll-triggered text |
| Artisan Gallery | Poster-style bios with hover-reveal portfolio links |
| Product Grid | Featured products with category icons |
| AI Showcase | Seven AI capabilities explained cinematically |
| How It Works | Step-by-step process visualization |
| Testimonials | Animated carousel with artisan stories |
| CTA Footer | Call-to-action with marquee text strip |

The transition from emotional storytelling to functional e-commerce is seamless — users scroll from a documentary directly into a shop.

---

### 🤖 AI Capabilities (7 Functions via Gemini 2.5 Flash)

| # | Feature | Input | Output |
|---|---------|-------|--------|
| 1 | **FAQ Generation** | Product data (text) | 8 buyer-perspective Q&As (JSON) |
| 2 | **Vision-to-Catalog** | Product photo (image) | Title, description, tags, materials |
| 3 | **AI Pricing Recommendation** | Competitor data via Serper API | Margin breakdown with labor + profit |
| 4 | **Kala Chatbot** | Multi-turn conversation | Streamed answers with product context |
| 5 | **Kavya Support Bot** | Text + image | AI response + matching product cards |
| 6 | **Customization Preview** | Image + prompt | AI-generated preview via Socket.IO |
| 7 | **Content Structuring** | Raw text input | SEO-optimized description |

All AI endpoints share a common utility layer with **retry logic**, **exponential backoff**, **structured JSON parsing with fallback prompts**, and **safety content filtering**.

---

### 🛒 Commerce & Product Features

- **Multi-step product upload wizard** with drag-and-drop image upload
- **Draft and published states** for product management
- **Category, city, material, and craft technique metadata**
- **3D Product Viewer** — React Three Fiber + Drei with orbit controls (spin, zoom, inspect). Models via Meshy API, stored on DigitalOcean Spaces
- **Razorpay payment integration** with order status progression (pending → confirmed → in progress → shipped → delivered)
- **Wishlist** — persistent toggle from product cards and detail pages
- **Shop filtering** — category, material, price range, city; sort by price, date, popularity
- **Multi-city support** — Visakhapatnam, Hyderabad, Chennai, Kolkata

---

### 💬 Real-Time Chat & Customization

- **Socket.IO WebSocket messaging** between buyers and artisans
- Text and image messages with typing indicators
- Message persistence in MongoDB
- Pop-out chat window accessible from any page — **no navigation required**
- Conversation list with unread counts and timestamps
- **AI Customization Preview** — artisan sends product image + prompt → Gemini generates preview → uploaded to Cloudinary → delivered to buyer's chat in real-time

---

### 🔐 Multi-Role Authentication

- Separate buyer and artisan registration flows
- JWT access tokens with **HttpOnly secure cookies**
- 30-day refresh tokens with dedicated refresh endpoints
- Password hashing with **bcrypt (12-round salt)**
- Role-based route protection

---

### 📊 Artisan Analytics Dashboard

- **Overview cards** — total products, published products, views, orders, revenue, average rating
- **Period filtering** — 7, 30, and 90-day date ranges
- **Revenue chart** — daily aggregation plotted over selected period
- **Product performance table** — views, orders, revenue, and approved FAQ count per product
- **Top products** ranked by view count
- All data computed server-side via **MongoDB aggregation pipelines on indexed fields**

---

### 🌐 PWA & SEO

#### PWA Support

- Service worker via `@ducanh2912/next-pwa` with offline caching
- Installable on mobile and desktop (home screen prompt)
- Custom cursor auto-hidden on touch devices

#### SEO

- Dynamic meta tags per page (title, description, keywords, OpenGraph)
- Product **JSON-LD structured data** for rich search results
- **FAQ schema markup** for FAQ-rich snippets in Google
- Dynamic `sitemap.js` crawling published products and artisan profiles
- Image optimization with automatic **AVIF and WebP** selection

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 16, React 19 |
| Styling | Tailwind CSS, Framer Motion, GSAP |
| 3D / WebGL | Three.js, React Three Fiber, Drei |
| Backend | Next.js App Router + custom Node.js server |
| Database | MongoDB with Mongoose |
| Real-Time | Socket.IO |
| AI | Google Generative AI (Gemini 2.5 Flash) |
| Payments | Razorpay |
| Storage | Cloudinary, DigitalOcean Spaces |
| Auth | JWT + bcrypt + HttpOnly cookies |
| SEO | JSON-LD, dynamic sitemap, OpenGraph |
| PWA | @ducanh2912/next-pwa |

---

## 🏗️ Architecture & Security

- **Layered architecture** — Next.js App Router + custom Node.js server for WebSocket support
- **Dedicated `lib/` layer** for auth, rate limiting, input sanitization, and AI utilities
- **Content Security Policy** with HSTS, X-Frame-Options, and source whitelisting
- **HttpOnly JWT** with refresh token rotation
- **Input sanitization** via DOMPurify and mongo-sanitize
- **IP-based and product-level rate limiting** on all AI endpoints (max 5 AI generations per product)

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- MongoDB instance
- API keys for Cloudinary, Razorpay, and Gemini

### 1. Clone the repository

```bash
git clone https://github.com/Varun9490/StoryCraft.git
cd StoryCraft
````

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

```bash
cp .env.example .env
```

### 4. Run development server

```bash
npm run dev
```

### 5. Build for production

```bash
npm run build
npm run start
```

---

## 📝 License

Licensed under the [MIT License](./LICENSE).

---

<div align="center">

Built with ❤️ for India's artisan communities — and the AI era.

⭐ **Star this repo** if StoryCraft resonates with you.

</div>

