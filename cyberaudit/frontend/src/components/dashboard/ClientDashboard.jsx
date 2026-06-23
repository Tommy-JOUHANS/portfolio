import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.js";
import { sanitize } from "../../utils/sanitize.js";
import {
  getAllRequests,
  getNotificationsByUserId,
} from "../../services/dataService.js";
import api from "../../services/api.js";
import StatCard from "./StatCard.jsx";
import StatusBadge from "./StatusBadge.jsx";

function formatDate(isoString) {
  return new Date(isoString).toLocaleDateString("fr-FR");
}

function timeAgo(isoString) {
  const diffMs = Date.now() - new Date(isoString).getTime();
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  if (hours < 1) return `il y a ${Math.max(1, Math.floor(diffMs / 60000))} min`;
  if (hours < 24) return `il y a ${hours} h`;
  return `il y a ${Math.floor(hours / 24)} j`;
}

// Detecte le type de notification a partir du message
function getNotifType(message) {
  const m = (message || "").toLowerCase();
  if (m.includes("report") && m.includes("available")) return "report";
  if (m.includes("status changed") || m.includes("statut")) return "status";
  if (m.includes("received your") || m.includes("audit request")) return "received";
  return "default";
}

const NOTIF_STYLES = {
  report:   { icon: "✓", border: "border-green-500", bg: "bg-green-50",  iconBg: "bg-green-100", iconColor: "text-green-700" },
  status:   { icon: "↻", border: "border-blue-500",  bg: "bg-blue-50",   iconBg: "bg-blue-100",  iconColor: "text-blue-700" },
  received: { icon: "✉", border: "border-amber-500", bg: "bg-amber-50",  iconBg: "bg-amber-100", iconColor: "text-amber-700" },
  default:  { icon: "•", border: "border-brand",     bg: "bg-cream",     iconBg: "bg-brand-soft", iconColor: "text-brand" },
};

