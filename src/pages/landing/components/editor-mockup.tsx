import {
  IconPlus,
  IconHome,
  IconFiles,
  IconChartBar,
  IconSettings,
  IconLayoutSidebar,
  IconDots,
  IconChevronRight,
  IconMessage,
  IconSearch,
  IconList,
  IconLayoutGrid,
} from "@tabler/icons-react";

/* ============================================================
   Shared shell — mirrors WorkspaceLayout03 + CanvasToolbar
   ============================================================ */

function BrowserChrome({ url }: { url: string }) {
  return (
    <div className="flex items-center gap-1.5 border-b border-border bg-muted/40 px-4 py-2.5">
      <div className="h-2.5 w-2.5 rounded-full bg-border" />
      <div className="h-2.5 w-2.5 rounded-full bg-border" />
      <div className="h-2.5 w-2.5 rounded-full bg-border" />
      <div className="ml-3 flex-1">
        <div className="mx-auto max-w-xs rounded-md bg-background px-3 py-1">
          <span className="text-[10px] text-muted-foreground">{url}</span>
        </div>
      </div>
    </div>
  );
}

function Avatar({
  src,
  initials,
  ring,
  size = 20,
}: {
  src?: string;
  initials: string;
  ring?: string;
  size?: number;
}) {
  return (
    <div
      style={{ width: size, height: size }}
      className={`flex items-center justify-center overflow-hidden rounded-full bg-muted text-[9px] font-medium text-foreground ${ring ? `ring-2 ${ring}` : ""}`}
    >
      {src ? <img src={src} alt="" className="h-full w-full object-cover" /> : initials}
    </div>
  );
}

const AVATARS = {
  alex: "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=200",
  maya: "https://images.pexels.com/photos/1462630/pexels-photo-1462630.jpeg?auto=compress&cs=tinysrgb&w=200",
  sam: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=200",
};

function AppSidebar({ active = "documents" }: { active?: "overview" | "documents" | "analytics" | "settings" }) {
  const items: Array<{ key: string; label: string; icon: typeof IconHome }> = [
    { key: "overview", label: "Overview", icon: IconHome },
    { key: "documents", label: "Documents", icon: IconFiles },
    { key: "analytics", label: "Analytics", icon: IconChartBar },
    { key: "settings", label: "Settings", icon: IconSettings },
  ];
  return (
    <aside className="hidden w-40 shrink-0 flex-col bg-muted p-2 sm:flex">
      <div className="mb-2 px-2 pt-1 font-heading text-[13px] font-semibold tracking-tight text-foreground">
        Team Docs
      </div>

      <div className="flex flex-col gap-0.5">
        <button className="flex h-6 items-center gap-1.5 rounded-full px-2 text-[11px] text-muted-foreground">
          <IconPlus className="size-3" />
          New document
        </button>
        <div className="my-1.5 h-px bg-border" />
        {items.map((item) => {
          const isActive = item.key === active;
          const Icon = item.icon;
          return (
            <div
              key={item.key}
              className={`flex h-6 items-center gap-1.5 rounded-full px-2 text-[11px] ${
                isActive
                  ? "bg-background font-medium text-foreground shadow-sm"
                  : "text-muted-foreground"
              }`}
            >
              <Icon className="size-3" />
              {item.label}
            </div>
          );
        })}
      </div>

      <div className="mt-auto">
        <div className="my-1.5 h-px bg-border" />
        <div className="flex items-center gap-1.5 px-2 py-1">
          <Avatar src={AVATARS.alex} initials="AK" size={16} />
          <span className="text-[11px] text-foreground">Alex Kim</span>
        </div>
      </div>
    </aside>
  );
}

function EditorTopBar({
  title,
  showAvatars,
  showChat,
  saved = "Saved ✓",
  words = 30,
}: {
  title: string;
  showAvatars?: boolean;
  showChat?: boolean;
  saved?: string;
  words?: number;
}) {
  return (
    <div className="flex h-8 items-center justify-between px-3" style={{ backgroundColor: "#f7f7f7" }}>
      <div className="flex items-center gap-1 text-[10px]">
        <IconLayoutSidebar className="size-3 text-muted-foreground" />
        <span className="ml-1 text-muted-foreground">Documents</span>
        <IconChevronRight className="size-2.5 text-muted-foreground" />
        <span className="font-medium text-foreground">{title}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-[9px] text-muted-foreground">{saved}</span>
        <span className="text-[9px] text-muted-foreground">{words} words</span>
        {showAvatars && (
          <div className="flex -space-x-1">
            <Avatar src={AVATARS.maya} initials="MB" size={16} ring="ring-background" />
            <Avatar src={AVATARS.sam} initials="SR" size={16} ring="ring-background" />
            <Avatar src={AVATARS.alex} initials="AK" size={16} ring="ring-background" />
          </div>
        )}
        {showChat && <IconMessage className="size-3 text-muted-foreground" />}
        <IconDots className="size-3 text-muted-foreground" />
      </div>
    </div>
  );
}

