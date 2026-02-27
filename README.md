StoryCraft (KalaSaga)

A cinematic artisan commerce platform that connects buyers directly to verified craftspeople from Visakhapatnam and other Indian cities. StoryCraft treats every product as a story: the artisan who made it, the technique behind it, and the cultural legacy it carries.

Built with Next.js 16, React 19, MongoDB, Socket.IO, Google Generative AI (Gemini 2.5 Flash), Three.js, GSAP, and Framer Motion.


PROJECT OVERVIEW

StoryCraft solves the artisan-market disconnect in India. Over 7 million artisan households produce heritage-grade goods but lack digital presence. Middlemen claim 40 to 60 percent of sale prices. Buyers cannot verify authenticity. Existing platforms treat crafts as commodity listings.

StoryCraft provides direct artisan-to-buyer commerce with AI-powered tools, real-time communication, cinematic storytelling, and a comprehensive seller dashboard. Every feature is designed to preserve cultural heritage while generating sustainable income for craftspeople.


FEATURES

Cinematic Storytelling Landing Page
Scroll-driven documentary-style narrative using GSAP ScrollTrigger and Lenis smooth scroll. Full-viewport transitions from aerial Visakhapatnam views to artisan workshops to product close-ups. Globe section with WebGL-rendered Earth showing artisan locations. Story panels with parallax reveals. Artisan poster gallery. Testimonial carousel.

Multi-Role Authentication
Separate buyer and artisan registration flows. JWT access tokens with HttpOnly secure cookies. 30-day refresh tokens with dedicated refresh endpoints. Password hashing with bcrypt (12-round salt). Role-based route protection.

Product Management
Multi-step upload wizard with drag-and-drop image upload. AI-assisted product fields from computer vision. Draft and published states. Category, city, material, and craft technique metadata. Stock tracking.

AI-Generated FAQs
Gemini 2.5 Flash analyzes product title, description, category, material, and craft technique to generate 8 buyer-perspective questions with culturally aware answers. Artisans approve, edit, or delete FAQs individually. Only approved FAQs appear on product pages. Rate-limited to 5 generations per product. Structured data output for SEO.

AI Image Analysis (Vision-to-Catalog)
Upload a product photo. Gemini identifies craft type, materials, region of origin, color palette, and generates a title, 200-word description, and SEO tags. Apply results directly to product form fields. Reduces listing time from hours to minutes.

AI Pricing Recommendation
Scrapes competitor prices via Serper API. Caches results per category-city pair. Gemini synthesizes a margin breakdown: material cost, artisan labor, platform fee, and profit percentage. Gives rural artisans market intelligence they otherwise cannot access.

AI Chatbot (Kala)
Floating pop-out panel accessible from every page. Uses Gemini with conversation history and live product context from the database. Answers buyer questions about crafts, materials, artisans, care, shipping, and platform features. Glassmorphism UI with gradient header and branded avatar.

AI Support Bot (Kavya)
Accepts text and image input. Searches product database by title, tags, category, and description. Feeds matched products as context to Gemini. Returns AI response and matching product cards. Image recognition identifies craft styles and suggests similar products.

AI Customization Preview
Buyers request customizations in chat. Artisan sends original product image and customization prompt to Gemini image generation. Generated preview uploads to Cloudinary and delivers to buyer's chat via Socket.IO in real-time. Buyer confirms or requests changes.

Real-Time Chat
Socket.IO WebSocket messaging between buyers and artisans. Text and image messages. Typing indicators. Message persistence in MongoDB. Pop-out chat window accessible from any page without navigation. Conversation list with unread counts and timestamps. Customization workflow runs entirely within the chat thread.

3D Product Viewer
Interactive 3D visualization using React Three Fiber and Drei. Orbit controls for spin, zoom, and inspect. Models generated via Meshy API and stored on DigitalOcean Spaces. Lazy-loaded as dynamic import with SSR disabled.

Artisan Analytics Dashboard
Revenue tracking with daily aggregation charts (7, 30, 90 day periods). Product performance: views, orders, revenue per product. Top products by view count. Overview cards: total products, published products, views, orders, revenue, rating.

Order Management and Payments
Razorpay payment integration. Order status progression: pending, confirmed, in progress, shipped, delivered. Payment status tracking. Delivery address capture. Item snapshots preserve prices at order time. Customization orders with detail text.

Wishlist
Persistent wishlist in user document. Toggle from product cards and detail pages. Dedicated wishlist page.

Shop with Filtering
Category, material, price range, and city filtering. Sort by price, date, popularity. Multi-city support: Visakhapatnam, Hyderabad, Chennai, Kolkata.


AI CAPABILITIES

StoryCraft integrates seven AI functions through Google Generative AI Gemini 2.5 Flash:

1. FAQ Generation from product data (text input, JSON output)
2. Computer Vision product analysis (image input, structured JSON output)
3. Competitive pricing with web scraping synthesis (text plus data input, JSON output)
4. Conversational chatbot with product context (multi-turn text, streamed text output)
5. Support bot with image recognition and product matching (multimodal input, text plus product cards output)
6. Customization preview image generation (image plus text input, image output)
7. Content structuring and description generation (text input, structured text output)

All AI endpoints share a common utility layer with retry logic, exponential backoff, structured JSON parsing with fallback prompts, and safety content filtering.


STORYTELLING EXPERIENCE

The landing page is a full cinematic narrative:

