// ── Interfaces ──────────────────────────────────────────────────

export interface Profile {
  id: string;
  full_name: string;
  avatar_url: string | null;
  created_at?: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: "admin" | "editor" | "viewer";
  created_at: string;
}

export interface Document {
  id: string;
  author_id: string;
  title: string;
  icon_emoji: string | null;
  cover_image_url: string | null;
  content: Record<string, unknown>;
  content_text: string;
  word_count: number;
  created_at: string;
  updated_at: string;
}

export interface Comment {
  id: string;
  document_id: string;
  user_id: string;
  content: string;
  created_at: string;
}

export interface Invitation {
  id: string;
  email: string;
  role: "editor" | "viewer";
  invited_by: string;
  status: "pending" | "accepted" | "revoked";
  created_at: string;
}

export interface TeamMember {
  user_id: string;
  full_name: string;
  role: "admin" | "editor" | "viewer";
  initials: string;
  avatar_url: string | null;
}

export interface OverviewStats {
  totalDocs: number;
}

export interface RecentDoc {
  id: string;
  icon_emoji: string | null;
  title: string;
  updated_at: string;
  author: { initials: string; full_name: string; avatar_url: string | null };
}

export interface DocumentRow {
  id: string;
  icon_emoji: string | null;
  title: string;
  content: Record<string, unknown>;
  content_text: string;
  word_count: number;
  updated_at: string;
  created_at: string;
  author: { initials: string; full_name: string; avatar_url: string | null };
}

export interface DocsLinePoint {
  date: string;
  count: number;
}

export interface WordsAreaPoint {
  date: string;
  cumulative_words: number;
}

export interface PieSlice {
  bucket: string;
  count: number;
}

export interface DocumentFilters {
  search?: string;
  sort?: "date" | "title" | "words" | "author";
}

export interface DateRangeFilters {
  startDate: string;
  endDate: string;
}

export interface DocumentFields {
  title?: string;
  content?: Record<string, unknown>;
  contentText?: string;
  coverImageUrl?: string | null;
  iconEmoji?: string | null;
  wordCount?: number;
}

export interface ProfileFields {
  fullName: string;
  newPassword?: string;
}

export interface InvitationFields {
  email: string;
  role: "editor" | "viewer";
}

// ── Seed arrays ─────────────────────────────────────────────────

