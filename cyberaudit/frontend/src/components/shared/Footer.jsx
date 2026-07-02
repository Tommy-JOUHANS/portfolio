// ========================================================================
// Footer.jsx - Pied de page enrichi avec contact + liens + pages legales.
// ========================================================================
import { Link } from "react-router-dom";
import { Copyright, Mail, MapPin, Shield, Scale } from "lucide-react";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-brand text-white">
      <div className="mx-auto max-w-6xl px-6 py-8">
        <div className="grid gap-6 md:grid-cols-4">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2">
              <Shield size={20} />
              <h3 className="text-lg font-bold">CyberAudit &amp; Solutions</h3>
            </div>
            <p className="mt-2 text-sm text-white/70">
              Cybersecurity audit platform for French SMEs without in-house IT security.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold">Quick Links</h4>
            <ul className="mt-2 space-y-1 text-sm">
              <li>
                <Link to="/" className="text-white/70 transition hover:text-white">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-white/70 transition hover:text-white">
                  Sign In
                </Link>
              </li>
              <li>
                <Link to="/register" className="text-white/70 transition hover:text-white">
                  Create an account
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <div className="flex items-center gap-2">
              <Scale size={16} />
              <h4 className="font-semibold">Legal</h4>
            </div>
            <ul className="mt-2 space-y-1 text-sm">
              <li>
                <Link to="/mentions-legales" className="text-white/70 transition hover:text-white">
                  Legal Notice
                </Link>
              </li>
              <li>
                <Link to="/confidentialite" className="text-white/70 transition hover:text-white">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/cgu" className="text-white/70 transition hover:text-white">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold">Contact</h4>
            <ul className="mt-2 space-y-1 text-sm text-white/70">
              <li className="flex items-center gap-2">
                <Mail size={14} />
                <a href="mailto:cyberaudit721@gmail.com" className="transition hover:text-white">
                  cyberaudit721@gmail.com
                </a>
              </li>
              <li className="flex items-center gap-2">
                <MapPin size={14} />
                Dijon, France
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-6 border-t border-white/20 pt-4 text-center text-sm text-white/80">
          <Copyright className="inline-block h-4 w-4" /> {year} CyberAudit &amp; Solutions. <em className="italic text-white/50">All rights reserved.</em>
        </div>
      </div>
    </footer>
  );
}
