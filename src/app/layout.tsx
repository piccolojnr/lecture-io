import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/authOptions";
import SessionProvider from "@/providers/SessionProvider";
import Navigation from "@/components/Navigation";
import { Toaster } from "react-hot-toast";
import "katex/dist/katex.min.css";

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

export const metadata: Metadata = {
  title: "Lecture IO - Interactive Learning Platform",
  description: "Transform your lecture notes into interactive study materials",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen`}
      >
        <SessionProvider session={session}>
          <Navigation />
          <main className="pt-16 min-h-screen">{children}</main>
          <Toaster />
        </SessionProvider>
      </body>
    </html>
  );
}
