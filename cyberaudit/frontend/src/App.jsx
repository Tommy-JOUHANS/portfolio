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
              <div></div>
              - Cybersecurity audit
              <div></div>
              - The fixing of flows
            </p>

          </article>
          <article>
            <p><b>Our sercices:</b>
              <div></div>
              We secure your data, modernize your IT, and simplify your daily life.
              <div></div>
              With our all-in-one solution, you benefit from:
              robust cybersecurity
              
              comprehensive support
              <div></div>
              - The fixing of flows
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