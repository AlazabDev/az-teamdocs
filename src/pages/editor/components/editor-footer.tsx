interface EditorFooterProps {
  saveStatus: "idle" | "saving" | "saved";
  wordCount: number;
  onDelete: () => void;
}

export function EditorFooter({
  saveStatus,
  wordCount,
  onDelete,
}: EditorFooterProps) {
  const statusText =
    saveStatus === "saving"
      ? "Saving…"
      : saveStatus === "saved"
        ? "Saved ✓"
        : "";

  const formattedWords = wordCount.toLocaleString();

  return (
    <div className="flex h-10 items-center justify-between border-t border-border px-6 text-xs text-muted-foreground">
      <span>{statusText}</span>
      <span>{formattedWords} words</span>
      <button
        onClick={onDelete}
        className="text-destructive hover:underline"
      >
        Delete document
      </button>
    </div>
  );
}
