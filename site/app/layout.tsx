import type { Metadata } from "next";
import { IBM_Plex_Sans, IBM_Plex_Sans_Condensed, IBM_Plex_Mono, IBM_Plex_Sans_Arabic } from "next/font/google";
import Sidebar from "@/components/Sidebar";
import "./globals.css";
import "./diagrams.css";

const plex = IBM_Plex_Sans({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-plex" });
const plexCond = IBM_Plex_Sans_Condensed({ subsets: ["latin"], weight: ["500", "600", "700"], variable: "--font-plex-cond" });
const plexMono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-plex-mono" });
const plexAr = IBM_Plex_Sans_Arabic({ subsets: ["arabic"], weight: ["400", "500", "600"], variable: "--font-plex-ar" });

export const metadata: Metadata = {
  title: { default: "Derja e-Access", template: "%s · Derja e-Access" },
  description: "Student project: an assistant that explains Tunisian administrative procedures in Derja, by text, speech and sign language.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${plex.variable} ${plexCond.variable} ${plexMono.variable} ${plexAr.variable}`}>
      <body>
        <div className="shell">
          <Sidebar />
          <main className="content">
            <div className="page">
              {children}
              <footer className="site">
                <span>Student project · not an official government service</span>
                <span>Team: Ayhem · Belhaj · Med Amine</span>
                <a href="https://github.com/ngcodingtn-create/e-accesibility">Source on GitHub</a>
              </footer>
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
