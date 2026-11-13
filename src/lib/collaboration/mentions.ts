/**
 * Extract @mentions from Tiptap JSON and auto-grant commenter access.
 *
 * Reference: store-D_mhcuWf.js lines 1994-2025
 */

import { supabase } from "@/integrations/supabase/client";

interface TiptapNode {
  type: string;
  attrs?: Record<string, unknown>;
  content?: TiptapNode[];
}

/** Recursively extract mention user IDs from Tiptap JSON */
function extractMentionIds(node: TiptapNode): string[] {
  const ids: string[] = [];

  if (node.type === "mention" && node.attrs?.id) {
    ids.push(node.attrs.id as string);
  }

  if (node.content) {
    for (const child of node.content) {
      ids.push(...extractMentionIds(child));
    }
  }

  return ids;
}

/**
 * Grant commenter access to any @mentioned users who don't have document access.
 * Uses upsert with ignoreDuplicates so existing permissions aren't downgraded.
 */
export async function grantCommenterAccessToMentions(
  documentId: string,
  workspaceId: string,
  tiptapJson: Record<string, unknown>,
) {
  const mentionIds = [
    ...new Set(extractMentionIds(tiptapJson as unknown as TiptapNode)),
  ];
  if (mentionIds.length === 0) return;

  // Check which users are already workspace members
  const { data: existing } = await supabase
    .from("workspace_members")
    .select("user_id")
    .eq("workspace_id", workspaceId)
    .in("user_id", mentionIds);

  const existingIds = new Set(existing?.map((m) => m.user_id) ?? []);
  const newUserIds = mentionIds.filter((id) => !existingIds.has(id));

  if (newUserIds.length === 0) return;

  // Add as viewers to workspace (minimum access to see the doc)
  await supabase.from("workspace_members").upsert(
    newUserIds.map((userId) => ({
      workspace_id: workspaceId,
      user_id: userId,
      role: "viewer",
    })),
    { onConflict: "workspace_id,user_id", ignoreDuplicates: true },
  );
}
