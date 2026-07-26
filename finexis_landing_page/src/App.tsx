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
  return (
    <div className="min-h-screen bg-paper">
      <Nav />
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
  );
}
