/**
 * Yjs relative position helpers for comment anchors.
 *
 * Converts ProseMirror absolute positions ↔ Yjs relative positions
 * so comment highlights survive collaborative edits.
 *
 * Uses @tiptap/y-tiptap (same package as the Collaboration extension)
 * to ensure plugin key compatibility.
 */

import * as Y from "yjs";
import {
  absolutePositionToRelativePosition,
  relativePositionToAbsolutePosition,
  ySyncPluginKey,
} from "@tiptap/y-tiptap";
import type { Editor } from "@tiptap/react";

/**
 * Get the Yjs binding from the editor's sync plugin state.
 * Returns null if the editor isn't collaborative.
 */
function getYjsBinding(editor: Editor) {
  try {
    const state = ySyncPluginKey.getState(editor.view.state);
    if (!state?.binding) return null;
    return {
      type: state.type as Y.XmlFragment,
      mapping: state.binding.mapping as never,
      doc: state.doc as Y.Doc,
    };
  } catch {
    return null;
  }
}

/**
 * Convert absolute ProseMirror positions to Yjs relative positions.
 * Returns serialized JSON strings for database storage.
 */
export function createRelativePositions(
  editor: Editor,
  from: number,
  to: number,
): { yjsFrom: string; yjsTo: string } | null {
  const binding = getYjsBinding(editor);
  if (!binding) return null;

  const relFrom = absolutePositionToRelativePosition(
    from,
    binding.type,
    binding.mapping,
  );
  const relTo = absolutePositionToRelativePosition(
    to,
    binding.type,
    binding.mapping,
  );

  return {
    yjsFrom: JSON.stringify(Y.relativePositionToJSON(relFrom)),
    yjsTo: JSON.stringify(Y.relativePositionToJSON(relTo)),
  };
}

/**
 * Resolve Yjs relative positions back to absolute ProseMirror positions.
 * Returns null if the content was deleted (thread should be marked detached).
 */
export function resolveRelativePositions(
  editor: Editor,
  yjsFrom: string,
  yjsTo: string,
): { from: number; to: number } | null {
  const binding = getYjsBinding(editor);
  if (!binding) return null;

  try {
    const relFrom = Y.createRelativePositionFromJSON(JSON.parse(yjsFrom));
    const relTo = Y.createRelativePositionFromJSON(JSON.parse(yjsTo));

    const absFrom = relativePositionToAbsolutePosition(
      binding.doc,
      binding.type,
      relFrom,
      binding.mapping,
    );
    const absTo = relativePositionToAbsolutePosition(
      binding.doc,
      binding.type,
      relTo,
      binding.mapping,
    );

    if (absFrom === null || absTo === null) return null;

    return { from: absFrom, to: absTo };
  } catch {
    return null;
  }
}
