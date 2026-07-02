import React from "react";
import { Link } from "react-router-dom";

/**
 * Terms of Service - CyberAudit & Solutions
 * Route: /cgu
 */
export default function CGU() {
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
            Terms of Service
          </h1>
          <p className="text-slate-300">Last updated: July 2, 2026</p>
        </div>

        <div className="bg-cyan-500/10 border border-cyan-400/40 rounded-xl p-6 mb-10">
          <p className="text-slate-100 leading-relaxed">
            By creating an account or using CyberAudit &amp; Solutions, you
            fully accept these Terms of Service (ToS). Please read them
            carefully.
          </p>
        </div>

        <div className="space-y-10">
          <section className="bg-[#1E2761] rounded-xl p-6 md:p-8 border border-cyan-500/20">
            <h2 className="text-2xl font-bold text-cyan-400 mb-4">
              Article 1 &mdash; Purpose
            </h2>
            <p className="text-slate-200 leading-relaxed">
              CyberAudit &amp; Solutions is an educational cybersecurity audit
              platform for French SMEs. The service allows users to run a
              self-audit of their IT security posture and receive a PDF report
              with recommendations.
            </p>
          </section>

          <section className="bg-[#1E2761] rounded-xl p-6 md:p-8 border border-cyan-500/20">
            <h2 className="text-2xl font-bold text-cyan-400 mb-4">
              Article 2 &mdash; Service Publishers
            </h2>
            <p className="text-slate-200 mb-3">
              The service is co-published by:
            </p>
            <ul className="space-y-2 text-slate-200">
              <li>
                &bull; <strong>James ROUSSEL</strong> &mdash; Student, Holberton
                School Dijon
              </li>
              <li>
                &bull; <strong>Tommy JOUHANS</strong> &mdash; Student, Holberton
                School Dijon
              </li>
            </ul>
            <p className="text-slate-200 mt-4">
              Contact:{" "}
              <a
                href="mailto:cyberaudit721@gmail.com"
                className="text-cyan-400 hover:text-cyan-300"
              >
                cyberaudit721@gmail.com
              </a>
            </p>
          </section>

          <section className="bg-[#1E2761] rounded-xl p-6 md:p-8 border border-cyan-500/20">
            <h2 className="text-2xl font-bold text-cyan-400 mb-4">
              Article 3 &mdash; Access to the Service
            </h2>
            <p className="text-slate-200 leading-relaxed mb-3">
              Access to the service is free as part of this educational
              project. It requires:
            </p>
            <ul className="space-y-2 text-slate-200">
              <li>&bull; An account with a valid email address</li>
              <li>&bull; A password meeting our complexity requirements</li>
              <li>&bull; An Internet connection and a modern browser</li>
            </ul>
            <p className="text-slate-200 mt-4">
              We strive to ensure maximum service availability but do not
              guarantee 24/7 uptime. Maintenance interruptions may occur.
            </p>
          </section>

          <section className="bg-[#1E2761] rounded-xl p-6 md:p-8 border border-cyan-500/20">
            <h2 className="text-2xl font-bold text-cyan-400 mb-4">
              Article 4 &mdash; User Account
            </h2>
            <p className="text-slate-200 leading-relaxed mb-3">
              Each user is responsible for:
            </p>
            <ul className="space-y-2 text-slate-200">
              <li>
                &bull; The <strong>confidentiality</strong> of their login
                credentials
              </li>
              <li>
                &bull; The <strong>accuracy</strong> of the information
                provided
              </li>
              <li>
                &bull; Any <strong>action performed</strong> from their account
              </li>
            </ul>
            <p className="text-slate-200 mt-4">
              In case of loss or theft of your credentials, contact us
              immediately. We reserve the right to suspend any account used
              fraudulently or abusively.
            </p>
          </section>

          <section className="bg-[#1E2761] rounded-xl p-6 md:p-8 border border-cyan-500/20">
            <h2 className="text-2xl font-bold text-cyan-400 mb-4">
              Article 5 &mdash; Acceptable Use
            </h2>
            <p className="text-slate-200 mb-3">
              The user agrees not to:
            </p>
            <ul className="space-y-2 text-slate-200">
              <li>
                &bull; Attempt to <strong>compromise the security</strong> of
                the service (injection, XSS, brute force, DDoS)
              </li>
              <li>
                &bull; Massively extract data via unauthorized automated
                scripts
              </li>
              <li>
                &bull; Use the service for <strong>illegal</strong> or
                fraudulent purposes
              </li>
              <li>
                &bull; Impersonate <strong>another person</strong> or company
              </li>
              <li>
                &bull; Redistribute, resell or modify the service without
                authorization
              </li>
            </ul>
            <p className="text-slate-200 mt-4">
              Any violation may result in <strong>immediate account
              deletion</strong> without notice, and legal proceedings where
              applicable.
            </p>
          </section>

          <section className="bg-[#1E2761] rounded-xl p-6 md:p-8 border border-cyan-500/20">
            <h2 className="text-2xl font-bold text-cyan-400 mb-4">
              Article 6 &mdash; Nature of the Audit Reports
            </h2>
            <p className="text-slate-200 leading-relaxed mb-3">
              Audit reports generated by CyberAudit are provided{" "}
              <strong>for indicative and educational purposes only</strong>.
              They are based on the user's declarative answers and do not have
              the value of an official security audit conducted by a certified
              firm.
            </p>
            <p className="text-slate-200 leading-relaxed">
              The user remains solely responsible for implementing the
              recommendations and for the actual security of their information
              system.
            </p>
          </section>

          <section className="bg-[#1E2761] rounded-xl p-6 md:p-8 border border-cyan-500/20">
            <h2 className="text-2xl font-bold text-cyan-400 mb-4">
              Article 7 &mdash; Intellectual Property
            </h2>
            <p className="text-slate-200 leading-relaxed">
              The content of the site (design, text, source code, CyberAudit
              brand) is protected by copyright and belongs exclusively to the
              publishers. Any unauthorized reproduction is prohibited.
            </p>
            <p className="text-slate-200 leading-relaxed mt-3">
              The user retains <strong>ownership of their data</strong> (audit
              answers, personalized reports).
            </p>
          </section>

          <section className="bg-[#1E2761] rounded-xl p-6 md:p-8 border border-cyan-500/20">
            <h2 className="text-2xl font-bold text-cyan-400 mb-4">
              Article 8 &mdash; Limitation of Liability
            </h2>
            <p className="text-slate-200 leading-relaxed mb-3">
              CyberAudit is an educational project provided "as is". The
              publishers cannot be held responsible for:
            </p>
            <ul className="space-y-2 text-slate-200">
              <li>
                &bull; Damages resulting from a <strong>misinterpretation</strong>
                of the reports
              </li>
              <li>
                &bull; Service interruptions or exceptional{" "}
                <strong>data losses</strong>
              </li>
              <li>
                &bull; Malicious acts by <strong>third parties</strong>{" "}
                (hacking, phishing)
              </li>
              <li>&bull; Uses non-compliant with these ToS</li>
            </ul>
          </section>

          <section className="bg-[#1E2761] rounded-xl p-6 md:p-8 border border-cyan-500/20">
            <h2 className="text-2xl font-bold text-cyan-400 mb-4">
              Article 9 &mdash; Account Deletion
            </h2>
            <p className="text-slate-200 leading-relaxed mb-3">
              The user can request account and data deletion at any time:
            </p>
            <ul className="space-y-2 text-slate-200">
              <li>
                &bull; From their personal space ("Delete my account" button)
              </li>
              <li>
                &bull; By email to{" "}
                <a
                  href="mailto:cyberaudit721@gmail.com"
                  className="text-cyan-400 hover:text-cyan-300"
                >
                  cyberaudit721@gmail.com
                </a>
              </li>
            </ul>
            <p className="text-slate-200 mt-4">
              Deletion is <strong>effective within 30 days</strong>. Only
              security logs (legal requirement) are kept for 12 additional
              months.
            </p>
          </section>

          <section className="bg-[#1E2761] rounded-xl p-6 md:p-8 border border-cyan-500/20">
            <h2 className="text-2xl font-bold text-cyan-400 mb-4">
              Article 10 &mdash; Data Protection
            </h2>
            <p className="text-slate-200 leading-relaxed">
              The processing of your personal data is detailed in our{" "}
              <Link
                to="/confidentialite"
                className="text-cyan-400 hover:text-cyan-300 underline"
              >
                Privacy Policy
              </Link>
              , which is GDPR compliant.
            </p>
          </section>

          <section className="bg-[#1E2761] rounded-xl p-6 md:p-8 border border-cyan-500/20">
            <h2 className="text-2xl font-bold text-cyan-400 mb-4">
              Article 11 &mdash; Changes to the ToS
            </h2>
            <p className="text-slate-200 leading-relaxed">
              The publishers reserve the right to modify these ToS at any
              time. Any substantial change will be notified by email to
              registered users. The last update date is shown at the top of
              this page.
            </p>
          </section>

          <section className="bg-[#1E2761] rounded-xl p-6 md:p-8 border border-cyan-500/20">
            <h2 className="text-2xl font-bold text-cyan-400 mb-4">
              Article 12 &mdash; Applicable Law and Jurisdiction
            </h2>
            <p className="text-slate-200 leading-relaxed">
              These ToS are governed by <strong>French law</strong>. Any
              dispute relating to their interpretation or execution will fall
              within the exclusive jurisdiction of French courts.
            </p>
            <p className="text-slate-200 leading-relaxed mt-3">
              In the event of a dispute, the parties commit to seeking an
              amicable solution before any legal action.
            </p>
          </section>

          <section className="bg-[#1E2761] rounded-xl p-6 md:p-8 border border-cyan-500/20">
            <h2 className="text-2xl font-bold text-cyan-400 mb-4">
              Related Documents
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
                to="/confidentialite"
                className="bg-[#0F1B4C] rounded-lg p-4 border border-cyan-500/30 hover:border-cyan-400 hover:bg-[#152058] transition"
              >
                <div className="font-semibold text-white mb-1">
                  Privacy Policy
                </div>
                <div className="text-slate-400 text-sm">
                  How we handle your personal data (GDPR)
                </div>
              </Link>
            </div>
          </section>
        </div>

        <div className="mt-12 text-center text-slate-500 text-sm">
          &copy; 2026 CyberAudit &amp; Solutions. All rights reserved.
        </div>
      </div>
    </div>
  );
}
