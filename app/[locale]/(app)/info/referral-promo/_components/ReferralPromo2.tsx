"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useRouter } from "@/app/_components/useRouter";
import { useReferral } from "@/hooks/useReferral";
import { Link } from "@/i18n/routing";
import "./ReferralPromo2.css";

interface FormData {
  fullName: string;
  email: string;
  phone: string;
  source: string;
  terms: boolean;
  dailyNews: boolean;
}

export default function ReferralPromo2() {
  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    email: "",
    phone: "",
    source: "",
    terms: false,
    dailyNews: false,
  });
  const [showSticky, setShowSticky] = useState(false);
  const heroRef = useRef<HTMLElement>(null);
  const { referralCode: urlReferralCode } = useReferral();
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      if (heroRef.current) {
        const triggerPoint = heroRef.current.offsetHeight * 0.7;
        setShowSticky(window.scrollY > triggerPoint);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (targetId: string) => {
    const target = document.getElementById(targetId);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const transferToSignup = () => {
    // Basic validation
    if (
      !formData.fullName ||
      !formData.email ||
      !formData.phone ||
      !formData.terms
    ) {
      toast.error("Please fill all required fields and accept the terms.");
      return;
    }

    // Store basic form data for pre-filling the signup form
    sessionStorage.setItem('referral_signup_data', JSON.stringify({
      fullName: formData.fullName,
      email: formData.email,
      phone: formData.phone,
      source: formData.source,
      dailyNews: formData.dailyNews,
      terms: formData.terms,
      referral_code: urlReferralCode,
    }));

    // Store referral metadata separately to be sent with the signup request
    sessionStorage.setItem('referral_signup_metadata', JSON.stringify({
      phone: formData.phone,
      source: formData.source,
      terms_accepted: formData.terms,
    }));

    // Store promo signup flag for later redirect to referral dashboard
    sessionStorage.setItem('promo_signup', 'true');

    // Navigate to signup page
    const params = new URLSearchParams({
      promo: 'true',
      ...(urlReferralCode && { ref: urlReferralCode }),
    });
    router.push(`/signup?${params.toString()}`);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, type, value, checked } = e.target as HTMLInputElement;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  return (
    <div className="referral-promo-2">
      {/* HERO SECTION */}
      <header ref={heroRef} id="hero" className="hero">
        <div className="hero-inner container">
          <div className="hero-top !pb-5">
            <Link href="/" className="logo">
              <img
                src="/zeal_news_logo.png"
                alt="ZealNews Africa logo"
                className="zeal"
              />
            </Link>
          </div>
          <div className="hero-layout">
            <div className="hero-right">
              <div className="hero-right-image">
                <img
                  width={500}
                  height={500}
                  src="/referral/SHARE_and_win.png"
                  alt="Share & Win contest banner showing cash prizes and ZealNews Africa branded T-shirt"
                />
              </div>
              <button
                className="joinbtn btn cta-pulse"
                onClick={() => scrollToSection("signup")}
              >
                Join now
              </button>
              <section
                className="why-card why-card-green"
                aria-labelledby="who-we-are-title"
              >
                <div className="why-card-t">
                  <div className="pill pill-green" id="who-we-are-title">
                    WHO WE ARE
                  </div>
                </div>
                <p className="why-card-text">
                  At Zeal News Africa, we deliver journalism that is truthful,
                  rich in contextvajdcfearless, covering culture, investigation,
                  and global perspective. We tell stories in a way that&apos;s
                  bold, curious and unapologetically African. We don&apos;t just
                  share news; we spark conversations that matter.
                </p>
              </section>
            </div>
            <div className="hero-left">
              <section className="section hero-video !pt-2" id="contest-video">
                <div className="video-card card-soft">
                  <div className="video-wrapper">
                    <video
                      src="https://d3hovs1ug0rvor.cloudfront.net/videos/referral_promo.mp4"
                      poster="/referral/referral-promo-video.png"
                      title="Share & Win ₦50,000 – ZealNews Africa Contest"
                      controls
                      preload="metadata"
                      playsInline
                    />
                  </div>
                  <div className="video-cta">
                    <button
                      className="btn-primary btn cta-pulse"
                      onClick={() => scrollToSection("signup")}
                    >
                      Join now
                    </button>
                  </div>
                </div>
              </section>
              <article className="hero-card hero-card-main">
                <div className="pill pill-yellow">
                  Share & Win ₦50,000 + a ZealNews Branded T-Shirt
                </div>
                <div className="hero-heading">
                  <h1 className="h2">
                    Stay Ahead of the News and Get Paid to Share It.
                  </h1>
                </div>
                <p className="hero-subtext">
                  Invite friends to sign up on <strong>ZealNews Africa</strong>.
                  The top referrer wins{" "}
                  <strong>₦50,000 + a ZealNews Branded T-Shirt</strong>, the 1st
                  runner-up gets <strong>₦30,000</strong>, 2nd runner-up gets{" "}
                  <strong>₦20,000</strong>. There are also{" "}
                  <strong>10 consolation prizes worth ₦5,000 each.</strong>
                </p>
                <div className="hero-actions">
                  <button
                    className="btn btn-primary cta-pulse"
                    onClick={() => scrollToSection("signup")}
                  >
                    Join the Contest
                  </button>
                </div>
              </article>
            </div>
          </div>
        </div>
      </header>
      <main>
        {/* HOW IT WORKS SECTION */}
        <section className="section" id="how-it-works">
          <div className="container">
            <div className="steps-card card-soft">
              <h2 className="section-title">
                How the &quot;Share & Win ₦50,000&quot; contest works
              </h2>
              <div className="steps-list">
                <div className="step-item">
                  <div className="icon-circle icon-orange">👤</div>
                  <div>
                    <div className="step-number">Step 1</div>
                    <div className="step-item-title">Sign up for free</div>
                    <p className="step-item-text">
                      Create your free ZealNews Africa account in seconds.
                    </p>
                  </div>
                </div>
                <div className="step-item">
                  <div className="icon-circle icon-neutral">🔗</div>
                  <div>
                    <div className="step-number">Step 2</div>
                    <div className="step-item-title">
                      Share your unique link
                    </div>
                    <p className="step-item-text">
                      We give you a personal link. Post it on WhatsApp,
                      Facebook, X, TikTok and more.
                    </p>
                  </div>
                </div>
                <div className="step-item">
                  <div className="icon-circle icon-yellow">🏆</div>
                  <div>
                    <div className="step-number">Step 3</div>
                    <div className="step-item-title">Repeat</div>
                    <p className="step-item-text">
                      The more signups you get, the more points you get and the
                      higher your chances of winning.
                    </p>
                  </div>
                </div>
              </div>
              <p className="steps-note">
                You&apos;ll be able to track your referrals on your contest
                dashboard after you sign up.
              </p>
            </div>
          </div>
        </section>
        {/* WHY JOIN SECTION */}
        <section className="section why-section" id="why-join">
          <div className="container">
            <h2 className="section-title">Why people love ZealNews Africa</h2>
            <div className="why-cards">
              <div className="why-card">
                <div className="why-card-title">Fast updates</div>
                <p className="why-card-text">
                  You get access to top headlines and every trending topic in
                  the country.
                </p>
              </div>
              <div className="why-card">
                <div className="why-card-title">Verified news</div>
                <p className="why-card-text">
                  All news updates and stories are verified and thoroughly fact
                  checked.
                </p>
              </div>
              <div className="why-card">
                <div className="why-card-title">Local and Global</div>
                <p className="why-card-text">
                  From your street to the world stage, we tell stories that
                  matter to everyone.
                </p>
              </div>
            </div>
          </div>
        </section>
        {/* SIGNUP FORM SECTION */}
        <section className="section form-section" id="signup">
          <div className="container">
            <div className="card form-card">
              <h2 className="section-title">
                Join the contest &amp; get your link
              </h2>
              <p className="form-description">
                Takes less than 1 minute and it&apos;s free.
              </p>
              <form id="signup-form" onSubmit={(e) => { e.preventDefault(); transferToSignup(); }} noValidate>
                <div className="form-grid">
                  <div className="form-field">
                    <label htmlFor="full-name">
                      Full name<span className="required">*</span>
                    </label>
                    <input
                      id="full-name"
                      name="fullName"
                      type="text"
                      required
                      autoComplete="name"
                      placeholder="e.g. Adaeze Okafor"
                      value={formData.fullName}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-field">
                    <label htmlFor="email">
                      Email address<span className="required">*</span>
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      autoComplete="email"
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-field">
                    <label htmlFor="phone">
                      Phone / WhatsApp number<span className="required">*</span>
                    </label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      required
                      autoComplete="tel"
                      placeholder="+234 801 234 5678"
                      value={formData.phone}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-field">
                    <label htmlFor="source">
                      How did you hear about this contest?
                    </label>
                    <select
                      id="source"
                      name="source"
                      value={formData.source}
                      onChange={handleInputChange}
                    >
                      <option value="">Select an option</option>
                      <option>Instagram</option>
                      <option>WhatsApp</option>
                      <option>X (Twitter)</option>
                      <option>TikTok</option>
                      <option>Friend</option>
                      <option>Other</option>
                    </select>
                  </div>
                </div>
                <div className="checkbox-row">
                  <input
                    id="terms"
                    name="terms"
                    type="checkbox"
                    required
                    checked={formData.terms}
                    onChange={handleInputChange}
                  />
                  <label htmlFor="terms">
                    I agree to the contest terms and conditions.
                    <span className="required">*</span>
                  </label>
                </div>
                <div className="checkbox-row">
                  <input
                    id="daily-news"
                    name="dailyNews"
                    type="checkbox"
                    checked={formData.dailyNews}
                    onChange={handleInputChange}
                  />
                  <label htmlFor="daily-news">
                    {" "}
                    Send me daily news highlights.{" "}
                  </label>
                </div>
                <div style={{ marginTop: "0.9rem" }}>
                  <button
                    type="submit"
                    className="btn btn-secondary-dark"
                    style={{ width: "100%" }}
                  >
                    Continue to sign up
                  </button>
                </div>
                <p className="form-footnote">
                  We&apos;ll never share your details. You can unsubscribe
                  anytime.
                </p>
              </form>
            </div>
          </div>
        </section>
        {/* SOCIAL SHARING SECTION */}
        <section className="section" id="boost">
          <div className="container">
            <h2 className="section-title">
              Boost your chances by sharing everywhere.
            </h2>
            <p className="section-subtitle">
              Use your link on all your socials. Every new signup takes you
              closer to ₦50,000 + A ZealNews Branded T-Shirt.
            </p>
            <div className="social-grid">
              <div className="social-card whatsapp">
                <div className="social-label">
                  <img
                    className="social-icon"
                    src="https://img.icons8.com/?size=100&amp;id=BkugfgmBwtEI&amp;format=png&amp;color=000000"
                    alt="WhatsApp logo"
                  />
                </div>
                <p className="social-caption">Share to chats &amp; groups.</p>
              </div>
              <div className="social-card facebook">
                <div className="social-label">
                  <img
                    className="social-icon"
                    src="https://img.icons8.com/?size=100&amp;id=118497&amp;format=png&amp;color=000000"
                    alt="Facebook logo"
                  />
                </div>
                <p className="social-caption">
                  Add your link to your bio or Story.
                </p>
              </div>
              <div className="social-card x-twitter">
                <div className="social-label">
                  <img
                    className="social-icon"
                    src="https://img.icons8.com/?size=100&amp;id=phOKFKYpe00C&amp;format=png&amp;color=000000"
                    alt="X (Twitter) logo"
                  />
                </div>
                <p className="social-caption">
                  Post your link with a hot headline.
                </p>
              </div>
              <div className="social-card linkedin">
                <div className="social-label">
                  <img
                    className="social-icon"
                    src="https://img.icons8.com/?size=100&amp;id=13930&amp;format=png&amp;color=000000"
                    alt="Linkedin"
                  />
                </div>
                <p className="social-caption">
                  Drop your link in video descriptions.
                </p>
              </div>
            </div>
            <div className="pro-tip-banner">
              <div className="pro-tip-label">Pro tip</div>
              <p>
                Write a short message like:
                <br />
                &quot;This is where I get my news in 3 minutes. Sign up free
                here 👉
                <strong>[your link]</strong>&quot;
              </p>
            </div>
          </div>
        </section>
        {/* FAQ SECTION */}
        <section className="section faq-section" id="faq">
          <div className="container">
            <h2 className="section-title">
              Got questions? We&apos;ve got answers.
            </h2>
            <div className="faq-list">
              <details open>
                <summary>
                  <span className="faq-question">
                    How do I win the ₦50,000 + A ZealNews Branded T-Shirt?
                  </span>
                  <span className="faq-chevron">›</span>
                </summary>
                <div className="faq-answer">
                  The participant with the highest number of unique signups
                  using their personal link wins.
                </div>
              </details>
              <details>
                <summary>
                  <span className="faq-question">
                    How long does the contest run?
                  </span>
                  <span className="faq-chevron">›</span>
                </summary>
                <div className="faq-answer">
                  From <strong>[Start Date]</strong> to{" "}
                  <strong>[End Date]</strong>. The winner will be announced on
                  our socials and by email.
                </div>
              </details>
              <details>
                <summary>
                  <span className="faq-question">
                    How do you pay the winner?
                  </span>
                  <span className="faq-chevron">›</span>
                </summary>
                <div className="faq-answer">
                  We&apos;ll contact the winner directly and pay via bank
                  transfer within
                  <strong>[X]</strong> working days.
                </div>
              </details>
              <details>
                <summary>
                  <span className="faq-question">Is this really free?</span>
                  <span className="faq-chevron">›</span>
                </summary>
                <div className="faq-answer">
                  Yes, you will not be asked to pay anything throughout the
                  program. Everything is completely free.
                </div>
              </details>
            </div>
            <div className="faq-meta">
              <p>
                <Link
                  href="/info/referral-promo/terms-and-conditions"
                  className="tcs-link"
                >
                  Read full terms &amp; conditions
                </Link>
              </p>
              <p style={{ marginTop: "0.4rem" }}>
                ZealNews Africa is a news media company based in Lagos.
              </p>
            </div>
          </div>
        </section>
      </main>
      {/* STICKY CTA */}
      <div
        className={`sticky-cta ${showSticky ? "visible" : ""}`}
        id="sticky-cta"
      >
        <div className="sticky-cta-text">
          <strong>Win ₦50,000</strong>{" "}
          <span>Join the referral contest now.</span>
        </div>
        <button
          className="btn btn-primary cta-pulse"
          onClick={() => scrollToSection("signup")}
        >
          Join now
        </button>
      </div>
    </div>
  );
}
