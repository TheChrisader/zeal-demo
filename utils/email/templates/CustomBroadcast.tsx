import { Body } from "@react-email/body";
import { Container } from "@react-email/container";
import { Head } from "@react-email/head";
import { Html } from "@react-email/html";
import { Link } from "@react-email/link";
import { Markdown } from "@react-email/markdown";
import { Preview } from "@react-email/preview";
import { Section } from "@react-email/section";
import { Tailwind } from "@react-email/tailwind";
import { Text } from "@react-email/text";
import * as React from "react";
import ZealLogo from "@/assets/ZealLogo";

// The props your component accepts
export interface CustomBroadcastProps {
  bodyContent: string;
  meta: {
    subject: string;
    preheader: string;
    unsubscribeUrl: string;
  };
}

export const ZealCustomBroadcast = ({
  bodyContent = "Hello,\n\nThis is a sample custom broadcast message.\n\n## What's New?\n\n- **Feature 1**: Enhanced performance\n- **Feature 2**: Improved user experience\n- **Feature 3**: New integrations available\n\n## Get Started\n\nVisit our [website](https://example.com) to learn more about these updates.\n\n### Next Steps\n\n1. Review the documentation\n2. Try the new features\n3. Share your feedback\n\nThanks for being part of our community!\n\n---\n\nThis is a ~~cancelled~~ completed feature.",
  meta = {
    subject: "Custom Broadcast",
    preheader: "Important updates and announcements",
    unsubscribeUrl: "{{UNSUBSCRIBE_URL}}",
  },
}: CustomBroadcastProps) => {
  return (
    <Html>
      <Tailwind
        config={{
          theme: {
            extend: {
              colors: {
                brand: "#096b0a",
                brandLight: "#096b0a",
                accent: "#f6d32d",
                dark: "#1c1c1e",
                graytext: "#6e6e73",
                bglight: "#f5f5f7",
                cardShadow: "rgba(0, 0, 0, 0.04)",
              },
              fontFamily: {
                serif: ["Georgia", "Times New Roman", "serif"],
                sans: [
                  "-apple-system",
                  "BlinkMacSystemFont",
                  "Segoe UI",
                  "Roboto",
                  "Helvetica",
                  "Arial",
                  "sans-serif",
                ],
              },
            },
          },
        }}
      >
        <Head />
        <Preview>{meta.preheader}</Preview>
        <Body className="bg-bglight m-auto font-sans">
          <Container className="mx-auto w-full max-w-[600px] rounded-lg border border-gray-200 bg-white p-0 shadow-lg sm:w-auto">
            {/* --- HEADER --- */}
            <Section className="from-brand to-brandLight rounded-t-lg bg-gradient-to-r p-4 sm:p-6">
              <div className="flex flex-col items-center gap-3 sm:gap-4">
                <div className="flex items-center space-x-2 text-center sm:space-x-3">
                  <div className="mx-auto flex rounded-lg bg-white p-2">
                    <Link href="https://zealnews.africa/en">
                      <ZealLogo />
                    </Link>
                  </div>
                </div>
              </div>
            </Section>

            {/* --- DATE & HEADER --- */}
            <Section className="border-b border-gray-100 px-4 py-3 sm:px-6 sm:py-4">
              <div className="flex items-center justify-between">
                <Text className="text-brand m-0 text-sm font-bold uppercase tracking-wide">
                  Announcement
                </Text>
                <Text className="text-graytext m-0 text-right text-xs sm:text-sm">
                  {new Date().toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  })}
                </Text>
              </div>
            </Section>

            {/* --- CUSTOM CONTENT --- */}
            <Section className="px-4 py-6 sm:px-6 sm:py-8">
              <Markdown
                markdownCustomStyles={{
                  h1: {
                    color: "#1c1c1e",
                    fontSize: "24px",
                    fontWeight: "bold",
                    marginBottom: "16px",
                    lineHeight: "1.2",
                  },
                  h2: {
                    color: "#1c1c1e",
                    fontSize: "20px",
                    fontWeight: "bold",
                    marginTop: "24px",
                    marginBottom: "12px",
                    lineHeight: "1.3",
                  },
                  h3: {
                    color: "#1c1c1e",
                    fontSize: "18px",
                    fontWeight: "bold",
                    marginTop: "20px",
                    marginBottom: "10px",
                    lineHeight: "1.3",
                  },
                  p: {
                    fontSize: "16px",
                    lineHeight: "24px",
                    color: "#1c1c1e",
                    marginBottom: "16px",
                  },
                  li: {
                    marginBottom: "8px",
                    fontSize: "16px",
                    lineHeight: "24px",
                    color: "#1c1c1e",
                  },
                  ul: {
                    marginBottom: "16px",
                    paddingLeft: "20px",
                  },
                  ol: {
                    marginBottom: "16px",
                    paddingLeft: "20px",
                  },
                  codeInline: {
                    background: "#f5f5f5",
                    padding: "2px 6px",
                    borderRadius: "3px",
                    fontFamily: "monospace",
                    fontSize: "14px",
                  },
                  codeBlock: {
                    background: "#f5f5f5",
                    padding: "12px",
                    borderRadius: "6px",
                    fontFamily: "monospace",
                    fontSize: "14px",
                    marginBottom: "16px",
                    border: "1px solid #e5e5e7",
                  },
                  blockQuote: {
                    borderLeft: "4px solid #1a5fb4",
                    paddingLeft: "16px",
                    margin: "16px 0",
                    fontStyle: "italic",
                    color: "#6e6e73",
                  },
                  hr: {
                    border: "none",
                    borderTop: "1px solid #e5e5e7",
                    margin: "24px 0",
                  },
                }}
                markdownContainerStyles={{
                  padding: "0",
                  backgroundColor: "#ffffff",
                }}
              >
                {bodyContent}
              </Markdown>
            </Section>

            {/* --- FOOTER --- */}
            <Section className="mb-6 rounded bg-orange-50 p-3 text-center sm:mb-8 sm:p-4">
              <Text className="m-0 text-xs text-gray-700">
                Forwarded this email?{" "}
                <Link
                  href="https://zealnews.africa/en/newsletter"
                  className="font-bold text-green-600 underline"
                >
                  Subscribe
                </Link>{" "}
                to get more announcements and updates in your inbox.
              </Text>
            </Section>

            {/* Brand & Legal */}
            <Section className="p-4 text-center sm:p-6">
              <div className="text-center">
                <Link
                  href="https://zealnews.africa/en"
                  className="mx-auto mb-4 w-fit"
                >
                  <ZealLogo />
                </Link>
                <Text className="text-graytext m-0 mx-auto mb-4 max-w-md text-xs leading-relaxed">
                  Bringing you important announcements and updates from trusted
                  sources.
                </Text>
                <div className="mx-auto mb-4 text-center">
                  <Link
                    href="https://zealnews.africa/en/info/about-us"
                    className="text-graytext hover:text-brand mx-2 text-center text-xs"
                  >
                    About
                  </Link>{" "}
                  <Link
                    href="https://zealnews.africa/en/info/privacy-policy"
                    className="text-graytext hover:text-brand mx-2 text-center text-xs"
                  >
                    Privacy Policy
                  </Link>{" "}
                  <Link
                    href="https://zealnews.africa/en/info/terms-and-conditions"
                    className="text-graytext hover:text-brand mx-2 text-center text-xs"
                  >
                    Terms
                  </Link>{" "}
                  <Link
                    href="https://zealnews.africa/en/info/advertise-with-us"
                    className="text-graytext hover:text-brand mx-2 text-center text-xs"
                  >
                    Contact
                  </Link>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4 text-center">
                <Text className="text-graytext m-0 text-xs">
                  You&apos;re receiving this email because you subscribed to
                  Zeal News&apos; communications.
                </Text>
                <Text className="text-graytext m-0 mt-2 text-xs">
                  {/* <Link href="#" className="text-brand hover:underline">
                    Update preferences
                  </Link>{" "}
                  •{" "} */}
                  <Link
                    href={meta.unsubscribeUrl}
                    className="text-brand hover:underline"
                  >
                    Unsubscribe
                  </Link>
                </Text>
                <Text className="text-graytext m-0 mt-2 text-xs">
                  © 2025 Zeal News Africa. All rights reserved.
                </Text>
              </div>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default ZealCustomBroadcast;
