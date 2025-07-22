"use client";
import {
  Clock,
  Copy,
  Edit3,
  ExternalLink,
  Eye,
  Facebook,
  Hourglass,
  Linkedin,
  Link as LinkIcon,
  PlusCircle,
  Share2,
  Tag,
  Twitter,
} from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/routing";
import { IDraft } from "@/types/draft.type";
import { IPost } from "@/types/post.type";
import { generateShortURL } from "../_actions/generateShortUrl";

const PostAwaitingApproval = ({ article }: { article: IDraft }) => {
  const [copied, setCopied] = useState(false);
  // const [shortUrl, setShortUrl] = useState(article.short_url || "");
  // const [shortUrlCopied, setShortUrlCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // const generateLink = (slug: string) => {
  //   return `${process.env.NEXT_PUBLIC_APP_URL}/en/post/${slug}`;
  // };

  // const url = generateLink(article.slug);

  // const handleCopyUrl = async () => {
  //   try {
  //     await navigator.clipboard.writeText(url);
  //     setCopied(true);
  //     setTimeout(() => setCopied(false), 2000);
  //   } catch (err) {
  //     console.error("Failed to copy URL");
  //   }
  // };

  // const handleCopyShortUrl = async () => {
  //   try {
  //     await navigator.clipboard.writeText(shortUrl);
  //     setShortUrlCopied(true);
  //     setTimeout(() => setShortUrlCopied(false), 2000);
  //   } catch (err) {
  //     console.error("Failed to copy URL");
  //   }
  // };

  // const handleGenerateShortUrl = async () => {
  //   try {
  //     setIsLoading(true);
  //     const post = await generateShortURL(url, article._id!.toString());
  //     if (!post) {
  //       toast.error("Error generating short URL");
  //       return;
  //     }
  //     setShortUrl(post.short_url!);
  //   } catch (error) {
  //     console.error("Error generating short URL:", error);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  // const shareUrls = {
  //   twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(article.title)}&url=${encodeURIComponent(url)}`,
  //   facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
  //     url,
  //   )}`,
  //   linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
  //     url,
  //   )}`,
  //   email: `mailto:?subject=${encodeURIComponent(
  //     article.title,
  //   )}&body=${encodeURIComponent(url)}`,
  // };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 p-4">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8 pt-8 text-center">
          <div className="mb-4 inline-flex size-16 items-center justify-center rounded-full bg-yellow-100">
            <Hourglass className="size-8 text-yellow-600" />
          </div>
          <h1 className="mb-2 text-3xl font-bold text-gray-900">
            Post Awaiting Approval
          </h1>
          <p className="text-lg text-gray-600">
            Your article has been submitted and is pending review by our
            moderators. Please check back later.
          </p>
        </div>

        {/* Article Preview Card */}
        <div className="mb-8 rounded-xl border border-gray-100 bg-white p-6 shadow-lg">
          <div className="mb-4 flex items-start justify-between">
            <div className="flex-1">
              <h2 className="mb-2 line-clamp-2 text-xl font-semibold text-gray-900">
                {article.title}
              </h2>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                {/* <div className="flex items-center">
                  <Clock className="mr-1 size-4" />
                  {article.ttr} min read
                </div> */}
                <div className="flex items-center">
                  <Tag className="mr-1 size-4" />
                  {article.category.join(", ")}
                </div>
                <div>
                  Submitted {new Date(article.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>

          {/* URL Copy Section */}
          {/* <div className="flex items-center rounded-lg bg-gray-50 p-3">
            <code className="mr-3 flex-1 truncate text-sm text-gray-700">
              {url}
            </code>
            <button
              onClick={handleCopyUrl}
              className="flex items-center rounded bg-gray-200 px-3 py-1 text-sm transition-colors hover:bg-gray-300"
            >
              <Copy className="mr-1 size-4" />
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
          {shortUrl && (
            <div className="flex items-center rounded-lg bg-gray-50 p-3">
              <code className="mr-3 flex-1 truncate text-sm text-gray-700">
                {shortUrl}
              </code>
              <button
                onClick={handleCopyShortUrl}
                className="flex items-center rounded bg-gray-200 px-3 py-1 text-sm transition-colors hover:bg-gray-300"
              >
                <Copy className="mr-1 size-4" />
                {shortUrlCopied ? "Copied!" : "Copy"}
              </button>
            </div>
          )} */}
        </div>

        {/* Action Grid */}
        {/* <div className="mb-8 grid gap-6 md:grid-cols-2"> */}
        {/* Share Your Article */}
        {/* <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-lg">
            <div className="mb-4 flex items-center">
              <Share2 className="mr-2 size-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">
                Share Your Article
              </h3>
            </div>
            <p className="mb-4 text-gray-600">
              Once approved, you can amplify your reach by sharing across social
              platforms
            </p>

            <div className="space-y-3">
              <a
                href={shareUrls.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center rounded-lg border border-gray-200 p-3 transition-colors hover:bg-gray-50"
              >
                <Twitter className="mr-3 size-5 text-blue-400" />
                <span className="font-medium">Share on Twitter</span>
              </a>

              <a
                href={shareUrls.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center rounded-lg border border-gray-200 p-3 transition-colors hover:bg-gray-50"
              >
                <Linkedin className="mr-3 size-5 text-blue-600" />
                <span className="font-medium">Share on LinkedIn</span>
              </a>

              <a
                href={shareUrls.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center rounded-lg border border-gray-200 p-3 transition-colors hover:bg-gray-50"
              >
                <Facebook className="mr-3 size-5 text-blue-700" />
                <span className="font-medium">Share on Facebook</span>
              </a>
            </div>
          </div> */}

        <div className="flex w-full gap-2">
          <div className="flex-1 rounded-xl border border-gray-100 bg-white p-6 shadow-lg">
            <div className="mb-3 flex items-center">
              <Edit3 className="mr-2 size-5 text-orange-600" />
              <h4 className="font-semibold text-gray-900">Make Updates</h4>
            </div>
            <p className="mb-4 text-sm text-gray-600">
              Need to make changes? You can edit your article anytime before it
              is published.
            </p>
            <Link
              href={`/editor/${article?._id?.toString()}`}
              className="flex w-full items-center justify-center rounded-lg bg-orange-100 px-4 py-2 text-orange-700 transition-colors hover:bg-orange-200"
            >
              Edit Article
            </Link>
          </div>

          {/* Write Another */}
          <div className="flex-1 rounded-xl border border-gray-100 bg-white p-6 shadow-lg">
            <div className="mb-3 flex items-center">
              <PlusCircle className="mr-2 size-5 text-green-600" />
              <h4 className="font-semibold text-gray-900">Keep Writing</h4>
            </div>
            <p className="mb-4 text-sm text-gray-600">
              Momentum is key! Start your next article while inspiration is
              fresh.
            </p>
            <Link
              href="/editor"
              className="flex w-full items-center justify-center rounded-lg bg-green-100 px-4 py-2 text-green-700 transition-colors hover:bg-green-200"
            >
              New Article
            </Link>
          </div>
        </div>
        {/* </div> */}
      </div>
    </div>
  );
};

export default PostAwaitingApproval;
