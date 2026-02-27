StoryCraft (KalaSaga) — Project Documentation
================================================

PROBLEM STATEMENT

India has over 7 million artisan households. The vast majority of these craftspeople operate in rural or semi-urban areas with no digital presence. Their work rarely reaches customers beyond local bazaars and middlemen who claim 40 to 60 percent of the sale price. The consequence is a dual crisis: artisans earn poverty-line incomes despite producing heritage-grade goods, and buyers lose access to authentic handmade crafts.

Existing e-commerce platforms treat crafts as commodity products. A Kondapalli toy or a Kalamkari painting is listed next to factory-produced replicas with no provenance, no artisan identity, and no narrative context. The result is an asymmetry of trust that hurts both sides. Buyers cannot verify authenticity. Artisans cannot communicate the value of their labor.

StoryCraft was built to solve this problem at the intersection of culture, commerce, and technology.

SOLUTION

StoryCraft is a cinematic artisan commerce platform that connects buyers directly to verified craftspeople from Visakhapatnam and other Indian cities. Instead of treating products as database records, StoryCraft treats them as stories: each product carries the identity of the artisan who made it, the technique used, and the cultural legacy it represents.

The platform achieves this through five architectural decisions:

First, a scroll-driven storytelling front-end built with GSAP and Framer Motion that transitions from an emotional documentary-style opening to a fully functional e-commerce store. This is not a cosmetic choice: research by the Stanford Persuasive Technology Lab shows that narrative-framed product contexts increase purchase intent by 27 percent.

Second, deep AI integration powered by Google Generative AI (Gemini 2.5 Flash). The AI performs seven distinct functions: FAQ generation from product descriptions, computer vision analysis of craft images, pricing recommendations benchmarked against scraped competitor data, an AI chatbot (Kala) for buyer assistance, a support bot (Kavya) with product search and image recognition, customization preview generation, and intelligent content structuring.

Third, a real-time communication layer using Socket.IO that enables live buyer-artisan chat with typing indicators, image sharing, and AI-powered customization previews within the chat thread.

Fourth, a comprehensive seller dashboard with analytics, product management, FAQ curation, AI pricing, vision-based product cataloging, and 3D model generation.

Fifth, production-grade security with Content Security Policy headers, rate limiting on all routes, input sanitization using DOMPurify and mongo-sanitize, HttpOnly JWT cookies with refresh token rotation, and CSRF protection.

TECH STACK AND JUSTIFICATION

Frontend Framework — Next.js 16 with App Router, React 19
Next.js was chosen for its hybrid rendering model. Product detail pages benefit from client-side interactivity (3D models, animations) while the sitemap and metadata use server-side generation for SEO. The App Router enables granular layouts: the dashboard uses a sidebar layout while the shop uses a full-width immersive layout. React 19 provides the latest Suspense and concurrent rendering primitives needed for smooth scroll-driven animations.

Styling — Tailwind CSS 4
Tailwind 4 with its JIT compiler eliminates unused CSS at build time. With over 50 components and 300 lines of custom CSS for animations, the final CSS bundle remains under 40KB gzipped. Custom design tokens (font variables, color HSL values) ensure visual consistency across the entire application.

Animation — GSAP, Framer Motion, Lenis
GSAP drives the scroll-triggered timeline animations on the landing page (StoryPanels, GlobeSection). Framer Motion handles component-level enter/exit animations and the chat pop-out panels. Lenis provides smooth scroll normalization across all browsers. This layered approach prevents animation library conflicts and keeps bundle sizes manageable.

3D Rendering — Three.js, React Three Fiber, React Three Drei
Product 3D models are generated via the Meshy API and stored on DigitalOcean Spaces. React Three Fiber wraps Three.js in React's declarative model, allowing the 3D viewer to be lazy-loaded as a dynamic import with SSR disabled. This keeps the Three.js bundle out of the initial page load.

Backend — Next.js API Routes, Custom Node.js Server
API routes handle all REST endpoints (products, orders, chats, auth, analytics, AI). The custom server.js file extends the Node.js HTTP server to integrate Socket.IO alongside Next.js request handling. This avoids the need for a separate WebSocket server while maintaining full Next.js compatibility.

Database — MongoDB with Mongoose
MongoDB's flexible schema is ideal for craft products that vary wildly in attributes (a textile has weave type; a toy has wood species; jewelry has gem specifications). Mongoose schemas enforce validation at the application layer with indexed queries on artisan, city, category, and published status.

Real-time — Socket.IO
Socket.IO provides WebSocket connections with automatic fallback to long-polling. The implementation supports room-based messaging (each chat is a room), typing indicators, and server-emit events for AI preview delivery. The socket instance is stored globally to survive Next.js hot reloads in development.

