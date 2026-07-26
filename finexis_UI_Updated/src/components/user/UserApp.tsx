import Sidebar from "./Sidebar";
import DashboardPage from "./DashboardPage";
import CaseManagerPage from "./CaseManagerPage";
import CreateCaseWizardPage from "./CreateCaseWizardPage";
import CaseOverviewPage from "./CaseOverviewPage";
import StatementAnalysisPage from "./StatementAnalysisPage";
import TransactionIntelligencePage from "./TransactionIntelligencePage";
import DigitalSpendPage from "./DigitalSpendPage";
import UpiIntelligencePage from "./UpiIntelligencePage";
import FundFlowPage from "./FundFlowPage";
import CryptoIntelligencePage from "./CryptoIntelligencePage";
import MuleIntelligencePage from "./MuleIntelligencePage";
import FindingsPage from "./FindingsPage";
import EvidenceLockerPage from "./EvidenceLockerPage";
import ReportsPage from "./ReportsPage";
import RecentActivityPage from "./RecentActivityPage";
import SavedSearchesPage from "./SavedSearchesPage";
import ProfileSettingsPage from "./ProfileSettingsPage";
import NoticeGeneratorPage from "./NoticeGeneratorPage";
import { CaseProvider, useCaseContext } from "../../context/CaseContext";

export type UserPage =
  | "dashboard"
  | "case-manager"
  | "create-case"
  | "case-overview"
  | "statement-analysis"
  | "transaction-intelligence"
  | "digital-spend"
  | "upi-intelligence"
  | "fund-flow"
  | "crypto-intelligence"
  | "mule-intelligence"
  | "findings"
  | "evidence-locker"
  | "reports"
  | "notice-generator"
  | "recent-activity"
  | "saved-searches"
  | "profile-settings";

function UserAppContent({ onSignOut }: { onSignOut?: () => void }) {
  const { page, setPage } = useCaseContext();

  return (
    <div className="min-h-screen bg-paper flex">
      <Sidebar page={page} onNavigate={setPage} onSignOut={onSignOut} />
      <main className="flex-1 min-w-0">
        {page === "dashboard" && <DashboardPage />}
        {page === "case-manager" && <CaseManagerPage />}
        {page === "create-case" && <CreateCaseWizardPage />}
        {page === "case-overview" && <CaseOverviewPage />}
        {page === "statement-analysis" && <StatementAnalysisPage />}
        {page === "transaction-intelligence" && <TransactionIntelligencePage />}
        {page === "digital-spend" && <DigitalSpendPage />}
        {page === "upi-intelligence" && <UpiIntelligencePage />}
        {page === "fund-flow" && <FundFlowPage />}
        {page === "crypto-intelligence" && <CryptoIntelligencePage />}
        {page === "mule-intelligence" && <MuleIntelligencePage />}
        {page === "findings" && <FindingsPage />}
        {page === "evidence-locker" && <EvidenceLockerPage />}
        {page === "reports" && <ReportsPage />}
        {page === "notice-generator" && <NoticeGeneratorPage />}
        {page === "recent-activity" && <RecentActivityPage />}
        {page === "saved-searches" && <SavedSearchesPage />}
        {page === "profile-settings" && <ProfileSettingsPage />}
      </main>
    </div>
  );
}

export default function UserApp({ initialPage = "case-manager", onSignOut }: { initialPage?: UserPage; onSignOut?: () => void }) {
  return (
    <CaseProvider initialPage={initialPage}>
      <UserAppContent onSignOut={onSignOut} />
    </CaseProvider>
  );
}
