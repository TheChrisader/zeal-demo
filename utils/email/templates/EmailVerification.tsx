import { Container } from "@react-email/container";
import { Head } from "@react-email/head";
import { Heading } from "@react-email/heading";
import { Html } from "@react-email/html";
import { Tailwind } from "@react-email/tailwind";
import { Text } from "@react-email/text";
import * as React from "react";

import { EmailFooter, EmailHeader, EmailWrapper } from "../components";

import { IUser } from "@/types/user.type";

type EmailVerificationProps = {
  user: Partial<IUser>;
  otp: string;
  appName?: string;
};

const EmailVerification = ({
  user = { display_name: "John Doe" },
  otp = "123456",
  appName = "Zeal",
}: EmailVerificationProps) => {
  return (
    <EmailWrapper preheader="Verify your email address to complete your registration">
      <EmailHeader />

      <Container className="p-6">
        <Heading className="text-dark">Verify your email address</Heading>
        <Text className="text-xl font-bold text-graytext">
          Hi{user.display_name ? `, ${user.display_name}!` : "!"}
        </Text>
        <Text className="text-graytext">
          To take the next step in your registration, we need you to verify your
          email address using the token below.
        </Text>
        <Text className="text-brand text-2xl font-bold">{otp}</Text>
        <Text className="text-graytext">
          Thanks! This token will expire in 2 hours.
        </Text>
        <Text className="text-dark font-semibold">{appName} team</Text>
      </Container>

      <EmailFooter />
    </EmailWrapper>
  );
};

export default EmailVerification;
