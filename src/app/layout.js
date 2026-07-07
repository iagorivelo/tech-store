import "./globals.css";
import { Inter } from "next/font/google";
import { CartProvider } from "@/context/CartContext";
import Header from "@/components/layout/Header";
import CartDrawer from "@/components/cart/CartDrawer";

// Fonte self-hosted via next/font: sem request a fonts.googleapis.com e sem
// layout shift. Exposta como CSS var consumida em globals.css.
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const title = "TechStore — Produtos Premium de Tecnologia";
const description =
  "Encontre os melhores produtos de tecnologia com preços incríveis. Headphones, smartwatches, teclados, mouses e muito mais.";

export const metadata = {
  metadataBase: new URL("https://techstore.example.com"),
  title: {
    default: title,
    template: "%s · TechStore",
  },
  description,
  applicationName: "TechStore",
  keywords: ["tecnologia", "eletrônicos", "headphone", "smartwatch", "loja"],
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "TechStore",
    title,
    description,
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR" className={inter.variable}>
      <body>
        <CartProvider>
          <Header />
          <main>{children}</main>
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  );
}
