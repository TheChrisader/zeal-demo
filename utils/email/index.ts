import { render } from "@react-email/render";

import { MailOptions, sendMail, SMTPTransport } from "@/lib/mailer";
import { IUser } from "@/types/user.type";

import EmailVerification from "./templates/EmailVerification";
import ModeratorOnboarding from "./templates/ModeratorOnboarding";
import NewsletterWelcome from "./templates/NewsletterWelcome";
import ReferralWelcome from "./templates/ReferralWelcome";
import ResetPassword from "./templates/ResetPassword";

const appName = process.env.NEXT_PUBLIC_APP_NAME;

export const sendEmail = async (
  to: string,
  cc: string[],
  bcc: string[],
  subject: string,
  plainText: string,
  htmlBody: string,
): Promise<SMTPTransport.SentMessageInfo> => {
  const mailOptions: MailOptions = {
    from: `"${appName} - Do not reply" <${process.env.EMAIL_FROM}>`,
    to,
    cc,
    bcc,
    subject,
    text: plainText,
    html: htmlBody,
  };

  try {
    const response = await sendMail(mailOptions);
    return response;
  } catch (error) {
    throw error;
  }
};

export const sendAccountVerificationEmail = (user: IUser, otp: string) => {
  return new Promise(async (resolve, reject) => {
    // const htmlBody = getEmailVerificationTemplate(user, tokenLink);
    const htmlBody = await render(
      EmailVerification({
        user,
        otp,
        appName,
      }),
    );
    const emailSubject = `${appName} - Verify your email address`;
    const emailPlainText = `${appName} - Verify your email address`;
    sendEmail(user.email, [], [], emailSubject, emailPlainText, htmlBody)
      .then(resolve)
      .catch(reject);
  });
};

export const sendResetPasswordEmail = (user: IUser, otp: string) => {
  return new Promise(async (resolve, reject) => {
    // const htmlBody = getResetPasswordTemplate(user, tokenLink);
    const htmlBody = await render(
      ResetPassword({
        user,
        otp,
        appName,
      }),
    );
    const emailSubject = `${appName} - Reset your password`;
    const emailPlainText = `${appName} - Reset your password`;
    sendEmail(user.email, [], [], emailSubject, emailPlainText, htmlBody)
      .then(resolve)
      .catch(reject);
  });
};

export const sendModeratorOnboardingEmail = (
  user: Pick<IUser, "email"> & { name: string; password_plaintext: string },
) => {
  return new Promise(async (resolve, reject) => {
    const htmlBody = await render(
      ModeratorOnboarding({
        user,
        appName,
      }),
    );
    const emailSubject = `Welcome to ${appName}, Moderator!`;
    const emailPlainText = `Welcome to ${appName}! Your moderator account has been created. Email: ${user.email}, Password: ${user.password_plaintext}`;
    sendEmail(user.email, [], [], emailSubject, emailPlainText, htmlBody)
      .then(resolve)
      .catch(reject);
  });
};

export const sendNewsletterWelcomeEmail = (user: IUser) => {
  return new Promise(async (resolve, reject) => {
    try {
      const htmlBody = await render(
        NewsletterWelcome({
          user,
          appName,
        }),
      );
      const emailSubject = `Welcome to the ${appName} Newsletter!`;
      const emailPlainText = `Welcome to the ${appName} Newsletter! Thank you for subscribing. Customize your preferences at ${process.env.NEXT_PUBLIC_APP_URL || 'https://lodge.app'}/newsletter/preferences`;

      sendEmail(user.email, [], [], emailSubject, emailPlainText, htmlBody)
        .then(resolve)
        .catch(reject);
    } catch (error) {
      reject(error);
    }
  });
};

export const sendReferralWelcomeEmail = (
  user: IUser,
  referralCode: string,
  referralLink?: string,
) => {
  return new Promise(async (resolve, reject) => {
    const htmlBody = await render(
      ReferralWelcome({
        user,
        referralCode,
        referralLink,
        appName,
      }),
    );
    const emailSubject = `Welcome to the ${appName} Referral Program!`;
    const emailPlainText = `Welcome to the ${appName} Referral Program! Your referral code is: ${referralCode}. Share your link: ${referralLink || `${process.env.NEXT_PUBLIC_APP_URL}?ref=${referralCode}`}`;
    sendEmail(user.email, [], [], emailSubject, emailPlainText, htmlBody)
      .then(resolve)
      .catch(reject);
  });
};