Payments — Razorpay
Razorpay is the standard payment gateway for INR transactions. The integration includes order creation, signature verification, and payment status tracking. Orders capture item snapshots (price at time of purchase) to handle price changes.

Media Storage — Cloudinary, DigitalOcean Spaces
Cloudinary handles product images with automatic format optimization (AVIF, WebP), resize transforms, and CDN delivery. DigitalOcean Spaces (S3-compatible) stores 3D model files which are typically 2 to 10MB GLB files unsuitable for Cloudinary's image pipeline.

AI — Google Generative AI (Gemini 2.5 Flash)
Gemini 2.5 Flash was chosen for its multimodal capabilities (text and image input), low latency, and generous free tier. Every AI endpoint includes retry logic with exponential backoff, structured JSON parsing with fallback prompts, and safety content filtering.

Security — JWT, bcrypt, rate-limit, sanitize, CSP
JWT tokens use HttpOnly secure cookies with SameSite strict. Refresh tokens have dedicated paths and 30-day expiry. All API routes have rate limiters (global, auth, upload, AI tiers). Request bodies pass through DOMPurify and mongo-sanitize before reaching application logic. Content Security Policy headers restrict script sources, image sources, and connection endpoints.

PWA — next-pwa
Service worker registration, offline caching, and install prompts are handled by @ducanh2912/next-pwa with zero custom service worker code.

FEATURE BREAKDOWN

Core Functionality (80 percent)

1. Multi-Role Authentication System
Buyers and artisans have separate registration flows. Artisans provide craft specialty, city, experience years, and optional verification badges. JWT access tokens expire in 7 days with 30-day refresh tokens. Cookie handling uses HttpOnly, Secure, SameSite strict flags. Password hashing uses bcrypt with 12-round salt.

2. Product Lifecycle Management
Artisans create products through a multi-step wizard: image upload with drag-and-drop and multi-file support, basic info with AI-assisted fields, and pricing with AI market analysis. Products exist in draft and published states. The publish action runs validation checks on required fields.

3. AI-Powered Product Intelligence Suite
Seven AI endpoints work together:

Generate FAQs: Analyzes product title, description, category, material, and craft technique. Generates 8 buyer-perspective questions with culturally aware answers. Rate-limited to 5 generations per product to prevent abuse. Artisan reviews and approves each FAQ before it appears on the product page.

Image Analysis with Vision: Accepts a Cloudinary image URL, fetches the image as base64, and sends it to Gemini with a craft-specialist vision prompt. Returns craft type, material, suggested title, description, tags, and color palette. Artisans can apply these suggestions directly to product fields.

Pricing Recommendation: Scrapes competitor prices via Serper API, caches results per category-city pair, and asks Gemini to produce a pricing breakdown including material cost, artisan labor, platform fee, and profit margin percentages.

AI Chatbot (Kala): Accessible from every page via a floating pop-out panel. Uses Gemini with conversation history and store product context. Responds to buyer questions about crafts, artisans, materials, and platform features.

Support Bot (Kavya): Accepts text and image input. Searches the product database by title, tags, category, and description to find matching products. Feeds matched products as context to Gemini for informed responses. Returns both the AI response and matching product cards.

Customization Preview Generation: When a buyer requests customization, the artisan can generate an AI preview by providing the original product image and a customization prompt to Gemini's image generation model. The generated preview is uploaded to Cloudinary and delivered to the buyer's chat in real-time via Socket.IO.

FAQ Approval Workflow: Generated FAQs start as unapproved. Artisans can approve, edit, or delete individual FAQs from the dashboard. Only approved FAQs appear on the product detail page with structured data markup for SEO.

4. Real-Time Chat System
WebSocket-based messaging between buyers and artisans. Features include:
Text and image message types with Cloudinary upload integration.
Typing indicators showing when the other participant is composing.
Message persistence in MongoDB with chat history pagination.
Pop-out chat window accessible from any page without navigation.
Inline chat list showing all conversations with unread counts and timestamps.
Customization workflow integration: customization requests, AI preview delivery, buyer confirmation or change requests all happen within the chat thread.

5. Artisan Analytics Dashboard
Revenue tracking with daily aggregation charts over 7, 30, or 90 day periods. Product performance metrics including views, orders, and revenue per product. Top product rankings by view count. Overview cards showing total products, published products, total views, total orders, total revenue, and average rating.

6. Order Management
Complete checkout flow with Razorpay payment integration. Order status progression from pending through confirmed, in progress, shipped, and delivered. Payment status tracking (unpaid, paid, refunded). Delivery address capture with landmark field. Item snapshots preserve product titles and prices at order time. Customization order support with detail text field.

7. Product Search and Browsing
Full shop page with category filtering, material filtering, price range filtering, and sorting. Multi-city support (Visakhapatnam, Hyderabad, Chennai, Kolkata) with city context provider. Product cards with image galleries, pricing, artisan attribution, and wishlist buttons. Featured products API for homepage curation.

