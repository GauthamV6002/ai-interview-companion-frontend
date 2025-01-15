"use client"
import "./globals.css";
import type { Metadata } from "next";
import { ThemeProvider } from "@/components/Theme/ThemeProvider";
import { AuthProvider } from "@/context/AuthContext";
// import { AuthProvider } from "@/context/AuthContext";

// export const metadata: Metadata = {
//   title: "AI Interview Companion",
//   description: "For UBC Research Study",
// };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
