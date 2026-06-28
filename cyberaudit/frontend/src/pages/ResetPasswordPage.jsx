import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Lock } from "lucide-react";
import api from "../services/api.js";

export default function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }
    setSubmitting(true);
    try {
      await api.post("/auth/password-reset/confirm/", { token, new_password: newPassword });
      setSuccess(true);
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || "Reset failed. The link may have expired.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="flex justify-center bg-cream px-4 py-12">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm">
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-soft">
            <Lock size={26} className="text-brand" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Reset Password</h1>
          <p className="text-sm text-gray-500">Enter your new password below.</p>
        </div>

        {success ? (
          <div className="mt-6 rounded-lg bg-green-50 p-4 text-center">
            <p className="text-sm font-semibold text-green-700">Password reset successful!</p>
            <p className="mt-1 text-xs text-green-600">Redirecting to login...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">New password</label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 8 characters"
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-brand focus:outline-none"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Confirm password</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-type your password"
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-brand focus:outline-none"
              />
            </div>
            {error && (
              <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
            )}
            <button
              type="submit"
              disabled={submitting}
              className="rounded-md bg-brand py-2.5 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-50"
            >
              {submitting ? "Resetting..." : "Reset password"}
            </button>
            <Link to="/login" className="text-center text-sm text-brand hover:underline">
              Back to login
            </Link>
          </form>
        )}
      </div>
    </section>
  );
}
