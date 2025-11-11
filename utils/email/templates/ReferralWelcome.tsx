import { Button } from "@react-email/button";
import { Container } from "@react-email/container";
import { Head } from "@react-email/head";
import { Heading } from "@react-email/heading";
import { Html } from "@react-email/html";
import { Tailwind } from "@react-email/tailwind";
import { Text } from "@react-email/text";
import * as React from "react";

import { IUser } from "@/types/user.type";

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
  appName = "Lodge",
}: ReferralWelcomeProps) => {
  const shareLink = referralLink || `${process.env.NEXT_PUBLIC_APP_URL || 'https://lodge.app'}?ref=${referralCode}`;

  return (
    <Tailwind>
      <Html className="bg-card-alt-bg font-sans">
        <Head>
          {/* <title>`${appName} - Welcome to our referral program!`</title> */}
        </Head>
        <Container className="max-w-2xl mx-auto p-6">
          <Heading className="text-3xl font-bold text-gray-900 mb-6">
            Welcome to the {appName} Referral Program! 🎉
          </Heading>

          <Text className="text-xl font-semibold text-gray-800 mb-4">
            Hi{user.display_name ? `, ${user.display_name}!` : "!"}
          </Text>

          <Text className="text-gray-700 mb-6 leading-relaxed">
            Thank you for joining our community! We're excited to have you as part of our referral program.
            Share your unique referral code with friends and family to help grow our community.
          </Text>

          <Text className="text-lg font-semibold text-gray-800 mb-3">
            Your Referral Code:
          </Text>

          <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-4 mb-6 text-center">
            <Text className="text-2xl font-mono font-bold text-blue-600">
              {referralCode}
            </Text>
          </div>

          <Text className="text-lg font-semibold text-gray-800 mb-3">
            Your Referral Link:
          </Text>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 break-all">
            <Text className="text-sm text-blue-700">
              {shareLink}
            </Text>
          </div>

          <Text className="text-gray-700 mb-4">
            Share this link with others, and when they sign up using your referral code,
            you'll get credit for the referral!
          </Text>

          <Container className="text-center mb-6">
            <Button
              href={shareLink}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg"
            >
              Visit Your Referral Page
            </Button>
          </Container>

          <Text className="text-sm text-gray-600 mb-4">
            Questions about our referral program? Check your settings page or contact our support team.
          </Text>

          <Text className="text-gray-700">
            Happy referring!
          </Text>

          <Text className="text-gray-700 font-semibold">
            The {appName} Team
          </Text>
        </Container>
      </Html>
    </Tailwind>
  );
};

export default ReferralWelcome;