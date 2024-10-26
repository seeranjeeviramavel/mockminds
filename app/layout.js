import localFont from "next/font/local";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
import "./css/style.css";
import { TooltipProvider } from "@/components/ui/tooltip";
// Local fonts
const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata = {
  title: "Mock Minds",
  description: "by Seeranjeevi Ramavel",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
       <TooltipProvider>
      <html lang="en">
        <body
          class={`${geistSans.variable} ${geistMono.variable} ${inter.variable} antialiased`}
        >
          {children}
        </body>
        <Toaster />
      </html>
      </TooltipProvider>
    </ClerkProvider>
  );
}