export const profiles: Profile[] = [
  { id: "user-1", full_name: "Alex Kim", avatar_url: "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=400" },
  { id: "user-2", full_name: "Sam Rivera", avatar_url: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=400" },
  { id: "user-3", full_name: "Maya Bloom", avatar_url: "https://images.pexels.com/photos/1462630/pexels-photo-1462630.jpeg?auto=compress&cs=tinysrgb&w=400" },
  { id: "user-4", full_name: "Dan Liu", avatar_url: "https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=400" },
];

export const userRoles: UserRole[] = [
  { id: "role-1", user_id: "user-1", role: "admin", created_at: "2024-01-01T00:00:00Z" },
  { id: "role-2", user_id: "user-2", role: "editor", created_at: "2024-01-02T00:00:00Z" },
  { id: "role-3", user_id: "user-3", role: "editor", created_at: "2024-01-03T00:00:00Z" },
  { id: "role-4", user_id: "user-4", role: "viewer", created_at: "2024-01-04T00:00:00Z" },
];

export const documents: Document[] = [
  {
    id: "doc-1",
    author_id: "user-1",
    title: "2026 Product Roadmap",
    icon_emoji: "\u{1F5FA}",
    cover_image_url: "https://images.pexels.com/photos/1078850/pexels-photo-1078850.jpeg?auto=compress&cs=tinysrgb&w=1200",
    content: {
      type: "doc",
      content: [
        { type: "heading", attrs: { level: 1 }, content: [{ type: "text", text: "Q1 Goals" }] },
        { type: "paragraph", content: [{ type: "text", text: "We’re doubling down on speed and simplicity this quarter." }] },
        { type: "paragraph", content: [{ type: "text", marks: [{ type: "bold" }], text: "Ship" }, { type: "text", text: " the new editor, deprecate legacy export pipeline." }] },
        { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "Key initiatives" }] },
        { type: "bulletList", content: [
          { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "Redesign onboarding" }] }] },
          { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "Ship mobile-responsive layout" }] }] },
        ] },
        { type: "blockquote", content: [{ type: "paragraph", content: [{ type: "text", text: "\"Fast, focused, and shipped.\"" }] }] },
      ],
    },
    content_text: "Q1 Goals We’re doubling down on speed and simplicity this quarter. Ship the new editor, deprecate legacy export pipeline. Key initiatives Redesign onboarding Ship mobile-responsive layout \"Fast, focused, and shipped.\"",
    word_count: 1240,
    created_at: "2024-03-15T10:22:00Z",
    updated_at: "2024-03-15T10:22:00Z",
  },
  {
    id: "doc-2",
    author_id: "user-2",
    title: "Engineering Hiring Plan",
    icon_emoji: "\u{1F52C}",
    cover_image_url: "https://images.pexels.com/photos/2422294/pexels-photo-2422294.jpeg?auto=compress&cs=tinysrgb&w=1200",
    content: {
      type: "doc",
      content: [
        { type: "heading", attrs: { level: 1 }, content: [{ type: "text", text: "Engineering Hiring Plan" }] },
        { type: "paragraph", content: [{ type: "text", text: "Target: 6 new engineers by Q3. Focus on backend and infrastructure." }] },
        { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "Open roles" }] },
        { type: "bulletList", content: [
          { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "Senior backend engineer (2)" }] }] },
          { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "Platform / infra engineer (2)" }] }] },
          { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "Developer experience engineer (2)" }] }] },
        ] },
      ],
    },
    content_text: "Engineering Hiring Plan Target: 6 new engineers by Q3. Focus on backend and infrastructure. Open roles Senior backend engineer Platform infra engineer Developer experience engineer",
    word_count: 980,
    created_at: "2024-03-12T14:05:00Z",
    updated_at: "2024-03-12T14:05:00Z",
  },
  {
    id: "doc-3",
    author_id: "user-3",
    title: "Q1 Goals",
    icon_emoji: "\u{1F4CB}",
    cover_image_url: null,
    content: {
      type: "doc",
      content: [
        { type: "heading", attrs: { level: 1 }, content: [{ type: "text", text: "Q1 Goals" }] },
        { type: "paragraph", content: [{ type: "text", text: "Three priorities: performance, reliability, and team growth." }] },
        { type: "orderedList", content: [
          { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "Reduce p95 latency by 40%" }] }] },
          { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "Achieve 99.9% uptime SLA" }] }] },
          { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "Hire 3 engineers" }] }] },
        ] },
      ],
    },
    content_text: "Q1 Goals Three priorities: performance, reliability, and team growth. Reduce p95 latency by 40% Achieve 99.9% uptime SLA Hire 3 engineers",
    word_count: 760,
    created_at: "2024-03-10T09:30:00Z",
    updated_at: "2024-03-10T09:30:00Z",
  },
  {
    id: "doc-4",
    author_id: "user-1",
    title: "Security Compliance Guide",
    icon_emoji: "\u{1F6E1}",
    cover_image_url: null,
    content: {
      type: "doc",
      content: [
        { type: "heading", attrs: { level: 1 }, content: [{ type: "text", text: "Security Compliance Guide" }] },
        { type: "paragraph", content: [{ type: "text", text: "SOC 2 Type II audit preparation checklist and timeline." }] },
        { type: "codeBlock", content: [{ type: "text", text: "# Run security scanner\nnpm audit --audit-level=high" }] },
      ],
    },
    content_text: "Security Compliance Guide SOC 2 Type II audit preparation checklist and timeline. npm audit --audit-level=high",
    word_count: 540,
    created_at: "2024-03-05T11:00:00Z",
    updated_at: "2024-03-05T11:00:00Z",
  },
  {
    id: "doc-5",
    author_id: "user-2",
    title: "Launch Announcement",
    icon_emoji: "\u{1F4E3}",
    cover_image_url: "https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg?auto=compress&cs=tinysrgb&w=1200",
    content: {
      type: "doc",
      content: [
        { type: "heading", attrs: { level: 1 }, content: [{ type: "text", text: "Launch Announcement" }] },
        { type: "paragraph", content: [{ type: "text", text: "We’re shipping to the public on March 1st. Here’s the plan." }] },
        { type: "paragraph", content: [{ type: "text", text: "Press release goes out at 9am PT. Social at 10am. Blog post live at noon." }] },
      ],
    },
    content_text: "Launch Announcement We’re shipping to the public on March 1st. Here’s the plan. Press release goes out at 9am PT. Social at 10am. Blog post live at noon.",
    word_count: 430,
    created_at: "2024-02-28T16:30:00Z",
    updated_at: "2024-02-28T16:30:00Z",
  },
  {
    id: "doc-6",
    author_id: "user-3",
    title: "Ideas Backlog",
    icon_emoji: "\u{1F4A1}",
    cover_image_url: null,
    content: {
      type: "doc",
      content: [
        { type: "heading", attrs: { level: 1 }, content: [{ type: "text", text: "Ideas Backlog" }] },
        { type: "paragraph", content: [{ type: "text", text: "Unfiltered ideas for future sprints. Not prioritized." }] },
        { type: "bulletList", content: [
          { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "Dark mode for guest viewers" }] }] },
          { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "Export to PDF / Markdown" }] }] },
          { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "Inline image embeds" }] }] },
        ] },
      ],
    },
    content_text: "Ideas Backlog Unfiltered ideas for future sprints. Not prioritized. Dark mode for guest viewers Export to PDF Markdown Inline image embeds",
    word_count: 310,
    created_at: "2024-02-20T08:00:00Z",
    updated_at: "2024-02-20T08:00:00Z",
  },
  {
    id: "doc-7",
    author_id: "user-1",
    title: "Design Principles",
    icon_emoji: "\u{1F4D0}",
    cover_image_url: "https://images.pexels.com/photos/1779487/pexels-photo-1779487.jpeg?auto=compress&cs=tinysrgb&w=1200",
    content: {
      type: "doc",
      content: [
        { type: "heading", attrs: { level: 1 }, content: [{ type: "text", text: "Design Principles" }] },
        { type: "paragraph", content: [{ type: "text", text: "The five principles that guide every product decision." }] },
        { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "1. Clarity over cleverness" }] },
        { type: "paragraph", content: [{ type: "text", text: "If an interaction needs explaining, redesign it." }] },
        { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "2. Calm by default" }] },
        { type: "paragraph", content: [{ type: "text", text: "Remove noise before adding features." }] },
      ],
    },
    content_text: "Design Principles The five principles that guide every product decision. Clarity over cleverness If an interaction needs explaining redesign it. Calm by default Remove noise before adding features.",
    word_count: 620,
    created_at: "2024-02-14T13:45:00Z",
    updated_at: "2024-02-14T13:45:00Z",
  },
  {
    id: "doc-8",
    author_id: "user-2",
    title: "Meeting Notes — Feb Sprint",
    icon_emoji: "\u{1F5D2}",
    cover_image_url: null,
    content: {
      type: "doc",
      content: [
        { type: "heading", attrs: { level: 1 }, content: [{ type: "text", text: "Meeting Notes — Feb Sprint" }] },
        { type: "paragraph", content: [{ type: "text", text: "Attendees: Alex, Sam, Maya, Dan. 25 min." }] },
        { type: "paragraph", content: [{ type: "text", text: "Action items: Alex ships auth by Friday. Sam unblocks the API integration." }] },
      ],
    },
    content_text: "Meeting Notes Feb Sprint Attendees: Alex Sam Maya Dan. 25 min. Action items: Alex ships auth by Friday. Sam unblocks the API integration.",
    word_count: 190,
    created_at: "2024-02-03T10:00:00Z",
    updated_at: "2024-02-03T10:00:00Z",
  },
];

