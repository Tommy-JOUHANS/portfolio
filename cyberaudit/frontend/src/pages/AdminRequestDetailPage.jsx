import { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";
import {
  getRequestByReference, updateRequest, archiveRequest,
  addRequestHistory,
} from "../services/dataService.js";
import { sendStatusNotification } from "../services/emailService.js";
import StatusBadge from "../components/dashboard/StatusBadge.jsx";

const ASSIGNEES = ["", "Karim", "Sophie", "James", "Tommy"];

function formatDateTime(isoString) {
  const d = new Date(isoString);
  return `${d.toLocaleDateString("fr-FR")} ${d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}`;
}

export default function AdminRequestDetailPage() {
  const { reference } = useParams();
  const { user } = useAuth();

  const [request, setRequest]           = useState(null);
  const [loading, setLoading]           = useState(true);
  const [status, setStatus]             = useState("pending");
  const [assignedTo, setAssignedTo]     = useState("");
  const [internalNotes, setInternalNotes] = useState("");
  const [notice, setNotice]             = useState("");
  const [saving, setSaving]             = useState(false);

  const loadRequest = useCallback(async () => {
    setLoading(true);
    const found = await getRequestByReference(reference);
    setRequest(found);
    if (found) {
      setStatus(found.status);
      setAssignedTo(found.assigned_to ?? "");
      setInternalNotes(found.internal_notes ?? "");
    }
    setLoading(false);
  }, [reference]);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { loadRequest(); }, [loadRequest]);

  if (loading) return (
    <div className="flex h-64 items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-brand" />
    </div>
  );

  if (!request) return (
    <div className="rounded-xl border border-gray-100 bg-white p-8 text-center shadow-sm">
      <p className="text-gray-600">No requests found for"{reference}".</p>
      <Link to="/dashboard" className="mt-4 inline-block rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark">
        Back to list
      </Link>
    </div>
  );

  // Champs backend : client_info, pack, scope_notes
  const clientInfo = request.client_info ?? {};
  const pack       = request.pack ?? {};

  async function handleSave() {
    setSaving(true);
    try {
      await updateRequest(reference, { status, assigned_to: assignedTo, internal_notes: internalNotes });
      await loadRequest();
      setNotice("Changes saved.");
    } catch { setNotice("Error occurred while saving changes."); }
    finally { setSaving(false); }
  }


  async function handleSendNotification() {
    const STATUS_LABELS = { pending: "Pending", in_progress: "In Progress", completed: "Completed", archived: "Archived" };
    sendStatusNotification({
      to_email:   clientInfo.email,
      to_name:    clientInfo.first_name,
      reference:  request.reference,
      new_status: STATUS_LABELS[status] ?? status,
      message:    internalNotes,
    }).catch((err) => console.error("[emailService]", err));
    await addRequestHistory(reference, user.first_name, `Notification sent to — statut : ${STATUS_LABELS[status] ?? status}`);
    setNotice("Notification sent to client.");
  }

  async function handleArchive() {
    await archiveRequest(reference);
    await loadRequest();
    setNotice("Request archived.");
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-brand">Request {request.reference}</h1>
        <Link to="/dashboard" className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-semibold text-gray-700 hover:bg-gray-100">
          Back to list
        </Link>
      </div>

      {notice && <p className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">{notice}</p>}

      <div className="grid gap-5 lg:grid-cols-2">
        {/* Infos client */}
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <h2 className="mb-3 border-b border-gray-100 pb-2 font-bold text-brand">Client information</h2>
          <dl className="flex flex-col gap-2 text-sm">
            <div className="flex justify-between gap-3"><dt className="text-gray-500">Company :</dt><dd className="font-medium text-gray-800">{clientInfo.company_name ?? "—"}</dd></div>
            <div className="flex justify-between gap-3"><dt className="text-gray-500">Contact :</dt><dd className="font-medium text-gray-800">{clientInfo.first_name} {clientInfo.last_name}</dd></div>
            <div className="flex justify-between gap-3"><dt className="text-gray-500">Email :</dt><dd className="font-medium text-gray-800">{clientInfo.email ?? "—"}</dd></div>
            <div className="flex justify-between gap-3"><dt className="text-gray-500">Submitted :</dt><dd className="font-medium text-gray-800">{formatDateTime(request.submitted_at)}</dd></div>
            <div className="flex justify-between gap-3"><dt className="text-gray-500">Pack :</dt><dd className="font-medium text-brand">{pack.name ?? "—"}</dd></div>
            <div className="flex flex-col gap-1"><dt className="text-gray-500">Client message :</dt><dd className="rounded-md bg-cream p-2 text-gray-700">{request.scope_notes || "—"}</dd></div>
          </dl>
        </div>

        {/* Actions */}
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <h2 className="mb-3 border-b border-gray-100 pb-2 font-bold text-brand">Status &amp; Actions</h2>
          <label className="flex flex-col gap-1 text-sm"><span className="text-gray-500">Current status :</span>
            <select value={status} onChange={(e) => setStatus(e.target.value)}
              className="rounded-md border border-gray-300 px-2 py-1.5 text-gray-800">
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="archived">Archived</option>
            </select>
          </label>
          <label className="mt-3 flex flex-col gap-1 text-sm"><span className="text-gray-500">Assigned to :</span>
            <select value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)}
              className="rounded-md border border-gray-300 px-2 py-1.5 text-gray-800">
              {ASSIGNEES.map((n) => <option key={n || "none"} value={n}>{n || "Unassigned"}</option>)}
            </select>
          </label>
          <label className="mt-3 flex flex-col gap-1 text-sm"><span className="text-gray-500">Internal notes :</span>
            <textarea value={internalNotes} onChange={(e) => setInternalNotes(e.target.value)} rows={3}
              placeholder="Internal notes (not visible by the client)"
              className="rounded-md border border-gray-300 px-2 py-1.5 text-gray-800" />
          </label>
          <div className="mt-3 flex items-center gap-2 text-sm">
            <span className="text-gray-500">Saved status :</span>
            <StatusBadge status={request.status} />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={handleSave} disabled={saving}
          className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-50">
          {saving ? "Saving…" : "Save changes"}
        </button>
        <Link to={`/admin/report/${reference}`} className="inline-block rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 text-center">Generate PDF report</Link>
        <button type="button" onClick={handleSendNotification}
          className="rounded-md border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100">
          Send notification
        </button>
        <button type="button" onClick={handleArchive}
          className="rounded-md border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100">
          Archive request
        </button>
      </div>

      {/* Historique — non disponible via l'API REST */}
      <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
        <h2 className="mb-2 font-bold text-brand">History</h2>
        <p className="text-sm text-gray-400">Detailed history is managed on the backend (Django log).</p>
        <div className="mt-2 flex flex-col gap-1 text-sm text-gray-600">
          <p>Submitted on : {formatDateTime(request.submitted_at)}</p>
          {request.updated_at && <p>Last updated : {formatDateTime(request.updated_at)}</p>}
          {request.completed_at && <p>Completed on : {formatDateTime(request.completed_at)}</p>}
        </div>
      </div>
    </div>
  );
}
