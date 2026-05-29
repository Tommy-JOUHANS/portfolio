import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";
import { getReportByReference, getRequestByReference } from "../services/dataService.js";
import api from "../services/api.js";

function severityClasses(severity) {
  if (severity === "High")   return "bg-red-100 text-red-700";
  if (severity === "Medium") return "bg-amber-100 text-amber-700";
  return "bg-green-100 text-green-700";
}

function scoreColor(score) {
  if (score > 70) return "bg-green-500";
  if (score >= 40) return "bg-orange-500";
  return "bg-red-500";
}

export default function ReportViewerPage() {
  const { reference } = useParams();
  const { user } = useAuth();

  const [report, setReport]       = useState(null);
  const [auditId, setAuditId]     = useState(null);
  const [loading, setLoading]     = useState(true);
  const [notice, setNotice]       = useState("");
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    async function load() {
      const [rep, audit] = await Promise.all([
        getReportByReference(reference),
        getRequestByReference(reference),
      ]);
      setReport(rep);
      setAuditId(audit?.id ?? null);
      setLoading(false);
    }
    load();
  }, [reference]);

  async function handleDownloadPdf() {
    if (!auditId) { setNotice("ID audit introuvable."); return; }
    setDownloading(true);
    try {
      const response = await api.get(`/audits/${auditId}/report/`, {
        responseType: "blob",
        validateStatus: (s) => s < 500,
      });
      if (response.status === 202) {
        setNotice("Le rapport PDF est en cours de génération. Réessayez dans quelques instants.");
        return;
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

  if (!report) return (
    <div className="rounded-xl border border-gray-100 bg-white p-8 text-center shadow-sm">
      <p className="text-gray-600">Aucun rapport disponible pour "{reference}".</p>
      <Link to="/dashboard" className="mt-4 inline-block rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark">
        Back to list
      </Link>
    </div>
  );

  const findings   = Array.isArray(report.findings) ? report.findings : [];

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-brand">Vulnerability Report - {reference}</h1>
        <div className="flex gap-2">
          <Link to="/dashboard" className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-semibold text-gray-700 hover:bg-gray-100">
            Back to list
          </Link>
          <button type="button" onClick={handleDownloadPdf} disabled={downloading}
            className="rounded-md bg-green-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50">
            {downloading ? "Téléchargement…" : "Download PDF"}
          </button>
        </div>
      </div>

      {notice && <p className="rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-700">{notice}</p>}

      {/* Score global */}
      <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
        <h2 className="mb-3 font-bold text-brand">Global security score</h2>
        <div className="flex flex-wrap items-center gap-4">
          <span className="flex h-14 w-14 items-center justify-center rounded-lg bg-green-100 text-2xl font-extrabold text-green-700">
            {report.grade}
          </span>
          <div className="min-w-[200px] flex-1">
            <p className="text-sm text-gray-600">{report.verdict}</p>
            <div className="mt-2 h-3 w-full overflow-hidden rounded-full bg-gray-200">
              <div className={`h-full rounded-full ${scoreColor(report.security_score)}`}
                style={{ width: `${report.security_score}%` }} />
            </div>
            <p className="mt-1 text-xs font-semibold text-gray-500">{report.security_score} / 100</p>
          </div>
        </div>
      </div>

      {/* Résumé exécutif */}
      <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
        <h2 className="mb-2 font-bold text-brand">Executive summary</h2>
        <p className="text-sm text-gray-600">{report.summary}</p>
      </div>

      {/* Vulnérabilités */}
      <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
        <h2 className="mb-3 font-bold text-brand">Vulnerabilities identified</h2>
        {findings.length === 0 ? (
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
