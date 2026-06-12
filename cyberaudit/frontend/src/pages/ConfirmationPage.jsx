import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import { getRequestByReference } from "../services/dataService.js";
import { sanitize } from "../utils/sanitize.js";

function formatDateTime(isoString) {
  const d = new Date(isoString);
  return `${d.toLocaleDateString("fr-FR")} ${d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}`;
}

export default function ConfirmationPage() {
  const { reference } = useParams();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const data = await getRequestByReference(reference);
      setRequest(data);
      setLoading(false);
    }
    load();
  }, [reference]);

  if (loading) return (
    <div className="flex h-64 items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-brand" />
    </div>
  );

  if (!request) return (
    <div className="rounded-xl border border-gray-100 bg-white p-8 text-center shadow-sm">
      <p className="text-gray-600">No requests found for "{reference}".</p>
      <Link to="/dashboard" className="mt-4 inline-block rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark">
        Go to my Dashboard
      </Link>
    </div>
  );

  // Champs backend : request.pack (objet imbriqué), request.scope_notes, request.client_info
  const pack       = request.pack ?? {};
  const clientInfo = request.client_info ?? {};

  return (
    <div className="flex flex-col items-center">
      <div className="flex flex-col items-center gap-2 text-center">
        <CheckCircle2 size={44} className="text-green-600" />
        <h1 className="text-xl font-bold text-green-700">Request Submitted Successfully</h1>
      </div>

      {/* Carte récapitulatif : @container pour adapter le padding
          à la largeur réelle de la carte (pas du viewport).              */}
      <div className="@container mt-6 w-full max-w-xl rounded-xl border border-gray-200 bg-white p-4 shadow-sm @sm:p-6">
        <dl className="flex flex-col gap-3 text-sm">
          {/* Chaque ligne : empilée sur mobile (flex-col), côte à côte sur sm+ */}
          <div className="flex flex-col gap-0.5 @sm:flex-row @sm:justify-between @sm:gap-4">
            <dt className="font-semibold text-brand">Case number :</dt>
            <dd className="text-gray-800 @sm:text-right">{request.reference}</dd>
          </div>
          <div className="flex flex-col gap-0.5 @sm:flex-row @sm:justify-between @sm:gap-4">
            <dt className="font-semibold text-brand">Contact :</dt>
            <dd className="text-gray-800 @sm:text-right">{sanitize(clientInfo.first_name)} {sanitize(clientInfo.last_name)}</dd>
          </div>
          <div className="flex flex-col gap-0.5 @sm:flex-row @sm:justify-between @sm:gap-4">
            <dt className="font-semibold text-brand">Company Name :</dt>
            <dd className="text-gray-800 @sm:text-right">{sanitize(clientInfo.company_name) || "—"}</dd>
          </div>
          <div className="flex flex-col gap-0.5 @sm:flex-row @sm:justify-between @sm:gap-4">
            <dt className="font-semibold text-brand">Selected pack :</dt>
            <dd className="text-gray-800 @sm:text-right">{sanitize(pack.name) || "—"}</dd>
          </div>
          {pack.included_services && (
            <div className="flex flex-col gap-0.5 @sm:flex-row @sm:justify-between @sm:gap-4">
              <dt className="font-semibold text-brand">Services included :</dt>
              <dd className="text-gray-800 @sm:text-right">
                {pack.included_services}<br />{pack.for_whom}<br />{pack.perimeter}
              </dd>
            </div>
          )}
          <div className="flex flex-col gap-0.5 @sm:flex-row @sm:justify-between @sm:gap-4">
            <dt className="font-semibold text-brand">Price :</dt>
            <dd className="font-bold text-gray-800 sm:text-right">{pack.price} EUR</dd>
          </div>
          <div className="flex flex-col gap-0.5 @sm:flex-row @sm:justify-between @sm:gap-4">
            <dt className="font-semibold text-brand">Submission date :</dt>
            <dd className="text-gray-800 @sm:text-right">{formatDateTime(request.submitted_at)}</dd>
          </div>
          <div className="flex flex-col gap-0.5 @sm:flex-row @sm:justify-between @sm:gap-4">
            <dt className="font-semibold text-brand">Estimated processing time :</dt>
            <dd className="text-gray-800 @sm:text-right">{pack.duration_days} business days</dd>
          </div>
          <div className="flex flex-col gap-0.5 @sm:flex-row @sm:justify-between @sm:gap-4">
            <dt className="font-semibold text-brand">Message :</dt>
            <dd className="text-gray-800 @sm:text-right">{sanitize(request.scope_notes) || "—"}</dd>
          </div>
        </dl>
      </div>

      <p className="mt-4 w-full max-w-xl rounded-md bg-amber-50 px-4 py-3 text-xs text-amber-700">
        A confirmation email has been sent to your address. You can track your request status in real time from your dashboard.
      </p>

      <div className="mt-5 flex flex-wrap justify-center gap-3">
        <Link to="/dashboard" className="rounded-md bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark">
          Go to my Dashboard
        </Link>
        <Link to="/audit/new" className="rounded-md border border-brand px-5 py-2.5 text-sm font-semibold text-brand hover:bg-brand-soft">
          Submit a new request
        </Link>
      </div>
    </div>
  );
}
