import { Markdown } from "@react-email/markdown";
import { Section } from "@react-email/section";
import { Text } from "@react-email/text";
import { EmailFooter, EmailHeader, EmailWrapper } from "@/utils/email/components";

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
    <EmailWrapper preheader={meta.preheader}>
      <EmailHeader />

            {/* --- DATE & HEADER --- */}
            <Section className="border-b border-gray-100 px-4 py-1 sm:px-6 sm:py-2">
              <Text className="text-brand bg-brand/5 m-0 rounded-xl px-9 py-2 text-center text-xl font-bold uppercase tracking-wide">
                Announcement
              </Text>
            </Section>

            {/* --- CUSTOM CONTENT --- */}
            <Section className="px-4 py-1 sm:px-6 sm:py-2">
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
            <EmailFooter
              unsubscribeUrl={meta.unsubscribeUrl}
              description="Bringing you important announcements and updates from trusted sources."
              subscribeMessage="to get more announcements and updates in your inbox."
            />
    </EmailWrapper>
  );
};

export default ZealCustomBroadcast;