export const comments: Comment[] = [
  {
    id: "comment-1",
    document_id: "doc-1",
    user_id: "user-3",
    content: "Nice work on the outline, really clear structure.",
    created_at: "2024-03-15T11:05:00Z",
  },
  {
    id: "comment-2",
    document_id: "doc-1",
    user_id: "user-1",
    content: "Added the timeline section — let me know if that works.",
    created_at: "2024-03-15T14:30:00Z",
  },
  {
    id: "comment-3",
    document_id: "doc-2",
    user_id: "user-1",
    content: "Should we add a target salary band per role?",
    created_at: "2024-03-12T15:00:00Z",
  },
  {
    id: "comment-4",
    document_id: "doc-2",
    user_id: "user-3",
    content: "Good call, I’ll add the bands before EOD.",
    created_at: "2024-03-12T16:45:00Z",
  },
];

export const invitations: Invitation[] = [
  {
    id: "inv-1",
    email: "jamie@example.com",
    role: "editor",
    invited_by: "user-1",
    status: "pending",
    created_at: "2024-03-16T09:00:00Z",
  },
];

export const COVER_IMAGE_PRESETS = [
  "https://images.pexels.com/photos/1078850/pexels-photo-1078850.jpeg?auto=compress&cs=tinysrgb&w=1200",
  "https://images.pexels.com/photos/2422294/pexels-photo-2422294.jpeg?auto=compress&cs=tinysrgb&w=1200",
  "https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg?auto=compress&cs=tinysrgb&w=1200",
  "https://images.pexels.com/photos/1779487/pexels-photo-1779487.jpeg?auto=compress&cs=tinysrgb&w=1200",
  "https://images.pexels.com/photos/1287145/pexels-photo-1287145.jpeg?auto=compress&cs=tinysrgb&w=1200",
  "https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg?auto=compress&cs=tinysrgb&w=1200",
];

