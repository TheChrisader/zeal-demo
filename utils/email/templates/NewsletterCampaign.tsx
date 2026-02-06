import { Column } from "@react-email/column";
import { Hr } from "@react-email/hr";
import { Img } from "@react-email/img";
import { Link } from "@react-email/link";
import { Row } from "@react-email/row";
import { Section } from "@react-email/section";
import { Text } from "@react-email/text";
import { EmailArticle } from "@/types/newsletter.type";
import { EmailFooter, EmailHeader, EmailWrapper } from "@/utils/email/components";

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
    <EmailWrapper preheader={meta.preheader}>
      <EmailHeader />

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
            <EmailFooter unsubscribeUrl={meta.unsubscribeUrl} />
    </EmailWrapper>
  );
};

export default ZealNewsletterCampaign;
