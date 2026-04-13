import * as React from "react";
import { Button, Heading, Section, Text } from "@react-email/components";
import { EmailLayout } from "./components/EmailLayout";

type Props = {
  name: string;
  role: "passenger" | "driver" | "admin";
};

export default function WelcomeEmail({ name, role }: Props) {
  const firstName = name?.split(" ")[0] || "friend";
  const roleCopy =
    role === "driver"
      ? "Ready to offer a ride? Post your next trip and start matching with passengers heading your way."
      : "Ready to hit the road? Search for a ride or post a request and drivers will reach out.";

  return (
    <EmailLayout preview={`Karibu ${firstName}! Your Kipita account is ready.`}>
      <Heading style={headingStyle}>Karibu, {firstName} 👋</Heading>
      <Text style={leadStyle}>
        Welcome to <b>Kipita</b>, Kenya's community carpool. You're officially
        part of a crew that's making every trip a little cheaper, a little
        greener, and a lot friendlier.
      </Text>

      <Section style={cardStyle}>
        <Text style={cardLabelStyle}>
          {/* Compass icon */}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ verticalAlign: "middle", marginRight: 6 }}>
            <circle cx="12" cy="12" r="9" stroke="#16a34a" strokeWidth="1.8" />
            <path d="M8 16l2-6 6-2-2 6z" stroke="#16a34a" strokeWidth="1.8" strokeLinejoin="round" />
          </svg>
          FIRST STEPS
        </Text>
        <Text style={bulletStyle}>• Add your phone number and verify it</Text>
        <Text style={bulletStyle}>• {roleCopy}</Text>
        <Text style={bulletStyle}>• Invite a friend and travel together</Text>
      </Section>

      <Section style={{ textAlign: "center", margin: "24px 0 8px" }}>
        <Button href="https://kipita.app/home" style={ctaStyle}>
          Open Kipita
        </Button>
      </Section>

      <Text style={mutedStyle}>
        Questions? Reply to this email or tap <b>Contact support</b> below — we
        answer fast.
      </Text>
    </EmailLayout>
  );
}

const headingStyle: React.CSSProperties = {
  color: "#0f1613",
  fontSize: 26,
  fontWeight: 800,
  letterSpacing: "-0.01em",
  margin: "0 0 12px",
};

const leadStyle: React.CSSProperties = {
  color: "#374151",
  fontSize: 15,
  lineHeight: 1.6,
  margin: "0 0 20px",
};

const cardStyle: React.CSSProperties = {
  backgroundColor: "#f0fdf4",
  borderRadius: 14,
  border: "1px solid #bbf7d0",
  padding: "18px 20px",
};

const cardLabelStyle: React.CSSProperties = {
  color: "#16a34a",
  fontSize: 11,
  fontWeight: 800,
  letterSpacing: "0.15em",
  margin: "0 0 10px",
};

const bulletStyle: React.CSSProperties = {
  color: "#1f2937",
  fontSize: 14,
  margin: "4px 0",
  lineHeight: 1.5,
};

const ctaStyle: React.CSSProperties = {
  backgroundColor: "#16a34a",
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
  fontSize: 13,
  margin: "16px 0 0",
  textAlign: "center" as const,
};
