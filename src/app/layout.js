import { Geist, Geist_Mono, Orbit } from "next/font/google";
import "./globals.css";
import Head from "next/head";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const orbit = Orbit({
  weight: '400',
  subsets: ['latin'],
});

export const metadata = {
  title: 'League of Quantum',
  description: 'Experience the future of quantum-powered dining.',
  themeColor: '#000000'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">

      <Head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </Head>

      <body
        className={`${geistSans.variable} ${geistMono.variable} ${orbit.className} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
