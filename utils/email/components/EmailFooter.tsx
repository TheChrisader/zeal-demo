import { Img } from "@react-email/img";
import { Link } from "@react-email/link";
import { Section } from "@react-email/section";
import { Text } from "@react-email/text";

export interface EmailFooterProps {
  unsubscribeUrl?: string;
  description?: string;
  subscribeMessage?: string;
}

export const EmailFooter = ({
  unsubscribeUrl,
  description = "Balanced news from trusted sources, delivered weekly. We bring together diverse perspectives to help you stay informed without the noise.",
  subscribeMessage = "to get more balanced, bite-sized stories in your inbox.",
}: EmailFooterProps) => {
  return (
    <>
      {/* Subscribe CTA */}
      <Section className="mb-6 rounded bg-orange-50 p-3 text-center sm:mb-8 sm:p-4">
        <Text className="m-0 text-xs text-gray-700">
          Forwarded this email?{" "}
          <Link
            href="https://zealnews.africa/en/newsletter"
            className="font-bold text-green-600 underline"
          >
            Subscribe
          </Link>{" "}
          {subscribeMessage}
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
            {description}
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
            You&apos;re receiving this email because you subscribed to Zeal
            News&apos; newsletter.
          </Text>
          {unsubscribeUrl && (
            <Text className="text-graytext m-0 mt-2 text-xs">
              <Link
                href={unsubscribeUrl}
                className="text-brand hover:underline"
              >
                Unsubscribe
              </Link>
            </Text>
          )}
          <Text className="text-graytext m-0 mt-2 text-xs">
            © 2025 Zeal News Africa. All rights reserved.
          </Text>
        </div>
      </Section>
    </>
  );
};
