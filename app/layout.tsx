import "./globals.css";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Faqih Muntashir",
  description:
    "Just your typical 10X Engineer wannabe who cares about developer and user experience.",
};

type RootLayoutProps = {
  children: React.ReactNode;
  modal: React.ReactNode;
};

export default function RootLayout({ children, modal }: RootLayoutProps) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        {modal}
        <Analytics />
      </body>
    </html>
  );
}