export const EMOJI_PRESETS = [
  "\u{1F4CB}", "\u{1F4C4}", "\u{1F4DD}", "\u{1F4C3}", "\u{1F4D1}", "\u{1F5D2}", "\u{1F5FA}", "\u{1F4D0}", "\u{1F4A1}", "\u{1F52C}",
  "\u{1F6E1}", "\u{1F4E3}", "\u{1F680}", "⚡", "\u{1F3AF}", "\u{1F52E}", "\u{1F9E9}", "\u{1F48E}", "\u{1F31F}", "\u{1F525}",
  "\u{1F30A}", "\u{1F331}", "\u{1F3D4}", "\u{1F3A8}", "\u{1F3AD}", "\u{1F3AC}", "\u{1F3A4}", "\u{1F3B5}", "\u{1F4CA}", "\u{1F4C8}",
  "\u{1F4C9}", "\u{1F5D3}", "⏰", "\u{1F511}", "\u{1F512}", "\u{1F9F2}", "\u{1F527}", "⚙️", "\u{1F3D7}", "\u{1F30D}",
  "\u{1F91D}", "\u{1F9E0}", "\u{1F441}", "✅", "❌", "⚠️", "\u{1F4AC}", "\u{1F4E6}", "\u{1F3E0}", "\u{1F381}",
];

// ── Derived convenience exports ─────────────────────────────────

import { getInitials } from "@/lib/utils";

export function profileById(id: string): Profile | undefined {
  return profiles.find((p) => p.id === id);
}

export function initialsFromName(name: string): string {
  return getInitials(name);
}

export const overviewStats: OverviewStats = {
  totalDocs: documents.length,
};

export const recentDocuments: RecentDoc[] = [...documents]
  .sort((a, b) => b.updated_at.localeCompare(a.updated_at))
  .slice(0, 3)
  .map((d) => {
    const profile = profileById(d.author_id);
    return {
      id: d.id,
      icon_emoji: d.icon_emoji,
      title: d.title,
      updated_at: d.updated_at,
      author: {
        initials: profile ? getInitials(profile.full_name) : "??",
        full_name: profile?.full_name ?? "Unknown",
        avatar_url: profile?.avatar_url ?? null,
      },
    };
  });

export const teamMembers: TeamMember[] = [
  { user_id: "user-1", full_name: "Alex Kim", role: "admin", initials: "AK", avatar_url: profiles[0].avatar_url },
  { user_id: "user-2", full_name: "Sam Rivera", role: "editor", initials: "SR", avatar_url: profiles[1].avatar_url },
  { user_id: "user-3", full_name: "Maya Bloom", role: "editor", initials: "MB", avatar_url: profiles[2].avatar_url },
  { user_id: "user-4", full_name: "Dan Liu", role: "viewer", initials: "DL", avatar_url: profiles[3].avatar_url },
];

export const docsLineChartData: DocsLinePoint[] = [
  { date: "2024-02-03", count: 1 },
  { date: "2024-02-14", count: 1 },
  { date: "2024-02-20", count: 1 },
  { date: "2024-02-28", count: 1 },
  { date: "2024-03-05", count: 1 },
  { date: "2024-03-10", count: 1 },
  { date: "2024-03-12", count: 1 },
  { date: "2024-03-15", count: 1 },
];

export const wordsAreaChartData: WordsAreaPoint[] = [
  { date: "2024-02-03", cumulative_words: 190 },
  { date: "2024-02-14", cumulative_words: 810 },
  { date: "2024-02-20", cumulative_words: 1120 },
  { date: "2024-02-28", cumulative_words: 1550 },
  { date: "2024-03-05", cumulative_words: 2090 },
  { date: "2024-03-10", cumulative_words: 2850 },
  { date: "2024-03-12", cumulative_words: 3830 },
  { date: "2024-03-15", cumulative_words: 5070 },
];

export const wordDistributionPieData: PieSlice[] = [
  { bucket: "Under 300", count: 2 },
  { bucket: "300–700", count: 3 },
  { bucket: "700–1,200", count: 2 },
  { bucket: "Over 1,200", count: 1 },
];
