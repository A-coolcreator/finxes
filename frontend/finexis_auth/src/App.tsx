import { useState } from "react";
import AuthApp from "./components/auth/AuthApp";
import Nav from "./components/Nav";
import Hero from "./components/Hero";
import TrustBar from "./components/TrustBar";
import Footer from "./components/Footer";

export default function App() {
  const [view, setView] = useState<"site" | "auth">("auth");

  return (
    <>
      {/* Dev toggle */}
      <div className="fixed bottom-4 right-4 z-[9999] flex gap-2">
        <button onClick={() => setView("auth")}
          className={`rounded-full px-4 py-1.5 text-[12px] font-semibold shadow transition-colors ${view==="auth" ? "bg-forensic-500 text-white" : "bg-white text-ink border border-line"}`}>
          Auth Pages
        </button>
        <button onClick={() => setView("site")}
          className={`rounded-full px-4 py-1.5 text-[12px] font-semibold shadow transition-colors ${view==="site" ? "bg-forensic-500 text-white" : "bg-white text-ink border border-line"}`}>
          Landing Page
        </button>
      </div>

      {view === "auth" ? (
        <AuthApp />
      ) : (
        <div className="min-h-screen bg-paper">
          <Nav />
          <main>
            <Hero />
            <TrustBar />
          </main>
          <Footer />
        </div>
      )}
    </>
  );
}
