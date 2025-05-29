"use client";
import React, { useState } from "react";
import {
  CheckCircle,
  Share2,
  Copy,
  Twitter,
  Facebook,
  Linkedin,
  Edit3,
  Eye,
  Users,
  MessageCircle,
  PlusCircle,
  ExternalLink,
  Clock,
  Tag,
  Link as LinkIcon,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { IPost } from "@/types/post.type";
import { Button } from "@/components/ui/button";
import { generateShortURL } from "../_actions/generateShortUrl";
import { toast } from "sonner";
import { Link } from "@/i18n/routing";

const PostPublish = ({ article }: { article: IPost }) => {
  const [copied, setCopied] = useState(false);
  const [shortUrl, setShortUrl] = useState(article.short_url || "");
  const [shortUrlCopied, setShortUrlCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Mock article data
  //   const article = {
  //     title:
  //       "The Future of Sustainable Energy: A Deep Dive into Solar Innovation",
  //     url: "https://newsplatform.com/articles/sustainable-energy-solar-innovation-2025",
  //     publishedAt: "2025-05-25T14:30:00Z",
  //     estimatedReadTime: "8 min read",
  //     category: "Technology",
  //   };

  //   const suggestedTags = [
  //     "renewable energy",
  //     "solar power",
  //     "climate change",
  //     "innovation",
  //     "sustainability",
  //     "green technology",
  //     "energy policy",
  //     "clean energy",
  //   ];

  const generateLink = (slug: string) => {
    return `${process.env.NEXT_PUBLIC_APP_URL}/en/post/${slug}`;
  };

  const url = generateLink(article.slug);

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy URL");
    }
  };

  const handleCopyShortUrl = async () => {
    try {
      await navigator.clipboard.writeText(shortUrl);
      setShortUrlCopied(true);
      setTimeout(() => setShortUrlCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy URL");
    }
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  const handleGenerateShortUrl = async () => {
    try {
      setIsLoading(true);
      const post = await generateShortURL(url, article._id!.toString());
      if (!post) {
        toast.error("Error generating short URL");
        return;
      }
      setShortUrl(post.short_url!);
    } catch (error) {
      console.error("Error generating short URL:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const shareUrls = {
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(article.title)}&url=${encodeURIComponent(url)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="mx-auto max-w-4xl">
        {/* Success Header */}
        <div className="mb-8 pt-8 text-center">
          <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="mb-2 text-3xl font-bold text-gray-900">
            Article Published Successfully!
          </h1>
          <p className="text-lg text-gray-600">
            Your story is now live and ready to reach readers around the world.
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
                <div className="flex items-center">
                  <Clock className="mr-1 h-4 w-4" />
                  {article.ttr} min read
                </div>
                <div className="flex items-center">
                  <Tag className="mr-1 h-4 w-4" />
                  {article.category.join(", ")}
                </div>
                <div>
                  Published{" "}
                  {new Date(article.published_at).toLocaleDateString()}
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-4 flex items-center rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
              >
                <Eye className="mr-2 h-4 w-4" />
                View Live
                <ExternalLink className="ml-2 h-4 w-4" />
              </a>
              {!shortUrl && (
                <Button variant="outline" onClick={handleGenerateShortUrl}>
                  <LinkIcon className="mr-2 h-4 w-4" />
                  {isLoading ? "Generating..." : "Generate Short URL"}
                </Button>
              )}
            </div>
          </div>

          {/* URL Copy Section */}
          <div className="flex items-center rounded-lg bg-gray-50 p-3">
            <code className="mr-3 flex-1 truncate text-sm text-gray-700">
              {url}
            </code>
            <button
              onClick={handleCopyUrl}
              className="flex items-center rounded bg-gray-200 px-3 py-1 text-sm transition-colors hover:bg-gray-300"
            >
              <Copy className="mr-1 h-4 w-4" />
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
                <Copy className="mr-1 h-4 w-4" />
                {shortUrlCopied ? "Copied!" : "Copy"}
              </button>
            </div>
          )}
        </div>

        {/* Action Grid */}
        <div className="mb-8 grid gap-6 md:grid-cols-2">
          {/* Share Your Article */}
          <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-lg">
            <div className="mb-4 flex items-center">
              <Share2 className="mr-2 h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">
                Share Your Article
              </h3>
            </div>
            <p className="mb-4 text-gray-600">
              Amplify your reach by sharing across social platforms
            </p>

            <div className="space-y-3">
              <a
                href={shareUrls.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center rounded-lg border border-gray-200 p-3 transition-colors hover:bg-gray-50"
              >
                <Twitter className="mr-3 h-5 w-5 text-blue-400" />
                <span className="font-medium">Share on Twitter</span>
              </a>

              <a
                href={shareUrls.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center rounded-lg border border-gray-200 p-3 transition-colors hover:bg-gray-50"
              >
                <Linkedin className="mr-3 h-5 w-5 text-blue-600" />
                <span className="font-medium">Share on LinkedIn</span>
              </a>

              <a
                href={shareUrls.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center rounded-lg border border-gray-200 p-3 transition-colors hover:bg-gray-50"
              >
                <Facebook className="mr-3 h-5 w-5 text-blue-700" />
                <span className="font-medium">Share on Facebook</span>
              </a>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-lg">
              <div className="mb-3 flex items-center">
                <Edit3 className="mr-2 h-5 w-5 text-orange-600" />
                <h4 className="font-semibold text-gray-900">Make Updates</h4>
              </div>
              <p className="mb-4 text-sm text-gray-600">
                Need to make changes? You can edit your published article
                anytime.
              </p>
              <Link
                href={`/editor/${article?._id?.toString()}`}
                className="flex w-full items-center justify-center rounded-lg bg-orange-100 px-4 py-2 text-orange-700 transition-colors hover:bg-orange-200"
              >
                Edit Article
              </Link>
            </div>

            {/* Write Another */}
            <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-lg">
              <div className="mb-3 flex items-center">
                <PlusCircle className="mr-2 h-5 w-5 text-green-600" />
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

          {/* Engage with Readers */}
          {/* <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-lg">
            <div className="mb-4 flex items-center">
              <Users className="mr-2 h-5 w-5 text-purple-600" />
              <h3 className="text-lg font-semibold text-gray-900">
                Engage with Readers
              </h3>
            </div>
            <p className="mb-4 text-gray-600">
              Build connections and foster discussion around your content
            </p>

            <div className="space-y-3">
              <button className="flex w-full items-center rounded-lg border border-gray-200 p-3 text-left transition-colors hover:bg-gray-50">
                <MessageCircle className="mr-3 h-5 w-5 text-green-600" />
                <div>
                  <div className="font-medium">Monitor Comments</div>
                  <div className="text-sm text-gray-500">
                    Respond to reader feedback
                  </div>
                </div>
              </button>

              <button className="flex w-full items-center rounded-lg border border-gray-200 p-3 text-left transition-colors hover:bg-gray-50">
                <Users className="mr-3 h-5 w-5 text-blue-600" />
                <div>
                  <div className="font-medium">Connect with Readers</div>
                  <div className="text-sm text-gray-500">
                    Follow back engaged users
                  </div>
                </div>
              </button>
            </div>
          </div> */}
        </div>

        {/* Additional Actions */}
        {/* <div className="mb-8 grid gap-6 md:grid-cols-3"> */}
        {/* Edit Article */}
        {/* <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-lg">
            <div className="mb-3 flex items-center">
              <Edit3 className="mr-2 h-5 w-5 text-orange-600" />
              <h4 className="font-semibold text-gray-900">Make Updates</h4>
            </div>
            <p className="mb-4 text-sm text-gray-600">
              Need to make changes? You can edit your published article anytime.
            </p>
            <button className="w-full rounded-lg bg-orange-100 px-4 py-2 text-orange-700 transition-colors hover:bg-orange-200">
              Edit Article
            </button>
          </div>

          {/* Write Another */}
        {/* <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-lg">
            <div className="mb-3 flex items-center">
              <PlusCircle className="mr-2 h-5 w-5 text-green-600" />
              <h4 className="font-semibold text-gray-900">Keep Writing</h4>
            </div>
            <p className="mb-4 text-sm text-gray-600">
              Momentum is key! Start your next article while inspiration is
              fresh.
            </p>
            <button className="w-full rounded-lg bg-green-100 px-4 py-2 text-green-700 transition-colors hover:bg-green-200">
              New Article
            </button> */}
        {/* </div> */}

        {/* View Profile */}
        {/* <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-lg">
            <div className="mb-3 flex items-center">
              <Eye className="mr-2 h-5 w-5 text-blue-600" />
              <h4 className="font-semibold text-gray-900">Your Profile</h4>
            </div>
            <p className="mb-4 text-sm text-gray-600">
              See how your article looks on your author profile page.
            </p>
            <button className="w-full rounded-lg bg-blue-100 px-4 py-2 text-blue-700 transition-colors hover:bg-blue-200">
              View Profile
            </button>
          </div> */}
        {/* </div> */}

        {/* Tag Suggestions */}
        {/* <div className="mb-8 rounded-xl border border-gray-100 bg-white p-6 shadow-lg">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">
            Enhance Discoverability
          </h3>
          <p className="mb-4 text-gray-600">
            Consider adding these relevant tags to help readers find your
            article:
          </p>

          <div className="mb-4 flex flex-wrap gap-2">
            {suggestedTags.map((tag) => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`rounded-full border px-3 py-1 text-sm transition-colors ${
                  selectedTags.includes(tag)
                    ? "border-blue-300 bg-blue-100 text-blue-700"
                    : "border-gray-300 bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>

          {selectedTags.length > 0 && (
            <button className="rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700">
              Add Selected Tags ({selectedTags.length})
            </button>
          )}
        </div> */}

        {/* Tips for Success */}
        {/* <Alert className="border-blue-200 bg-blue-50">
          <AlertDescription className="text-blue-800">
            <strong>Pro tip:</strong> The first few hours after publishing are
            crucial for engagement. Share your article, respond to early
            comments, and engage with your network to maximize reach and build
            momentum.
          </AlertDescription>
        </Alert> */}
      </div>
    </div>
  );
};

export default PostPublish;
