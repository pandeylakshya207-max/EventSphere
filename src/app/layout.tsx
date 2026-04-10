import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { LocalToSupabaseMigration } from "@/components/LocalToSupabaseMigration";
import { Navbar } from "@/components/Navbar";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

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
      <body className={`${outfit.className} bg-dark-bg text-white antialiased min-h-full`}>
        <Providers>
          <LocalToSupabaseMigration />
          <Navbar />
          {children}
          <Toaster theme="dark" position="bottom-right" />
        </Providers>
      </body>
    </html>
  );
}

