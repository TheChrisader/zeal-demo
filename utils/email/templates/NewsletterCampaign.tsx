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
import { EmailArticle } from "@/types/newsletter.type";

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
  thumbnailUrl: "https://i.ytimg.com/vi/7f-lBjbfky8/maxresdefault.jpg",
  dateStr: "2025-11-30 10:44:59",
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
            <Section className="bg-brand mb-4 rounded-t-md text-center">
              <Text className="m-0 text-[10px] font-medium uppercase tracking-[0.2em] text-white">
                Zeal News africa •{" "}
                {new Date().toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                })}
              </Text>
            </Section>

            {/* Brand Logo Placeholder */}
            <Section className="mb-4 text-center">
              <Link href="https://zealnews.africa/en">
                <Img
                  src="https://d3hovs1ug0rvor.cloudfront.net/assets/zeal_news_logo_dynamic.png"
                  alt="Zeal News"
                  width="100"
                  className="mx-auto"
                  style={{ width: "100px", height: "auto" }}
                />
              </Link>
            </Section>

            {/* Aesthetic Thin Divider */}
            <Hr className="border-brand mb-2 border-t" />

            {/* Secondary Navigation / Sub-Header */}
            <Section className="rounded-xl text-center">
              <Text className="text-brand text-sm italic leading-relaxed">
                &quot;The stories that matter, delivered directly to your
                inbox.&quot;
              </Text>
            </Section>

            <Hr className="border-brand mb-4 mt-2 border-t" />

            {/* --- DATE & TOP STORIES HEADER --- */}
            <Section className="border-b border-gray-100 px-4 py-3 sm:px-6 sm:py-4">
              <Row>
                <Column>
                  <Text className="text-brand bg-brand/5 m-0 rounded-xl px-9 py-2 text-center text-xl font-bold uppercase tracking-wide">
                    Top Stories
                  </Text>
                </Column>
                {/* <Column align="right">
                  <Text className="m-0 text-right text-xs text-white sm:text-sm">
                    {new Date().toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}
                  </Text>
                </Column> */}
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
                          • {batch.dateStr}
                        </Text>
                      </div>
                      <Text className="text-graytext m-0 mb-4 text-sm leading-relaxed">
                        {batch.excerpt}
                      </Text>
                      <Link
                        href={batch.url}
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
                        <Link href={batch.url}>
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
                                {batch.category} • {batch.dateStr}
                              </Text>
                            </div>
                          </div>
                        </Link>
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
                <Link
                  href="https://zealnews.africa/en/newsletter"
                  className="font-bold text-green-600 underline"
                >
                  Subscribe
                </Link>{" "}
                to get more balanced, bite-sized stories in your inbox.
              </Text>
            </Section>

            {/* Brand & Legal */}
            <Section className="p-4 text-center sm:p-6">
              <div className="text-center">
                <Link
                  href="https://zealnews.africa/en"
                  className="mx-auto mb-4 w-fit"
                >
                  <Img
                    src="https://d3hovs1ug0rvor.cloudfront.net/assets/zeal_news_logo_dynamic.png"
                    className="mx-auto mb-4"
                    alt="Zeal News"
                    width="100"
                    style={{ width: "100px", height: "auto" }}
                  />
                </Link>
                <Text className="text-graytext m-0 mx-auto mb-4 max-w-md text-xs leading-relaxed">
                  Balanced news from trusted sources, delivered weekly. We bring
                  together diverse perspectives to help you stay informed
                  without the noise.
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
                  Zeal News&apos; newsletter.
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

export default ZealNewsletterCampaign;
