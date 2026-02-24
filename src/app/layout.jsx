import { Playfair_Display, Inter, Space_Mono } from "next/font/google";
import "./globals.css";
import ToastProvider from "@/components/ui/ToastProvider";
import { CityProvider } from "@/contexts/CityContext";
import { CartProvider } from "@/contexts/CartContext";
import CartDrawer from "@/components/cart/CartDrawer";

const playfair = Playfair_Display({
    variable: "--font-playfair",
    subsets: ["latin"],
    display: "swap",
    weight: ["400", "500", "600", "700"],
    style: ["normal", "italic"],
});

const inter = Inter({
    variable: "--font-inter",
    subsets: ["latin"],
    display: "swap",
    weight: ["300", "400", "500", "600", "700"],
});

const spaceMono = Space_Mono({
    variable: "--font-space",
    subsets: ["latin"],
    display: "swap",
    weight: ["400", "700"],
});

export const metadata = {
    title: "StoryCraft — Handcrafted Art from Visakhapatnam",
    description:
        "Discover handcrafted art from the craftspeople of Visakhapatnam. Each piece carries a legacy. Direct trade, fair prices, traceable from hand to home.",
    keywords: [
        "Visakhapatnam",
        "handicrafts",
        "artisan",
        "Kalamkari",
        "Kondapalli",
        "handmade",
        "Indian crafts",
        "e-commerce",
    ],
    openGraph: {
        title: "StoryCraft — Handcrafted Art from Visakhapatnam",
        description:
            "Where hands tell stories. Discover handcrafted art from the craftspeople of Visakhapatnam.",
        type: "website",
    },
};

export default function RootLayout({ children }) {
    return (
        <html lang="en" className="scroll-smooth" suppressHydrationWarning>
            <body
                className={`${playfair.variable} ${inter.variable} ${spaceMono.variable} antialiased`}
                suppressHydrationWarning
            >
                <div className="noise-overlay" aria-hidden="true" />
                <CityProvider>
                    <CartProvider>
                        {children}
                        <CartDrawer />
                    </CartProvider>
                </CityProvider>
                <ToastProvider />
            </body>
        </html>
    );
}

