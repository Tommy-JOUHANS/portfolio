// emails/AuditStatusEmail.jsx
import {
  Body, Button, Container, Head, Heading,
  Html, Preview, Section, Text,
} from "@react-email/components";

const STATUS_LABELS = {
  pending:     "Pending",
  in_progress: "In Progress",
  completed:   "Completed",
  cancelled:   "Cancelled",
};

const STATUS_COLORS = {
  pending:     "#f59e0b",
  in_progress: "#3b82f6",
  completed:   "#10b981",
  cancelled:   "#ef4444",
};

export default function AuditStatusEmail({
  firstName    = "User",
  auditId      = "42",
  status       = "in_progress",
  dashboardUrl = "http://localhost:5173/dashboard",
}) {
  const label = STATUS_LABELS[status] ?? status;
  const color = STATUS_COLORS[status] ?? "#7c3aed";

  return (
    <Html>
      <Head />
      <Preview>Votre audit #{auditId} : {label}</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Heading style={styles.h1}>Mise à jour de votre audit</Heading>
          <Text style={styles.text}>Bonjour {firstName},</Text>
          <Text style={styles.text}>
            Le statut de votre audit <strong>#{auditId}</strong> a été mis à jour :
          </Text>
          <Section style={{ ...styles.badge, borderLeft: `4px solid ${color}` }}>
            <Text style={{ margin: 0, fontWeight: 600, color }}>
              {label}
            </Text>
          </Section>
          <Section style={{ textAlign: "center", marginTop: 24 }}>
            <Button href={dashboardUrl} style={styles.button}>
              Voir mon audit
            </Button>
          </Section>
          <Text style={styles.footer}>L'équipe CyberAudit</Text>
        </Container>
      </Body>
    </Html>
  );
}

AuditStatusEmail.PreviewProps = {
  firstName:    "Marie",
  auditId:      "99",
  status:       "completed",
  dashboardUrl: "http://localhost:5173/dashboard",
};

const styles = {
  body:      { backgroundColor: "#f6f9fc", fontFamily: "sans-serif" },
  container: { maxWidth: 600, margin: "0 auto", backgroundColor: "#fff",
               padding: 32, borderRadius: 8 },
  h1:        { color: "#7c3aed", fontSize: 24, marginBottom: 16 },
  text:      { color: "#374151", fontSize: 16, lineHeight: "1.6" },
  badge:     { backgroundColor: "#f3f4f6", padding: 16, borderRadius: 8, margin: "16px 0" },
  button:    { backgroundColor: "#7c3aed", color: "#fff", padding: "12px 24px",
               borderRadius: 6, textDecoration: "none", display: "inline-block" },
  footer:    { color: "#9ca3af", fontSize: 13, marginTop: 32 },
};
