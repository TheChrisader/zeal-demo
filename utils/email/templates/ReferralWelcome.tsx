import { Button } from "@react-email/button";
import { Hr } from "@react-email/hr";
import { Section } from "@react-email/section";
import { Text } from "@react-email/text";
import * as React from "react";

import { IUser } from "@/types/user.type";
import { EmailFooter, EmailHeader, EmailWrapper } from "../components";

type ReferralWelcomeProps = {
  user: Partial<IUser>;
  referralCode: string;
  referralLink?: string;
  appName?: string;
};

const ReferralWelcome = ({
  user = { display_name: "John Doe" },
  referralCode = "REF123",
  referralLink,
  appName = "Zeal News",
}: ReferralWelcomeProps) => {
  const shareLink =
    referralLink ||
    `${process.env.NEXT_PUBLIC_APP_URL}/en/signup?ref=${referralCode}`;

  const referralPage = `${process.env.NEXT_PUBLIC_APP_URL}/en/settings/referral`;

  return (
    <EmailWrapper preheader="You're officially part of Zeal's biggest engagement challenge yet. Start sharing. Start earning.">
      <EmailHeader />

      <Section className="px-6 py-8">
        {/* Main Heading */}
        <Text className="text-dark mb-6 text-2xl font-bold leading-tight">
          Welcome to the Zeal Share & Earn Challenge 2025 — Gain Rewards With
          Ease
        </Text>

        {/* Greeting */}
        <Text className="text-graytext mb-6 text-base">
          Dear {user?.display_name},
        </Text>

        {/* Welcome Message */}
        <Text className="text-graytext mb-6 text-base leading-relaxed">
          Welcome to the Zeal Share & Earn Challenge 2025 — where your
          engagement meets opportunity.
        </Text>

        <Text className="text-graytext mb-6 text-base leading-relaxed">
          You&apos;ve taken the first step into an exclusive reward system that
          recognizes influence, consistency, and drive. This challenge is
          designed to celebrate active users in Zealnews and rewarding every
          meaningful share, click, and connection.
        </Text>

        {/* How to Begin Section */}
        <Text className="text-dark mb-4 text-base font-semibold">
          Here&apos;s how to begin:
        </Text>

        <Text className="text-graytext mb-1 ml-4 text-base">
          ● Share Zeal content with zeal across your preferred platforms.
        </Text>
        <Text className="text-graytext mb-1 ml-4 text-base">
          ● Earn cash, points, or vouchers for every valid engagement.
        </Text>
        <Text className="text-graytext mb-1 ml-4 text-base">
          ● Track your performance and progress in real-time through your
          personal dashboard.
        </Text>
        <Text className="text-graytext mb-6 ml-4 text-base">
          ● Invite others to join, because the more you grow your network, the
          higher your rewards.
        </Text>

        {/* Referral Code Section */}
        <Text className="text-dark mb-3 text-base font-semibold">
          Your Referral Code:
        </Text>

        <Section className="border-brandLight mb-6 rounded-lg border-2 border-dashed bg-green-50 p-4 text-center">
          <Text className="text-brand font-mono text-2xl font-bold">
            {referralCode}
          </Text>
        </Section>

        {/* Referral Link Section */}
        <Text className="text-dark mb-3 text-base font-semibold">
          Your Referral Link:
        </Text>

        <Section className="border-brandLight mb-6 break-all rounded-lg border bg-green-50 p-4">
          <Text className="text-brand text-sm">{shareLink}</Text>
        </Section>

        {/* Motivational Message */}
        <Text className="text-graytext mb-6 text-base leading-relaxed">
          Your journey to the leaderboard starts now. Let every share count,
          every invite matter, and every moment online become a step toward
          something bigger.
        </Text>

        {/* CTA Button */}
        <Section className="mb-8 text-center">
          <Button
            href={referralPage}
            className="bg-brand hover:bg-brandLight rounded-lg px-8 py-3 font-semibold text-white"
          >
            Go to Your Referral Page
          </Button>
        </Section>

        <Hr className="mb-6 border-t border-gray-200" />

        {/* Closing Message */}
        <Text className="text-graytext mb-2 text-base">
          Welcome to the challenge. Welcome to Zeal.
        </Text>

        <Text className="text-dark mb-6 text-base font-semibold">
          Team {appName}
        </Text>

        {/* P.S. Section */}
        <Section className="mb-6 rounded-lg bg-orange-50 p-4">
          <Text className="text-dark text-sm font-semibold">P.S.</Text>
          <Text className="text-graytext text-sm leading-relaxed">
            Great things happen when you share with purpose. Start today — your
            influence has value.
          </Text>
        </Section>
      </Section>

      <EmailFooter />
    </EmailWrapper>
  );
};

export default ReferralWelcome;
