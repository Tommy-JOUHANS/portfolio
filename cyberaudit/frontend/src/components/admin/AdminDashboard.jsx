import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getAllRequests } from "../../services/dataService.js";
import StatCard from "../dashboard/StatCard.jsx";
import StatusBadge from "../dashboard/StatusBadge.jsx";

const PAGE_SIZE = 5;

function formatDate(isoString) {
  return new Date(isoString).toLocaleDateString("fr-FR");
}

export default function AdminDashboard() {
  const [requests, setRequests]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [packFilter, setPackFilter]   = useState("all");
  const [clientQuery, setClientQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    async function load() {
      const data = await getAllRequests();
      setRequests(Array.isArray(data) ? data : []);
      setLoading(false);
    }
    load();
  }, []);

  const countByStatus = (s) => requests.filter((r) => r.status === s).length;

  // Champs backend : r.pack.code, r.client_info.company_name
  const filteredRequests = requests.filter((r) => {
    const statusOk = statusFilter === "all" || r.status === statusFilter;
    const packOk   = packFilter   === "all" || r.pack?.code === packFilter;
    const company  = r.client_info?.company_name ?? "";
    const clientOk = company.toLowerCase().includes(clientQuery.trim().toLowerCase());
    return statusOk && packOk && clientOk;
  });

  const totalPages   = Math.max(1, Math.ceil(filteredRequests.length / PAGE_SIZE));
  const safePage     = Math.min(currentPage, totalPages);
  const startIndex   = (safePage - 1) * PAGE_SIZE;
  const pageRequests = filteredRequests.slice(startIndex, startIndex + PAGE_SIZE);

  function changeFilter(setter, value) { setter(value); setCurrentPage(1); }
  function resetFilters() { setStatusFilter("all"); setPackFilter("all"); setClientQuery(""); setCurrentPage(1); }

  if (loading) return (
    <div className="flex h-64 items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-brand" />
    </div>
  );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-brand">Admin Dashboard - Audit Requests</h1>
        <p className="text-sm italic text-gray-500">CyberAudit operator view - Manage all SME requests</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Pending"     value={countByStatus("pending")}     accentClass="text-amber-500" />
        <StatCard label="In Progress" value={countByStatus("in_progress")} accentClass="text-blue-600"  />
        <StatCard label="Completed"   value={countByStatus("completed")}   accentClass="text-green-600" />
        <StatCard label="Archived"    value={countByStatus("archived")}    accentClass="text-gray-600"  />
      </div>

      <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-end gap-3">
          <span className="text-sm font-semibold text-gray-700">Filters :</span>
          <label className="flex flex-col text-xs text-gray-500">Status
            <select value={statusFilter} onChange={(e) => changeFilter(setStatusFilter, e.target.value)}
              className="mt-0.5 rounded-md border border-gray-300 px-2 py-1 text-sm text-gray-800">
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="archived">Archived</option>
            </select>
          </label>
          <label className="flex flex-col text-xs text-gray-500">Pack
            <select value={packFilter} onChange={(e) => changeFilter(setPackFilter, e.target.value)}
              className="mt-0.5 rounded-md border border-gray-300 px-2 py-1 text-sm text-gray-800">
              <option value="all">All</option>
              <option value="audit">Audit</option>
              <option value="security">Security</option>
              <option value="protection">Protection</option>
              <option value="premium">Premium</option>
            </select>
          </label>
          <label className="flex flex-col text-xs text-gray-500">Client
            <input type="text" value={clientQuery} placeholder="Search"
              onChange={(e) => changeFilter(setClientQuery, e.target.value)}
              className="mt-0.5 rounded-md border border-gray-300 px-2 py-1 text-sm text-gray-800" />
          </label>
          <button type="button" onClick={resetFilters}
            className="rounded-md border border-brand px-3 py-1.5 text-sm font-semibold text-brand hover:bg-brand-soft">
            Reset filters
          </button>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-brand-soft text-gray-600">
              <tr>
                <th className="px-3 py-2 font-semibold">Case #</th>
                <th className="px-3 py-2 font-semibold">Client</th>
                <th className="px-3 py-2 font-semibold">Pack</th>
                <th className="px-3 py-2 font-semibold">Submitted</th>
                <th className="px-3 py-2 font-semibold">Status</th>
                <th className="px-3 py-2 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {pageRequests.length === 0 ? (
                <tr><td colSpan={6} className="px-3 py-6 text-center text-gray-400">Aucune demande.</td></tr>
              ) : pageRequests.map((r) => (
                <tr key={r.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                  <td className="px-3 py-3 font-medium text-gray-800">{r.reference}</td>
                  <td className="px-3 py-3 text-gray-600">{r.client_info?.company_name ?? "—"}</td>
                  <td className="px-3 py-3 text-gray-600">{r.pack?.name ?? "—"}</td>
                  <td className="px-3 py-3 text-gray-600">{formatDate(r.submitted_at)}</td>
                  <td className="px-3 py-3"><StatusBadge status={r.status} /></td>
                  <td className="px-3 py-3">
                    {r.status === "completed" ? (
                      <Link to={`/admin/report/${r.reference}`} className="font-medium text-brand hover:underline">View report</Link>
                    ) : (
                      <Link to={`/admin/request/${r.reference}`} className="font-medium text-brand hover:underline">View / Edit</Link>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <span className="text-xs text-gray-500">{pageRequests.length} of {filteredRequests.length} requests</span>
          <div className="flex gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button key={page} type="button" onClick={() => setCurrentPage(page)}
                className={`h-7 w-7 rounded text-sm font-semibold transition ${
                  page === safePage ? "bg-brand text-white" : "bg-gray-100 text-gray-600 hover:bg-brand-soft"
                }`}>{page}</button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
