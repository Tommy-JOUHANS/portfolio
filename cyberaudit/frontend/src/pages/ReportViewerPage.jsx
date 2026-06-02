import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  getReportByReference,
  getRequestByReference,
  generateReportFromFindings,
  updateRequest,
} from "../services/dataService.js";
import api from "../services/api.js";

const SEVERITIES = ["Critical", "High", "Medium", "Low"];
const EMPTY_FINDING = { severity: "Medium", asset: "", description: "", recommendation: "" };

// ── Helpers UI ────────────────────────────────────────────────────────
function severityClasses(severity) {
  const s = (severity || "").toLowerCase();
  if (s === "critical") return "bg-red-200 text-red-900";
  if (s === "high")     return "bg-red-100 text-red-700";
  if (s === "medium")   return "bg-amber-100 text-amber-700";
  return "bg-green-100 text-green-700";
}

function scoreColor(score) {
  if (score >= 70) return "bg-green-500";
  if (score >= 40) return "bg-orange-500";
  return "bg-red-500";
}

function gradeColor(grade) {
  if (["A", "B+"].includes(grade)) return "bg-green-100 text-green-700";
  if (["B", "C"].includes(grade))  return "bg-amber-100 text-amber-700";
  return "bg-red-100 text-red-700";
}

function getCurrentUser() {
  try {
    const raw = localStorage.getItem("cyberaudit:session");
    return raw ? JSON.parse(raw).user : null;
  } catch {
    return null;
  }
}

// Preview score côté client (purement indicatif — c'est le serveur qui tranche)
const SEV_WEIGHTS = { critical: 25, high: 10, medium: 4, low: 1 };
const GRADE_TH    = [[90,"A"],[80,"B+"],[70,"B"],[55,"C"],[40,"D"],[20,"E"],[0,"F"]];
function previewScore(findings) {
  if (!findings?.length) return 100;
  const d = findings.reduce(
    (s, f) => s + (SEV_WEIGHTS[(f.severity || "").toLowerCase()] ?? 1), 0);
  return Math.max(0, Math.min(100, 100 - d));
}
function previewGrade(score) {
  for (const [t, g] of GRADE_TH) if (score >= t) return g;
  return "F";
}

