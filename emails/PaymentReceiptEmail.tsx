import * as React from "react";
import { Button, Heading, Section, Text } from "@react-email/components";
import { EmailLayout } from "./components/EmailLayout";

type Props = {
  name: string;
  amount: number;
  method: "M-Pesa" | "Card";
  rideId: string;
  reference: string;
};

export default function PaymentReceiptEmail({
  name,
  amount,
  method,
  rideId,
  reference,
}: Props) {
  const firstName = name?.split(" ")[0] || "Traveller";
  const now = new Date().toLocaleString("en-KE", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <EmailLayout
      preview={`Payment of KES ${amount.toLocaleString()} confirmed`}
      accent="#16a34a"
    >
      <div style={{ textAlign: "center" }}>
        {/* Check circle icon */}
        <svg width="56" height="56" viewBox="0 0 24 24" fill="none" style={{ marginBottom: 8 }}>
          <circle cx="12" cy="12" r="10" fill="#dcfce7" stroke="#16a34a" strokeWidth="1.5" />
          <path d="M7.5 12.5l3 3 6-6.5" stroke="#16a34a" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      <Heading style={headingStyle}>Payment received 🎉</Heading>
      <Text style={leadStyle}>
        Asante sana, {firstName}. Your seat is locked in and your driver has
        been notified. Here's your receipt — keep it safe.
      </Text>

      <Section style={receiptCardStyle}>
        <Row label="AMOUNT" value={`KES ${amount.toLocaleString()}`} large />
        <Row label="METHOD" value={method} />
        <Row label="REFERENCE" value={reference} mono />
        <Row label="RIDE" value={`#${rideId.slice(0, 8)}`} mono />
        <Row label="DATE" value={now} />
      </Section>

      <table role="presentation" width="100%" style={{ margin: "22px 0 4px" }}>
        <tr>
          <td align="center" style={{ padding: "0 6px" }}>
            <Button href="https://kipita.app/trips" style={primaryCtaStyle}>
              View my rides
            </Button>
          </td>
          <td align="center" style={{ padding: "0 6px" }}>
            <Button href="https://kipita.app/support" style={secondaryCtaStyle}>
              Contact support
            </Button>
          </td>
        </tr>
      </table>

      <Text style={mutedStyle}>
        Funds are held securely until your trip is confirmed complete. If
        anything goes wrong, we've got your back.
      </Text>
    </EmailLayout>
  );
}

function Row({
  label,
  value,
  large,
  mono,
}: {
  label: string;
  value: string;
  large?: boolean;
  mono?: boolean;
}) {
  return (
    <table role="presentation" width="100%" style={{ borderCollapse: "collapse" }}>
      <tr>
        <td style={rowLabelStyle}>{label}</td>
        <td
          style={{
            ...rowValueStyle,
            fontSize: large ? 20 : 14,
            fontWeight: large ? 800 : 600,
            color: large ? "#16a34a" : "#0f1613",
            fontFamily: mono
              ? "ui-monospace, SFMono-Regular, Menlo, monospace"
              : undefined,
          }}
        >
          {value}
        </td>
      </tr>
    </table>
  );
}

const headingStyle: React.CSSProperties = {
  color: "#0f1613",
  fontSize: 24,
  fontWeight: 800,
  margin: "6px 0 10px",
  textAlign: "center" as const,
};

const leadStyle: React.CSSProperties = {
  color: "#374151",
  fontSize: 14,
  lineHeight: 1.6,
  margin: "0 0 20px",
  textAlign: "center" as const,
};

const receiptCardStyle: React.CSSProperties = {
  backgroundColor: "#f9fafb",
  border: "1px dashed #d1d5db",
  borderRadius: 14,
  padding: "14px 18px",
};

const rowLabelStyle: React.CSSProperties = {
  color: "#6b7280",
  fontSize: 10,
  fontWeight: 800,
  letterSpacing: "0.12em",
  padding: "10px 0",
  textAlign: "left" as const,
};

const rowValueStyle: React.CSSProperties = {
  padding: "10px 0",
  textAlign: "right" as const,
};

const primaryCtaStyle: React.CSSProperties = {
  backgroundColor: "#16a34a",
  borderRadius: 999,
  color: "#ffffff",
  display: "inline-block",
  fontSize: 13,
  fontWeight: 700,
  padding: "12px 22px",
  textDecoration: "none",
};

const secondaryCtaStyle: React.CSSProperties = {
  backgroundColor: "#ffffff",
  border: "1px solid #16a34a",
  borderRadius: 999,
  color: "#16a34a",
  display: "inline-block",
  fontSize: 13,
  fontWeight: 700,
  padding: "12px 22px",
  textDecoration: "none",
};

const mutedStyle: React.CSSProperties = {
  color: "#6b7280",
  fontSize: 12,
  margin: "18px 0 0",
  textAlign: "center" as const,
  lineHeight: 1.6,
};
