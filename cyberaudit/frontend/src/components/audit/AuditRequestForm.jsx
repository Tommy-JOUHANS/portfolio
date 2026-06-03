import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.js";
import { getPackages, createRequest, getPackageByCode } from "../../services/dataService.js";
import { sendAuditConfirmation } from "../../services/emailService.js";
import PackSelector from "./PackSelector.jsx";
import { isRequired, isWithinMaxLength, MISSING_FIELD_MESSAGE, MAX_FIELD_LENGTH } from "../../utils/validators.js";

export default function AuditRequestForm() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [packages, setPackages]   = useState([]);
  const [form, setForm]           = useState({ username: user.first_name, companyName: user.company_name, packCode: "", message: "" });
  const [errors, setErrors]       = useState({});
  const [submitting, setSubmitting] = useState(false);

  // ── Chargement async des packs ──────────────────────────────────────
  useEffect(() => {
    async function load() {
      const packs = await getPackages();
      setPackages(Array.isArray(packs) ? packs : (packs.results ?? []));
    }
    load();
  }, []);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleSelectPack(code) {
    setForm((prev) => ({ ...prev, packCode: code }));
  }

  function validate() {
    const found = {};
    if (!isRequired(form.username))    found.username    = MISSING_FIELD_MESSAGE;
    else if (!isWithinMaxLength(form.username)) found.username = `Maximum ${MAX_FIELD_LENGTH} caracteres.`;
    if (!isRequired(form.companyName)) found.companyName = MISSING_FIELD_MESSAGE;
    else if (!isWithinMaxLength(form.companyName)) found.companyName = `Maximum ${MAX_FIELD_LENGTH} caracteres.`;
    if (!isRequired(form.packCode))    found.packCode    = "Veuillez selectionner un pack.";
    return found;
  }

  // ── Soumission async ────────────────────────────────────────────────
  async function handleSubmit(event) {
    event.preventDefault();
    const found = validate();
    if (Object.keys(found).length > 0) { setErrors(found); return; }
    setErrors({});
    setSubmitting(true);

    try {
      // createRequest est maintenant async
      const created = await createRequest({
        packCode: form.packCode,
        message:  form.message,
      });

      // getPackageByCode est maintenant async
      const pack = await getPackageByCode(form.packCode);

      sendAuditConfirmation({
        to_email:          user.email,
        to_name:           user.first_name,
        username:          form.username,
        company_name:      form.companyName,
        pack_name:         pack ? pack.name : form.packCode,
        services_included: pack ? [pack.included_services, pack.for_whom, pack.perimeter].join("\n") : "-",
        price:             pack ? `${pack.price.toLocaleString("fr-FR")} EUR` : "-",
        processing_time:   pack ? `${pack.duration_days} business days` : "-",
        message:           form.message,
        reference:         created.reference,
      }).catch((err) => console.error("[emailService] Acknowledgment not sent :", err));

      navigate(`/audit/confirmation/${created.reference}`);
    } catch {
      setErrors({ submit: "Error sending. Please try again." });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
      {/* Username */}
      <div className="flex flex-col gap-1">
        <label htmlFor="username" className="text-sm font-semibold text-gray-700">Username :</label>
        <input id="username" name="username" type="text" value={form.username}
          onChange={handleChange} maxLength={50}
          className="rounded-md bg-gray-100 px-3 py-2 text-sm outline-none ring-brand/40 focus:bg-white focus:ring-2" />
        {errors.username && <span className="text-xs text-red-600">{errors.username}</span>}
      </div>

      {/* Company Name */}
      <div className="flex flex-col gap-1">
        <label htmlFor="companyName" className="text-sm font-semibold text-gray-700">Company Name :</label>
        <input id="companyName" name="companyName" type="text" value={form.companyName}
          onChange={handleChange} maxLength={50}
          className="rounded-md bg-gray-100 px-3 py-2 text-sm outline-none ring-brand/40 focus:bg-white focus:ring-2" />
        {errors.companyName && <span className="text-xs text-red-600">{errors.companyName}</span>}
      </div>

      {/* PackSelector */}
      <div className="flex flex-col gap-1">
        <PackSelector packages={packages} selectedCode={form.packCode} onSelect={handleSelectPack} />
        {errors.packCode && <span className="text-xs text-red-600">{errors.packCode}</span>}
      </div>

      {/* Message */}
      <div className="flex flex-col gap-1">
        <label htmlFor="message" className="text-sm font-semibold text-gray-700">Message :</label>
        <textarea id="message" name="message" value={form.message} onChange={handleChange}
          rows={4} maxLength={500} placeholder="Describe your audit request (optional)"
          className="rounded-md bg-gray-100 px-3 py-2 text-sm outline-none ring-brand/40 focus:bg-white focus:ring-2" />
      </div>

      {errors.submit && <span className="text-sm text-red-600">{errors.submit}</span>}

      <button type="submit" disabled={submitting}
        className="self-start rounded-md bg-brand px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-dark disabled:opacity-50">
        {submitting ? "Shipment in progress…" : "Sent the audit request"}
      </button>
    </form>
  );
}
