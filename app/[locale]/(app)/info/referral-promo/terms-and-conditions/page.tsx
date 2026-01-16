import { Link } from "@/i18n/routing";

const ReferralPromoTermsAndConditions = () => {
  return (
    <div className="prose mx-auto flex flex-col px-3 py-4 lg:max-w-[80vw]">
      <h2 className="text-center">TERMS AND CONDITIONS</h2>
      <p>
        <strong>1. Eligibility:</strong>
        <br />
        The contest is only open to people aged 18 and above. Employees of Zeal
        News Africa and their immediate family members are not eligible to
        participate.
      </p>
      <p>
        <strong>2. How to Enter:</strong>
        <br />
        Participants must share the designated Zeal News Africa post on their
        social media account(s), ensure their profile is public, and tag Zeal
        News Africa as instructed. Only entries that fully comply will be
        considered.
      </p>
      <p>
        <strong>3. Entry Limit:</strong>
        <br />
        Each participant may submit only one valid entry. Multiple entries from
        the same participant will be disqualified.
      </p>
      <p>
        <strong>4. Contest Period:</strong>
        <br />
        The contest starts on [Start Date] and ends on [End Date]. Entries
        submitted after the deadline will not be considered.
      </p>
      <p>
        <strong>5. Winner Selection:</strong>
        <br />
        Winners will be selected based on verified compliance with contest
        rules. Zeal News Africa reserves the right to disqualify entries deemed
        fraudulent, incomplete, or non-compliant.
      </p>
      <p>
        <strong>6. Prizes:</strong>
        <br />
        Prizes include cash and/or other items as stated in the contest
        announcement. Prizes are non-transferable, cannot be exchanged for other
        items, and will only be awarded to verified winners.
      </p>
      <p>
        <strong>7. Announcement of Winners:</strong>
        <br />
        Winners will be announced on Zeal News Africa&apos;s official platforms
        on [Announcement Date]. Winners will also be contacted directly via the
        social media account used to enter. Zeal News Africa will never request
        payments up front; cash prizes will be delivered securely to verified
        winners only.
      </p>
      <p>
        <strong>8. Privacy:</strong>
        <br />
        Participants&apos; personal information will be used solely for the
        purpose of administering the contest and will not be shared with third
        parties.
      </p>
      <p>
        <strong>9. Limitation of Liability:</strong>
        <br />
        Zeal News Africa is not responsible for technical errors, lost or late
        entries, or any other issues beyond its control.
      </p>
      <p>
        <strong>10. General:</strong>
        <br />
        By participating, entrants agree to abide by these terms and the
        decisions of Zeal News Africa, which are final and binding in all
        respects. Zeal News Africa reserves the right to modify, suspend, or
        terminate the contest at any time without prior notice.
      </p>
      <p>
        For questions about this contest, please contact us at{" "}
        <Link href="mailto:info@zealnews.africa">info@zealnews.africa</Link>.
      </p>
      <hr />
      <p className="text-center">
        By participating in this contest, you acknowledge that you have read,
        understood, and agreed to these Terms and Conditions.
      </p>
    </div>
  );
};

export default ReferralPromoTermsAndConditions;
