import { Container } from "@react-email/container";
import { Head } from "@react-email/head";
import { Heading } from "@react-email/heading";
import { Html } from "@react-email/html";
import { Tailwind } from "@react-email/tailwind";
import { Text } from "@react-email/text";
import * as React from "react";

import { IUser } from "@/types/user.type";

type EmailVerificationProps = {
  user: Partial<IUser>;
  otp: string;
  appName?: string;
};

const EmailVerification = ({
  user = { display_name: "John Doe" },
  otp = "123456",
  appName = "Lodge",
}: EmailVerificationProps) => {
  return (
    <Tailwind>
      <Html className="bg-white font-sans">
        <Head>
          {/* <title>`${appName} - Verify your email address`</title> */}
        </Head>
        <Container>
          <Heading>Verify your email address</Heading>
          <Text className="text-xl font-bold">
            Hi{user.display_name ? `, ${user.display_name}!` : "!"}
          </Text>
          <Text>
            To take the next step in your registration, we need you to verify
            your email address using the token below.
          </Text>
          <Text className="text-2xl font-bold">{otp}</Text>
          <Text>Thanks! This token will expire in 2 hours.</Text>
          <Text>{appName} team</Text>
        </Container>
      </Html>
    </Tailwind>
  );
};

export default EmailVerification;