Section 1: Hero with animated text reveal and custom cursor tracking.
Section 2: WebGL globe with artisan location markers and satellite zoom.
Section 3: Story panels with parallax image reveals and scroll-triggered text.
Section 4: Artisan poster gallery with hover-reveal bios and portfolio links.
Section 5: Product grid with featured products and category icons.
Section 6: AI features showcase explaining the seven AI capabilities.
Section 7: How It Works process visualization with step-by-step flow.
Section 8: Testimonial carousel with animated cards.
Section 9: CTA footer with call-to-action and marquee text strip.

The transition from emotional storytelling to functional e-commerce is seamless. Users scroll from a documentary into a shop without any navigation interruption.


ANALYTICS SYSTEM

The artisan analytics dashboard provides:

Overview Metrics: Total products, published products, total views across all products, total orders, total revenue, average rating.

Period-Based Filtering: 7 day, 30 day, and 90 day date range selection.

Product Performance Table: Each product shows views, orders, revenue, and approved FAQ count.

Revenue Chart: Daily revenue aggregation plotted over the selected period.

Top Products: Ranked by view count for performance insights.

All analytics data is computed server-side using MongoDB aggregation pipelines on indexed fields.


PWA SUPPORT

StoryCraft is a fully installable Progressive Web App:

Service worker registration and lifecycle management via @ducanh2912/next-pwa.
Offline caching of the app shell and static assets.
Install prompt for home screen placement on mobile and desktop.
Responsive layouts optimized for phone, tablet, and desktop viewports.
Custom cursor is automatically hidden on touch devices.


SEO CAPABILITIES

Dynamic meta tags generated per page (title, description, keywords, OpenGraph).
Product structured data with JSON-LD for rich search results.
FAQ schema markup on product pages for FAQ-rich snippets in search.
Dynamic sitemap.js that crawls published products and artisan profiles.
Semantic HTML with proper heading hierarchy across all pages.
Image optimization with automatic AVIF and WebP format selection.
Page load optimization via code splitting, dynamic imports, and lazy loading.


SETUP

Prerequisites: Node.js 18 or later, MongoDB instance, and API keys for Cloudinary, Razorpay, Gemini, and optionally Serper and DigitalOcean Spaces.

Install dependencies:
npm install

Create a .env file in the project root with the following variables:
MONGODB_URI (MongoDB connection string)
JWT_SECRET (secret for JWT signing)
CLOUDINARY_URL (Cloudinary environment URL)
GEMINI_API_KEY (Google Generative AI API key)
RAZORPAY_KEY_ID (Razorpay key ID)
RAZORPAY_KEY_SECRET (Razorpay key secret)
DO_SPACES_KEY (optional, DigitalOcean Spaces access key)
DO_SPACES_SECRET (optional, DigitalOcean Spaces secret)
DO_SPACES_ENDPOINT (optional, DigitalOcean Spaces endpoint)
DO_SPACES_BUCKET (optional, DigitalOcean Spaces bucket name)
SERPER_API_KEY (optional, for competitor price scraping)

Run in development:
npm run dev

This starts a custom Node.js server (server.js) that integrates Socket.IO with Next.js. The app is available at http://localhost:3000.

Build for production:
npm run build
npm run start


DEMO INSTRUCTIONS

1. Open the landing page and scroll through all sections. Note the cinematic transitions, globe animation, and story panels.
2. Navigate to the shop and browse products. Apply filters. Click a product to see the full-viewport image carousel, details, FAQs, and 3D model viewer.
3. Open the Kala AI chatbot (purple button, bottom-left). Ask about products or craft techniques.
4. Open the Messages pop-out (orange button, bottom-right). View conversations and send a message.
5. Log in as an artisan. Open the dashboard. View analytics, product list, and orders.
6. Add a new product. Upload an image and trigger AI Image Analysis. Show auto-filled fields. Trigger AI Pricing Recommendation.
7. Open FAQ Manager on an existing product. Generate FAQs with AI. Approve or reject individual FAQs.
8. Demonstrate a customization request flow from buyer side if applicable.
9. Show responsive design by resizing the browser.
10. Show the PWA install prompt if triggered.


JUDGING ALIGNMENT

Architecture and Security (20 points)
Layered architecture: Next.js App Router with custom Node.js server for WebSocket support. MongoDB with Mongoose schemas and compound indexes. Dedicated lib layer for auth, rate limiting, sanitization, and AI utilities. Content Security Policy with HSTS, X-Frame-Options, and source whitelisting. HttpOnly JWT with refresh token rotation. Input sanitization with DOMPurify and mongo-sanitize. IP-based and product-level rate limiting on all AI endpoints.

Innovation (20 points)
Seven-function AI suite on a single Gemini model. Vision-to-catalog pipeline auto-fills product listings from a single photograph. Competitor price scraping synthesized by AI into margin breakdown recommendations. Real-time AI customization previews delivered via Socket.IO within chat. Scroll-driven documentary landing that transitions to functional e-commerce. Pop-out chat architecture that persists across page navigations.

UI (10 points)
Cinematic scroll-driven narrative with GSAP and Lenis. WebGL globe visualization. 3D product viewer with orbit controls. Custom animated cursor with spring physics. Glassmorphism design system with dark theme and warm terracotta accents. Framer Motion enter/exit animations on all interactive elements. Fully responsive mobile-first layouts.

Documentation Quality (10 points)
Comprehensive DOCUMENTATION.md covering problem statement, solution architecture, tech stack justification, feature breakdown, demo guide, innovation analysis, and feasibility assessment. Updated README with complete feature list, AI capabilities, setup instructions, and demo flow. Code is commented at decision points and complex logic blocks.
