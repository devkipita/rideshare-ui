import * as React from "react";
import { Button, Heading, Section, Text } from "@react-email/components";
import { EmailLayout } from "./components/EmailLayout";

type Props = {
  name: string;
  origin: string;
  destination: string;
  departureTime: string;
  driverName: string;
  seats: number;
};

export default function TripConfirmationEmail({
  name,
  origin,
  destination,
  departureTime,
  driverName,
  seats,
}: Props) {
  const firstName = name?.split(" ")[0] || "Traveller";
  const dt = new Date(departureTime);
  const friendlyDate = isNaN(dt.getTime())
    ? departureTime
    : dt.toLocaleString("en-KE", { dateStyle: "full", timeStyle: "short" });

  return (
    <EmailLayout
      preview={`Trip confirmed: ${origin} → ${destination}`}
      accent="#0ea5e9"
    >
      <Heading style={headingStyle}>Your trip is confirmed ✨</Heading>
      <Text style={leadStyle}>
        Safari njema, {firstName}! {driverName.split(" ")[0]} is expecting you.
        Here's everything you need for the road.
      </Text>

      {/* Route card with Kenyan map pin icons */}
      <Section style={routeCardStyle}>
        <table role="presentation" width="100%">
          <tr>
            <td style={{ width: 36, verticalAlign: "top" }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="5" fill="#0ea5e9" />
                <circle cx="12" cy="12" r="9" stroke="#0ea5e9" strokeOpacity="0.25" strokeWidth="2" />
              </svg>
            </td>
            <td>
              <Text style={routeLabelStyle}>FROM</Text>
              <Text style={routePlaceStyle}>{origin}</Text>
            </td>
          </tr>
          <tr>
            <td>
              <div style={dottedLineStyle} />
            </td>
            <td />
          </tr>
          <tr>
            <td style={{ width: 36, verticalAlign: "top" }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 22s7-7.5 7-13a7 7 0 10-14 0c0 5.5 7 13 7 13z"
                  fill="#0ea5e9"
                />
                <circle cx="12" cy="9" r="2.4" fill="#ffffff" />
              </svg>
            </td>
            <td>
              <Text style={routeLabelStyle}>TO</Text>
              <Text style={routePlaceStyle}>{destination}</Text>
            </td>
          </tr>
        </table>
      </Section>

      {/* Details grid */}
      <table role="presentation" width="100%" style={{ marginTop: 14 }}>
        <tr>
          <td style={pillCellStyle}>
            <Text style={pillLabelStyle}>DEPARTURE</Text>
            <Text style={pillValueStyle}>{friendlyDate}</Text>
          </td>
        </tr>
        <tr>
          <td style={pillCellStyle}>
            <Text style={pillLabelStyle}>DRIVER</Text>
            <Text style={pillValueStyle}>{driverName}</Text>
          </td>
        </tr>
        <tr>
          <td style={pillCellStyle}>
            <Text style={pillLabelStyle}>SEATS</Text>
            <Text style={pillValueStyle}>
              {seats} seat{seats === 1 ? "" : "s"}
            </Text>
          </td>
        </tr>
      </table>

      <Section style={{ textAlign: "center", margin: "22px 0 4px" }}>
        <Button href="https://kipita.app/trips" style={ctaStyle}>
          Open trip details
        </Button>
      </Section>

      <Text style={mutedStyle}>
        Running late or can't make it? Tap <b>Contact support</b> below and
        we'll help you reschedule.
      </Text>
    </EmailLayout>
  );
}

const headingStyle: React.CSSProperties = {
  color: "#0f1613",
  fontSize: 24,
  fontWeight: 800,
  margin: "0 0 10px",
};

const leadStyle: React.CSSProperties = {
  color: "#374151",
  fontSize: 14,
  lineHeight: 1.6,
  margin: "0 0 20px",
};

const routeCardStyle: React.CSSProperties = {
  backgroundColor: "#f0f9ff",
  border: "1px solid #bae6fd",
  borderRadius: 16,
  padding: "16px 18px",
};

const routeLabelStyle: React.CSSProperties = {
  color: "#0369a1",
  fontSize: 10,
  fontWeight: 800,
  letterSpacing: "0.15em",
  margin: "0 0 2px",
};

const routePlaceStyle: React.CSSProperties = {
  color: "#0f1613",
  fontSize: 16,
  fontWeight: 800,
  margin: "0 0 4px",
};

const dottedLineStyle: React.CSSProperties = {
  borderLeft: "2px dotted #7dd3fc",
  height: 18,
  marginLeft: 10,
};

const pillCellStyle: React.CSSProperties = {
  backgroundColor: "#f9fafb",
  border: "1px solid #e5e7eb",
  borderRadius: 12,
  padding: "10px 14px",
};

const pillLabelStyle: React.CSSProperties = {
  color: "#6b7280",
  fontSize: 10,
  fontWeight: 800,
  letterSpacing: "0.12em",
  margin: 0,
};

const pillValueStyle: React.CSSProperties = {
  color: "#0f1613",
  fontSize: 14,
  fontWeight: 700,
  margin: "4px 0 0",
};

const ctaStyle: React.CSSProperties = {
  backgroundColor: "#0ea5e9",
  borderRadius: 999,
  color: "#ffffff",
  display: "inline-block",
  fontSize: 14,
  fontWeight: 700,
  padding: "14px 32px",
  textDecoration: "none",
};

const mutedStyle: React.CSSProperties = {
  color: "#6b7280",
  fontSize: 12,
  margin: "18px 0 0",
  lineHeight: 1.6,
  textAlign: "center" as const,
};
