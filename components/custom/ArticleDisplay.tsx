"use client";
import React, { Fragment, ReactNode } from "react";
import { PhotoProvider, PhotoView } from "react-photo-view";
import "react-photo-view/dist/react-photo-view.css";
import { getParsedDocument, HTMLNode } from "@/lib/html-parser";
import ArticlePromotion from "../promotion/article";
import { PROMOTION_DETAIL_KEY_ENUMS } from "../promotion/data";
import WhatsappPromotion from "../promotion/whatsapp";

let PARAGRAPH_TRACKER = 0;

interface CustomComponentProps {
  // key?: React.Key;
  children?: ReactNode;
  [key: string]: unknown;
}

interface CustomImageProps extends CustomComponentProps {
  src?: string;
  alt?: string;
}

interface CustomHeadingProps extends CustomComponentProps {
  level: 1 | 2 | 3 | 4 | 5 | 6;
}

interface CustomListProps extends CustomComponentProps {
  ordered: boolean;
}

interface CustomLinkProps extends CustomComponentProps {
  href?: string;
}

// Custom components for different HTML elements
const CustomParagraph: React.FC<CustomComponentProps> = ({
  children,
  ...props
}) => (
  <p
    className="mb-4 max-w-[100vw] text-base font-normal leading-7 text-foreground-alt-p/75"
    {...props}
  >
    {children}
  </p>
);

const CustomHeading: React.FC<CustomHeadingProps> = ({
  level,
  children,
  ...props
}) => {
  const baseClasses = "font-bold mb-3";
  const levelClasses: Record<number, string> = {
    1: "text-3xl",
    2: "text-2xl",
    3: "text-xl",
    4: "text-lg",
    5: "text-base",
    6: "text-sm",
  };

  const Tag = `h${level}` as keyof JSX.IntrinsicElements;
  return (
    <Tag className={`${baseClasses} ${levelClasses[level]}`} {...props}>
      {children}
    </Tag>
  );
};

const CustomDiv: React.FC<CustomComponentProps> = ({ children, ...props }) => (
  <div className="mb-2" {...props}>
    {children}
  </div>
);

const CustomImage: React.FC<CustomImageProps> = ({
  src = "",
  alt = "Image",
  ...props
}) => (
  <PhotoView src={src}>
    <div className="group relative mb-4 max-h-[350px] max-w-full cursor-pointer overflow-hidden rounded-lg shadow-md transition-all duration-300 hover:shadow-xl">
      <img
        src={src}
        alt={alt}
        className="size-full object-contain transition-transform duration-300 group-hover:scale-105"
        {...props}
      />

      {/* Overlay with expand icon */}
      <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-all duration-300 group-hover:bg-black/20">
        <div className="rounded-full bg-white/90 p-3 opacity-0 shadow-lg transition-opacity duration-300 group-hover:opacity-100">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-gray-700"
          >
            <polyline points="15,3 21,3 21,9"></polyline>
            <polyline points="9,21 3,21 3,15"></polyline>
            <line x1="21" y1="3" x2="14" y2="10"></line>
            <line x1="3" y1="21" x2="10" y2="14"></line>
          </svg>
        </div>
      </div>

      {/* Corner indicator */}
      <div className="absolute right-3 top-3 opacity-60 transition-opacity duration-300 group-hover:opacity-100">
        <div className="rounded-full bg-black/50 p-1.5">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="15,3 21,3 21,9"></polyline>
            <polyline points="9,21 3,21 3,15"></polyline>
            <line x1="21" y1="3" x2="14" y2="10"></line>
            <line x1="3" y1="21" x2="10" y2="14"></line>
          </svg>
        </div>
      </div>
    </div>
  </PhotoView>
);

const CustomList: React.FC<CustomListProps> = ({
  ordered,
  children,
  ...props
}) => {
  const Tag = ordered ? "ol" : "ul";
  const listClass = ordered
    ? "list-decimal mb-4 space-y-1"
    : "list-disc mb-4 space-y-1";

  return (
    <Tag className={listClass} {...props}>
      {children}
    </Tag>
  );
};

const CustomListItem: React.FC<CustomComponentProps> = ({
  children,
  ...props
}) => (
  <li className="ml-4" {...props}>
    {children}
  </li>
);

const CustomLink: React.FC<CustomLinkProps> = ({
  href,
  children,
  ...props
}) => {
  return (
    <a
      href={href}
      className="text-blue-600 underline hover:text-blue-800"
      target="_blank"
      rel="noopener noreferrer"
      {...props}
    >
      {children}
    </a>
  );
};

const CustomStrong: React.FC<CustomComponentProps> = ({
  children,
  ...props
}) => (
  <strong className="font-bold" {...props}>
    {children}
  </strong>
);

const CustomEm: React.FC<CustomComponentProps> = ({ children, ...props }) => (
  <em className="italic" {...props}>
    {children}
  </em>
);

