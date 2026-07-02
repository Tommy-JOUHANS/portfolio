import { Link } from "react-router-dom";

/**
 * Privacy Policy - CyberAudit & Solutions
 * GDPR compliant (Articles 13, 15-22, 30, 32)
 */
export default function Confidentialite() {
  const subprocessors = [
    { name: "Vercel", role: "Frontend hosting", loc: "USA (EU-US SCCs)" },
    { name: "Railway", role: "Backend, DB, workers", loc: "USA (EU-US SCCs)" },
    { name: "PostgreSQL (Railway)", role: "Database", loc: "USA" },
    { name: "EmailJS", role: "Email notifications", loc: "USA" },
  ];

  const rights = [
    { right: "Right of access", desc: "Get a copy of your data" },
    { right: "Right to rectification", desc: "Correct inaccurate data" },
    { right: "Right to erasure", desc: "Delete your account" },
    { right: "Right to portability", desc: "Export your data in JSON" },
    { right: "Right to object", desc: "Refuse a specific processing" },
    { right: "Right to restriction", desc: "Freeze a processing" },
  ];

  const measures = [
    "HTTPS encryption with HSTS preloaded",
    "Password hashing: PBKDF2 + SHA256 + 600k iterations",
    "JWT authentication with rotation and blacklist",
    "Rate limiting: 5 req/min anti-brute-force",
    "Strict Content Security Policy against XSS",
    "DOMPurify input sanitization",
    "Django ORM against SQL injection",
    "RBAC with anti-enumeration (404 instead of 403)",
    "Security score recalculated server-side",
    "Security logs and intrusion detection",
  ];

  return (
    <div className="min-h-screen bg-[#0F1B4C] text-white py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-12">
          <Link
            to="/"
            className="text-cyan-400 hover:text-cyan-300 text-sm mb-4 inline-block"
          >
            &larr; Back to home
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold mb-3">
            Privacy Policy
          </h1>
          <p className="text-slate-300">
            GDPR compliant (EU 2016/679) &middot; Last updated: July 2, 2026
          </p>
        </div>

        <div className="bg-cyan-500/10 border border-cyan-400/40 rounded-xl p-6 mb-10">
          <p className="text-slate-100 leading-relaxed">
            <strong>The security and privacy of your data</strong> are our
            priority. This policy explains, in full transparency, what data we
            collect, why, how we protect it, and what your rights are.
          </p>
        </div>

        <div className="space-y-10">
          <section className="bg-[#1E2761] rounded-xl p-6 md:p-8 border border-cyan-500/20">
            <h2 className="text-2xl font-bold text-cyan-400 mb-4">
              1. Data Controllers
            </h2>
            <p className="text-slate-200 mb-4">
              CyberAudit &amp; Solutions is co-published by two students at
              Holberton School Dijon acting as{" "}
              <strong>joint data controllers</strong> under Article 26 of the
              GDPR:
            </p>
            <ul className="space-y-2 text-slate-200">
              <li>&bull; James ROUSSEL</li>
              <li>&bull; Tommy JOUHANS</li>
            </ul>
            <p className="text-slate-200 mt-4">
              Single point of contact for any question about your data:{" "}
              <a
                href="mailto:cyberaudit721@gmail.com"
                className="text-cyan-400 hover:text-cyan-300 font-medium"
              >
                cyberaudit721@gmail.com
              </a>
            </p>
          </section>

          <section className="bg-[#1E2761] rounded-xl p-6 md:p-8 border border-cyan-500/20">
            <h2 className="text-2xl font-bold text-cyan-400 mb-4">
              2. Data Collected
            </h2>
            <p className="text-slate-200 mb-4">
              We apply the <strong>data minimization</strong> principle: we
              only collect data strictly necessary for the service.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-cyan-500/30">
                    <th className="text-left py-3 px-3 text-cyan-300">Data</th>
                    <th className="text-left py-3 px-3 text-cyan-300">
                      Purpose
                    </th>
                    <th className="text-left py-3 px-3 text-cyan-300">
                      Legal Basis
                    </th>
                  </tr>
                </thead>
                <tbody className="text-slate-200">
                  <tr className="border-b border-slate-700">
                    <td className="py-3 px-3">Email address</td>
                    <td className="py-3 px-3">Authentication, notifications</td>
                    <td className="py-3 px-3">Contract</td>
                  </tr>
                  <tr className="border-b border-slate-700">
                    <td className="py-3 px-3">First / Last name</td>
                    <td className="py-3 px-3">Account personalization</td>
                    <td className="py-3 px-3">Contract</td>
                  </tr>
                  <tr className="border-b border-slate-700">
                    <td className="py-3 px-3">Company name</td>
                    <td className="py-3 px-3">Client identification</td>
                    <td className="py-3 px-3">Contract</td>
                  </tr>
                  <tr className="border-b border-slate-700">
                    <td className="py-3 px-3">Audit answers</td>
                    <td className="py-3 px-3">Report generation</td>
                    <td className="py-3 px-3">Contract</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-3">Login logs</td>
                    <td className="py-3 px-3">Security, intrusion detection</td>
                    <td className="py-3 px-3">Legitimate interest</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-slate-400 text-sm mt-4">
              We <strong>do not collect</strong> sensitive data (Art. 9 GDPR)
              or banking data. We use <strong>no tracking cookies</strong> or
              advertising pixels.
            </p>
          </section>

          <section className="bg-[#1E2761] rounded-xl p-6 md:p-8 border border-cyan-500/20">
            <h2 className="text-2xl font-bold text-cyan-400 mb-4">
              3. Data Retention
            </h2>
            <ul className="space-y-2 text-slate-200">
              <li>
                &bull; <strong>Active user account</strong>: until deleted by
                the user
              </li>
              <li>
                &bull; <strong>Inactive account</strong>: auto-deleted after 3
                years of inactivity
              </li>
              <li>
                &bull; <strong>Audit reports (PDF)</strong>: 3 years, then
                anonymization
              </li>
              <li>
                &bull; <strong>Security logs</strong>: 12 months (legal
                requirement)
              </li>
              <li>
                &bull; <strong>Backups</strong>: 30-day rolling window
              </li>
            </ul>
          </section>

          <section className="bg-[#1E2761] rounded-xl p-6 md:p-8 border border-cyan-500/20">
            <h2 className="text-2xl font-bold text-cyan-400 mb-4">
              4. Cookies and Local Storage
            </h2>
            <p className="text-slate-200 mb-4">
              CyberAudit <strong>does not use tracking cookies</strong> or
              third-party advertising cookies. We only use:
            </p>
            <div className="bg-[#0F1B4C] rounded-lg p-5 border-l-4 border-cyan-400">
              <h3 className="font-semibold text-white mb-2">
                sessionStorage (technical)
              </h3>
              <p className="text-slate-300 text-sm">
                Stores your JWT authentication token for the duration of your
                session. Automatically cleared when you close the tab.{" "}
                <strong>Exempt from consent</strong> under CNIL guidance
                (strictly necessary for the service).
              </p>
            </div>
          </section>

          <section className="bg-[#1E2761] rounded-xl p-6 md:p-8 border border-cyan-500/20">
            <h2 className="text-2xl font-bold text-cyan-400 mb-4">
              5. Subprocessors and Transfers
            </h2>
            <p className="text-slate-200 mb-4">
              To operate the service, we rely on the following providers who
              process data on our behalf:
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              {subprocessors.map((sub) => (
                <div
                  key={sub.name}
                  className="bg-[#0F1B4C] rounded-lg p-4 border border-cyan-500/20"
                >
                  <div className="font-semibold text-white">{sub.name}</div>
                  <div className="text-slate-300 text-sm mt-1">{sub.role}</div>
                  <div className="text-slate-500 text-xs mt-2">{sub.loc}</div>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-[#1E2761] rounded-xl p-6 md:p-8 border border-cyan-500/20">
            <h2 className="text-2xl font-bold text-cyan-400 mb-4">
              6. Your Rights (GDPR Articles 15 to 22)
            </h2>
            <p className="text-slate-200 mb-4">
              You have the following rights over your personal data at any
              time:
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              {rights.map((d) => (
                <div
                  key={d.right}
                  className="bg-[#0F1B4C] rounded-lg p-4 border-l-4 border-cyan-400"
                >
                  <div className="font-semibold text-white text-sm">
                    {d.right}
                  </div>
                  <div className="text-slate-400 text-xs mt-1">{d.desc}</div>
                </div>
              ))}
            </div>
            <p className="text-slate-200 mt-6">
              To exercise these rights, contact us at{" "}
              <a
                href="mailto:cyberaudit721@gmail.com"
                className="text-cyan-400 hover:text-cyan-300"
              >
                cyberaudit721@gmail.com
              </a>
              . Response within <strong>30 days maximum</strong>.
            </p>
            <p className="text-slate-400 text-sm mt-3">
              For unresolved complaints, you can file with the{" "}
              <a
                href="https://www.cnil.fr"
                target="_blank"
                rel="noreferrer"
                className="text-cyan-400 hover:underline"
              >
                CNIL
              </a>{" "}
              (French Data Protection Authority).
            </p>
          </section>

          <section className="bg-[#1E2761] rounded-xl p-6 md:p-8 border border-cyan-500/20">
            <h2 className="text-2xl font-bold text-cyan-400 mb-4">
              7. Security Measures (GDPR Article 32)
            </h2>
            <p className="text-slate-200 mb-4">
              We apply a <strong>defense in depth</strong> strategy to protect
              your data:
            </p>
            <div className="grid md:grid-cols-2 gap-3">
              {measures.map((m) => (
                <div
                  key={m}
                  className="flex items-start gap-2 text-slate-200 text-sm"
                >
                  <span className="text-cyan-400 mt-0.5">&#10003;</span>
                  <span>{m}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-[#1E2761] rounded-xl p-6 md:p-8 border border-cyan-500/20">
            <h2 className="text-2xl font-bold text-cyan-400 mb-4">
              8. Breach Notification
            </h2>
            <p className="text-slate-200 leading-relaxed">
              In the event of a data breach likely to result in a risk to your
              rights and freedoms, we commit to informing you within{" "}
              <strong>72 hours</strong> in accordance with Article 33 of the
              GDPR, and to notifying the CNIL.
            </p>
          </section>

          <section className="bg-[#1E2761] rounded-xl p-6 md:p-8 border border-cyan-500/20">
            <h2 className="text-2xl font-bold text-cyan-400 mb-4">
              9. Changes
            </h2>
            <p className="text-slate-200 leading-relaxed">
              We reserve the right to modify this policy. In case of
              substantial changes, users will be informed by email. The last
              update date is shown at the top of this page.
            </p>
          </section>

          <section className="bg-[#1E2761] rounded-xl p-6 md:p-8 border border-cyan-500/20">
            <h2 className="text-2xl font-bold text-cyan-400 mb-4">
              10. Related Documents
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <Link
                to="/mentions-legales"
                className="bg-[#0F1B4C] rounded-lg p-4 border border-cyan-500/30 hover:border-cyan-400 hover:bg-[#152058] transition"
              >
                <div className="font-semibold text-white mb-1">
                  Legal Notice
                </div>
                <div className="text-slate-400 text-sm">
                  Publisher and hosting information
                </div>
              </Link>
              <Link
                to="/cgu"
                className="bg-[#0F1B4C] rounded-lg p-4 border border-cyan-500/30 hover:border-cyan-400 hover:bg-[#152058] transition"
              >
                <div className="font-semibold text-white mb-1">
                  Terms of Service
                </div>
                <div className="text-slate-400 text-sm">
                  Rules for using the service
                </div>
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
