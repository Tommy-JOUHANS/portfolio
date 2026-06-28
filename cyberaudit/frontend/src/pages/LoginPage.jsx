// ========================================================================
// LoginPage.jsx - Page de connexion (ecran 3 de la doc).
// ========================================================================
import { useState } from "react";
import { Link } from "react-router-dom";
import { Lock } from "lucide-react";
import LoginForm from "../components/auth/LoginForm.jsx";
import { sendStatusNotification } from "../services/emailService.js";
import api from "../services/api.js";

export default function LoginPage() {
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail]         = useState("");
  const [resetSubmitted, setResetSubmitted] = useState(false);

  async function handleResetSubmit(e) {
    e.preventDefault();
    try {
      const { data } = await api.post("/auth/password-reset/request/", { email: resetEmail });
      if (data.reset_token) {
        const resetUrl = `${window.location.origin}/reset-password/${data.reset_token}`;
        sendStatusNotification({
          to_email:   resetEmail,
          to_name:    data.user_name || resetEmail.split("@")[0],
          reference:  "PASSWORD-RESET",
          new_status: "Reset Link",
          message:    `Click this link to reset your password: ${resetUrl}\n\nThis link expires in 3 days. If you did not request this, please ignore this email.`,
        }).catch((err) => console.error("[reset] EmailJS failed:", err));
      }
    } catch (err) {
      console.error("[reset] Backend failed:", err);
    }
    setResetSubmitted(true);
  }

  function closeResetModal() {
    setShowResetModal(false);
    setTimeout(() => { setResetEmail(""); setResetSubmitted(false); }, 200);
  }

  return (
    <section className="flex justify-center bg-cream px-4 py-8 sm:py-12">
      <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-sm xs:p-6 sm:p-8">
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-soft">
            <Lock size={26} className="text-brand" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Log In</h1>
          <p className="text-sm text-gray-500">
            Enter your credentials to access your account
          </p>
        </div>

        <div className="mt-6">
          <LoginForm />
        </div>

        <div className="mt-3 text-center">
          <button
            type="button"
            onClick={() => setShowResetModal(true)}
            className="text-sm font-medium text-brand transition hover:underline"
          >
            Forgot password?
          </button>
        </div>

        <div className="my-6 border-t border-gray-200" />

        <div className="flex flex-col items-center gap-3">
          <p className="text-sm text-gray-500">Don't have an account?</p>
          <Link
            to="/register"
            className="w-full rounded-md border border-brand py-2.5 text-center text-sm font-semibold text-brand transition hover:bg-brand-soft"
          >
            Create an account
          </Link>
        </div>
      </div>

      {showResetModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
          onClick={closeResetModal}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {resetSubmitted ? (
              <div className="text-center">
                <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
                  <svg className="h-7 w-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-800">Check your email</h3>
                <p className="mt-2 text-sm text-gray-600">
                  If <span className="font-semibold text-brand">{resetEmail}</span> matches an existing account, reset instructions have been sent.
                </p>
                <p className="mt-3 text-xs text-gray-400">
                  Contact <a href="mailto:admin@cyberaudit.fr" className="text-brand hover:underline">admin@cyberaudit.fr</a> if you don&apos;t receive anything within 5 minutes.
                </p>
                <button
                  type="button"
                  onClick={closeResetModal}
                  className="mt-5 w-full rounded-md bg-brand py-2.5 text-sm font-semibold text-white hover:bg-brand-dark"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleResetSubmit}>
                <h3 className="text-lg font-bold text-gray-800">Reset your password</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Enter your email address and we&apos;ll send you instructions to reset your password.
                </p>
                <label className="mt-4 block text-sm font-medium text-gray-700">Email address</label>
                <input
                  type="email"
                  required
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-brand focus:outline-none"
                />
                <div className="mt-5 flex gap-2">
                  <button
                    type="button"
                    onClick={closeResetModal}
                    className="flex-1 rounded-md border border-gray-300 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 rounded-md bg-brand py-2.5 text-sm font-semibold text-white hover:bg-brand-dark"
                  >
                    Send reset link
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
