"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Link } from "@/i18n/routing";
import { IBatchArticle } from "@/types/batch.type";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, ChevronUp, ExternalLink } from "lucide-react";
import { useState } from "react";

const RelatedExternalArticles = ({
  articles,
}: {
  articles: IBatchArticle[];
}) => {
  const [isArticlesExpanded, setIsArticlesExpanded] = useState(false);
  return (
    <div className="relative w-full lg:w-[600px]">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsArticlesExpanded(!isArticlesExpanded)}
        className="mb-1 w-full justify-between"
      >
        <span>Related Articles</span>
        {isArticlesExpanded ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <div className="flex items-center">
            <div className="mr-2 flex -space-x-3">
              {articles.slice(0, 3).map((article, index) => (
                <div
                  key={article.id.toString()}
                  className="relative overflow-hidden rounded-full border-2 border-white bg-[#fff]"
                  style={{ zIndex: 3 - index }}
                >
                  <img
                    src={article.source_icon || "/placeholder.svg"}
                    alt={article.source_name}
                    width={24}
                    height={24}
                    className="rounded-full"
                  />
                </div>
              ))}
            </div>
            {articles.length > 3 && (
              <Badge variant="secondary" className="ml-1">
                +{articles.length - 3}
              </Badge>
            )}
            <ChevronDown className="ml-2 h-4 w-4" />
          </div>
        )}
      </Button>
      <AnimatePresence>
        {isArticlesExpanded && (
          <ScrollArea type="auto" className="h-[300px]">
            <motion.ul
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-3 space-y-3 overflow-hidden pr-2"
            >
              {articles.map((article) => (
                <motion.li
                  key={article.id.toString()}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <Link
                    href={article.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:bg-subtle-hover-bg flex items-center space-x-3 rounded-md p-2 transition-colors"
                  >
                    <div className="flex-shrink-0">
                      <img
                        src={article.source_icon || "/placeholder.svg"}
                        alt={article.source_name}
                        width={24}
                        height={24}
                        className="rounded-full"
                      />
                    </div>
                    <div className="flex-grow">
                      <p className="text-foreground-alt text-xs font-medium">
                        {article.title}
                      </p>
                      <p className="text-xs text-gray-500">
                        {article.source_name}
                      </p>
                    </div>
                    <ExternalLink className="h-4 w-4 flex-shrink-0 text-gray-400" />
                  </Link>
                </motion.li>
              ))}
            </motion.ul>
          </ScrollArea>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RelatedExternalArticles;
