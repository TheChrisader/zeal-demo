"use client";
import React from "react";

const ExplainerVideo: React.FC = () => {
  return (
    <section
      id="explainer-video"
      className="reveal mx-auto mt-20 max-w-6xl px-6"
    >
      <style jsx>{`
        .reveal {
          transform: translateY(14px);
          opacity: 0;
          transition: all 0.7s cubic-bezier(0.2, 0.9, 0.3, 1);
        }

        .reveal.is-visible {
          transform: translateY(0);
          opacity: 1;
        }
      `}</style>

      <div className="mb-10 text-center">
        <h2 className="text-3xl font-extrabold text-emerald-700 md:text-4xl">
          Explainer Video
        </h2>

        <p className="mx-auto mt-3 max-w-2xl text-slate-600">
          Watch this short video to understand how ZealNews referral rewards
          work — from signup to success.
        </p>
      </div>

      <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-slate-200 shadow-lg">
        <iframe
          className="h-full w-full"
          src="https://www.youtube.com/embed/dQw4w9WgXcQ"
          title="ZealNews Explainer Video"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>

      <div className="mt-6 text-center text-sm text-slate-600">
        <p>
          Prefer reading? Download our
          <a href="#" className="font-medium text-emerald-600">
            Visual Guide PDF
          </a>
          for offline access.
        </p>
      </div>
    </section>
  );
};

export default ExplainerVideo;
