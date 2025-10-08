"use client";
import {
  Calendar,
  Edit3,
  PlusCircle,
  Tag,
} from "lucide-react";
import React from "react";
import { Link } from "@/i18n/routing";
import { IDraft } from "@/types/draft.type";

const PostScheduled = ({ article }: { article: IDraft }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8 pt-8 text-center">
          <div className="mb-4 inline-flex size-16 items-center justify-center rounded-full bg-blue-100">
            <Calendar className="size-8 text-blue-600" />
          </div>
          <h1 className="mb-2 text-3xl font-bold text-gray-900">
            Post Scheduled
          </h1>
          <p className="text-lg text-gray-600">
            Your article has been scheduled and will be published at the specified time.
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
                  <Tag className="mr-1 size-4" />
                  {article.category.join(", ")}
                </div>
                <div>
                  Scheduled for {article.scheduledDate ? new Date(article.scheduledDate).toLocaleDateString() : "Pending"}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Grid */}
        <div className="flex w-full gap-2">
          <div className="flex-1 rounded-xl border border-gray-100 bg-white p-6 shadow-lg">
            <div className="mb-3 flex items-center">
              <Edit3 className="mr-2 size-5 text-orange-600" />
              <h4 className="font-semibold text-gray-900">Make Updates</h4>
            </div>
            <p className="mb-4 text-sm text-gray-600">
              Need to make changes? You can edit your scheduled article before it publishes.
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
              Momentum is key! Start your next article while inspiration is fresh.
            </p>
            <Link
              href="/editor"
              className="flex w-full items-center justify-center rounded-lg bg-green-100 px-4 py-2 text-green-700 transition-colors hover:bg-green-200"
            >
              New Article
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostScheduled;