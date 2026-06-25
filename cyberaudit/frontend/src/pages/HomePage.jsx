// ========================================================================
// HomePage.jsx - Page d'accueil publique (ecran 1 de la doc).
// ========================================================================
import { Link } from "react-router-dom";
import {
  Search, ShieldAlert, Radar, GraduationCap,
  Zap, FileText, CheckCircle, ArrowRight,
} from "lucide-react";

const SERVICES = [
  {
    icon: Search,
    title: "Risk audit & analysis",
    items: [
      "Identification of vulnerabilities",
      "Risk analysis (EBIOS, ISO 27005)",
      "Clear and appropriate recommendations",
    ],
  },
  {
    icon: ShieldAlert,
    title: "Incident management & vulnerability fixing",
    items: ["Ransomware", "Intrusion", "Data leak", "Restoration after incident"],
  },
  {
    icon: Radar,
    title: "System Protection & 24/7 Monitoring (SOC)",
    items: [
      "Attack detection",
      "Real-time alerts",
      "Quick response",
      "Access management (MFA, passwords, rights)",
      "Professional backups",
    ],
  },
  {
    icon: GraduationCap,
    title: "Awareness",
    items: ["Anti-phishing", "Team training", "Simple and useful best practices"],
  },
];

const PACKS = [
  {
    name: "Pack Audit",
    price: "€1,000",
    included: "Audit & Risk Analysis (EBIOS RM)",
    forWhom: "SMEs new to cybersecurity",
    perimeter: "Initial assessment, vulnerability report",
  },
  {
    name: "Pack Security",
    price: "€2,500",
    included: "Audit + Incident Management & Vulnerability Remediation",
    forWhom: "SMEs that have experienced an incident",
    perimeter: "Audit + remediation of detected vulnerabilities",
  },
  {
    name: "Pack Protection",
    price: "€3,500",
    included: "Audit + System Security & 24/7 SOC Monitoring",
    forWhom: "SMEs with sensitive data",
    perimeter: "Audit + Continuous Monitoring & Real-Time Alerts",
  },
  {
    name: "Pack Premium",
    price: "€5,000",
    included: "Audit + Incidents + SOC + Team Awareness",
    forWhom: "SMEs seeking comprehensive coverage",
    perimeter: "The most comprehensive all-in-one solution",
  },
];

const STATS = [
  { value: "60%", label: "of SMEs hit by cyberattacks in 2024", source: "CESIN Barometer" },
  { value: "4", label: "audit packs from €1k to €5k", source: "Tailored to your needs" },
  { value: "5 days", label: "average audit delivery time", source: "From request to PDF report" },
];

const STEPS = [
  {
    icon: FileText,
    title: "1. Choose your pack",
    text: "Select among our 4 packs based on your needs and budget — from quick audit to full SOC monitoring.",
  },
  {
    icon: Zap,
    title: "2. Submit your request",
    text: "Fill our structured form in 3 minutes. Get instant email confirmation with your unique case number.",
  },
  {
    icon: CheckCircle,
    title: "3. Receive your report",
    text: "Track progress in real time. Receive a detailed PDF vulnerability report with actionable recommendations.",
  },
];

export default function HomePage() {
  return (
    <section className="bg-cream">
      <div className="mx-auto max-w-6xl px-6 py-10">

        {/* ───── HERO ───── */}
        <div className="rounded-2xl bg-gradient-to-br from-brand to-brand-dark px-6 py-12 text-center text-white shadow-md sm:py-16">
          <h1 className="text-3xl font-extrabold sm:text-5xl">
            CyberAudit &amp; Solutions
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-white/90 sm:text-lg">
            Protect your SME from cyberattacks. Get a full security audit in under <strong>5 days</strong>, with a detailed PDF report and clear recommendations.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 rounded-md bg-white px-5 py-2.5 text-sm font-semibold text-brand transition hover:bg-white/90"
            >
              Create an account <ArrowRight size={16} />
            </Link>
            <Link
              to="/login"
              className="rounded-md border border-white px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Sign In
            </Link>
          </div>
        </div>

        {/* ───── STATS ───── */}
        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {STATS.map((s) => (
            <div key={s.label} className="rounded-xl bg-white p-6 text-center shadow-sm">
              <div className="text-4xl font-extrabold text-brand">{s.value}</div>
              <p className="mt-2 text-sm font-medium text-gray-700">{s.label}</p>
              <p className="mt-1 text-xs italic text-gray-400">{s.source}</p>
            </div>
          ))}
        </div>

        {/* ───── HOW IT WORKS ───── */}
        <div className="mt-12">
          <h2 className="text-center text-2xl font-bold text-brand">How it works</h2>
          <p className="mt-2 text-center text-sm text-gray-500">
            From signup to vulnerability report in 3 simple steps
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {STEPS.map((step) => {
              const Icon = step.icon;
              return (
                <div key={step.title} className="rounded-xl bg-white p-6 shadow-sm">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-soft">
                    <Icon size={22} className="text-brand" />
                  </div>
                  <h3 className="mt-4 font-bold text-brand">{step.title}</h3>
                  <p className="mt-2 text-sm text-gray-600">{step.text}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* ───── PRESENTATION + SERVICES (2 cols) ───── */}
        <div className="mt-12 grid gap-8 lg:grid-cols-2">
          <div className="flex flex-col gap-6">
            <article className="rounded-xl bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-brand">
                Presentation of the company
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                Our company supports organisations in two essential areas:
              </p>
              <ul className="mt-2 list-disc pl-5 text-sm text-gray-600">
                <li>Cybersecurity audit</li>
                <li>Vulnerability remediation</li>
              </ul>
            </article>
            <article className="rounded-xl bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-brand">Our services</h2>
              <p className="mt-2 text-sm text-gray-600">
                We secure your data, modernize your IT, and simplify your daily
                life. With our all-in-one solution, you benefit from robust
                cybersecurity and comprehensive support.
              </p>
            </article>
            <article className="rounded-xl bg-brand p-6 text-white shadow-sm">
              <h2 className="text-lg font-bold">Ready to get started?</h2>
              <p className="mt-1 text-sm text-white/80">
                Create your account to submit an audit request and track it in real time.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Link
                  to="/register"
                  className="rounded-md bg-white px-4 py-2 text-sm font-semibold text-brand transition hover:bg-white/90"
                >
                  Create an account
                </Link>
                <Link
                  to="/login"
                  className="rounded-md border border-white px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  Sign In
                </Link>
              </div>
            </article>
          </div>
          <div className="flex flex-col gap-4">
            {SERVICES.map((service) => {
              const Icon = service.icon;
              return (
                <article
                  key={service.title}
                  className="rounded-xl bg-white p-5 shadow-sm"
                >
                  <div className="flex items-center gap-2">
                    <Icon size={20} className="text-brand" />
                    <h3 className="font-bold text-brand">{service.title}</h3>
                  </div>
                  <ul className="mt-2 list-disc pl-6 text-sm text-gray-600">
                    {service.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </article>
              );
            })}
          </div>
        </div>

        {/* ───── PACKAGES TABLE (avec prix) ───── */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-brand">Our packages</h2>
          <p className="mt-1 text-sm text-gray-500">
            Transparent pricing. No hidden fees.
          </p>
          <div className="mt-3 overflow-x-auto rounded-xl bg-white shadow-sm">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-brand text-white">
                <tr>
                  <th className="px-4 py-3 font-semibold">Pack</th>
                  <th className="px-4 py-3 font-semibold">Price</th>
                  <th className="px-4 py-3 font-semibold">Included services</th>
                  <th className="px-4 py-3 font-semibold">For whom?</th>
                  <th className="px-4 py-3 font-semibold">Perimeter</th>
                </tr>
              </thead>
              <tbody>
                {PACKS.map((pack, index) => (
                  <tr
                    key={pack.name}
                    className={index % 2 === 0 ? "bg-white" : "bg-cream"}
                  >
                    <td className="px-4 py-3 font-semibold text-brand">
                      {pack.name}
                    </td>
                    <td className="px-4 py-3 font-bold text-brand">
                      {pack.price}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{pack.included}</td>
                    <td className="px-4 py-3 text-gray-600">{pack.forWhom}</td>
                    <td className="px-4 py-3 text-gray-600">{pack.perimeter}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
