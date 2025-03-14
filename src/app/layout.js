import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ProtectedRoute from '../components/ProtectedRoute';
import PreventBackNavigation from '../components/PreventBackNavigation';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Personal-Loan Flashfund",
  description: "Generated by create next app",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ProtectedRoute>
        <PreventBackNavigation>
        {children}
        </PreventBackNavigation>
        </ProtectedRoute>
      </body>
    </html>
  );
}
