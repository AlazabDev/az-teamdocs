import { useState, useCallback, useEffect, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import * as Y from "yjs";
import { useDataProvider } from "@/lib/data-provider";
import { useAuth } from "@/lib/auth/auth-provider";
import { SupabaseYjsProvider } from "@/lib/collaboration/y-supabase-provider";
import { CanvasToolbar } from "./components/canvas-toolbar";
import { PaperSurface } from "./components/paper-surface";
import { DeleteDocumentDialog } from "./components/delete-document-dialog";
import { CommentingProvider } from "./components/commenting-provider";
import { CommentSidebar } from "./components/comment-sidebar";
import { ShareDialog } from "./components/share-dialog";
import type { DocumentFields } from "@/data/seed";

// Deterministic cursor colors based on user ID
const CURSOR_COLORS = [
  "#f87171", "#fb923c", "#facc15", "#4ade80",
  "#22d3ee", "#818cf8", "#c084fc", "#f472b6",
];

function getCursorColor(userId: string): string {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = ((hash << 5) - hash + userId.charCodeAt(i)) | 0;
  }
  return CURSOR_COLORS[Math.abs(hash) % CURSOR_COLORS.length];
}

export default function EditorPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const isDemo = pathname.startsWith("/demo");
  const prefix = isDemo ? "/demo" : "";

  const data = useDataProvider();
  const { data: doc, isLoading } = data.useDocument(id ?? "");
  const { mutate: updateDocument } = data.useUpdateDocument();
  const { mutate: deleteDocument } = data.useDeleteDocument();
  const { user } = useAuth();

  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">(
    "saved",
  );
  const [wordCount, setWordCount] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  // Yjs provider — only for authenticated routes
  const yjsProviderRef = useRef<SupabaseYjsProvider | null>(null);
  const [yjsProvider, setYjsProvider] = useState<SupabaseYjsProvider>();

  useEffect(() => {
    if (isDemo || !id) return;

    const yDoc = new Y.Doc();
    const provider = new SupabaseYjsProvider(id, yDoc);
    yjsProviderRef.current = provider;
    setYjsProvider(provider);

    return () => {
      provider.destroy();
      yDoc.destroy();
      yjsProviderRef.current = null;
      setYjsProvider(undefined);
    };
  }, [id, isDemo]);

  const currentUser = user
    ? {
        name: user.user_metadata?.full_name ?? user.email ?? "Anonymous",
        color: getCursorColor(user.id),
        avatarUrl: user.user_metadata?.avatar_url ?? null,
      }
    : undefined;

  const handleToggleChat = useCallback(() => setChatOpen((v) => !v), []);

  const handleUpdate = useCallback(
    (fields: DocumentFields) => {
      if (id) {
        updateDocument(id, fields);
      }
    },
    [id, updateDocument],
  );

  const handleDelete = () => {
    if (id) {
      deleteDocument(id);
      navigate(`${prefix}/documents`);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
      </div>
    );
  }

  if (!doc) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">Document not found.</p>
      </div>
    );
  }

  const editorContent = (
    <>
      <CanvasToolbar
        title={doc.title}
        saveStatus={saveStatus}
        wordCount={wordCount}
        awareness={yjsProvider?.awareness}
        onDelete={() => setDeleteDialogOpen(true)}
        onToggleChat={!isDemo ? handleToggleChat : undefined}
        chatOpen={chatOpen}
        onShare={!isDemo && id ? () => setShareOpen(true) : undefined}
      />

      <div
        className="flex flex-1 overflow-hidden"
        style={{ background: "linear-gradient(90deg, #FFF 0%, #F7F7F7 10%)" }}
      >
        {/* Editor area — shrinks when sidebar opens */}
        <div
          className="flex flex-1 overflow-auto transition-all duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)]"
          style={{
            scrollbarGutter: "stable",
            scrollbarWidth: "thin",
          }}
        >
          <div className="@container flex flex-1 justify-center px-6 pb-8 pt-16">
            <PaperSurface
              title={doc.title}
              content={doc.content}
              coverImageUrl={doc.cover_image_url}
              iconEmoji={doc.icon_emoji}
              onUpdate={handleUpdate}
              onWordCountChange={setWordCount}
              onSaveStatusChange={setSaveStatus}
              yjsProvider={yjsProvider}
              currentUser={currentUser}
            />
          </div>
        </div>

        {/* Chat sidebar — 0 width when closed, 350px when open */}
        {!isDemo && id && (
          <div
            className="shrink-0 overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)]"
            style={{ width: chatOpen ? 350 : 0 }}
          >
            {chatOpen && (
              <CommentSidebar
                onClose={handleToggleChat}
              />
            )}
          </div>
        )}
      </div>
    </>
  );

  return (
    <div className="flex h-full flex-col">
      {!isDemo && id ? (
        <CommentingProvider editor={null} documentId={id}>
          {editorContent}
        </CommentingProvider>
      ) : (
        editorContent
      )}

      <DeleteDocumentDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title={doc.title}
        onConfirm={handleDelete}
      />

      {!isDemo && id && (
        <ShareDialog
          open={shareOpen}
          onOpenChange={setShareOpen}
          documentId={id}
          title={doc.title}
        />
      )}
    </div>
  );
}
