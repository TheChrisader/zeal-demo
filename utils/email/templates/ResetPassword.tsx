import { Container } from "@react-email/container";
import { Head } from "@react-email/head";
import { Heading } from "@react-email/heading";
import { Html } from "@react-email/html";
import { Tailwind } from "@react-email/tailwind";
import { Text } from "@react-email/text";
import * as React from "react";

import { IUser } from "@/types/user.type";

type ResetPasswordProps = {
  user: Partial<IUser>;
  otp: string;
  appName?: string;
};

const ResetPassword = ({
  user = { display_name: "John Doe" },
  otp = "123456",
  appName = "Lodge",
}: ResetPasswordProps) => {
  return (
    <Tailwind>
      <Html className="bg-white font-sans">
        <Head>{/* <title>`${appName} - Reset your password`</title> */}</Head>
        <Container>
          <Heading>Reset your password</Heading>
          <Text className="text-xl font-bold">
            Hi{user.display_name ? `, ${user.display_name}!` : "!"}
          </Text>
          <Text>Password reset has been triggered from your account.</Text>
          <Text>Use the one-time password below to verify your email.</Text>
          <Text className="text-2xl font-bold">{otp}</Text>
          <Text>This token will be expired in 2 hours.</Text>
          <Text>
            If you are not the author of this action, please contact the app
            administrator.
          </Text>
          <Text>Thanks!</Text>
          <Text>{appName} team</Text>
        </Container>
      </Html>
    </Tailwind>
  );
};

export default ResetPassword;
