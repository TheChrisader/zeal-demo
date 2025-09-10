import { mergeAttributes, Node } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import FigureComponent from "./components/FigureComponent";
import { filterFiles, randomId } from "../../utils";
import { ReplaceStep } from "@tiptap/pm/transform";
import {
  NodeSelection,
  Plugin,
  PluginKey,
  TextSelection,
} from "@tiptap/pm/state";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    figure: {
      setFigure: (options: {
        src: string;
        alt?: string;
        title?: string;
      }) => ReturnType;
      setFigures: (
        options: {
          src: string | File;
          alt?: string;
          title?: string;
        }[],
      ) => ReturnType;
    };
  }
}

// You will need to create this React component
export const Figure = Node.create({
  name: "figure",

  group: "block",

  content: "image figcaption", // <-- This is the crucial part

  draggable: true,

  isolating: true,

  addOptions() {
    return {
      allowedMimeTypes: [],
      maxFileSize: 0,
      allowBase64: false,
    };
  },

  addAttributes() {
    return {
      // You can add attributes here if needed, e.g., for alignment
      // class: { default: 'text-left' },
    };
  },

  parseHTML() {
    return [
      {
        tag: "figure",
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    // The '0' is a "hole" where the content (the image and figcaption) will be rendered
    return ["figure", mergeAttributes(HTMLAttributes), 0];
  },

  //   addNodeView() {
  //     return ReactNodeViewRenderer(FigureComponent);
  //   },

  addCommands() {
    return {
      setFigure:
        (options) =>
        ({ commands }) => {
          if (!options.src) {
            return false;
          }

          const position = this.editor.state.selection.from;
          const id = randomId();

          return commands.insertContentAt(position, {
            type: this.name,
            content: [
              {
                type: "image",
                attrs: {
                  id,
                  src: options.src,
                  alt: options.alt,
                  title: options.title,
                },
              },
              {
                type: "figcaption",
                content: [
                  {
                    type: "text",
                    text: " ", // Add a space to ensure the cursor can be placed inside
                  },
                ],
              },
            ],
          });
        },
      setFigures:
        (options) =>
        ({ commands }) => {
          const [validImages, errors] = filterFiles(options, {
            allowedMimeTypes: this.options.allowedMimeTypes,
            maxFileSize: this.options.maxFileSize,
            allowBase64: this.options.allowBase64,
          });

          if (errors.length > 0 && this.options.onValidationError) {
            this.options.onValidationError(errors);
          }

          if (validImages.length > 0) {
            return commands.insertContent(
              validImages.map((image) => {
                if (image.src instanceof File) {
                  const blobUrl = URL.createObjectURL(image.src);
                  const id = randomId();

                  return {
                    type: this.name,
                    content: [
                      {
                        type: "image",
                        attrs: {
                          id,
                          src: blobUrl,
                          alt: image.alt,
                          title: image.title,
                          fileName: image.src.name,
                        },
                      },
                      {
                        type: "figcaption",
                        content: [
                          {
                            type: "text",
                            text: " ", // Add a space to ensure the cursor can be placed inside
                          },
                        ],
                      },
                    ],
                  };
                }
              }),
            );
          }
          return false;
        },
    };
  },

  addKeyboardShortcuts() {
    return {
      // When backspace is pressed...
      Backspace: () => {
        const { selection } = this.editor.state;

        // ...and the selection is a NodeSelection on an image
        if (
          selection instanceof NodeSelection &&
          selection.node.type.name === "image"
        ) {
          // ...and that image's parent is a figure
          const parent = selection.$from.parent;
          if (parent.type.name === this.name) {
            // Then delete the entire figure node
            return this.editor.commands.deleteNode(this.name);
          }
        }

        // Otherwise, do the default behavior
        return false;
      },
      // You should probably do the same for the 'Delete' key
      Delete: () => {
        // ... same logic as above
        const { selection } = this.editor.state;

        // ...and the selection is a NodeSelection on an image
        if (
          selection instanceof NodeSelection &&
          selection.node.type.name === "image"
        ) {
          // ...and that image's parent is a figure
          const parent = selection.$from.parent;
          if (parent.type.name === this.name) {
            // Then delete the entire figure node
            return this.editor.commands.deleteNode(this.name);
          }
        }

        // Otherwise, do the default behavior
        return false;
      },
    };
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey("figureTextInput"),
        props: {
          handleTextInput: (view, from, to, text) => {
            const { state, dispatch } = view;
            const { selection } = state;

            if (
              selection instanceof NodeSelection &&
              selection.node.type.name === "image"
            ) {
              const parent = selection.$from.parent;
              if (parent.type.name === this.name) {
                // User is typing over the image in our figure.
                // Create a transaction to delete the entire figure and insert the text.
                // 1. Calculate the start and end positions of the entire figure
                const figurePos =
                  selection.$from.pos - selection.$from.parentOffset - 1;
                const figureEndPos = figurePos + parent.nodeSize;

                const newParagraph = state.schema.nodes.paragraph?.create(
                  null,
                  state.schema.text(text),
                );

                // 2. Create a transaction that replaces the figure with the new text
                // Using `replaceWith` is slightly cleaner than `deleteRange` + `insert`
                let tr = state.tr.replaceWith(
                  figurePos,
                  figureEndPos,
                  //   state.schema.text(text),
                  newParagraph || state.schema.text(text),
                );

                // 3. Calculate the new cursor position
                const newPos = figurePos + text.length + 1;

                // 4. Set the selection to that new position
                tr = tr.setSelection(TextSelection.create(tr.doc, newPos));

                // 5. Dispatch the single, complete transaction
                dispatch(tr);

                return true; // We handled it.
              }
            }

            return false; // Let ProseMirror do its thing.
          },
        },
      }),
    ];
  },
});
