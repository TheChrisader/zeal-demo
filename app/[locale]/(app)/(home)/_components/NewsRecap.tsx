"use client";

import type React from "react";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronDown,
  ChevronRight,
  ChevronUp,
  ExternalLink,
} from "lucide-react";
import { format } from "date-fns";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { IBatch } from "@/types/batch.type";
import { Id } from "@/lib/database";

type ClientBatch = IBatch & { summary?: string; _id: Id };

const NewsRecapCard: React.FC<{ batch: ClientBatch }> = ({ batch }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isArticlesExpanded, setIsArticlesExpanded] = useState(false);

  return (
    <Card className="h-full select-none overflow-hidden bg-white shadow-lg">
      <CardHeader className="bg-gradient-to-r from-primary to-primary text-white">
        <CardTitle className="text-lg font-semibold">{batch.name}</CardTitle>
        <CardDescription className="text-white">
          {format(new Date(batch.updated_at), "MMM d, yyyy")}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <ScrollArea
          type="auto"
          className={`mb-4 transition-all ${isExpanded ? "h-[350px]" : "h-[210px]"}`}
        >
          <p className="pr-2 text-sm font-semibold leading-relaxed text-muted-foreground">
            {isExpanded ? batch.summary : `${batch.summary!.slice(0, 300)}...`}
          </p>
        </ScrollArea>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="mb-4 text-[#696969]"
        >
          {isExpanded ? (
            <>
              Show Less <ChevronUp className="ml-2 h-4 w-4" />
            </>
          ) : (
            <>
              Read More <ChevronDown className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
        <Separator className="my-4" />
        <div className="relative">
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
                  {batch.articles.slice(0, 3).map((article, index) => (
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
                {batch.articles.length > 3 && (
                  <Badge variant="secondary" className="ml-1">
                    +{batch.articles.length - 3}
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
                  {batch.articles.map((article) => (
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
                        className="flex items-center space-x-3 rounded-md p-2 transition-colors hover:bg-gray-100"
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
                          <p className="text-xs font-medium text-[#2F2D32]">
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
      </CardContent>
      {/* <CardFooter className="bg-gray-50 p-4">
        {batch.related && batch.related.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {batch.related.map((tag, index) => (
              <Badge key={index} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardFooter> */}
    </Card>
  );
};

const NewsRecapSection: React.FC<{ batches: ClientBatch[] }> = ({
  batches,
}) => {
  return (
    <section className="w-full">
      <div className="container mx-auto px-4">
        <motion.div
          className="mb-6 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="mb-4 text-2xl font-bold text-primary">
            Recap of the Day
          </h2>
          <p className="text-lg text-muted-foreground">
            The latest updates, consolidated for your pleasure
          </p>
        </motion.div>
        <Carousel className="w-full" opts={{ loop: true }}>
          <CarouselContent>
            {batches.map((batch, index) => (
              <CarouselItem
                key={batch._id?.toString()}
                className="pl-4 md:basis-1/2 lg:basis-1/3"
              >
                <AnimatePresence>
                  <motion.div
                    key={batch._id?.toString()}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.5 }}
                  >
                    <NewsRecapCard batch={batch} />
                  </motion.div>
                </AnimatePresence>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden md:flex" />
          <CarouselNext className="hidden md:flex" />
        </Carousel>
        {/* <div className="mt-12 text-center">
          <Button
            variant="default"
            size="lg"
            className="bg-gradient-to-r from-red-600 to-orange-500 text-white transition-all duration-300 hover:from-red-700 hover:to-orange-600"
          >
            View All Breaking News <ChevronRight className="ml-2 h-5 w-5" />
          </Button>
        </div> */}
      </div>
    </section>
  );
};

export default NewsRecapSection;
