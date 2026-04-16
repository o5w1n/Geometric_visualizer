import type { Metadata } from "next";
import { JetBrains_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";
import 'katex/dist/katex.min.css';
import { ThemeProvider } from "@/components/shared/ThemeProvider";

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Geometric Analyzer",
  description: "2D Transformation Lab and 3D Physics Sandbox",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${jetbrainsMono.variable} ${spaceGrotesk.variable} antialiased`}
    >
      {/*
        Flash-prevention: runs synchronously before paint.
        If the user previously chose dark, apply .dark immediately
        so there is no white flash on reload in dark mode.
        Default (no stored pref) = light — no class needed.
      */}
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('theme');if(t==='dark')document.documentElement.classList.add('dark');}catch(e){}`,
          }}
        />
      </head>
      <body className="min-h-screen bg-base text-ink font-mono flex flex-col selection:bg-raised">
        <ThemeProvider>
          <main className="flex-1 flex flex-col">
            {children}
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
