import * as React from "react";
import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";

type EmailLayoutProps = {
  preview: string;
  accent?: string;
  children: React.ReactNode;
};

const BRAND = "#16a34a"; // Kipita green
const SUPPORT_URL = "https://kipita.app/support";
const APP_URL = "https://kipita.app";
const INSTAGRAM_URL = "https://instagram.com/kipita";
const TWITTER_URL = "https://twitter.com/kipita";

export function EmailLayout({ preview, accent = BRAND, children }: EmailLayoutProps) {
  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={bodyStyle}>
        <Container style={containerStyle}>
          {/* Header */}
          <Section style={{ ...headerStyle, borderTop: `4px solid ${accent}` }}>
            <table width="100%" cellPadding={0} cellSpacing={0} role="presentation">
              <tr>
                <td align="left">
                  <div style={logoMarkStyle}>
                    {/* Simple inline SVG car-on-road icon */}
                    <svg
                      width="28"
                      height="28"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M5 11l1.5-4.5A2 2 0 018.4 5h7.2a2 2 0 011.9 1.5L19 11M5 11h14M5 11v6h2v-2h10v2h2v-6"
                        stroke="#ffffff"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <circle cx="8" cy="15" r="1.2" fill="#ffffff" />
                      <circle cx="16" cy="15" r="1.2" fill="#ffffff" />
                    </svg>
                  </div>
                </td>
                <td align="right">
                  <Text style={headerTagline}>Share the road. Split the cost.</Text>
                </td>
              </tr>
            </table>
          </Section>

          {/* Body */}
          <Section style={contentStyle}>{children}</Section>

          {/* Footer */}
          <Hr style={dividerStyle} />
          <Section style={footerStyle}>
            <Text style={footerLinksStyle}>
              <Link href={SUPPORT_URL} style={footerLinkStyle}>
                Contact support
              </Link>
              {"  ·  "}
              <Link href={`${APP_URL}/trips`} style={footerLinkStyle}>
                My rides
              </Link>
              {"  ·  "}
              <Link href={INSTAGRAM_URL} style={footerLinkStyle}>
                Instagram
              </Link>
              {"  ·  "}
              <Link href={TWITTER_URL} style={footerLinkStyle}>
                Twitter
              </Link>
            </Text>
            <Text style={footerTextStyle}>
              Kipita Kenya Ltd · Nairobi, Kenya
              <br />
              You're receiving this because you have an account with Kipita.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const bodyStyle: React.CSSProperties = {
  backgroundColor: "#f4f5f2",
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  margin: 0,
  padding: "32px 12px",
};

const containerStyle: React.CSSProperties = {
  backgroundColor: "#ffffff",
  borderRadius: 18,
  maxWidth: 560,
  margin: "0 auto",
  overflow: "hidden",
  boxShadow: "0 12px 40px -18px rgba(22, 163, 74, 0.25)",
};

const headerStyle: React.CSSProperties = {
  backgroundColor: "#0f1613",
  padding: "22px 28px",
};

const logoMarkStyle: React.CSSProperties = {
  display: "inline-block",
  width: 40,
  height: 40,
  borderRadius: 12,
  backgroundColor: BRAND,
  textAlign: "center",
  lineHeight: "40px",
  verticalAlign: "middle",
};

const headerTagline: React.CSSProperties = {
  color: "#9ca3a0",
  fontSize: 11,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  margin: 0,
};

const contentStyle: React.CSSProperties = {
  padding: "32px 28px 8px",
};

const dividerStyle: React.CSSProperties = {
  borderColor: "#e5e7eb",
  margin: "16px 28px",
};

const footerStyle: React.CSSProperties = {
  padding: "8px 28px 28px",
  textAlign: "center" as const,
};

const footerLinksStyle: React.CSSProperties = {
  color: "#4b5563",
  fontSize: 12,
  margin: "6px 0",
};

const footerLinkStyle: React.CSSProperties = {
  color: BRAND,
  textDecoration: "none",
  fontWeight: 600,
};

const footerTextStyle: React.CSSProperties = {
  color: "#9ca3af",
  fontSize: 11,
  lineHeight: 1.6,
  margin: "10px 0 0",
};
