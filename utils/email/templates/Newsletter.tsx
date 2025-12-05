import { Button } from "@react-email/button";
import { Container } from "@react-email/container";
import { Head } from "@react-email/head";
import { Heading } from "@react-email/heading";
import { Html } from "@react-email/html";
import { Tailwind } from "@react-email/tailwind";
import { Text } from "@react-email/text";
import * as React from "react";

import { IUser } from "@/types/user.type";

type NewsletterProps = {
  user: Partial<IUser> & { email: string };
  subject: string;
  content: string;
  ctaText?: string;
  ctaUrl?: string;
  appName?: string;
  preferencesUrl?: string;
};

const Newsletter = ({
  user = { display_name: "", email: "" },
  subject = "Newsletter",
  content = "Your newsletter content goes here.",
  ctaText = "Read More",
  ctaUrl = "#",
  appName = "Lodge",
  preferencesUrl,
}: NewsletterProps) => {
  const defaultPreferencesUrl = `${process.env.NEXT_PUBLIC_APP_URL || "https://lodge.app"}/en/newsletter/preferences?email=${encodeURIComponent(user.email)}`;
  const finalPreferencesUrl = preferencesUrl || defaultPreferencesUrl;

  return (
    <Tailwind>
      <Html className="bg-card-alt-bg font-sans">
        <Head>
          <title>{subject}</title>
        </Head>
        <Container className="mx-auto max-w-2xl p-6">
          <Heading className="mb-6 text-2xl font-bold text-gray-900">
            {subject}
          </Heading>

          <Text className="mb-4 text-xl font-semibold text-gray-800">
            Hi{user.display_name ? `, ${user.display_name}!` : ""}
          </Text>

          <Text
            className="mb-6 leading-relaxed text-gray-700"
            dangerouslySetInnerHTML={{ __html: content }}
          />

          {ctaUrl && ctaUrl !== "#" && (
            <Container className="mb-8 text-center">
              <Button
                href={ctaUrl}
                className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
              >
                {ctaText}
              </Button>
            </Container>
          )}

          <Container className="mt-8 pt-8 border-t border-gray-200">
            <Text className="mb-2 text-sm text-gray-600">
              You received this email because you subscribed to our newsletter.
            </Text>

            <Container className="text-center">
              <Button
                href={finalPreferencesUrl}
                className="text-sm text-blue-600 hover:text-blue-700 underline"
                style={{ background: 'none', border: 'none', padding: 0 }}
              >
                Unsubscribe or manage preferences
              </Button>
            </Container>
          </Container>

          <Text className="mt-6 text-sm text-gray-600">
            Questions or feedback? Simply reply to this email.
          </Text>

          <Text className="font-semibold text-gray-700">
            The {appName} Team
          </Text>
        </Container>
      </Html>
    </Tailwind>
  );
};

export default Newsletter;