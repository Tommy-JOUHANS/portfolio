import { Link } from "react-router-dom";

/**
 * Legal Notice - CyberAudit & Solutions
 * Recommended route: /legal-notice (or /mentions-legales for FR compatibility)
 */
export default function MentionsLegales() {
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
          <h1 className="text-4xl md:text-5xl font-bold mb-3">Legal Notice</h1>
          <p className="text-slate-300">Last updated: July 2, 2026</p>
        </div>

        <div className="space-y-10">
          {/* Publishers */}
          <section className="bg-[#1E2761] rounded-xl p-6 md:p-8 border border-cyan-500/20">
            <h2 className="text-2xl font-bold text-cyan-400 mb-4">
              1. Site Publishers
            </h2>
            <p className="text-slate-200 mb-4">
              The website <strong>CyberAudit &amp; Solutions</strong> is an
              educational project developed by two students at Holberton
              School Dijon as part of the RNCP Application Developer (CDA)
              certification.
            </p>
            <div className="grid md:grid-cols-2 gap-6 mt-6">
              <div className="bg-[#0F1B4C] rounded-lg p-5 border-l-4 border-cyan-400">
                <h3 className="font-semibold text-white mb-2">James ROUSSEL</h3>
                <p className="text-slate-300 text-sm">
                  Student, Holberton School Dijon
                </p>
                <p className="text-slate-300 text-sm mt-1">Co-publisher</p>
              </div>
              <div className="bg-[#0F1B4C] rounded-lg p-5 border-l-4 border-cyan-400">
                <h3 className="font-semibold text-white mb-2">Tommy JOUHANS</h3>
                <p className="text-slate-300 text-sm">
                  Student, Holberton School Dijon
                </p>
                <p className="text-slate-300 text-sm mt-1">Co-publisher</p>
              </div>
            </div>
          </section>

          {/* Contact */}
          <section className="bg-[#1E2761] rounded-xl p-6 md:p-8 border border-cyan-500/20">
            <h2 className="text-2xl font-bold text-cyan-400 mb-4">
              2. Contact
            </h2>
            <p className="text-slate-200 mb-3">
              For any question about the site, its content or personal data:
            </p>
            <a
              href="mailto:cyberaudit721@gmail.com"
              className="text-cyan-400 hover:text-cyan-300 font-medium"
            >
              cyberaudit721@gmail.com
            </a>
            <p className="text-slate-400 text-sm mt-4">
              Address: Holberton School Dijon, Dijon, France
            </p>
          </section>

          {/* Hosting */}
          <section className="bg-[#1E2761] rounded-xl p-6 md:p-8 border border-cyan-500/20">
            <h2 className="text-2xl font-bold text-cyan-400 mb-4">
              3. Hosting
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-white mb-1">
                  Frontend (user interface)
                </h3>
                <p className="text-slate-300 text-sm">
                  <strong>Vercel Inc.</strong> &mdash; 340 S Lemon Ave #4133,
                  Walnut, CA 91789, USA
                </p>
                <a
                  href="https://vercel.com"
                  target="_blank"
                  rel="noreferrer"
                  className="text-cyan-400 text-sm hover:underline"
                >
                  vercel.com
                </a>
              </div>
              <div>
                <h3 className="font-semibold text-white mb-1">
                  Backend (API, database, workers)
                </h3>
                <p className="text-slate-300 text-sm">
                  <strong>Railway Corp.</strong> &mdash; 500 Folsom St, San
                  Francisco, CA 94105, USA
                </p>
                <a
                  href="https://railway.app"
                  target="_blank"
                  rel="noreferrer"
                  className="text-cyan-400 text-sm hover:underline"
                >
                  railway.app
                </a>
              </div>
            </div>
          </section>

          {/* IP */}
          <section className="bg-[#1E2761] rounded-xl p-6 md:p-8 border border-cyan-500/20">
            <h2 className="text-2xl font-bold text-cyan-400 mb-4">
              4. Intellectual Property
            </h2>
            <p className="text-slate-200 leading-relaxed">
              All content on this site (text, logos, source code, design) is
              the exclusive property of its publishers, unless otherwise
              stated. Any reproduction, even partial, without prior written
              authorization is prohibited.
            </p>
            <p className="text-slate-200 leading-relaxed mt-3">
              The source code of this project is available on GitHub under an
              educational license as part of the Holberton School curriculum.
            </p>
          </section>

          {/* Liability */}
          <section className="bg-[#1E2761] rounded-xl p-6 md:p-8 border border-cyan-500/20">
            <h2 className="text-2xl font-bold text-cyan-400 mb-4">
              5. Limitation of Liability
            </h2>
            <p className="text-slate-200 leading-relaxed">
              This website is an educational project. The security audits
              provided are automated and given for indicative purposes only.
              They do not replace a professional security audit conducted by a
              certified specialized firm.
            </p>
            <p className="text-slate-200 leading-relaxed mt-3">
              The publishers cannot be held responsible for direct or indirect
              damages resulting from the use of the service or from a
              misinterpretation of the audit results.
            </p>
          </section>

          {/* Law */}
          <section className="bg-[#1E2761] rounded-xl p-6 md:p-8 border border-cyan-500/20">
            <h2 className="text-2xl font-bold text-cyan-400 mb-4">
              6. Applicable Law
            </h2>
            <p className="text-slate-200 leading-relaxed">
              These legal notices are governed by French law. Any dispute
              relating to the use of the site will fall within the exclusive
              jurisdiction of French courts.
            </p>
          </section>

          {/* Related docs */}
          <section className="bg-[#1E2761] rounded-xl p-6 md:p-8 border border-cyan-500/20">
            <h2 className="text-2xl font-bold text-cyan-400 mb-4">
              7. Related Documents
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
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