// ══════════════════════════════════════════════════════════════════════
export default function ReportViewerPage() {
  const { reference } = useParams();
  const [report, setReport]   = useState(null);
  const [audit, setAudit]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice]   = useState("");
  const [downloading, setDownloading] = useState(false);

  // édition
  const [editMode, setEditMode]     = useState(false);
  const [findings, setFindings]     = useState([]);
  const [summary, setSummary]       = useState("");
  const [verdict, setVerdict]       = useState("");
  const [draft, setDraft]           = useState({ ...EMPTY_FINDING });
  const [submitting, setSubmitting] = useState(false);
  const [progressMsg, setProgressMsg] = useState("");

  const currentUser = getCurrentUser();
  const isAdmin = currentUser?.role === "admin";

  // Cycle les messages du loader pendant la génération du PDF.
  // setState uniquement dans le callback setInterval (lint react-hooks/set-state-in-effect compliant).
  useEffect(() => {
    if (!submitting) return;
    const messages = [
      "Calcul du score de sécurité…",
      "Sauvegarde des vulnérabilités…",
      "Rendu HTML du rapport…",
      "Génération du PDF avec WeasyPrint…",
      "Finalisation…",
    ];
    let i = 0;
    const tick = () => {
      setProgressMsg(messages[i]);
      i = (i + 1) % messages.length;
    };
    const interval = setInterval(tick, 600);
    tick();  // affiche le premier message immédiatement
    return () => clearInterval(interval);
  }, [submitting]);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const [rep, aud] = await Promise.all([
        getReportByReference(reference),
        getRequestByReference(reference),
      ]);
      setReport(rep);
      setAudit(aud);
      setSummary(rep?.summary || "");
      setVerdict(rep?.verdict || "");
      setFindings(Array.isArray(rep?.findings) ? rep.findings : []);
      setEditMode(isAdmin && aud?.status !== "completed");
      setLoading(false);
    }
    load();
  }, [reference, isAdmin]);

  function addFinding() {
    if (!draft.asset.trim()) { setNotice("Le champ « Asset » est obligatoire."); return; }
    setFindings([...findings, { ...draft }]);
    setDraft({ ...EMPTY_FINDING });
    setNotice("");
  }
  function removeFinding(i) { setFindings(findings.filter((_, idx) => idx !== i)); }

  async function handleGenerate() {
    if (!audit?.id) return;
    setSubmitting(true); setNotice("");
    try {
      const result = await generateReportFromFindings(reference, { summary, verdict, findings });
      if (audit.status !== "completed") {
        await updateRequest(reference, { status: "completed" });
      }
      setNotice(`Rapport généré (score ${result.security_score}/100, grade ${result.grade}). PDF en cours…`);
      setTimeout(() => setNotice(""), 5000);  // efface le notice après 5 sec
      const [fresh, freshAudit] = await Promise.all([
        getReportByReference(reference),
        getRequestByReference(reference),
      ]);
      setReport(fresh); setAudit(freshAudit); setEditMode(false);
    } catch (e) {
      setNotice("Erreur lors de la génération : " + (e.response?.data?.detail || e.message));
    } finally { setSubmitting(false); }
  }

  async function handleDownloadPdf() {
    if (!audit?.id) { setNotice("ID audit introuvable."); return; }
    setDownloading(true); setNotice("");
    try {
      const response = await api.get(`/audits/${audit.id}/report/`, {
        responseType: "blob", validateStatus: (s) => s < 500,
      });
      if (response.status === 202) {
        setNotice("PDF en cours de génération. Réessayez dans quelques secondes."); return;
      }
      if (response.status >= 400) {
        setNotice("Aucun PDF disponible."); return;
      }
      const url = URL.createObjectURL(new Blob([response.data], { type: "application/pdf" }));
      const a = document.createElement("a");
      a.href = url; a.download = `rapport-${reference}.pdf`;
      document.body.appendChild(a); a.click();
      document.body.removeChild(a); URL.revokeObjectURL(url);
    } catch { setNotice("Erreur lors du téléchargement."); }
    finally { setDownloading(false); }
  }

  if (loading) return (
    <div className="flex h-64 items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-brand" />
    </div>
  );

  if (!report && !editMode) return (
    <div className="rounded-xl border border-gray-100 bg-white p-8 text-center shadow-sm">
      <p className="text-gray-600">Aucun rapport disponible pour « {reference} ».</p>
      <Link to="/dashboard" className="mt-4 inline-block rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark">
        Back to list
      </Link>
    </div>
  );

  const pScore = previewScore(findings);
  const pGrade = previewGrade(pScore);

  return (
    <div className="flex flex-col gap-5">
      {/* ── Modal loader pendant la génération du PDF ──────────────────────── */}
      {submitting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="mx-4 max-w-md rounded-xl bg-white p-8 shadow-2xl">
            <div className="flex flex-col items-center gap-4">
              <div className="h-14 w-14 animate-spin rounded-full border-4 border-gray-200 border-t-brand" />
              <div className="text-center">
                <h3 className="text-lg font-bold text-brand">Génération du rapport en cours</h3>
                <p className="mt-2 text-sm text-gray-500">{progressMsg || "Initialisation…"}</p>
                <p className="mt-3 text-xs text-gray-400">Cela prend environ 3 secondes.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-brand">
          Vulnerability Report - {reference}
          {editMode && (
            <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
              Edit mode
            </span>
          )}
        </h1>
        <div className="flex gap-2">
          <Link to="/dashboard" className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-semibold text-gray-700 hover:bg-gray-100">
            Back to list
          </Link>
          {!editMode && report && (
            <button onClick={handleDownloadPdf} disabled={downloading}
              className="rounded-md bg-green-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50">
              {downloading ? "Téléchargement…" : "Download PDF"}
            </button>
          )}
        </div>
      </div>

      {notice && (
        <p className="rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-700">{notice}</p>
      )}

      {editMode ? (
        <>
          {/* PREVIEW SCORE */}
          <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
            <h2 className="mb-3 font-bold text-brand">Preview score (live)</h2>
            <div className="flex items-center gap-4">
              <span className={`flex h-14 w-14 items-center justify-center rounded-lg text-2xl font-extrabold ${gradeColor(pGrade)}`}>
                {pGrade}
              </span>
              <div className="flex-1">
                <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200">
                  <div className={`h-full rounded-full ${scoreColor(pScore)}`} style={{ width: `${pScore}%` }} />
                </div>
                <p className="mt-1 text-xs text-gray-500">{pScore} / 100 — recalculé serveur-side à la génération</p>
              </div>
            </div>
          </div>

          {/* SUMMARY + VERDICT */}
          <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
            <h2 className="mb-3 font-bold text-brand">Executive summary & verdict</h2>
            <label className="text-xs font-semibold text-gray-600">Verdict (1 ligne)</label>
            <input type="text" value={verdict} onChange={(e) => setVerdict(e.target.value)}
              placeholder="Niveau de risque général : Acceptable / Préoccupant / Critique"
              className="mb-3 mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-brand focus:outline-none"
              maxLength={255} />
            <label className="text-xs font-semibold text-gray-600">Executive summary</label>
            <textarea value={summary} onChange={(e) => setSummary(e.target.value)}
              placeholder="Synthèse de l'audit : périmètre testé, méthodologie, principaux constats…"
              rows={5}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-brand focus:outline-none" />
          </div>

          {/* ADD FINDING */}
          <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
            <h2 className="mb-3 font-bold text-brand">Add a vulnerability</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="text-xs font-semibold text-gray-600">Severity *</label>
                <select value={draft.severity} onChange={(e) => setDraft({ ...draft, severity: e.target.value })}
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-brand focus:outline-none">
                  {SEVERITIES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600">Asset / system *</label>
                <input type="text" value={draft.asset} onChange={(e) => setDraft({ ...draft, asset: e.target.value })}
                  placeholder="ex: VPN public, Serveur AD, WordPress admin…"
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-brand focus:outline-none"
                  maxLength={200} />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-gray-600">Description</label>
                <textarea value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                  placeholder="Quel est le problème ? Quelles preuves ? Quel impact potentiel ?"
                  rows={2}
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-brand focus:outline-none" />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-gray-600">Recommendation</label>
                <textarea value={draft.recommendation} onChange={(e) => setDraft({ ...draft, recommendation: e.target.value })}
                  placeholder="Comment corriger / mitiger ?"
                  rows={2}
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-brand focus:outline-none" />
              </div>
            </div>
            <button type="button" onClick={addFinding}
              className="mt-3 rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark">
              + Add to report
            </button>
          </div>

          {/* LIST OF FINDINGS */}
          <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
            <h2 className="mb-3 font-bold text-brand">
              Vulnerabilities to be reported ({findings.length})
            </h2>
            {findings.length === 0 ? (
              <p className="text-sm text-gray-400">Aucune vulnérabilité ajoutée.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] text-left text-sm">
                  <thead className="bg-brand-soft text-gray-600">
                    <tr>
                      <th className="px-3 py-2 font-semibold">Severity</th>
                      <th className="px-3 py-2 font-semibold">Asset</th>
                      <th className="px-3 py-2 font-semibold">Description</th>
                      <th className="px-3 py-2 font-semibold">Recommendation</th>
                      <th className="px-3 py-2 font-semibold">—</th>
                    </tr>
                  </thead>
                  <tbody>
                    {findings.map((f, i) => (
                      <tr key={i} className="border-b border-gray-100 last:border-0">
                        <td className="px-3 py-2">
                          <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${severityClasses(f.severity)}`}>
                            {f.severity}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-gray-700">{f.asset}</td>
                        <td className="px-3 py-2 text-gray-600">{f.description}</td>
                        <td className="px-3 py-2 text-gray-600">{f.recommendation}</td>
                        <td className="px-3 py-2 text-right">
                          <button onClick={() => removeFinding(i)}
                            className="rounded-md border border-red-200 px-2 py-0.5 text-xs font-semibold text-red-600 hover:bg-red-50">
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* GENERATE BUTTON */}
          <div className="flex justify-end gap-3">
            <button onClick={handleGenerate} disabled={submitting}
              className="rounded-md bg-green-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50">
              {submitting ? "Generating…" : `Generate report & mark Completed (${findings.length} findings)`}
            </button>
          </div>
        </>
      ) : (
        <>
          {/* READ MODE — Score */}
          <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
            <h2 className="mb-3 font-bold text-brand">Global security score</h2>
            <div className="flex flex-wrap items-center gap-4">
              <span className={`flex h-14 w-14 items-center justify-center rounded-lg text-2xl font-extrabold ${gradeColor(report.grade)}`}>
                {report.grade}
              </span>
              <div className="min-w-[200px] flex-1">
                <p className="text-sm text-gray-600">{report.verdict || "Audit completed"}</p>
                <div className="mt-2 h-3 w-full overflow-hidden rounded-full bg-gray-200">
                  <div className={`h-full rounded-full ${scoreColor(report.security_score)}`}
                    style={{ width: `${report.security_score}%` }} />
                </div>
                <p className="mt-1 text-xs font-semibold text-gray-500">{report.security_score} / 100</p>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
            <h2 className="mb-2 font-bold text-brand">Executive summary</h2>
            <p className="whitespace-pre-line text-sm text-gray-600">{report.summary || "—"}</p>
          </div>

          {/* Findings */}
          <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
            <h2 className="mb-3 font-bold text-brand">
              Vulnerabilities identified ({(report.findings || []).length})
            </h2>
            {(!report.findings || report.findings.length === 0) ? (
              <p className="text-sm text-gray-400">Aucune vulnérabilité enregistrée.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] text-left text-sm">
                  <thead className="bg-brand-soft text-gray-600">
                    <tr>
                      <th className="px-3 py-2 font-semibold">Severity</th>
                      <th className="px-3 py-2 font-semibold">Asset</th>
                      <th className="px-3 py-2 font-semibold">Description</th>
                      <th className="px-3 py-2 font-semibold">Recommendation</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.findings.map((f, i) => (
                      <tr key={i} className="border-b border-gray-100 last:border-0">
                        <td className="px-3 py-2">
                          <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${severityClasses(f.severity)}`}>
                            {f.severity}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-gray-700">{f.asset}</td>
                        <td className="px-3 py-2 text-gray-600">{f.description}</td>
                        <td className="px-3 py-2 text-gray-600">{f.recommendation}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Admin re-edit */}
          {isAdmin && (
            <div className="flex justify-end">
              <button onClick={() => setEditMode(true)}
                className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-100">
                Edit report
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
