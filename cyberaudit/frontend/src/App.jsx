import { useState } from 'react'
import './App.css'
import { Camera, Moon, Sun } from "lucide-react";

function App() {
  return (
    <>
      <header>
        <img src="src/assets/logo.png" id="logo" alt="Logo" />
        
        <nav>
          <a className="login-button" id="home-link" style={{ color: "white" }}>HOME</a>
          <a className="login-button" id="signin-link" style={{ color: "white" }}> SIGN IN</a>
        </nav>
      </header>

      <main>
        <h2>CyberAudit & Solution</h2>
        
        <section>
          <article>
            <p><b>Presentation of the compagny</b>
              <div></div>
              Our compagny supports organisation in two essentials areas:
            </p>

          </article>
        </section>
      </main>

      <footer>
        <p>&#169; CyberAudit &amp; Solutions - SME Audit Management Platform - 2026.</p>
      </footer>
    </>
  );
}


export default App;