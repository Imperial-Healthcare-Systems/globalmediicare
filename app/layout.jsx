import "./globals.css";

const SITE = "https://www.globalmediicare.com";
const TITLE = "Globalmediicare — World-Class Healthcare in India";
const DESC =
  "Globalmediicare is an international medical concierge connecting patients worldwide with India's leading doctors and accredited hospitals — free case management, transparent estimates in 48 hours, visa and travel handled.";

export const metadata = {
  metadataBase: new URL(SITE),
  title: TITLE,
  description: DESC,
  icons: { icon: "/favicon.png" },
  alternates: { canonical: "/" },
  openGraph: {
    title: TITLE,
    description: DESC,
    type: "website",
    url: SITE,
    siteName: "Globalmediicare",
    images: [{ url: "/assets/dest-in.jpg", width: 1200, height: 630, alt: "Globalmediicare" }],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESC,
    images: ["/assets/dest-in.jpg"],
  },
};

export const viewport = {
  themeColor: "#0D3B36",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600&family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