/* Paper surface — mirrors PaperSurface with cover, emoji, serif title, body */
function DocumentPaper({ withCover = true, compact = false }: { withCover?: boolean; compact?: boolean }) {
  return (
    <div
      className="mx-auto w-full max-w-[560px] overflow-hidden rounded-md bg-background"
      style={{
        boxShadow:
          "0 1px 2px hsl(var(--foreground) / 0.04), 0 4px 12px hsl(var(--foreground) / 0.06), 0 0 0 0.5px hsl(var(--foreground) / 0.08)",
      }}
    >
      {withCover && (
        <img
          src="https://images.pexels.com/photos/1078850/pexels-photo-1078850.jpeg?auto=compress&cs=tinysrgb&w=1200"
          alt=""
          className="h-20 w-full object-cover"
        />
      )}
      <div className={compact ? "px-8 pb-5 pt-4" : "px-10 pb-8 pt-6"}>
        <p className="text-xl leading-none">🗺</p>
        <h3 className="mt-2 font-heading text-[22px] font-semibold leading-tight tracking-tight text-foreground">
          2026 Product Roadmap
        </h3>
        <h4 className="mt-3 font-heading text-[15px] font-semibold text-foreground">Q1 Goals</h4>
        <p className="mt-2 text-[11px] leading-relaxed text-foreground/90">
          We&apos;re doubling down on speed and simplicity this quarter.
        </p>
        <p className="mt-2 text-[11px] leading-relaxed text-foreground/90">
          <span className="font-semibold">Ship</span> the new editor, deprecate legacy export pipeline.
        </p>
        {!compact && (
          <>
            <h4 className="mt-4 font-heading text-[15px] font-semibold text-foreground">Key initiatives</h4>
            <ul className="mt-2 ml-4 list-disc space-y-1 text-[11px] text-foreground/90">
              <li>Redesign onboarding</li>
              <li>Ship mobile-responsive layout</li>
            </ul>
            <blockquote className="mt-3 border-l-2 border-border pl-3 text-[11px] italic text-foreground/80">
              &ldquo;Fast, focused, and shipped.&rdquo;
            </blockquote>
          </>
        )}
      </div>
    </div>
  );
}

/* Inset card — mirrors the workspace inset card wrapper */
function InsetCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex-1 bg-muted p-1.5">
      <div className="h-full overflow-hidden rounded-lg border border-border bg-background">{children}</div>
    </div>
  );
}

/* ============================================================
   HERO — full app: sidebar + editor with cover
   ============================================================ */
