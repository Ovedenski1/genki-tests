import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Pokotoba",
  description: "Pokotoba website",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={nunito.className}>
        <div className="flex min-h-screen flex-col">
          <Navbar />

          <div className="flex flex-1 flex-col">
            {children}
          </div>

          <Footer />
        </div>
      </body>
    </html>
  );
}