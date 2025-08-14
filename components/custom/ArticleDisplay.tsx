"use client";
import { X } from "lucide-react";
import React, { ChangeEvent, ReactNode, useCallback, useState } from "react";
import { getParsedDocument, HTMLNode } from "@/lib/html-parser";

interface UploadedImage {
  url: string;
  name: string;
}

interface UploadedImages {
  [key: string]: UploadedImage;
}

interface ModalState {
  src: string;
  alt: string;
  isOpen: boolean;
}

interface CustomComponentProps {
  children?: ReactNode;
  key?: React.Key;
  [key: string]: unknown;
}

interface CustomImageProps extends CustomComponentProps {
  src?: string;
  alt?: string;
  onImageClick: (src: string, alt: string) => void;
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

interface ImageModalProps {
  src: string;
  alt: string;
  isOpen: boolean;
  onClose: () => void;
}

// Custom components for different HTML elements
const CustomParagraph: React.FC<CustomComponentProps> = ({
  children,
  ...props
}) => (
  <p className="mb-4 font-medium leading-relaxed" {...props}>
    {children}
  </p>
);

const CustomHeading: React.FC<CustomHeadingProps> = ({
  level,
  children,
  ...props
}) => {
  const baseClasses = "font-bold  mb-3";
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
  <div className="mb-2 rounded-r border-l-2 p-2" {...props}>
    {children}
  </div>
);

const CustomImage: React.FC<CustomImageProps> = ({
  src = "",
  alt = "Image",
  onImageClick,
  ...props
}) => (
  //   <img
  //     src={src}
  //     alt={alt}
  //     className="mb-4 h-auto max-w-full cursor-pointer rounded-lg shadow-md transition-shadow hover:shadow-lg"
  //     onClick={() => onImageClick(src, alt)}
  //     {...props}
  //   />
  <div
    onClick={() => onImageClick(src, alt)}
    className="group relative mb-4 max-h-[350px] max-w-full cursor-pointer overflow-hidden rounded-lg shadow-md transition-all duration-300 hover:shadow-xl"
  >
    <img
      src={src}
      alt={alt}
      className="size-full object-contain transition-transform duration-300 group-hover:scale-105"
      onClick={() => onImageClick(src, alt)}
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

    {/* Optional: Corner indicator */}
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
);

const CustomList: React.FC<CustomListProps> = ({
  ordered,
  children,
  ...props
}) => {
  const Tag = ordered ? "ol" : "ul";
  const listClass = ordered
    ? "list-decimal list-inside mb-4 space-y-1"
    : "list-disc list-inside mb-4 space-y-1";

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
}) => (
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

const ImageModal: React.FC<ImageModalProps> = ({
  src,
  alt,
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4"
      onClick={onClose}
    >
      <div className="relative max-h-full w-full">
        <button
          onClick={onClose}
          className="absolute -top-10 right-0 text-white transition-colors hover:text-gray-300"
        >
          <X size={24} />
        </button>
        <img
          src={src}
          alt={alt}
          className="max-h-full w-full max-w-4xl rounded-lg object-contain"
          onClick={(e: React.MouseEvent) => e.stopPropagation()}
        />
      </div>
    </div>
  );
};

const parseHTMLToReact = (
  htmlString: string,
  onImageClick: (src: string, alt: string) => void,
): ReactNode[] => {
  //   const parser = new DOMParser();
  //   const doc = parser.parseFromString(htmlString, 'text/html');
  const doc = getParsedDocument(htmlString);

  const convertNodeToReact = (node: HTMLNode, index: number = 0): ReactNode => {
    if (node.type === "TEXT_NODE") {
      const text = node.content;
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

    // const props: Record<string, unknown> = {
    //   key: index,
    //   ...element.attributes,
    //   className: element.attributes["class"]?.trim(),
    //   //   ...Array.from(element.attributes).reduce((acc: Record<string, string>, attr) => {
    //   //     acc[attr.name] = attr.value;
    //   //     return acc;
    //   //   }, {})
    // };

    const props: Record<string, unknown> = { key: index };
    for (const [key, value] of Object.entries(element.attributes)) {
      if (key === "class") {
        props.className = value.trim();
      } else if (key === "style") {
      } else {
        props[key] = value;
      }
    }

    switch (tagName) {
      case "p":
        return <CustomParagraph {...props}>{children}</CustomParagraph>;
      case "h1":
        return (
          <CustomHeading level={1} {...props}>
            {children}
          </CustomHeading>
        );
      case "h2":
        return (
          <CustomHeading level={2} {...props}>
            {children}
          </CustomHeading>
        );
      case "h3":
        return (
          <CustomHeading level={3} {...props}>
            {children}
          </CustomHeading>
        );
      case "h4":
        return (
          <CustomHeading level={4} {...props}>
            {children}
          </CustomHeading>
        );
      case "h5":
        return (
          <CustomHeading level={5} {...props}>
            {children}
          </CustomHeading>
        );
      case "h6":
        return (
          <CustomHeading level={6} {...props}>
            {children}
          </CustomHeading>
        );
      case "div":
        return <CustomDiv {...props}>{children}</CustomDiv>;
      case "img":
        return (
          <CustomImage
            {...props}
            src={props.src as string}
            alt={props.alt as string}
            onImageClick={onImageClick}
          />
        );
      case "ul":
        return (
          <CustomList ordered={false} {...props}>
            {children}
          </CustomList>
        );
      case "ol":
        return (
          <CustomList ordered={true} {...props}>
            {children}
          </CustomList>
        );
      case "li":
        return <CustomListItem {...props}>{children}</CustomListItem>;
      case "a":
        return (
          <CustomLink {...props} href={props.href as string}>
            {children}
          </CustomLink>
        );
      case "strong":
      case "b":
        return <CustomStrong {...props}>{children}</CustomStrong>;
      case "em":
      case "i":
        return <CustomEm {...props}>{children}</CustomEm>;
      case "br":
        return <br key={index} />;
      case "span":
        return (
          <span key={index} {...props}>
            {children}
          </span>
        );
      case "hr":
        return <hr key={index} {...props} />;
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
  //   onImageClick: (src: string, alt: string) => void;
}

// Main component
const HTMLParserRenderer: React.FC<HTMLParserRendererProps> = ({
  htmlString,
}) => {
  const [uploadedImages, setUploadedImages] = useState<UploadedImages>({});

  const getDefaultHTML = (): string => `
    <h1>Welcome to Custom HTML Renderer</h1>
    <p>This is a <strong>paragraph</strong> with some <em>emphasized text</em> and a <a href="https://example.com">link</a>.</p>
    <div>This is a custom div with special styling!</div>
    <h2>Features</h2>
    <ul>
      <li>Custom styled paragraphs</li>
      <li>Beautiful headings</li>
      <li>Clickable images with modal view</li>
      <li>Styled lists and links</li>
    </ul>
    <h3>Sample Images</h3>
    <p>Upload images below and they'll appear here when you click "Insert Image":</p>
    ${uploadedImages.image1 ? `<img src="${uploadedImages.image1.url}" alt="${uploadedImages.image1.name}" />` : "<p><em>Upload Image 1 to see it here</em></p>"}
    ${uploadedImages.image2 ? `<img src="${uploadedImages.image2.url}" alt="${uploadedImages.image2.name}" />` : "<p><em>Upload Image 2 to see it here</em></p>"}
    <ol>
      <li>First ordered item</li>
      <li>Second ordered item with <strong>bold text</strong></li>
      <li>Third item</li>
    </ol>
    <p>Try pasting your own HTML in the textarea above!</p>
  `;

  const [htmlInput, setHtmlInput] = useState<string>(htmlString);
  const [modalImage, setModalImage] = useState<ModalState>({
    src: "",
    alt: "",
    isOpen: false,
  });

  // Initialize HTML input with default content
  //   React.useEffect(() => {
  //     if (!htmlInput) {
  //       setHtmlInput(getDefaultHTML().trim());
  //     }
  //   }, [uploadedImages, htmlInput]);

  const handleImageUpload = (imageKey: string, file: File | null): void => {
    if (file && file.type.startsWith("image/")) {
      const url = URL.createObjectURL(file);
      setUploadedImages((prev) => ({
        ...prev,
        [imageKey]: { url, name: file.name },
      }));
    }
  };

  const insertImageIntoHTML = (imageKey: string): void => {
    const image = uploadedImages[imageKey];
    if (image) {
      const imageTag = `<img src="${image.url}" alt="${image.name}" />`;
      setHtmlInput((prev) => prev + "\n" + imageTag);
    }
  };

  const handleImageClick = useCallback((src: string, alt: string): void => {
    setModalImage({ src, alt, isOpen: true });
  }, []);

  const closeModal = useCallback((): void => {
    setModalImage({ src: "", alt: "", isOpen: false });
  }, []);

  const handleHtmlInputChange = (e: ChangeEvent<HTMLTextAreaElement>): void => {
    setHtmlInput(e.target.value);
  };

  const handleFileInputChange =
    (imageKey: string) =>
    (e: ChangeEvent<HTMLInputElement>): void => {
      const file = e.target.files?.[0] || null;
      handleImageUpload(imageKey, file);
    };

  const renderedContent = parseHTMLToReact(htmlInput, handleImageClick);

  return (
    <>
      {renderedContent}
      <ImageModal
        src={modalImage.src}
        alt={modalImage.alt}
        isOpen={modalImage.isOpen}
        onClose={closeModal}
      />
    </>
  );

  return (
    <div className="mx-auto max-w-4xl bg-white p-6">
      <div className="mb-6">
        <h1 className="mb-4 text-2xl font-bold text-gray-900">
          HTML Parser & Custom Renderer
        </h1>

        {/* Image Upload Section */}
        <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
          <h3 className="mb-3 text-lg font-semibold text-blue-900">
            Upload Images for Testing
          </h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Upload Image 1:
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileInputChange("image1")}
                className="block w-full text-sm text-gray-500 file:mr-4 file:rounded-full file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100"
              />
              {uploadedImages.image1 && (
                <div className="mt-2">
                  <button
                    onClick={() => insertImageIntoHTML("image1")}
                    className="rounded bg-blue-600 px-3 py-1 text-sm text-white transition-colors hover:bg-blue-700"
                  >
                    Insert Image 1 into HTML
                  </button>
                  <p className="mt-1 text-xs text-gray-600">
                    Uploaded: {uploadedImages.image1.name}
                  </p>
                </div>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Upload Image 2:
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileInputChange("image2")}
                className="block w-full text-sm text-gray-500 file:mr-4 file:rounded-full file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100"
              />
              {uploadedImages.image2 && (
                <div className="mt-2">
                  <button
                    onClick={() => insertImageIntoHTML("image2")}
                    className="rounded bg-blue-600 px-3 py-1 text-sm text-white transition-colors hover:bg-blue-700"
                  >
                    Insert Image 2 into HTML
                  </button>
                  <p className="mt-1 text-xs text-gray-600">
                    Uploaded: {uploadedImages.image2.name}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label
              htmlFor="html-input"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              HTML Input:
            </label>
            <textarea
              id="html-input"
              value={htmlInput}
              onChange={handleHtmlInputChange}
              className="resize-vertical h-32 w-full rounded-lg border border-gray-300 p-3 font-mono text-sm focus:border-transparent focus:ring-2 focus:ring-blue-500"
              placeholder="Paste your HTML here..."
            />
          </div>
        </div>
      </div>

      <div className="border-t-2 border-gray-200 pt-6">
        <h2 className="mb-4 text-xl font-semibold text-gray-800">
          Rendered Output:
        </h2>
        <div className="min-h-32 rounded-lg border bg-gray-50 p-6">
          {renderedContent}
        </div>
      </div>

      <ImageModal
        src={modalImage.src}
        alt={modalImage.alt}
        isOpen={modalImage.isOpen}
        onClose={closeModal}
      />
    </div>
  );
};

export default HTMLParserRenderer;
