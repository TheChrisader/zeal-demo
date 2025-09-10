import { Node } from "@tiptap/pm/model";
import { NodeSelection, Plugin, PluginKey } from "@tiptap/pm/state";

export const deleteFigurePluginKey = new PluginKey("deleteFigure");

export const deleteFigurePlugin = () => {
  return new Plugin({
    key: deleteFigurePluginKey,
    props: {
      // This hook gives us full control over key presses.
      handleKeyDown: (view, event) => {
        // We only care about Backspace and Delete keys
        if (event.key !== "Backspace" && event.key !== "Delete") {
          return false; // Let ProseMirror handle other keys
        }

        const { state, dispatch } = view;
        const { selection } = state;

        // Check if the current selection is a NodeSelection
        if (
          !(selection instanceof NodeSelection) ||
          selection.node.type.name !== "image"
        ) {
          return false; // The user hasn't selected an image node
        }

        // The selection's anchor gives us the position of the selected node
        const $pos = state.doc.resolve(selection.from);

        // The parent is at depth - 1
        const parent = $pos.node(-1);

        if (parent && parent.type.name === "figure") {
          // We've confirmed the user is deleting an image inside a figure.
          // Let's take control.

          // Calculate the start position of the parent figure
          const figurePos = $pos.before(-1);

          // Create a transaction to delete the entire figure
          const tr = state.tr.delete(figurePos, figurePos + parent.nodeSize);

          // Dispatch the transaction
          dispatch(tr);

          // Return true to tell ProseMirror we have handled this key press
          // and it should NOT perform its default action.
          return true;
        }

        // If it's an image not in a figure, let ProseMirror handle it normally
        return false;
      },
    },
  });
};
