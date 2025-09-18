import { type Editor, Extension } from "@tiptap/react";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import type { FileError, FileValidationOptions } from "../../utils";
import { filterFiles } from "../../utils";

type FileHandlePluginOptions = {
  key?: PluginKey;
  editor: Editor;
  onPaste?: (editor: Editor, files: File[], pasteContent?: string) => void;
  onDrop?: (editor: Editor, files: File[], pos: number) => void;
  onValidationError?: (errors: FileError[]) => void;
} & FileValidationOptions;

const FileHandlePlugin = (options: FileHandlePluginOptions) => {
  const {
    key,
    editor,
    onPaste,
    onDrop,
    onValidationError,
    allowedMimeTypes,
    maxFileSize,
  } = options;

  return new Plugin({
    key: key || new PluginKey("fileHandler"),

    props: {
      handleDrop(view, event) {
        console.log(1);
        const { dataTransfer } = event;
        event.preventDefault();
        event.stopPropagation();

        if (!dataTransfer?.files.length) {
          console.log("end");
          return false;
        }
        console.log(2);

        console.log(3);

        const pos = view.posAtCoords({
          left: event.clientX,
          top: event.clientY,
        });
        console.log(4);

        const [validFiles, errors] = filterFiles(
          Array.from(dataTransfer.files),
          {
            allowedMimeTypes,
            maxFileSize,
            allowBase64: options.allowBase64,
          },
        );
        console.log(5);

        if (errors.length > 0 && onValidationError) {
          onValidationError(errors);
        }
        console.log(6);

        if (validFiles.length > 0 && onDrop) {
          onDrop(editor, validFiles, pos?.pos ?? 0);
        }
        console.log(7);

        return true;
      },

      handlePaste(_, event) {
        const { clipboardData } = event;

        if (!clipboardData?.files.length) {
          return false;
        }

        event.preventDefault();
        event.stopPropagation();

        const [validFiles, errors] = filterFiles(
          Array.from(clipboardData.files),
          {
            allowedMimeTypes,
            maxFileSize,
            allowBase64: options.allowBase64,
          },
        );
        const html = clipboardData.getData("text/html");

        if (errors.length > 0 && onValidationError) {
          onValidationError(errors);
        }

        if (validFiles.length > 0 && onPaste) {
          onPaste(editor, validFiles, html);
        }

        return true;
      },
    },
  });
};

export const FileHandler = Extension.create<
  Omit<FileHandlePluginOptions, "key" | "editor">
>({
  name: "fileHandler",

  addOptions() {
    return {
      allowBase64: false,
      allowedMimeTypes: [],
      maxFileSize: 0,
    };
  },

  addProseMirrorPlugins() {
    return [
      FileHandlePlugin({
        key: new PluginKey(this.name),
        editor: this.editor,
        ...this.options,
      }),
    ];
  },
});
