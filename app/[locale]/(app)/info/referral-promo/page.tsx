import React from "react";
import ReferralPromoHero1 from "./_components/ReferralPromoHero1";
import HowItWorks from "./_components/HowItWorks";

const ReferralPromo = () => {
  return (
    <div className="flex flex-col items-center justify-center bg-gray-100">
      <ReferralPromoHero1 />
      <HowItWorks />
    </div>
  );
};

export default ReferralPromo;
