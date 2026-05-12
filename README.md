<div align="center">

<img src="https://img.shields.io/badge/StoryCraft-KalaSaga-D97706?style=for-the-badge&labelColor=1a1a1a" alt="StoryCraft"/>

# 🪔 StoryCraft — KalaSaga

### *A Cinematic Artisan Commerce Platform*

Connecting buyers directly to verified craftspeople from Visakhapatnam and across India.  
Every product is a story — the artisan who made it, the technique behind it, and the cultural legacy it carries.

[









</div>

***

## 🧭 The Problem

Over **7 million artisan households** in India produce heritage-grade goods but lack digital presence. Middlemen capture **40–60% of sale prices**. Buyers cannot verify authenticity. Existing platforms treat crafts as commodity listings — no story, no identity, no heritage.

**StoryCraft fixes this.** Direct artisan-to-buyer commerce with AI-powered tools, real-time communication, cinematic storytelling, and a comprehensive seller dashboard — all designed to preserve cultural heritage while generating sustainable income for craftspeople.

***

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

***

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

***

### 🛒 Commerce & Product Features

- **Multi-step product upload wizard** with drag-and-drop image upload
- **Draft and published states** for product management
- **Category, city, material, and craft technique metadata**
- **3D Product Viewer** — React Three Fiber + Drei with orbit controls (spin, zoom, inspect). Models via Meshy API, stored on DigitalOcean Spaces
- **Razorpay payment integration** with order status progression (pending → confirmed → in progress → shipped → delivered)
- **Wishlist** — persistent toggle from product cards and detail pages
- **Shop filtering** — category, material, price range, city; sort by price, date, popularity
- **Multi-city support** — Visakhapatnam, Hyderabad, Chennai, Kolkata

***

### 💬 Real-Time Chat & Customization

- **Socket.IO WebSocket messaging** between buyers and artisans
- Text and image messages with typing indicators
- Message persistence in MongoDB
- Pop-out chat window accessible from any page — **no navigation required**
- Conversation list with unread counts and timestamps
- **AI Customization Preview** — artisan sends product image + prompt → Gemini generates preview → uploaded to Cloudinary → delivered to buyer's chat in real-time

***

### 🔐 Multi-Role Authentication

- Separate buyer and artisan registration flows
- JWT access tokens with **HttpOnly secure cookies**
- 30-day refresh tokens with dedicated refresh endpoints
- Password hashing with **bcrypt (12-round salt)**
- Role-based route protection

***

### 📊 Artisan Analytics Dashboard

- **Overview cards** — total products, published products, views, orders, revenue, average rating
- **Period filtering** — 7, 30, and 90-day date ranges
- **Revenue chart** — daily aggregation plotted over selected period
- **Product performance table** — views, orders, revenue, and approved FAQ count per product
- **Top products** ranked by view count
- All data computed server-side via **MongoDB aggregation pipelines on indexed fields**

***

### 🌐 PWA & SEO

**PWA Support**
- Service worker via `@ducanh2912/next-pwa` with offline caching
- Installable on mobile and desktop (home screen prompt)
- Custom cursor auto-hidden on touch devices

**SEO**
- Dynamic meta tags per page (title, description, keywords, OpenGraph)
- Product **JSON-LD structured data** for rich search results
- **FAQ schema markup** for FAQ-rich snippets in Google
- Dynamic `sitemap.js` crawling published products and artisan profiles
- Image optimization with automatic **AVIF and WebP** selection

***

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

***

## 🏗️ Architecture & Security

- **Layered architecture** — Next.js App Router + custom Node.js server for WebSocket support
- **Dedicated `lib/` layer** for auth, rate limiting, input sanitization, and AI utilities
- **Content Security Policy** with HSTS, X-Frame-Options, and source whitelisting
- **HttpOnly JWT** with refresh token rotation
- **Input sanitization** via DOMPurify and mongo-sanitize
- **IP-based and product-level rate limiting** on all AI endpoints (max 5 AI generations per product)

***

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- MongoDB instance
- API keys for Cloudinary, Razorpay, and Gemini

### 1. Clone the repository

```bash
git clone https://github.com/Varun9490/StoryCraft.git
cd StoryCraft
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env` with your credentials:

```env
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/storycraft
JWT_SECRET=your-jwt-secret

CLOUDINARY_URL=cloudinary://api_key:api_secret@cloud_name

GEMINI_API_KEY=your-gemini-api-key

RAZORPAY_KEY_ID=rzp_live_xxxxx
RAZORPAY_KEY_SECRET=your-razorpay-secret

# Optional — DigitalOcean Spaces for 3D model storage
DO_SPACES_KEY=your-spaces-key
DO_SPACES_SECRET=your-spaces-secret
DO_SPACES_ENDPOINT=https://nyc3.digitaloceanspaces.com
DO_SPACES_BUCKET=your-bucket-name

# Optional — competitor price scraping
SERPER_API_KEY=your-serper-api-key
```

### 4. Run development server

```bash
npm run dev
```

> Starts a custom Node.js server (`server.js`) that integrates Socket.IO with Next.js.  
> App available at **http://localhost:3000**

### 5. Build for production

```bash
npm run build
npm run start
```

***

## 📁 Project Structure

```
storycraft/
├── app/
│   ├── api/
│   │   ├── auth/           # JWT, refresh token, login, register
│   │   ├── products/       # CRUD, AI analysis, FAQ, pricing
│   │   ├── chat/           # Socket.IO message persistence
│   │   ├── orders/         # Razorpay + order lifecycle
│   │   └── analytics/      # MongoDB aggregation pipelines
│   ├── (marketing)/        # Landing page, storytelling sections
│   ├── shop/               # Product browsing + filtering
│   ├── dashboard/          # Artisan analytics + product manager
│   └── profile/            # Buyer and artisan profiles
├── components/
│   ├── landing/            # GSAP + Three.js storytelling sections
│   ├── chat/               # Socket.IO pop-out chat UI
│   ├── ai/                 # Kala chatbot, Kavya support bot
│   └── ui/                 # Shared glassmorphism components
├── lib/
│   ├── auth.js             # JWT helpers + middleware
│   ├── aiDetection.js      # Gemini utility layer
│   ├── rateLimit.js        # IP + product-level rate limiting
│   └── sanitize.js         # DOMPurify + mongo-sanitize
├── server.js               # Custom Node.js server with Socket.IO
├── public/
└── next.config.js
```

***

## 🎬 Demo Flow

1. **Landing page** — Scroll through all sections. Note cinematic transitions, WebGL globe, and story panels.
2. **Shop** — Browse and filter products. Open a product to see the full-viewport image carousel, FAQs, and 3D model viewer.
3. **Kala chatbot** — Click the purple button (bottom-left). Ask about craft techniques or products.
4. **Messages** — Click the orange button (bottom-right). View conversations and send a message.
5. **Artisan dashboard** — Log in as an artisan. View analytics, product list, and orders.
6. **AI product listing** — Add a product, upload an image, trigger AI Image Analysis. Watch fields auto-fill.
7. **AI pricing** — Trigger AI Pricing Recommendation on a product. View the margin breakdown.
8. **FAQ manager** — Generate FAQs with AI. Approve or reject individual questions.
9. **Customization flow** — Request a customization as a buyer; watch the AI preview arrive in chat.
10. **PWA** — Resize to mobile, check responsive layouts. Show install prompt if triggered.

***

## 🏆 Judging Alignment

| Criteria | Highlights |
|----------|------------|
| **Architecture & Security** (20 pts) | Custom Node.js + Next.js hybrid server, compound MongoDB indexes, HttpOnly JWT rotation, CSP headers, IP rate limiting |
| **Innovation** (20 pts) | 7-function AI suite on a single Gemini model, vision-to-catalog pipeline, real-time AI customization previews via Socket.IO |
| **UI/UX** (10 pts) | Scroll-driven cinematic narrative, WebGL globe, 3D product viewer, custom cursor, glassmorphism dark theme |
| **Documentation** (10 pts) | Comprehensive DOCUMENTATION.md, annotated README, commented code at decision points |

***

## 🗺️ Future Roadmap

- [ ] AI watermark detection for authenticity certificates
- [ ] Multi-language support (Telugu, Hindi, Tamil)
- [ ] Enterprise/bulk buyer dashboards
- [ ] LMS integrations for artisan skill development
- [ ] VSCode extension for catalog management
- [ ] PDF/DOCX invoice and catalog export
- [ ] Semantic vector search across product descriptions

***

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch — `git checkout -b feature/your-feature`
3. Commit your changes — `git commit -m "Add your feature"`
4. Push to the branch — `git push origin feature/your-feature`
5. Open a Pull Request

***

## 🙏 Acknowledgments

- [Google Gemini API](https://ai.google.dev/) — Multi-modal AI backbone
- [Meshy API](https://www.meshy.ai/) — 3D model generation
- [Razorpay](https://razorpay.com/) — Payment infrastructure
- [Three.js](https://threejs.org/) & [GSAP](https://greensock.com/gsap/) — Visual storytelling
- [Prisma](https://www.prisma.io/) & [Next.js Team](https://nextjs.org/)
- The artisan communities of Visakhapatnam 🪔

***

## 📝 License

Licensed under the [MIT License](./LICENSE).

***

<div align="center">

Built with ❤️ for India's artisan communities — and the AI era.

⭐ **Star this repo** if StoryCraft resonates with you.

</div>
