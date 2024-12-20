/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { LexicalEditor } from "lexical";

import { $createCodeNode, $isCodeNode } from "@lexical/code";
import {
  editorStateFromSerializedDocument,
  exportFile,
  importFile,
  SerializedDocument,
  serializedDocumentFromEditorState,
} from "@lexical/file";
import { $generateHtmlFromNodes } from "@lexical/html";
import {
  $convertFromMarkdownString,
  $convertToMarkdownString,
  TRANSFORMERS,
} from "@lexical/markdown";
import { useCollaborationContext } from "@lexical/react/LexicalCollaborationContext";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { mergeRegister } from "@lexical/utils";
import { CONNECTED_COMMAND, TOGGLE_CONNECT_COMMAND } from "@lexical/yjs";
import {
  $createTextNode,
  $getRoot,
  $isParagraphNode,
  CLEAR_EDITOR_COMMAND,
  CLEAR_HISTORY_COMMAND,
  COMMAND_PRIORITY_EDITOR,
} from "lexical";
import React, { useCallback, useEffect, useRef, useState } from "react";

import useModal from "../hooks/useModal";
import Button from "../ui/Button";
import { docFromHash, docToHash } from "../utils/docSerialization";
import useActionHandler from "@/app/[locale]/(app)/write/_context/action-handler/useActionHandler";

import { flushSync } from "react-dom";
import { getDraftData } from "@/services/draft.services";
import { usePathname } from "@/i18n/routing";

// async function sendEditorState(editor: LexicalEditor): Promise<void> {
//   const stringifiedEditorState = JSON.stringify(editor.getEditorState());
//   try {
//     await fetch("http://localhost:1235/setEditorState", {
//       body: stringifiedEditorState,
//       headers: {
//         Accept: "application/json",
//         "Content-type": "application/json",
//       },
//       method: "POST",
//     });
//   } catch {
//     // NO-OP
//   }
// }

// async function validateEditorState(editor: LexicalEditor): Promise<void> {
//   const stringifiedEditorState = JSON.stringify(editor.getEditorState());
//   let response;
//   try {
//     response = await fetch("http://localhost:1235/validateEditorState", {
//       body: stringifiedEditorState,
//       headers: {
//         Accept: "application/json",
//         "Content-type": "application/json",
//       },
//       method: "POST",
//     });
//   } catch {
//     // NO-OP
//   }
//   if (response && response.status === 403) {
//     throw new Error(
//       "Editor state validation failed! Server did not accept changes."
//     );
//   }
// }

async function shareDoc(doc: SerializedDocument): Promise<void> {
  const url = new URL(window.location.toString());
  url.hash = await docToHash(doc);
  const newUrl = url.toString();
  window.history.replaceState({}, "", newUrl);
  await window.navigator.clipboard.writeText(newUrl);
}

