import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
 title: "CareerPilot | Academic & Career Mentorship",
 description: "AI-powered personalized recommendations and a personal AI clone to help you land your dream role.",
};

export default function RootLayout({
 children,
}: {
 children: React.ReactNode;
}) {
 return (
 <html lang="en" suppressHydrationWarning>
 <head>
 <script
 dangerouslySetInnerHTML={{
 __html: `
 (function() {
 try {
 var theme = localStorage.getItem('theme');
 if (theme === 'light') {
 document.documentElement.classList.remove('dark');
 } else {
 document.documentElement.classList.add('dark');
 }
 } catch(e) {
 document.documentElement.classList.add('dark');
 }
 })();
 `,
 }}
 />
 <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" integrity="sha512-DTOQO9RWCH3ppGqcWaEA1BIZOC6xxalwEsw9c2QQeAIftl+Vegovlnee1c9QX4TctnWMn13TZye+giMm8e2LwA==" crossOrigin="anonymous" referrerPolicy="no-referrer" />
 </head>
 <body className={`${inter.className} antialiased`} suppressHydrationWarning>
 <Providers>{children}</Providers>
 </body>
 </html>
 );
}