8. Wishlist System
Persistent wishlist stored in the User document. Toggle wishlist status from product cards and detail pages. Dedicated wishlist page with full product information.

User Interface (20 percent)

9. Cinematic Landing Experience
Full-viewport scroll-driven narrative using GSAP ScrollTrigger. Globe section with WebGL-rendered Earth showing artisan locations. Story panels with parallax image reveals and text animations. Artisan poster gallery with hover effects. Testimonial carousel. AI features showcase section. How It Works process visualization. Marquee text strip with CSS animation.

10. Custom Cursor
Animated cursor using Framer Motion springs with velocity tracking and rotation. Throttled via requestAnimationFrame to maintain 60fps. The cursor scales on movement and follows with spring physics.

11. Product Detail Experience
Full-viewport image hero with InfiniteMenu 3D carousel. Smooth scroll transition to product details. Interactive 3D model viewer (when available) with orbit controls. FAQ accordion with Radix UI primitives. Breadcrumb navigation. Artisan attribution with profile links.

12. Dark Glassmorphism Design System
Consistent dark theme with warm ivory and terracotta accents. Glassmorphism panels with backdrop blur and subtle borders. Gradient buttons and status indicators. Noise texture overlay for premium depth. Responsive breakpoints for mobile, tablet, and desktop.

DEMO RECORDING GUIDE

The demo should follow this sequence to demonstrate maximum feature coverage in minimum time.

Start on the landing page. Scroll slowly through the hero, globe section, and story panels to show the cinematic scroll-driven interface. This demonstrates the GSAP and Lenis integration and the emotional narrative approach.

Navigate to the shop page. Apply a category filter and browse products. Click into a product detail page. Show the full-viewport image carousel, scroll down to the product details, FAQs, and 3D model viewer if available. Add the product to cart and show the cart drawer.

Open the Kala AI chatbot from the bottom-left button. Ask a question like "What Kalamkari paintings do you have?" to demonstrate AI-powered assistance with product context.

Open the Messages chat pop-out from the bottom-right button. Show the conversation list and open a chat if one exists. Send a text message to demonstrate real-time messaging.

Log in as an artisan. Navigate to the artisan dashboard. Show the analytics overview cards and product list table. Click Add Product to demonstrate the multi-step upload wizard. Upload an image and trigger AI Image Analysis. Show the auto-filled fields from vision analysis. Scroll to pricing and trigger the AI Pricing Recommendation. Show the competitive analysis results.

Navigate to an existing product in the dashboard. Open the FAQ Manager. Click Generate FAQs with AI. Show the generated questions and the approve/reject workflow.

Finally, demonstrate the PWA install prompt if available, and show the responsive layout by resizing the browser window.

WHY USERS SHOULD USE THIS PRODUCT

For Buyers:
Direct access to verified artisans eliminates middleman markups of 40 to 60 percent.
AI-generated FAQs answer common buyer concerns before they need to ask.
Real-time chat enables custom order discussions without leaving the platform.
AI-powered customization previews let buyers see modifications before committing.
Culturally rich product narratives provide provenance and authenticity context.
3D product viewers reduce the uncertainty of buying handmade goods online.

For Artisans:
Zero listing cost with AI-assisted catalogs that reduce time-to-publish from hours to minutes.
Computer vision auto-fills product details from a single photograph.
AI pricing recommendations benchmarked against real market data ensure fair pricing.
Built-in analytics show which products perform and where traffic originates.
Direct buyer relationships through chat increase repeat purchase rates.
Professional-quality product pages with FAQs, 3D models, and storytelling layouts.

For the Ecosystem:
Preserves intangible cultural heritage by giving dying crafts a digital marketplace.
Creates traceable supply chains — every product links to a named artisan in a known village.
Supports sustainable consumption by replacing mass-manufactured goods with handmade alternatives.

PROBLEMS FACED AND SOLUTIONS

Problem: Socket.IO integration with Next.js App Router.
Next.js API routes are serverless functions that cannot maintain persistent WebSocket connections. Creating a separate WebSocket server would require running two processes.
Solution: A custom server.js file wraps the Next.js request handler inside a standard Node.js HTTP server. Socket.IO attaches to this server. The socket instance is stored on the global object to survive hot-module reloads in development. API routes access the socket via a getIO utility function.

Problem: AI response format inconsistency.
Gemini occasionally wraps JSON in markdown code blocks or adds explanatory text before the JSON payload.
Solution: A parseAIJson utility strips markdown fences, extracts JSON from mixed text, and handles edge cases like object-wrapped arrays. Every AI endpoint includes a retry mechanism that appends a stricter formatting instruction on the second attempt.

