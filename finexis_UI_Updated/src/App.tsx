import { useState } from "react";
import AuthApp from "./components/auth/AuthApp";
import AdminApp from "./components/admin/AdminApp";
import UserApp from "./components/user/UserApp";
import Nav from "./components/Nav";
import Hero from "./components/Hero";
import TrustBar from "./components/TrustBar";
import ClientSegments from "./components/ClientSegments";
import AnalyserGrid from "./components/AnalyserGrid";
import DataSources from "./components/DataSources";
import IntelligenceEngine from "./components/IntelligenceEngine";
import AutoDetects from "./components/AutoDetects";
import InvestigationWorkflows from "./components/InvestigationWorkflows";
import PlatformCapabilities from "./components/PlatformCapabilities";
import Outputs from "./components/Outputs";
import DemoForm from "./components/DemoForm";
import Footer from "./components/Footer";

export default function App() {
  const [view, setView] = useState<"site" | "auth" | "admin" | "user">("site");

  return (
    <>
      {/* Dev toggle */}
      {/* <div className="fixed bottom-4 right-4 z-[9999] flex gap-2">
        <button onClick={() => setView("site")}
          className={`rounded-full px-4 py-1.5 text-[12px] font-semibold shadow transition-colors ${view==="site" ? "bg-forensic-500 text-white" : "bg-white text-ink border border-line"}`}>
          Landing Page
        </button>
        <button onClick={() => setView("auth")}
          className={`rounded-full px-4 py-1.5 text-[12px] font-semibold shadow transition-colors ${view==="auth" ? "bg-forensic-500 text-white" : "bg-white text-ink border border-line"}`}>
          Auth Pages
        </button>
        <button onClick={() => setView("user")}
          className={`rounded-full px-4 py-1.5 text-[12px] font-semibold shadow transition-colors ${view==="user" ? "bg-forensic-500 text-white" : "bg-white text-ink border border-line"}`}>
          Investigator App
        </button>
        <button onClick={() => setView("admin")}
          className={`rounded-full px-4 py-1.5 text-[12px] font-semibold shadow transition-colors ${view==="admin" ? "bg-forensic-500 text-white" : "bg-white text-ink border border-line"}`}>
          Admin Panel
        </button>
      </div> */}

      {view === "auth" && (
        <AuthApp
          onLoginSuccess={(creds) => {
            if (creds?.email?.trim() === "officer@gov.in" && creds?.password === "Pass@1234") {
              setView("admin");
            } else {
              setView("user");
            }
          }}
        />
      )}
      {view === "admin" && <AdminApp onSignOut={() => setView("site")} />}
      {view === "user" && <UserApp initialPage="case-manager" onSignOut={() => setView("site")} />}
      {view === "site" && (
        <div className="min-h-screen bg-paper">
          <Nav onLogin={() => setView("auth")} />
          <main>
            <Hero />
            <TrustBar />
            <ClientSegments />
            <AnalyserGrid />
            <DataSources />
            <IntelligenceEngine />
            <AutoDetects />
            <InvestigationWorkflows />
            <PlatformCapabilities />
            <Outputs />
            <DemoForm />
          </main>
          <Footer />
        </div>
      )}
    </>
  );
}
