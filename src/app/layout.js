import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AdminLayout from "../components/AdminLayout";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Jackson Admin",
  description: "Admin Dashboard for Jackson Platform",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AdminLayout>
          {children}
        </AdminLayout>
      </body>
    </html>
  );
}
