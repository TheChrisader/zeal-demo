"use client";
import React from "react";

const FooterSection: React.FC = () => {
  return (
    <footer className="mx-auto mt-16 max-w-6xl px-6 py-8 text-sm text-slate-600">
      <div className="flex flex-col justify-between md:flex-row">
        <div>© 2025 ZealNews Africa — Built for creators &amp; changemakers</div>

        <div className="mt-4 md:mt-0">
          Questions?
          <a href="mailto:hello@zealnews.africa" className="text-emerald-600">
            hello@zealnews.africa
          </a>
        </div>
      </div>
    </footer>
  );
};

export default FooterSection;