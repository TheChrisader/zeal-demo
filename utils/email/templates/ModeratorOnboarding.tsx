import { Container } from "@react-email/container";
import { Head } from "@react-email/head";
import { Heading } from "@react-email/heading";
import { Html } from "@react-email/html";
import { Tailwind } from "@react-email/tailwind";
import { Text } from "@react-email/text";
import * as React from "react";

import { IUser } from "@/types/user.type";

type ModeratorOnboardingProps = {
  user: Pick<IUser, "email"> & { name: string; password_plaintext: string };
  appName?: string;
};

const ModeratorOnboarding = ({
  user,
  appName = "Lodge",
}: ModeratorOnboardingProps) => {
  return (
    <Tailwind>
      <Html className="bg-card-alt-bg font-sans">
        <Head>{/* <title>`Welcome to ${appName}!`</title> */}</Head>
        <Container className="p-4">
          <Heading className="mb-6 text-center text-2xl font-bold">
            Welcome to {appName}!
          </Heading>
          <Text className="text-lg">
            Hi{user.name ? `, ${user.name}!` : "!"}
          </Text>
          <Text className="mb-4 text-base">
            We&apos;re excited to have you join our team of moderators. Your
            account has been created, and you can now log in using the
            credentials below.
          </Text>
          <Text className="text-base font-semibold">Your Login Details:</Text>
          <Text className="text-base">Email: {user.email}</Text>
          <Text className="mb-4 text-base">
            Password: {user.password_plaintext}
          </Text>
          {/* <Text className="mb-4 text-base">
            We recommend changing your password after your first login for
            security reasons.
          </Text> */}
          <Text className="text-base">
            If you have any questions or need assistance, please don&apos;t
            hesitate to reach out.
          </Text>
          <Text className="mt-6 text-base">Thanks,</Text>
          <Text className="text-base">The {appName} Team</Text>
        </Container>
      </Html>
    </Tailwind>
  );
};

export default ModeratorOnboarding;