const CustomFigure: React.FC<CustomComponentProps> = ({
  children,
  ...props
}) => (
  <figure className="my-10 w-full" {...props}>
    {children}
  </figure>
);

const CustomFigcaption = ({ children }: CustomComponentProps) => (
  <figcaption className="mt-2 text-center text-sm font-light text-foreground-alt-p">
    {children}
  </figcaption>
);

const parseHTMLToReact = (
  htmlString: string,
  category: string[],
): ReactNode[] => {
  const doc = getParsedDocument(htmlString);

  const convertNodeToReact = (node: HTMLNode, index: number = 0): ReactNode => {
    if (node.type === "TEXT_NODE") {
      const text = node.content.replaceAll("&nbsp;", "");
      return text ? text : null;
    }

    if (node.type !== "V_NODE") {
      return null;
    }

    const element = node;
    const tagName = element.tagName.toLowerCase();
    const children = Array.from(element.children)
      .map((child, i) => convertNodeToReact(child, i))
      .filter((child): child is ReactNode => child !== null);

    const props: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(element.attributes)) {
      if (key === "class" || key === "style") {
        continue;
      }
      props[key] = value;
    }

    switch (tagName) {
      case "p":
        PARAGRAPH_TRACKER++;
        return (
          <Fragment key={index}>
            {PARAGRAPH_TRACKER % 15 === 0 &&
              element.parent?.tagName === "root" && (
                <div className="my-4">
                  <ArticlePromotion
                    category={category[0] as PROMOTION_DETAIL_KEY_ENUMS}
                  />
                </div>
              )}
            {PARAGRAPH_TRACKER % 20 === 0 &&
              element.parent?.tagName === "root" && (
                <div className="my-4">
                  <WhatsappPromotion />
                </div>
              )}
            <CustomParagraph {...props}>{children}</CustomParagraph>
          </Fragment>
        );
      case "h1":
        return (
          <CustomHeading key={index} level={1} {...props}>
            {children}
          </CustomHeading>
        );
      case "h2":
        return (
          <CustomHeading key={index} level={2} {...props}>
            {children}
          </CustomHeading>
        );
      case "h3":
        return (
          <CustomHeading key={index} level={3} {...props}>
            {children}
          </CustomHeading>
        );
      case "h4":
        return (
          <CustomHeading key={index} level={4} {...props}>
            {children}
          </CustomHeading>
        );
      case "h5":
        return (
          <CustomHeading key={index} level={5} {...props}>
            {children}
          </CustomHeading>
        );
      case "h6":
        return (
          <CustomHeading key={index} level={6} {...props}>
            {children}
          </CustomHeading>
        );
      case "div":
        return (
          <CustomDiv key={index} {...props}>
            {children}
          </CustomDiv>
        );
      case "img":
        return (
          <CustomImage
            {...props}
            key={index}
            src={props.src as string}
            alt={props.alt as string}
          />
        );
      case "figure":
        return (
          <CustomFigure key={index} {...props}>
            {children}
          </CustomFigure>
        );
      case "figcaption":
        return (
          <CustomFigcaption key={index} {...props}>
            {children}
          </CustomFigcaption>
        );
      case "ul":
        return (
          <CustomList key={index} ordered={false} {...props}>
            {children}
          </CustomList>
        );
      case "ol":
        return (
          <CustomList key={index} ordered={true} {...props}>
            {children}
          </CustomList>
        );
      case "li":
        return (
          <CustomListItem key={index} {...props}>
            {children}
          </CustomListItem>
        );
      case "a":
        return (
          <CustomLink key={index} {...props} href={props.href as string}>
            {children}
          </CustomLink>
        );
      case "strong":
      case "b":
        return (
          <CustomStrong key={index} {...props}>
            {children}
          </CustomStrong>
        );
      case "em":
      case "i":
        return (
          <CustomEm key={index} {...props}>
            {children}
          </CustomEm>
        );
      case "br":
        return <br key={index} />;
      case "span":
        return (
          <span key={index} {...props}>
            {children}
          </span>
        );
      case "hr":
        return <hr className="my-5" key={index} {...props} />;
      default:
        // For unknown tags, render them as-is using React.createElement
        return React.createElement(tagName, { key: index, ...props }, children);
    }
  };

  //   const bodyContent = doc.children;
  return doc.children
    .map((node, index) => convertNodeToReact(node, index))
    .filter((element): element is ReactNode => element !== null);
};

interface HTMLParserRendererProps {
  htmlString: string;
  category: string[];
}

// Main component
const HTMLParserRenderer: React.FC<HTMLParserRendererProps> = ({
  htmlString,
  category,
}) => {
  const renderedContent = parseHTMLToReact(
    htmlString,
    category || [],
  );
  PARAGRAPH_TRACKER = 0;

  return (
    <PhotoProvider>
      {renderedContent}
    </PhotoProvider>
  );
};

export default HTMLParserRenderer;
