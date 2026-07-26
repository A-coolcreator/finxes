import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { buildCaseWorkspaceAnalytics, type CaseWorkspaceAnalytics } from "../lib/caseAnalytics";
import { caseService } from "../services/caseService";
import type { CaseRecord } from "../types/case";
import type { PersonRecord } from "../types/person";
import type { ApiTransaction } from "../types/transaction";
import type { UserPage } from "../components/user/UserApp";

interface CaseContextValue {
  page: UserPage;
  setPage: (page: UserPage) => void;
  cases: CaseRecord[];
  casesLoading: boolean;
  casesError: string | null;
  selectedCaseId: string | null;
  selectedCase: CaseRecord | null;
  persons: PersonRecord[];
  workspace: CaseWorkspaceAnalytics | null;
  workspaceLoading: boolean;
  workspaceError: string | null;
  openCase: (caseId: string, nextPage?: UserPage) => void;
  refreshCases: () => Promise<void>;
  refreshWorkspace: () => Promise<void>;
  toggleTransactionFlag: (transactionId: string) => Promise<void>;
}

const CaseContext = createContext<CaseContextValue | null>(null);

export function CaseProvider({ children, initialPage = "case-manager" }: { children: ReactNode; initialPage?: UserPage }) {
  const [page, setPage] = useState<UserPage>(initialPage);
  const [cases, setCases] = useState<CaseRecord[]>([]);
  const [casesLoading, setCasesLoading] = useState(true);
  const [casesError, setCasesError] = useState<string | null>(null);
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [selectedCase, setSelectedCase] = useState<CaseRecord | null>(null);
  const [persons, setPersons] = useState<PersonRecord[]>([]);
  const [workspace, setWorkspace] = useState<CaseWorkspaceAnalytics | null>(null);
  const [workspaceLoading, setWorkspaceLoading] = useState(false);
  const [workspaceError, setWorkspaceError] = useState<string | null>(null);

  const refreshCases = useCallback(async () => {
    setCasesLoading(true);
    setCasesError(null);
    try {
      const records = await caseService.listCases();
      setCases(records.filter((record) => record.status?.toUpperCase() !== "ARCHIVED"));
    } catch (error) {
      setCasesError(error instanceof Error ? error.message : "Unable to load cases");
    } finally {
      setCasesLoading(false);
    }
  }, []);

  const loadWorkspace = useCallback(async (caseId: string) => {
    setWorkspaceLoading(true);
    setWorkspaceError(null);
    try {
      const [caseRecord, personRecords, transactions] = await Promise.all([
        caseService.getCaseById(caseId),
        caseService.getPersons(caseId),
        caseService.getTransactions(caseId),
      ]);

      setSelectedCase(caseRecord);
      setPersons(personRecords as PersonRecord[]);
      setWorkspace(
        buildCaseWorkspaceAnalytics(
          caseRecord,
          personRecords as PersonRecord[],
          transactions as ApiTransaction[]
        )
      );
    } catch (error) {
      setWorkspace(null);
      setWorkspaceError(error instanceof Error ? error.message : "Unable to load case workspace");
    } finally {
      setWorkspaceLoading(false);
    }
  }, []);

  const refreshWorkspace = useCallback(async () => {
    if (!selectedCaseId) return;
    await loadWorkspace(selectedCaseId);
  }, [loadWorkspace, selectedCaseId]);

  const openCase = useCallback(
    (caseId: string, nextPage: UserPage = "case-overview") => {
      setSelectedCaseId(caseId);
      setPage(nextPage);
    },
    []
  );

  const toggleTransactionFlag = useCallback(
    async (transactionId: string) => {
      await caseService.toggleTransactionFlag(transactionId);
      await refreshWorkspace();
    },
    [refreshWorkspace]
  );

  useEffect(() => {
    void refreshCases();
  }, [refreshCases]);

  useEffect(() => {
    if (!selectedCaseId) {
      setSelectedCase(null);
      setPersons([]);
      setWorkspace(null);
      return;
    }
    void loadWorkspace(selectedCaseId);
  }, [loadWorkspace, selectedCaseId]);

  const value = useMemo(
    () => ({
      page,
      setPage,
      cases,
      casesLoading,
      casesError,
      selectedCaseId,
      selectedCase,
      persons,
      workspace,
      workspaceLoading,
      workspaceError,
      openCase,
      refreshCases,
      refreshWorkspace,
      toggleTransactionFlag,
    }),
    [
      page,
      cases,
      casesLoading,
      casesError,
      selectedCaseId,
      selectedCase,
      persons,
      workspace,
      workspaceLoading,
      workspaceError,
      openCase,
      refreshCases,
      refreshWorkspace,
      toggleTransactionFlag,
    ]
  );

  return <CaseContext.Provider value={value}>{children}</CaseContext.Provider>;
}

export function useCaseContext() {
  const context = useContext(CaseContext);
  if (!context) {
    throw new Error("useCaseContext must be used within CaseProvider");
  }
  return context;
}
