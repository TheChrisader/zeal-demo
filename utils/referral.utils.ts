/**
 * Utility functions for handling referral codes in URLs
 */

/**
 * Append a referral code to a URL
 * @param url The base URL
 * @param referralCode The referral code to append
 * @returns The URL with the referral code appended
 */
export const appendReferralToUrl = (url: string, referralCode: string): string => {
  if (!referralCode) return url;

  try {
    const urlObj = new URL(url);
    urlObj.searchParams.set('ref', referralCode);
    return urlObj.toString();
  } catch (error) {
    // If URL parsing fails, append manually
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}ref=${referralCode}`;
  }
};

/**
 * Generate a shareable link with referral code
 * @param baseUrl The base URL to share
 * @param referralCode The user's referral code (optional)
 * @returns The shareable URL with referral code if provided
 */
export const generateShareableLink = (baseUrl: string, referralCode?: string | null): string => {
  if (!referralCode) return baseUrl;
  return appendReferralToUrl(baseUrl, referralCode);
};

/**
 * Generate a shareable link for a specific article
 * @param articleSlug The article slug
 * @param referralCode The user's referral code (optional)
 * @param appUrl The base app URL (defaults to NEXT_PUBLIC_APP_URL)
 * @returns The shareable article URL with referral code if provided
 */
export const generateArticleShareLink = (
  articleSlug: string,
  referralCode?: string | null,
  appUrl?: string
): string => {
  const baseUrl = appUrl || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const articleUrl = `${baseUrl}/post/${articleSlug}`;
  return generateShareableLink(articleUrl, referralCode);
};

/**
 * Generate a Twitter share URL with referral code
 * @param text The tweet text
 * @param url The URL to share
 * @param referralCode The user's referral code (optional)
 * @param via Twitter handle (optional)
 * @returns The Twitter share URL with referral code if provided
 */
export const generateTwitterShareUrl = (
  text: string,
  url: string,
  referralCode?: string | null,
  via?: string
): string => {
  const shareableUrl = generateShareableLink(url, referralCode);
  const params = new URLSearchParams({
    text: text,
    url: shareableUrl,
  });

  if (via) {
    params.set('via', via);
  }

  return `https://twitter.com/intent/tweet?${params.toString()}`;
};

/**
 * Generate a Facebook share URL with referral code
 * @param url The URL to share
 * @param referralCode The user's referral code (optional)
 * @returns The Facebook share URL with referral code if provided
 */
export const generateFacebookShareUrl = (
  url: string,
  referralCode?: string | null
): string => {
  const shareableUrl = generateShareableLink(url, referralCode);
  return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareableUrl)}`;
};

/**
 * Generate a WhatsApp share URL with referral code
 * @param url The URL to share
 * @param referralCode The user's referral code (optional)
 * @returns The WhatsApp share URL with referral code if provided
 */
export const generateWhatsAppShareUrl = (
  url: string,
  referralCode?: string | null
): string => {
  const shareableUrl = generateShareableLink(url, referralCode);
  return `https://wa.me/?text=${encodeURIComponent(shareableUrl)}`;
};

/**
 * Generate a LinkedIn share URL with referral code
 * @param url The URL to share
 * @param referralCode The user's referral code (optional)
 * @returns The LinkedIn share URL with referral code if provided
 */
export const generateLinkedInShareUrl = (
  url: string,
  referralCode?: string | null
): string => {
  const shareableUrl = generateShareableLink(url, referralCode);
  return `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareableUrl)}`;
};

/**
 * Generate a native share URL with referral code
 * @param title The share title
 * @param url The URL to share
 * @param referralCode The user's referral code (optional)
 * @returns Object with share data including URL with referral code if provided
 */
export const generateNativeShareData = (
  title: string,
  url: string,
  referralCode?: string | null
): { title: string; url: string } => {
  const shareableUrl = generateShareableLink(url, referralCode);
  return {
    title,
    url: shareableUrl,
  };
};