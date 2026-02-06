import { Body } from "@react-email/body";
import { Container } from "@react-email/container";
import { Head } from "@react-email/head";
import { Html } from "@react-email/html";
import { Preview } from "@react-email/preview";
import { Tailwind } from "@react-email/tailwind";
import { ReactNode } from "react";

export interface EmailWrapperProps {
  children: ReactNode;
  preheader: string;
}

const tailwindConfig = {
  theme: {
    extend: {
      colors: {
        brand: "#096b0a",
        brandLight: "#096b0a",
        accent: "#f6d32d",
        dark: "#1c1c1e",
        graytext: "#6e6e73",
        bglight: "#f5f5f7",
        cardShadow: "rgba(0, 0, 0, 0.04)",
      },
      fontFamily: {
        serif: ["Georgia", "Times New Roman", "serif"],
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Helvetica",
          "Arial",
          "sans-serif",
        ],
      },
    },
  },
};

export const EmailWrapper = ({ children, preheader }: EmailWrapperProps) => {
  return (
    <Html>
      <Tailwind config={tailwindConfig}>
        <Head />
        <Preview>{preheader}</Preview>
        <Body className="bg-bglight m-auto font-sans">
          <Container className="mx-auto w-full max-w-[600px] rounded-lg border border-gray-200 bg-white p-0 shadow-lg sm:w-auto">
            {children}
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};
