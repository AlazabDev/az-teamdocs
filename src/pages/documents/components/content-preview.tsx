import { IconFileText } from "@tabler/icons-react";

interface ContentPreviewProps {
  content: Record<string, unknown>;
  text?: string;
}

/** Recursively extract plain text from a TipTap JSON doc. */
function extractText(node: unknown): string {
  if (!node || typeof node !== "object") return "";
  const n = node as Record<string, unknown>;
  if (n.type === "text" && typeof n.text === "string") return n.text;
  const children = n.content as unknown[] | undefined;
  if (!Array.isArray(children)) return "";
  return children.map(extractText).join(" ");
}

export function ContentPreview({ content, text }: ContentPreviewProps) {
  const snippet = (text && text.trim()) || extractText(content).trim();

  if (!snippet) {
    return (
      <div className="flex size-full items-center justify-center bg-muted">
        <IconFileText className="size-6 text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="size-full overflow-hidden">
      <p className="text-[13px] leading-snug text-foreground/80 line-clamp-[14]">
        {snippet}
      </p>
    </div>
  );
}
