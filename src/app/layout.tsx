import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Navbar } from "@/components/Navbar";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "EventSphere | Discover & Launch Experiences",
  description: "Next-gen ticketing platform for creators and attendees.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} bg-dark-bg text-white antialiased min-h-full`}>
        <Providers>
          <Navbar />
          {children}
          <Toaster theme="dark" position="bottom-right" />
          <script src="https://checkout.razorpay.com/v1/checkout.js" async></script>
        </Providers>
      </body>
    </html>
  );
}
