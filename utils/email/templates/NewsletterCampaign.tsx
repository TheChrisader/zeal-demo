import { EmailArticle } from "@/types/newsletter.type";
import { Body } from "@react-email/body";
import { Column } from "@react-email/column";
import { Container } from "@react-email/container";
import { Head } from "@react-email/head";
import { Hr } from "@react-email/hr";
import { Html } from "@react-email/html";
import { Img } from "@react-email/img";
import { Link } from "@react-email/link";
import { Preview } from "@react-email/preview";
import { Row } from "@react-email/row";
import { Section } from "@react-email/section";
import { Tailwind } from "@react-email/tailwind";
import { Text } from "@react-email/text";
import * as React from "react";

// The props your component accepts
export interface NewsletterProps {
  articles: EmailArticle[];
  meta: {
    subject: string;
    preheader: string;
    unsubscribeUrl: string; // Will pass "{{UNSUBSCRIBE_URL}}" later
  };
}

const array = Array(10).fill(0);

const genericArticles = array.map((_, i) => ({
  title: `Article ${i + 1} Title. Lorem Ipsum and some other rndom filler text to fill out the space.`,
  excerpt: `Article ${i + 1} Excerpt. Lorem Ipsum and blh blah blah elena blah blah blah blah blah blah blah blah  blah blah elena blah blah blah blah blah blah blah`,
  category: `Category`,
  url: "https://domain.com/post/slug",
  thumbnailUrl: "https://domain.com/post/slug/thumbnail",
  dateStr: "Feb 14",
}));