export default function ClientDashboard() {
  const { user } = useAuth();
  const [requests, setRequests]           = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState(null);
  const [notice, setNotice]               = useState("");
  const [statusFilter, setStatusFilter]   = useState("all");
  const [packFilter, setPackFilter]       = useState("all");
  const [downloading, setDownloading]     = useState(null);
  const [showAllNotifs, setShowAllNotifs] = useState(false);
  const [pdfMap, setPdfMap]               = useState({});

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [reqs, notifs] = await Promise.all([
        getAllRequests(),
        getNotificationsByUserId(user.id),
      ]);
      setRequests(Array.isArray(reqs) ? reqs : []);
      setNotifications(Array.isArray(notifs) ? notifs : []);
    } catch {
      setError("Unable to load your data. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, [user.id]);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { loadData(); }, [loadData]);

  // Verifie quels dossiers Completed ont un PDF dispo (HEAD requests)
  useEffect(() => {
    const completed = requests.filter((r) => r.status === "completed");
    if (completed.length === 0) return;
    let cancelled = false;
    Promise.all(
      completed.map((r) =>
        api({ method: "HEAD", url: `/audits/${r.id}/report/`, validateStatus: () => true })
          .then((res) => [r.id, res.status >= 200 && res.status < 300])
          .catch(() => [r.id, false])
      )
    ).then((results) => {
      if (!cancelled) setPdfMap(Object.fromEntries(results));
    });
    return () => { cancelled = true; };
  }, [requests]);

  // Polling toutes les 5 sec pour detecter quand un nouveau PDF devient dispo
  useEffect(() => {
    const interval = setInterval(() => {
      const completed = requests.filter((r) => r.status === "completed");
      if (completed.length === 0) return;
      Promise.all(
        completed.map((r) =>
          api({ method: "HEAD", url: `/audits/${r.id}/report/`, validateStatus: () => true })
            .then((res) => [r.id, res.status >= 200 && res.status < 300])
            .catch(() => [r.id, false])
        )
      ).then((results) => {
        setPdfMap(Object.fromEntries(results));
      });
    }, 5000);
    return () => clearInterval(interval);
  }, [requests]);

  async function handleDownload(request) {
    setDownloading(request.id);
    setNotice("");
    try {
      const response = await api.get(`/audits/${request.id}/report/`, {
        responseType: "blob",
        validateStatus: (s) => s < 500,
      });
      if (response.status === 202) {
        setNotice("The report is being generated. Please try again in a few moments.");
        return;
      }
      if (response.status === 404) {
        setNotice("Report not available yet. Ask an administrator to generate it first.");
        return;
      }
      if (response.status !== 200) {
        setNotice("Unable to download the report. Please try again later.");
        return;
      }
      const url = URL.createObjectURL(new Blob([response.data], { type: "application/pdf" }));
      const a = document.createElement("a");
      a.href = url; a.download = `rapport-${request.reference}.pdf`;
      document.body.appendChild(a); a.click();
      document.body.removeChild(a); URL.revokeObjectURL(url);
    } catch {
      setNotice("Error occurred while downloading the report.");
    } finally {
      setDownloading(null);
    }
  }

  const filteredRequests = requests.filter((r) => {
    const statusOk = statusFilter === "all" || r.status === statusFilter;
    const packOk   = packFilter   === "all" || r.pack?.code === packFilter;
    return statusOk && packOk;
  });

  const openCount      = requests.filter((r) => r.status === "pending" || r.status === "in_progress").length;
  const completedCount = requests.filter((r) => r.status === "completed").length;

  if (loading) return (
    <div className="flex h-64 items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-brand" />
        <p className="text-sm text-gray-400">Loading…</p>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-brand">My Dashboard</h1>
        <p className="text-sm italic text-gray-500">
          Welcome {sanitize(user.first_name)}. Real-time tracking of your audit requests
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          <span className="flex-1">{error}</span>
          <button onClick={loadData} className="rounded-md bg-red-100 px-3 py-1 font-semibold hover:bg-red-200">
            Try again
          </button>
        </div>
      )}

      {notice && (
        <div className="rounded-md bg-amber-50 px-4 py-2 text-sm text-amber-700">{notice}</div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Open requests"     value={openCount}      accentClass="text-amber-500" />
        <StatCard label="Completed"         value={completedCount} accentClass="text-green-600" />
        <StatCard label="Reports available" value={Object.values(pdfMap).filter(Boolean).length} accentClass="text-brand"     />
      </div>

      <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-bold text-gray-800">My audit requests</h2>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <span className="text-sm text-gray-500">Filter :</span>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-md border border-gray-300 px-2 py-1 text-sm">
            <option value="all">All statuses</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="archived">Archived</option>
          </select>
          <select value={packFilter} onChange={(e) => setPackFilter(e.target.value)}
            className="rounded-md border border-gray-300 px-2 py-1 text-sm">
            <option value="all">All packs</option>
            <option value="audit">Audit</option>
            <option value="security">Security</option>
            <option value="protection">Protection</option>
            <option value="premium">Premium</option>
          </select>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-gray-200 text-gray-500">
              <tr>
                <th className="px-3 py-2 font-semibold">Case #</th>
                <th className="px-3 py-2 font-semibold">Pack</th>
                <th className="px-3 py-2 font-semibold">Submission</th>
                <th className="px-3 py-2 font-semibold">Status</th>
                <th className="px-3 py-2 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.length === 0 ? (
                <tr><td colSpan={5} className="px-3 py-6 text-center text-gray-400">No requests to display.</td></tr>
              ) : (
                filteredRequests.map((r) => (
                  <tr key={r.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                    <td className="px-3 py-3 font-medium text-gray-800">{sanitize(r.reference)}</td>
                    <td className="px-3 py-3 text-gray-600">{sanitize(r.pack?.name) || "—"}</td>
                    <td className="px-3 py-3 text-gray-600">{formatDate(r.submitted_at)}</td>
                    <td className="px-3 py-3"><StatusBadge status={r.status} /></td>
                    <td className="px-3 py-3">
                      {r.status === "completed" ? (
                        pdfMap[r.id] ? (
                          <button type="button" disabled={downloading === r.id}
                            onClick={() => handleDownload(r)}
                            className="font-medium text-brand hover:underline disabled:opacity-50">
                            {downloading === r.id ? "Downloading…" : "Download report"}
                          </button>
                        ) : (
                          <span className="text-xs italic text-amber-600">PDF being prepared…</span>
                        )
                      ) : (
                        <Link to={`/audit/confirmation/${r.reference}`}
                          className="font-medium text-brand hover:underline">
                          View details
                        </Link>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-800">Recent notifications</h2>
          {notifications.length > 0 && (
            <span className="rounded-full bg-brand-soft px-2.5 py-0.5 text-xs font-semibold text-brand">
              {notifications.length}
            </span>
          )}
        </div>
        {notifications.length === 0 ? (
          <p className="mt-3 text-sm text-gray-400">No notifications yet.</p>
        ) : (
          <>
            <ul className="mt-3 flex flex-col gap-2">
              {(showAllNotifs ? notifications : notifications.slice(0, 5)).map((n) => {
                const style = NOTIF_STYLES[getNotifType(n.message)];
                return (
                  <li key={n.id} className={`flex items-start gap-3 rounded-lg border-l-4 ${style.border} ${style.bg} p-3 transition hover:shadow-sm`}>
                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${style.iconBg} ${style.iconColor} text-base font-bold`}>
                      {style.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm leading-snug text-gray-700">{sanitize(n.message)}</p>
                      <p className="mt-1 text-xs italic text-gray-400">{timeAgo(n.created_at)}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
            {notifications.length > 5 && (
              <button
                type="button"
                onClick={() => setShowAllNotifs(!showAllNotifs)}
                className="mt-3 w-full rounded-md border border-gray-200 py-2 text-sm font-semibold text-brand transition hover:bg-brand-soft"
              >
                {showAllNotifs ? "Show less" : `Show all (${notifications.length})`}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