export default function ActionsPlugin({}: // isRichText,
// shouldPreserveNewLinesInMarkdown,
{
  // isRichText: boolean;
  // shouldPreserveNewLinesInMarkdown: boolean;
}): JSX.Element {
  const [editor] = useLexicalComposerContext();
  const [isEditable, setIsEditable] = useState(() => editor.isEditable());
  const [isSpeechToText, setIsSpeechToText] = useState(false);
  const [connected, setConnected] = useState(false);
  const [isEditorEmpty, setIsEditorEmpty] = useState(true);
  const [modal, showModal] = useModal();
  // const showFlashMessage = useFlashMessage();
  const { isCollabActive } = useCollaborationContext();

  const draftRef = useRef<HTMLButtonElement | null>(null);
  const publishRef = useRef<HTMLButtonElement | null>(null);
  const { setDraftRef, setPublishRef, setDraftPayload, setPublishPayload } =
    useActionHandler();

  useEffect(() => {
    setDraftRef(draftRef.current);
    setPublishRef(publishRef.current);
  }, []);

  // ALL YOU NEED TO GET STATE FROM HASH
  const id = usePathname().split("/").pop();
  useEffect(() => {
    if (!id || id === "write") return;
    const fillEditor = async () => {
      const doc = (await getDraftData(id)).content_hash;
      docFromHash(doc).then((doc) => {
        if (
          doc
          //  && doc.source === "Playground"
        ) {
          editor.setEditorState(editorStateFromSerializedDocument(editor, doc));
          editor.dispatchCommand(CLEAR_HISTORY_COMMAND, undefined);
        }
      });
    };
    fillEditor();
    // docFromHash(window.location.hash).then((doc) => {
    //   if (
    //     doc
    //     //  && doc.source === "Playground"
    //   ) {
    //     editor.setEditorState(editorStateFromSerializedDocument(editor, doc));
    //     editor.dispatchCommand(CLEAR_HISTORY_COMMAND, undefined);
    //   }
    // });
  }, [editor]);

  useEffect(() => {
    return editor.registerUpdateListener(
      ({ dirtyElements, prevEditorState, tags }) => {
        // If we are in read only mode, send the editor state
        // to server and ask for validation if possible.
        // if (
        //   !isEditable &&
        //   dirtyElements.size > 0 &&
        //   !tags.has("historic") &&
        //   !tags.has("collaboration")
        // ) {
        //   validateEditorState(editor);
        // }
        editor.getEditorState().read(() => {
          const root = $getRoot();
          const children = root.getChildren();

          if (children.length > 1) {
            setIsEditorEmpty(false);
          } else {
            if ($isParagraphNode(children[0])) {
              const paragraphChildren = children[0].getChildren();
              setIsEditorEmpty(paragraphChildren.length === 0);
            } else {
              setIsEditorEmpty(false);
            }
          }
        });
      },
    );
  }, [editor, isEditable]);

  // console.log(editor.getEditorState().toJSON());
  // console.log(serializedDocumentFromEditorState(editor.getEditorState()));
  // editor.update(() => {
  //   console.log($convertToMarkdownString(TRANSFORMERS));
  // });

  return (
    <div className="actions hidden">
      <button
        className="action-button import"
        onClick={() => importFile(editor)}
        title="Import"
        aria-label="Import editor state from JSON"
      >
        <i className="import" />
        Import Lexical Data
      </button>

      <button
        className="action-button import"
        onClick={() =>
          editor.update(() => {
            const html = $generateHtmlFromNodes(editor, null);
            setPublishPayload(html);
          })
        }
        title="Import"
        aria-label="Import editor state from JSON"
        ref={publishRef}
      >
        <i className="import" />
        Publish
      </button>

      <button
        className="action-button import"
        onClick={async () => {
          // editor.update(() => {
          //   console.log($generateHtmlFromNodes(editor, null));
          // })
          const doc = serializedDocumentFromEditorState(
            editor.getEditorState(),
          );
          const hash = await docToHash(doc);

          setDraftPayload(hash);
        }}
        title="Import"
        aria-label="Import editor state from JSON"
        ref={draftRef}
      >
        <i className="import" />
        Save to drafts
      </button>

      <button
        className="action-button export"
        onClick={() =>
          exportFile(editor, {
            fileName: `Playground ${new Date().toISOString()}`,
            source: "Playground",
          })
        }
        title="Export"
        aria-label="Export editor state to JSON"
      >
        <i className="export" />
        Export to JSON
      </button>
      {/* <button
        className="action-button share"
        disabled={isCollabActive || INITIAL_SETTINGS.isCollab}
        onClick={() =>
          shareDoc(
            serializedDocumentFromEditorState(editor.getEditorState(), {
              source: "Playground",
            })
          ).then(
            () => showFlashMessage("URL copied to clipboard"),
            () => showFlashMessage("URL could not be copied to clipboard")
          )
        }
        title="Share"
        aria-label="Share Playground link to current editor state"
      >
        <i className="share" />
      </button> */}
      <button
        className="action-button clear"
        disabled={isEditorEmpty}
        onClick={() => {
          showModal("Clear editor", (onClose) => (
            <ShowClearDialog editor={editor} onClose={onClose} />
          ));
        }}
        title="Clear"
        aria-label="Clear editor contents"
      >
        <i className="clear" />
        Clear Editor
      </button>
      <button
        className={`action-button ${!isEditable ? "unlock" : "lock"}`}
        onClick={() => {
          // Send latest editor state to commenting validation server
          // if (isEditable) {
          //   sendEditorState(editor);
          // }
          editor.setEditable(!editor.isEditable());
        }}
        title="Read-Only Mode"
        aria-label={`${!isEditable ? "Unlock" : "Lock"} read-only mode`}
      >
        <i className={!isEditable ? "unlock" : "lock"} />
        Set to Read-Only
      </button>
      {modal}
    </div>
  );
}

function ShowClearDialog({
  editor,
  onClose,
}: {
  editor: LexicalEditor;
  onClose: () => void;
}): JSX.Element {
  return (
    <>
      Are you sure you want to clear the editor?
      <div className="Modal__content">
        <Button
          onClick={() => {
            editor.dispatchCommand(CLEAR_EDITOR_COMMAND, undefined);
            editor.focus();
            onClose();
          }}
        >
          Clear
        </Button>{" "}
        <Button
          onClick={() => {
            editor.focus();
            onClose();
          }}
        >
          Cancel
        </Button>
      </div>
    </>
  );
}
