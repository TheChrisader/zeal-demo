import { Button } from "@react-email/button";
import { Container } from "@react-email/container";
import { Head } from "@react-email/head";
import { Heading } from "@react-email/heading";
import { Html } from "@react-email/html";
import { Tailwind } from "@react-email/tailwind";
import { Text } from "@react-email/text";
import * as React from "react";

import { IUser } from "@/types/user.type";

type NewsletterWelcomeProps = {
  user: Partial<IUser> & { email: string };
  appName?: string;
};

const NewsletterWelcome = ({
  user = { display_name: "", email: "" },
  appName = "Lodge",
}: NewsletterWelcomeProps) => {
  const preferencesUrl = `${process.env.NEXT_PUBLIC_APP_URL || "https://lodge.app"}/en/newsletter/preferences?email=${encodeURIComponent(user.email)}`;

  return (
    <Tailwind>
      <Html className="bg-card-alt-bg font-sans">
        <Head>
          {/* <title>`${appName} - Welcome to our newsletter!`</title> */}
        </Head>
        <Container className="mx-auto max-w-2xl p-6">
          <Heading className="mb-6 text-3xl font-bold text-gray-900">
            Welcome to the {appName} Newsletter! 🎉
          </Heading>

          <Text className="mb-4 text-xl font-semibold text-gray-800">
            Hi{user.display_name ? `, ${user.display_name}!` : "!"}
          </Text>

          <Text className="mb-6 leading-relaxed text-gray-700">
            Thank you for subscribing to our newsletter! We&apos;re thrilled to
            have you join our community of readers who are passionate about
            staying informed and engaged.
          </Text>

          <Text className="mb-4 text-lg font-semibold text-gray-800">
            Personalize Your Experience
          </Text>

          <Text className="mb-6 leading-relaxed text-gray-700">
            Make the most of your subscription by customizing your news
            preferences. Choose the topics and categories that matter most to
            you, and we&apos;ll deliver tailored content directly to your inbox.
          </Text>

          <Container className="mb-8 text-center">
            <Button
              href={preferencesUrl}
              className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
            >
              Customize Your News Preferences
            </Button>
          </Container>

          <Text className="mb-4 leading-relaxed text-gray-700">
            By customizing your preferences, you&apos;ll receive:
          </Text>

          <ul className="mb-6 list-inside list-disc space-y-2 text-gray-700">
            <li>Curated news from your favorite categories</li>
            <li>Personalized content recommendations</li>
            <li>Relevant updates tailored to your interests</li>
            <li>A better, more focused reading experience</li>
          </ul>

          <Text className="mb-6 leading-relaxed text-gray-700">
            We&apos;re committed to bringing you high-quality content that
            matters to you. Your personalized newsletter experience is just a
            click away!
          </Text>

          <Text className="mb-4 text-sm text-gray-600">
            Questions or feedback? Simply reply to this email or visit our help
            center.
          </Text>

          <Text className="text-gray-700">Happy reading!</Text>

          <Text className="font-semibold text-gray-700">
            The {appName} Team
          </Text>
        </Container>
      </Html>
    </Tailwind>
  );
};

export default NewsletterWelcome;