export function HeroEditorMockup() {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-2xl">
      <BrowserChrome url="team-docs.app/documents/2026-product-roadmap" />
      <div className="flex bg-muted">
        <AppSidebar active="documents" />
        <div className="flex flex-1 flex-col">
          <EditorTopBar title="2026 Product Roadmap" showAvatars showChat words={30} />
          <div className="flex-1 overflow-hidden px-6 py-5" style={{ backgroundColor: "#f7f7f7" }}>
            <DocumentPaper />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   TAB 1 — Rich text editor: paper + floating bubble toolbar
   ============================================================ */
export function EditorTabMockup() {
  return (
    <div className="flex bg-muted">
      <AppSidebar active="documents" />
      <div className="flex flex-1 flex-col">
        <EditorTopBar title="2026 Product Roadmap" words={30} />
        <div className="relative flex-1 px-6 py-6" style={{ backgroundColor: "#f7f7f7" }}>
          <DocumentPaper withCover={false} />
          {/* Floating selection bubble */}
          <div className="pointer-events-none absolute left-1/2 top-[130px] -translate-x-1/2">
            <div className="flex items-center gap-0.5 rounded-md border border-border bg-background px-1.5 py-1 shadow-lg">
              <span className="rounded px-1.5 py-0.5 text-[11px] font-semibold text-foreground">B</span>
              <span className="rounded px-1.5 py-0.5 text-[11px] italic text-foreground">I</span>
              <span className="rounded px-1.5 py-0.5 text-[11px] text-foreground underline">U</span>
              <div className="mx-1 h-4 w-px bg-border" />
              <span className="rounded px-1.5 py-0.5 text-[11px] font-semibold text-foreground">H1</span>
              <span className="rounded px-1.5 py-0.5 text-[11px] font-semibold text-muted-foreground">H2</span>
              <div className="mx-1 h-4 w-px bg-border" />
              <span className="rounded px-1.5 py-0.5 text-[11px] text-muted-foreground">• List</span>
              <span className="rounded px-1.5 py-0.5 text-[11px] text-muted-foreground">❝</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   TAB 2 — Live presence: avatar stack + colored cursors on doc
   ============================================================ */
export function PresenceTabMockup() {
  return (
    <div className="flex bg-muted">
      <AppSidebar active="documents" />
      <div className="flex flex-1 flex-col">
        <EditorTopBar title="2026 Product Roadmap" showAvatars words={30} />
        <div className="relative flex-1 px-6 py-6" style={{ backgroundColor: "#f7f7f7" }}>
          <DocumentPaper />
          {/* Cursor labels floating over the paper */}
          <div className="pointer-events-none absolute left-[38%] top-[240px]">
            <div className="h-4 w-px bg-emerald-500" />
            <div className="mt-0.5 inline-block whitespace-nowrap rounded-sm bg-emerald-500 px-1 py-0.5 text-[9px] font-medium text-white">
              Maya Bloom
            </div>
          </div>
          <div className="pointer-events-none absolute left-[52%] top-[330px]">
            <div className="h-4 w-px bg-sky-500" />
            <div className="mt-0.5 inline-block whitespace-nowrap rounded-sm bg-sky-500 px-1 py-0.5 text-[9px] font-medium text-white">
              Sam Rivera
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   TAB 3 — Comments: doc + right side comment panel
   ============================================================ */
export function CommentsTabMockup() {
  return (
    <div className="flex bg-muted">
      <AppSidebar active="documents" />
      <div className="flex flex-1 flex-col">
        <EditorTopBar title="2026 Product Roadmap" showChat words={30} />
        <div className="flex flex-1" style={{ backgroundColor: "#f7f7f7" }}>
          <div className="flex-1 px-6 py-6">
            <DocumentPaper compact />
          </div>
          <aside className="w-[220px] shrink-0 border-l border-border bg-background p-3">
            <div className="flex items-center gap-1.5 pb-3">
              <IconMessage className="size-3 text-muted-foreground" />
              <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                Comments · 2
              </p>
            </div>
            <div className="space-y-3">
              <div className="rounded-md border border-border p-2.5">
                <div className="flex items-center gap-1.5">
                  <Avatar src={AVATARS.maya} initials="MB" size={16} />
                  <span className="text-[10px] font-medium text-foreground">Maya Bloom</span>
                  <span className="ml-auto text-[9px] text-muted-foreground">Mar 15</span>
                </div>
                <p className="mt-1.5 text-[10px] leading-snug text-foreground/90">
                  Nice work on the outline — really clear structure.
                </p>
              </div>
              <div className="rounded-md border border-border p-2.5">
                <div className="flex items-center gap-1.5">
                  <Avatar src={AVATARS.alex} initials="AK" size={16} />
                  <span className="text-[10px] font-medium text-foreground">Alex Kim</span>
                  <span className="ml-auto text-[9px] text-muted-foreground">Mar 15</span>
                </div>
                <p className="mt-1.5 text-[10px] leading-snug text-foreground/90">
                  Added the timeline section — let me know if that works.
                </p>
                <div className="mt-2 flex items-center gap-2 border-t border-border pt-2">
                  <div className="flex items-center gap-1 rounded-full border border-border px-1.5 py-0.5 text-[9px] text-foreground/80">
                    👍 <span>2</span>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   Extra: DocumentsList mockup — for use if landing wants it
   ============================================================ */
export function DocumentsListMockup() {
  const rows = [
    { title: "2026 Product Roadmap", meta: "Mar 15 · Alex Kim", avatar: AVATARS.alex },
    { title: "Engineering Hiring Plan", meta: "Mar 12 · Sam Rivera", avatar: AVATARS.sam },
    { title: "Q1 Goals", meta: "Mar 10 · Maya Bloom", avatar: AVATARS.maya },
    { title: "Security Compliance Guide", meta: "Mar 5 · Alex Kim", avatar: AVATARS.alex },
  ];
  return (
    <div className="flex bg-muted">
      <AppSidebar active="documents" />
      <InsetCard>
        <div className="flex h-8 items-center gap-2 border-b border-border px-3">
          <IconLayoutSidebar className="size-3 text-muted-foreground" />
          <span className="text-[10px] font-medium text-foreground">Documents</span>
        </div>
        <div className="px-6 py-5">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-heading text-lg font-semibold text-foreground">Documents</h3>
              <p className="text-[10px] text-muted-foreground">8 documents</p>
            </div>
            <button className="flex h-6 items-center gap-1 rounded-md bg-primary px-2 text-[10px] font-medium text-primary-foreground">
              <IconPlus className="size-3" /> New
            </button>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <div className="relative flex-1">
              <IconSearch className="absolute left-2 top-1/2 size-3 -translate-y-1/2 text-muted-foreground" />
              <div className="h-6 rounded-md border border-border bg-background pl-6 pr-2 pt-1 text-[10px] text-muted-foreground">
                Search documents…
              </div>
            </div>
            <div className="flex h-6 items-center rounded-md border border-border">
              <div className="flex h-full items-center bg-muted px-1.5">
                <IconList className="size-3" />
              </div>
              <div className="flex h-full items-center px-1.5">
                <IconLayoutGrid className="size-3 text-muted-foreground" />
              </div>
            </div>
          </div>
          <p className="mt-4 text-[9px] font-medium text-muted-foreground">March 2024</p>
          <div className="mt-2 space-y-2">
            {rows.map((r) => (
              <div key={r.title} className="flex items-center gap-2.5">
                <div className="h-8 w-8 shrink-0 rounded-sm border border-border bg-muted/60" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[11px] font-medium text-foreground">{r.title}</p>
                  <p className="truncate text-[10px] text-muted-foreground">Document · {r.meta}</p>
                </div>
                <Avatar src={r.avatar} initials="" size={16} />
              </div>
            ))}
          </div>
        </div>
      </InsetCard>
    </div>
  );
}
