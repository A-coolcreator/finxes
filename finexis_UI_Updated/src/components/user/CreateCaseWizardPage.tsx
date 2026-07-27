import { useRef, useState } from "react";
import { Check, UploadCloud, CheckCircle2, Loader2, Plus, User, X } from "lucide-react";
import Topbar from "./Topbar";
import Badge from "../admin/Badge";
import { useCaseContext } from "../../context/CaseContext";
import { caseService } from "../../services/caseService";
import type { CaseRecord } from "../../types/case";

const STEPS = ["Case details", "Upload files", "Processing", "Summary"];
const inputClass =
  "w-full rounded-lg border border-line bg-surface px-3.5 py-2.5 text-[13.5px] text-ink placeholder:text-ink-faint transition-colors focus:border-forensic-500 focus:outline-none focus:ring-2 focus:ring-forensic-500/15";

function Stepper({ step }: { step: number }) {
  return (
    <div className="flex items-center gap-2 max-w-2xl">
      {STEPS.map((s, i) => (
        <div key={s} className="flex items-center flex-1 last:flex-none">
          <div className="flex items-center gap-2.5">
            <div
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[12.5px] font-semibold ${
                i < step ? "bg-forensic-500 text-white" : i === step ? "bg-forensic-500 text-white ring-4 ring-forensic-100" : "bg-line-soft text-ink-faint"
              }`}
            >
              {i < step ? <Check size={14} /> : i + 1}
            </div>
            <span className={`hidden sm:inline text-[12.5px] font-medium whitespace-nowrap ${i <= step ? "text-ink" : "text-ink-faint"}`}>{s}</span>
          </div>
          {i < STEPS.length - 1 && <div className={`h-px flex-1 mx-3 ${i < step ? "bg-forensic-500" : "bg-line"}`} />}
        </div>
      ))}
    </div>
  );
}

const readFilesAsBase64 = (files: File[]) =>
  Promise.all(
    files.map(
      (file) =>
        new Promise<{ filename: string; content: string; base64: string }>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const result = String(reader.result || "");
            const base64 = result.includes(",") ? result.split(",")[1] : result;
            resolve({ filename: file.name, content: base64, base64 });
          };
          reader.onerror = () => reject(reader.error);
          reader.readAsDataURL(file);
        })
    )
  );

interface PersonUploadData {
  personName: string;
  files: File[];
}

export default function CreateCaseWizardPage() {
  const { openCase, refreshCases } = useCaseContext();
  const fileInputRefs = useRef<{ [key: number]: HTMLInputElement | null }>({});
  const [step, setStep] = useState(0);
  const [title, setTitle] = useState("");
  const [caseNumber, setCaseNumber] = useState(`CS-${Date.now().toString().slice(-4)}`);
  const [subtitle, setSubtitle] = useState("");
  const [status, setStatus] = useState("ACTIVE");
  const [persons, setPersons] = useState<PersonUploadData[]>([{ personName: "", files: [] }]);
  const [createdCase, setCreatedCase] = useState<CaseRecord | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addPerson = () => {
    setPersons((prev) => [...prev, { personName: "", files: [] }]);
  };

  const removePerson = (index: number) => {
    setPersons((prev) => prev.filter((_, i) => i !== index));
  };

  const handlePersonNameChange = (index: number, name: string) => {
    setPersons((prev) => {
      const updated = [...prev];
      updated[index].personName = name;
      return updated;
    });
  };

  const handleFilesChange = (index: number, files: File[]) => {
    setPersons((prev) => {
      const updated = [...prev];
      updated[index].files = files;
      return updated;
    });
  };

  const openFileInput = (index: number) => {
    fileInputRefs.current[index]?.click();
  };

  const getTotalFilesCount = () => {
    return persons.reduce((sum, p) => sum + p.files.length, 0);
  };

  const submitCase = async () => {
    console.log(`[FRONTEND-LOG] [submitCase] Started. title="${title}", caseNumber="${caseNumber}", personsCount=${persons.length}`);
    setProcessing(true);
    setError(null);
    setStep(2);
    try {
      // Read all files for all persons
      const personData = await Promise.all(
        persons.map(async (person) => {
          const files = person.files.length ? await readFilesAsBase64(person.files) : [];
          // Add personName to each file object
          return {
            personName: person.personName || `Person ${persons.indexOf(person) + 1}`,
            files: files.map(f => ({ ...f, personName: person.personName || `Person ${persons.indexOf(person) + 1}` }))
          };
        })
      );

      console.log(`[FRONTEND-LOG] [submitCase] Encoded files for ${personData.length} persons. Calling caseService.createCase...`);
      // Flatten personData to single files array with personName attached
      const allFilesWithPerson = personData.flatMap(p => p.files);
      const record = await caseService.createCase({
        caseNumber,
        title: title || caseNumber,
        subtitle,
        status,
        files: allFilesWithPerson,
        personData
      });
      console.log(`[FRONTEND-LOG] [submitCase] caseService.createCase succeeded. Response:`, record);
      setCreatedCase(record);
      await refreshCases();
      setStep(3);
    } catch (err) {
      console.error(`[FRONTEND-LOG] [submitCase] ERROR:`, err);
      setError(err instanceof Error ? err.message : "Unable to create case");
      setStep(1);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div>
      <Topbar title="Create Investigation" subtitle="Set up a new case and upload statements to the backend" />

      <div className="px-5 py-6 lg:px-8 lg:py-8 space-y-6 max-w-4xl">
        <Stepper step={step} />
        {error && <div className="rounded-lg border border-flag-200 bg-flag-50 px-4 py-3 text-[13px] text-flag-700">{error}</div>}

        <div className="rounded-xl border border-line bg-surface shadow-card p-6">
          {step === 0 && (
            <div className="space-y-4">
              <h2 className="font-display text-[16px] font-semibold text-ink">Case details</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] font-medium text-ink mb-1.5">Case name</label>
                  <input className={inputClass} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Mule network — Sector 12" />
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-ink mb-1.5">Case number</label>
                  <input className={inputClass} value={caseNumber} onChange={(e) => setCaseNumber(e.target.value)} />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[13px] font-medium text-ink mb-1.5">Subtitle / reference</label>
                  <input className={inputClass} value={subtitle} onChange={(e) => setSubtitle(e.target.value)} placeholder="FIR / complaint reference" />
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-ink mb-1.5">Status</label>
                  <select className={inputClass} value={status} onChange={(e) => setStatus(e.target.value)}>
                    <option value="ACTIVE">Active</option>
                    <option value="CRITICAL">Critical</option>
                    <option value="CLOSED">Closed</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-6">
              <h2 className="font-display text-[16px] font-semibold text-ink">Upload files by person</h2>
              
              {persons.map((person, index) => (
                <div key={index} className="rounded-lg border border-line bg-paper p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <User size={16} className="text-forensic-500" />
                      <label className="block text-[13px] font-medium text-ink">Person name</label>
                    </div>
                    {persons.length > 1 && (
                      <button
                        onClick={() => removePerson(index)}
                        className="text-ink-faint hover:text-red-500 transition-colors"
                        title="Remove person"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                  
                  <input
                    className={inputClass}
                    value={person.personName}
                    onChange={(e) => handlePersonNameChange(index, e.target.value)}
                    placeholder="e.g. Lakshit Verma"
                  />

                  <div>
                    <label className="block text-[13px] font-medium text-ink mb-2">Upload PDFs for this person</label>
                    <input
                      ref={(el) => (fileInputRefs.current[index] = el)}
                      type="file"
                      multiple
                      accept=".pdf,.csv,.xlsx,.xls"
                      className="hidden"
                      onChange={(e) => handleFilesChange(index, Array.from(e.target.files || []))}
                    />
                    
                    {person.files.length > 0 ? (
                      <ul className="divide-y divide-line-soft rounded-lg border border-line-soft">
                        {person.files.map((file, fIdx) => (
                          <li key={`${file.name}-${fIdx}`} className="flex items-center justify-between px-3.5 py-2.5 text-[13px] text-ink">
                            <div className="flex items-center gap-2">
                              <Badge tone="green">PDF</Badge>
                              {file.name}
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <button
                        onClick={() => openFileInput(index)}
                        className="w-full rounded-lg border border-dashed border-line bg-surface px-4 py-6 text-[13px] text-ink-muted hover:bg-paper hover:border-forensic-300 transition-colors"
                      >
                        <UploadCloud size={24} className="mx-auto mb-2 text-forensic-400" />
                        Click to upload PDFs for {person.personName || "this person"}
                      </button>
                    )}
                  </div>
                </div>
              ))}

              <button
                onClick={addPerson}
                className="flex items-center gap-2 rounded-lg border border-line bg-paper px-4 py-3 text-[13px] font-medium text-ink hover:bg-forensic-50 hover:border-forensic-200 transition-colors"
              >
                <Plus size={16} className="text-forensic-500" />
                Add another person
              </button>

              <div className="rounded-lg bg-forensic-50/50 px-4 py-3 text-[12.5px] text-forensic-700">
                Total files to upload: <span className="font-semibold">{getTotalFilesCount()}</span> across{" "}
                <span className="font-semibold">{persons.length}</span> person(s)
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5 text-center py-8">
              <Loader2 size={28} className="mx-auto text-forensic-500 animate-spin" />
              <h2 className="font-display text-[16px] font-semibold text-ink">Creating case and parsing statements…</h2>
              <p className="text-[13px] text-ink-muted">
                Processing {persons.length} person(s) with {getTotalFilesCount()} PDF file(s).
              </p>
            </div>
          )}

          {step === 3 && createdCase && (
            <div className="space-y-5">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 size={20} className="text-forensic-600" />
                <h2 className="font-display text-[16px] font-semibold text-ink">Case created successfully</h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="rounded-lg border border-line-soft bg-paper p-3.5 text-center">
                  <p className="font-display text-[20px] font-semibold text-ink">{createdCase.caseNumber}</p>
                  <p className="text-[11.5px] text-ink-muted">Case number</p>
                </div>
                <div className="rounded-lg border border-line-soft bg-paper p-3.5 text-center">
                  <p className="font-display text-[20px] font-semibold text-ink">{createdCase.triggerCount || 0}</p>
                  <p className="text-[11.5px] text-ink-muted">Transactions loaded</p>
                </div>
                <div className="rounded-lg border border-line-soft bg-paper p-3.5 text-center">
                  <p className="font-display text-[15px] font-semibold text-ink">{createdCase.status}</p>
                  <p className="text-[11.5px] text-ink-muted">Status</p>
                </div>
              </div>
            </div>
          )}

          <div className="mt-8 flex items-center justify-between border-t border-line-soft pt-5">
            <button onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0 || processing} className="rounded-lg border border-line px-4 py-2.5 text-[13.5px] font-medium text-ink-muted hover:bg-paper transition-colors disabled:opacity-40">Back</button>
            {step < 3 ? (
              <button
                onClick={() => {
                  if (step === 1) void submitCase();
                  else setStep((s) => Math.min(3, s + 1));
                }}
                disabled={processing || (step === 0 && !title && !caseNumber)}
                className="rounded-lg bg-forensic-500 px-5 py-2.5 text-[13.5px] font-semibold text-white hover:bg-forensic-600 transition-colors disabled:opacity-40"
              >
                {step === 1 ? "Create & process" : "Continue"}
              </button>
            ) : (
              <button onClick={() => openCase(createdCase!.id, "case-overview")} className="rounded-lg bg-forensic-500 px-5 py-2.5 text-[13.5px] font-semibold text-white hover:bg-forensic-600 transition-colors">
                Start investigation
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
