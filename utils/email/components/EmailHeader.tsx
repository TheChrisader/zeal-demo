import { Hr } from "@react-email/hr";
import { Img } from "@react-email/img";
import { Link } from "@react-email/link";
import { Section } from "@react-email/section";
import { Text } from "@react-email/text";

export const EmailHeader = () => {
  return (
    <>
      {/* Brand Header Bar */}
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

      {/* Brand Logo */}
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

      {/* Tagline */}
      <Section className="rounded-xl text-center">
        <Text className="text-brand text-sm italic leading-relaxed">
          &quot;The stories that matter, delivered directly to your inbox.&quot;
        </Text>
      </Section>

      <Hr className="border-brand mb-4 mt-2 border-t" />
    </>
  );
};
