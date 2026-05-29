import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.js";
import {
  getAllRequests,
  getNotificationsByUserId,
} from "../../services/dataService.js";
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
      setError("Impossible de charger vos données.");
    } finally {
      setLoading(false);
    }
  }, [user.id]);

  useEffect(() => { loadData(); }, [loadData]);

  async function handleDownload(request) {
    setDownloading(request.id);
    setNotice("");
    try {
      const { default: api } = await import("../../services/api.js");
      const response = await api.get(`/audits/${request.id}/report/`, {
        responseType: "blob",
        validateStatus: (s) => s < 500,
      });
      if (response.status === 202) {
        setNotice("Le rapport est en cours de génération. Réessayez dans quelques instants.");
        return;
      }
      const url = URL.createObjectURL(new Blob([response.data], { type: "application/pdf" }));
      const a = document.createElement("a");
      a.href = url; a.download = `rapport-${request.reference}.pdf`;
      document.body.appendChild(a); a.click();
      document.body.removeChild(a); URL.revokeObjectURL(url);
    } catch {
      setNotice("Erreur lors du téléchargement.");
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
        <p className="text-sm text-gray-400">Chargement…</p>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-brand">My Dashboard</h1>
        <p className="text-sm italic text-gray-500">
          Welcome {user.first_name} — Real-time tracking of your audit requests
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          <span className="flex-1">{error}</span>
          <button onClick={loadData} className="rounded-md bg-red-100 px-3 py-1 font-semibold hover:bg-red-200">
            Réessayer
          </button>
        </div>
      )}

      {notice && (
        <div className="rounded-md bg-amber-50 px-4 py-2 text-sm text-amber-700">{notice}</div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Open requests"     value={openCount}      accentClass="text-amber-500" />
        <StatCard label="Completed"         value={completedCount} accentClass="text-green-600" />
        <StatCard label="Reports available" value={completedCount} accentClass="text-brand"     />
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
                <tr><td colSpan={5} className="px-3 py-6 text-center text-gray-400">Aucune demande à afficher.</td></tr>
              ) : (
                filteredRequests.map((r) => (
                  <tr key={r.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                    <td className="px-3 py-3 font-medium text-gray-800">{r.reference}</td>
                    <td className="px-3 py-3 text-gray-600">{r.pack?.name ?? "—"}</td>
                    <td className="px-3 py-3 text-gray-600">{formatDate(r.submitted_at)}</td>
                    <td className="px-3 py-3"><StatusBadge status={r.status} /></td>
                    <td className="px-3 py-3">
                      {r.status === "completed" ? (
                        <button type="button" disabled={downloading === r.id}
                          onClick={() => handleDownload(r)}
                          className="font-medium text-brand hover:underline disabled:opacity-50">
                          {downloading === r.id ? "Téléchargement…" : "Download report"}
                        </button>
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
        <h2 className="text-lg font-bold text-gray-800">Recent notifications</h2>
        {notifications.length === 0 ? (
          <p className="mt-3 text-sm text-gray-400">Aucune notification.</p>
        ) : (
          <ul className="mt-3 flex flex-col gap-2">
            {notifications.map((n) => (
              <li key={n.id} className="rounded-md border-l-4 border-brand bg-cream px-3 py-2 text-sm text-gray-700">
                {n.message} <span className="text-gray-400">({timeAgo(n.created_at)})</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
