// emails/WelcomeEmail.jsx
// Prévisualiser : npm run email → http://localhost:4000
import {
  Body, Button, Container, Head, Heading,
  Html, Preview, Section, Text,
} from "@react-email/components";

export default function WelcomeEmail({
  firstName   = "Utilisateur",
  dashboardUrl = "http://localhost:5173/dashboard",
}) {
  return (
    <Html>
      <Head />
      <Preview>Welcome to CyberAudit 🛡️</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Heading style={styles.h1}>
            Welcome to CyberAudit, {firstName} !
          </Heading>
          <Text style={styles.text}>
            Your account has been successfully created.
            You can now access your dashboard and submit a cybersecurity audit request..
          </Text>
          <Section style={{ textAlign: "center", marginTop: 24 }}>
            <Button href={dashboardUrl} style={styles.button}>
              Access Dashboard
            </Button>
          </Section>
          <Text style={styles.footer}>The CyberAudit Team</Text>
        </Container>
      </Body>
    </Html>
  );
}

// Props de prévisualisation (affichées dans react-email dev)
WelcomeEmail.PreviewProps = {
  firstName:    "Marie",
  dashboardUrl: "http://localhost:5173/dashboard",
};

const styles = {
  body:      { backgroundColor: "#f6f9fc", fontFamily: "sans-serif" },
  container: { maxWidth: 600, margin: "0 auto", backgroundColor: "#fff",
               padding: 32, borderRadius: 8 },
  h1:        { color: "#7c3aed", fontSize: 24, marginBottom: 16 },
  text:      { color: "#374151", fontSize: 16, lineHeight: "1.6" },
  button:    { backgroundColor: "#7c3aed", color: "#fff", padding: "12px 24px",
               borderRadius: 6, textDecoration: "none", display: "inline-block" },
  footer:    { color: "#9ca3af", fontSize: 13, marginTop: 32 },
};