export const ZealNewsletterCampaign = ({
  articles = genericArticles,
  meta = {
    subject: "Newsletter Subject",
    preheader: "Newsletter Preheader",
    unsubscribeUrl: "{{UNSUBSCRIBE_URL}}",
  },
}: NewsletterProps) => {
  const batch1 = articles.slice(0, 5).filter(Boolean);
  const batch2 = articles.slice(5, 10).filter(Boolean);
  return (
    <Html>
      <Tailwind
        config={{
          theme: {
            extend: {
              colors: {
                brand: "#1a5fb4",
                brandLight: "#3584e4",
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
        <Preview>
          Top Stories: Trump calls dealmaking with China &apos;extremely
          hard&apos;
        </Preview>
        <Body className="bg-bglight m-auto font-sans">
          <Container className="mx-auto w-full max-w-[600px] rounded-lg border border-gray-200 bg-white p-0 shadow-lg sm:w-auto">
            {/* --- HEADER --- */}
            <Section className="from-brand to-brandLight rounded-t-lg bg-gradient-to-r p-4 sm:p-6">
              <Row>
                <Column className="w-full">
                  <div className="flex flex-col items-center gap-3 sm:gap-4">
                    <div className="flex items-center space-x-2 text-center sm:space-x-3">
                      <div className="rounded-lg bg-white p-2">
                        <Img
                          src="https://placehold.co/32x32/1a5fb4/ffffff?text=ST"
                          alt="Zeal News Africa Logo"
                          className="size-8"
                        />
                      </div>
                      <div>
                        <Text className="m-0 font-sans text-lg font-bold text-white sm:text-xl">
                          Zeal News Africa
                        </Text>
                        <Text className="m-0 font-sans text-xs text-white/80">
                          Balanced news
                        </Text>
                      </div>
                    </div>
                    <Link
                      href="#"
                      className="text-brand block w-full max-w-[200px] rounded-full bg-white px-4 py-2 text-center text-xs font-semibold transition-colors hover:bg-gray-50 sm:inline-block sm:px-6"
                    >
                      Subscribe
                    </Link>
                  </div>
                </Column>
              </Row>
            </Section>

            {/* --- DATE & TOP STORIES HEADER --- */}
            <Section className="border-b border-gray-100 px-4 py-3 sm:px-6 sm:py-4">
              <Row>
                <Column>
                  <Text className="text-brand m-0 text-sm font-bold uppercase tracking-wide">
                    Top Stories
                  </Text>
                </Column>
                <Column align="right">
                  <Text className="text-graytext m-0 text-right text-xs sm:text-sm">
                    {new Date().toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}
                  </Text>
                </Column>
              </Row>
            </Section>

            {batch1.map((batch, i) => {
              return (
                <Section
                  key={i}
                  className="mb-0 transition-colors hover:bg-gray-50"
                >
                  <Row className="p-4 sm:p-6">
                    <Column className="w-full">
                      <Img
                        src={batch.thumbnailUrl}
                        alt={batch.title}
                        width="600"
                        height="300"
                        className="mb-4 h-auto w-full rounded-lg object-cover shadow-sm"
                        style={{ maxWidth: "100%", height: "auto" }}
                      />
                      <Text className="text-dark m-0 mb-3 font-serif text-lg font-bold leading-tight sm:text-xl">
                        {batch.title}
                      </Text>
                      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                        <Text className="text-brand m-0 text-xs font-bold uppercase">
                          {batch.category}
                        </Text>
                        <Text className="text-graytext m-0 text-xs">
                          • 2 hours ago
                        </Text>
                      </div>
                      <Text className="text-graytext m-0 mb-4 text-sm leading-relaxed">
                        {batch.excerpt}
                      </Text>
                      <Link
                        href="#"
                        className="text-brand inline-block text-xs font-semibold hover:underline"
                      >
                        Read full story →
                      </Link>
                    </Column>
                  </Row>
                  <Hr className="mx-4 border-gray-100 sm:mx-6" />
                </Section>
              );
            })}

            {/* --- TRENDING SECTION --- */}
            {batch2.length > 0 && (
              <Section className="px-4 py-6 sm:px-6 sm:py-8">
                <Text className="text-brand m-0 mb-4 text-center text-sm font-bold uppercase tracking-wide sm:mb-6">
                  More Stories You&apos;ll Love
                </Text>

                {batch2.map((batch, i) => {
                  return (
                    <Row key={i} className="space-y-4">
                      <Column className="w-full">
                        <div className="flex items-start gap-3 border-b border-gray-100 pb-4">
                          <div className="mr-2 align-top">
                            <Img
                              src={batch.thumbnailUrl}
                              width="70"
                              height="50"
                              className="rounded"
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <Text className="text-dark m-0 mb-1 font-serif text-sm font-bold leading-tight">
                              {batch.title}
                            </Text>
                            <Text className="text-graytext m-0 text-xs">
                              {batch.category} • 1 hour ago
                            </Text>
                          </div>
                        </div>
                      </Column>
                    </Row>
                  );
                })}
              </Section>
            )}

            {/* --- FOOTER --- */}
            <Section className="mb-6 rounded bg-orange-50 p-3 text-center sm:mb-8 sm:p-4">
              <Text className="m-0 text-xs text-gray-700">
                Forwarded this email?{" "}
                <Link href="#" className="font-bold text-blue-600 underline">
                  Subscribe
                </Link>{" "}
                to get more balanced, bite-sized stories in your inbox.
              </Text>
            </Section>

            {/* Brand & Legal */}
            <Section className="p-4 text-center sm:p-6">
              <div className="text-center">
                <div className="mx-auto mb-4 w-fit">
                  <Img
                    src="https://placehold.co/48x48/1a5fb4/ffffff?text=ST"
                    alt="Zeal News Africa Logo"
                    width="48"
                    height="48"
                    className="rounded-lg"
                  />
                </div>
                <Text className="text-dark m-0 mb-4 text-sm font-semibold">
                  Zeal News Africa
                </Text>
                <Text className="text-graytext m-0 mx-auto mb-4 max-w-md text-xs leading-relaxed">
                  Balanced news from trusted sources, delivered daily. We bring
                  together diverse perspectives to help you stay informed
                  without the noise.
                </Text>
                <div className="mx-auto mb-4 text-center">
                  <Link
                    href="#"
                    className="text-graytext hover:text-brand mx-2 text-center text-xs"
                  >
                    About
                  </Link>
                  <Link
                    href="#"
                    className="text-graytext hover:text-brand mx-2 text-center text-xs"
                  >
                    Privacy
                  </Link>
                  <Link
                    href="#"
                    className="text-graytext hover:text-brand mx-2 text-center text-xs"
                  >
                    Terms
                  </Link>
                  <Link
                    href="#"
                    className="text-graytext hover:text-brand mx-2 text-center text-xs"
                  >
                    Contact
                  </Link>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4 text-center">
                <Text className="text-graytext m-0 text-xs">
                  You&apos;re receiving this email because you subscribed to
                  Zeal News&apos; newsletter.
                </Text>
                <Text className="text-graytext m-0 mt-2 text-xs">
                  <Link href="#" className="text-brand hover:underline">
                    Update preferences
                  </Link>{" "}
                  •{" "}
                  <Link href="#" className="text-brand hover:underline">
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

export default ZealNewsletterCampaign;