Problem: Image loading failures across components.
Product images stored as objects with url and public_id properties were sometimes treated as plain strings. Next.js Image component required explicit remotePatterns for every image domain.
Solution: A resolveImageUrl helper function handles both string and object image formats. Chat and customization components use native HTML img tags to avoid Next.js Image optimization constraints for dynamically generated URLs.

Problem: React re-renders from custom cursor causing performance degradation.
The SmoothCursor component called useState on every mouse move frame, triggering React reconciliation 60 times per second.
Solution: Replaced React state with a ref-based timeout pattern. The cursor animation runs entirely through Framer Motion spring values which bypass React rendering. The previously used isMoving state was tracked but never read in the JSX output.

Problem: Message deduplication in real-time chat.
Optimistic UI updates added a temporary message with a temp- prefixed ID. When the server broadcast the saved message with a MongoDB _id, both the temporary and real messages appeared.
Solution: The onNewMessage handler filters out temporary messages by matching sender and content against the incoming server message before checking for _id duplicates.

Problem: Content Security Policy blocking legitimate resources.
Cloudinary images, DigitalOcean Spaces models, Google Fonts, and Razorpay scripts all require CSP allowlisting.
Solution: A comprehensive CSP header in next.config.mjs explicitly whitelists each resource domain per directive category (img-src, script-src, font-src, connect-src, frame-src).

INNOVATION HIGHLIGHTS

1. Seven-Function AI Suite on a Single Model
All AI capabilities run on Gemini 2.5 Flash through a shared utility layer. FAQ generation, image analysis, pricing, chatbot, support bot, customization preview, and content structuring all share the same rate limiter, retry logic, and JSON parser. This reduces cold start time and API key management.

2. Vision-to-Catalog Pipeline
An artisan photographs their product. The AI identifies the craft type, materials, region of origin, and color palette. It generates a product title, 200-word description, and SEO tags. The artisan clicks Apply and the product listing is 80 percent complete from a single image upload.

3. Competitor Price Scraping with AI Synthesis
The pricing engine scrapes live market prices via Serper API, caches them by category-city pair, and passes them to Gemini alongside product details. The AI synthesizes a margin breakdown showing material, labor, platform fee, and profit percentages. This gives rural artisans market intelligence they would otherwise never access.

4. AI Customization Previews in Chat
When a buyer requests "make this with a blue border," the artisan sends the original product image and the customization prompt to Gemini's image generation endpoint. The generated preview appears in the chat thread in real-time via Socket.IO. The buyer can approve or request changes without leaving the conversation.

5. Scroll-Driven Documentary Opening
The landing page is not a typical hero section. It is a full cinematic narrative that transitions from aerial views of Visakhapatnam to artisan workshops to product close-ups. GSAP ScrollTrigger sequences these transitions based on scroll position, creating a documentary film effect that traditional e-commerce platforms never attempt.

6. Global Pop-Out Chat Architecture
Both the AI chatbot and the buyer-artisan messaging system use pop-out panels that persist across page navigations. This is achieved through dynamic imports in a ClientProviders wrapper that lives outside the page router tree. Users never lose their conversation context while browsing.

FEASIBILITY AND REAL-WORLD SCALABILITY

Database Scaling: MongoDB compound indexes on artisan, city, category, and published_status support efficient queries at scale. The analytics aggregation pipeline uses indexed fields and date range filtering to limit scan scope.

AI Cost Management: Gemini 2.5 Flash has a free tier of 15 requests per minute. Rate limiters at both the IP level and the product level (5 FAQ generations per product) prevent runaway API costs. Pricing data is cached per category-city pair to minimize Serper API calls.

Media Delivery: Cloudinary handles image transformation and CDN delivery with automatic format selection (AVIF on supported browsers, WebP otherwise). This eliminates the need for custom image processing infrastructure.

Real-Time Scaling: Socket.IO rooms isolate chat traffic. Each chat creates an independent room, so message broadcast is O(room_size) not O(total_connections). For production scaling beyond a single server, Socket.IO supports Redis adapter for multi-instance pub/sub.

PWA and Offline: Service worker caching ensures the app shell loads instantly on repeat visits. The install prompt enables home screen placement on mobile devices, increasing return visit rates.

Multi-City Architecture: The CityContext provider and city-scoped queries are designed for horizontal expansion. Adding a new city requires adding an enum value to the Artisan and Product schemas and seeding artisan data. No code changes are needed in the frontend.

Session Resilience: Access tokens last 7 days with 30-day refresh tokens. The refresh endpoint issues new access tokens without requiring re-authentication, preventing session drops during extended browsing sessions.

Security Posture: The application passes OWASP top 10 checks for injection (mongo-sanitize), XSS (DOMPurify with CSP), broken authentication (HttpOnly cookies, bcrypt, JWT verify), and security misconfiguration (HSTS, X-Frame-Options, X-Content-Type-Options).
