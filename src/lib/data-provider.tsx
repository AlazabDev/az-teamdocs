import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth/auth-provider";
import * as seed from "@/data/seed";
import type {
  OverviewStats,
  RecentDoc,
  DocumentRow,
  Document,
  DocsLinePoint,
  WordsAreaPoint,
  PieSlice,
  Profile,
  TeamMember,
  Invitation,
  DocumentFilters,
  DateRangeFilters,
  DocumentFields,
  ProfileFields,
  InvitationFields,
} from "@/data/seed";

// ── Provider interface ──────────────────────────────────────────

export interface WorkspaceSummary {
  id: string;
  name: string;
  role: string;
}

interface AppDataProvider {
  useWorkspaces(): { data: WorkspaceSummary[]; activeId: string | null; isLoading: boolean };
  useSwitchWorkspace(): (id: string) => void;
  useCreateWorkspace(): { mutate: (name: string) => void; isPending: boolean };
  useOverviewStats(): { data: OverviewStats; isLoading: boolean };
  useRecentDocuments(): { data: RecentDoc[]; isLoading: boolean };
  useDocuments(filters: DocumentFilters): { data: DocumentRow[]; isLoading: boolean };
  useDocument(id: string): { data: Document | null; isLoading: boolean };
  useDocsLineChart(filters: DateRangeFilters): { data: DocsLinePoint[]; isLoading: boolean };
  useWordsAreaChart(filters: DateRangeFilters): { data: WordsAreaPoint[]; isLoading: boolean };
  useWordDistributionPie(filters: DateRangeFilters): { data: PieSlice[]; isLoading: boolean };
  useProfile(): { data: Profile | null; isLoading: boolean };
  useTeamMembers(): { data: TeamMember[]; isLoading: boolean };
  useInvitations(): { data: Invitation[]; isLoading: boolean };
  useCreateDocument(): { mutate: () => Promise<string>; isPending: boolean };
  useUpdateDocument(): { mutate: (id: string, fields: DocumentFields) => void; isPending: boolean };
  useDeleteDocument(): { mutate: (id: string) => void; isPending: boolean };
  useDeleteDocuments(): { mutate: (ids: string[]) => void; isPending: boolean };
  useUpdateProfile(): { mutate: (fields: ProfileFields) => void; isPending: boolean };
  useCreateInvitation(): { mutate: (fields: InvitationFields) => void; isPending: boolean };
  useUpdateMemberRole(): { mutate: (userId: string, role: string) => void; isPending: boolean };
  useRevokeMember(): { mutate: (userId: string) => void; isPending: boolean };
  useRevokeInvitation(): { mutate: (invitationId: string) => void; isPending: boolean };
  useDeleteAccount(): { mutate: () => void; isPending: boolean };
}

const DataProviderContext = createContext<AppDataProvider | null>(null);

export function useDataProvider(): AppDataProvider {
  const ctx = useContext(DataProviderContext);
  if (!ctx) throw new Error("useDataProvider must be inside a DataProvider");
  return ctx;
}

// ── Helpers ─────────────────────────────────────────────────────

import { getInitials } from "@/lib/utils";

function bucketWordCount(wc: number): string {
  if (wc < 300) return "Under 300";
  if (wc <= 700) return "300–700";
  if (wc <= 1200) return "700–1,200";
  return "Over 1,200";
}

function dateOnly(iso: string): string {
  return iso.slice(0, 10);
}

// ── SeedDataProvider ────────────────────────────────────────────

export function SeedDataProvider({ children }: { children: ReactNode }) {
  const demoToast = () => toast("Sign in to save changes");

  const provider: AppDataProvider = {
    useWorkspaces: () => ({
      data: [{ id: "demo-ws", name: "Demo workspace", role: "admin" }],
      activeId: "demo-ws",
      isLoading: false,
    }),
    useSwitchWorkspace: () => () => demoToast(),
    useCreateWorkspace: () => ({ mutate: () => demoToast(), isPending: false }),

    useOverviewStats: () => ({
      data: {
        totalDocs: seed.documents.length,
      },
      isLoading: false,
    }),

    useRecentDocuments: () => ({
      data: [...seed.documents]
        .sort((a, b) => b.updated_at.localeCompare(a.updated_at))
        .slice(0, 3)
        .map((d) => {
          const profile = seed.profiles.find((p) => p.id === d.author_id);
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
        }),
      isLoading: false,
    }),

    useDocuments: (filters) => {
      let filtered = [...seed.documents];

      if (filters.search) {
        const q = filters.search.toLowerCase();
        filtered = filtered.filter(
          (d) =>
            d.title.toLowerCase().includes(q) ||
            d.content_text.toLowerCase().includes(q)
        );
      }

      const sort = filters.sort ?? "date";
      if (sort === "title") {
        filtered.sort((a, b) => a.title.localeCompare(b.title));
      } else if (sort === "words") {
        filtered.sort((a, b) => b.word_count - a.word_count);
      } else if (sort === "author") {
        filtered.sort((a, b) => {
          const nameA = seed.profiles.find((p) => p.id === a.author_id)?.full_name ?? "";
          const nameB = seed.profiles.find((p) => p.id === b.author_id)?.full_name ?? "";
          return nameA.localeCompare(nameB);
        });
      } else {
        filtered.sort((a, b) => b.updated_at.localeCompare(a.updated_at));
      }

      return {
        data: filtered.map((d) => {
          const profile = seed.profiles.find((p) => p.id === d.author_id);
          return {
            id: d.id,
            icon_emoji: d.icon_emoji,
            title: d.title,
            content: d.content,
            content_text: d.content_text,
            word_count: d.word_count,
            updated_at: d.updated_at,
            created_at: d.created_at,
            author: {
              initials: profile ? getInitials(profile.full_name) : "??",
              full_name: profile?.full_name ?? "Unknown",
              avatar_url: profile?.avatar_url ?? null,
            },
          };
        }),
        isLoading: false,
      };
    },

    useDocument: (id) => ({
      data: seed.documents.find((d) => d.id === id) ?? null,
      isLoading: false,
    }),

    useDocsLineChart: (filters) => {
      const filtered = seed.documents.filter(
        (d) => d.created_at >= filters.startDate && d.created_at <= filters.endDate
      );
      const grouped: Record<string, number> = {};
      for (const d of filtered) {
        const day = dateOnly(d.created_at);
        grouped[day] = (grouped[day] ?? 0) + 1;
      }
      return {
        data: Object.entries(grouped)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([date, count]) => ({ date, count })),
        isLoading: false,
      };
    },

    useWordsAreaChart: (filters) => {
      const filtered = seed.documents
        .filter((d) => d.created_at >= filters.startDate && d.created_at <= filters.endDate)
        .sort((a, b) => a.created_at.localeCompare(b.created_at));

      let cumulative = 0;
      return {
        data: filtered.map((d) => {
          cumulative += d.word_count;
          return { date: dateOnly(d.created_at), cumulative_words: cumulative };
        }),
        isLoading: false,
      };
    },

    useWordDistributionPie: (filters) => {
      const filtered = seed.documents.filter(
        (d) => d.created_at >= filters.startDate && d.created_at <= filters.endDate
      );
      const buckets: Record<string, number> = {
        "Under 300": 0,
        "300–700": 0,
        "700–1,200": 0,
        "Over 1,200": 0,
      };
      for (const d of filtered) {
        const b = bucketWordCount(d.word_count);
        buckets[b] = (buckets[b] ?? 0) + 1;
      }
      return {
        data: Object.entries(buckets).map(([bucket, count]) => ({ bucket, count })),
        isLoading: false,
      };
    },

    useProfile: () => ({
      data: seed.profiles.find((p) => p.id === "user-1") ?? null,
      isLoading: false,
    }),

    useTeamMembers: () => {
      const members: TeamMember[] = seed.userRoles
        .map((r) => {
          const profile = seed.profiles.find((p) => p.id === r.user_id);
          return {
            user_id: r.user_id,
            full_name: profile?.full_name ?? "Unknown",
            role: r.role,
            initials: profile ? getInitials(profile.full_name) : "??",
            avatar_url: profile?.avatar_url ?? null,
          };
        })
        .sort((a, b) => {
          if (a.user_id === "user-1") return -1;
          if (b.user_id === "user-1") return 1;
          return a.full_name.localeCompare(b.full_name);
        });
      return { data: members, isLoading: false };
    },

    useInvitations: () => ({
      data: seed.invitations.filter((i) => i.status === "pending"),
      isLoading: false,
    }),

    useCreateDocument: () => ({
      mutate: async () => {
        demoToast();
        return "demo-doc";
      },
      isPending: false,
    }),
    useUpdateDocument: () => ({ mutate: () => demoToast(), isPending: false }),
    useDeleteDocument: () => ({ mutate: () => demoToast(), isPending: false }),
    useDeleteDocuments: () => ({ mutate: () => demoToast(), isPending: false }),
    useUpdateProfile: () => ({ mutate: () => demoToast(), isPending: false }),
    useCreateInvitation: () => ({ mutate: () => demoToast(), isPending: false }),
    useUpdateMemberRole: () => ({ mutate: () => demoToast(), isPending: false }),
    useRevokeMember: () => ({ mutate: () => demoToast(), isPending: false }),
    useRevokeInvitation: () => ({ mutate: () => demoToast(), isPending: false }),
    useDeleteAccount: () => ({ mutate: () => demoToast(), isPending: false }),
  };

  return (
    <DataProviderContext.Provider value={provider}>
      {children}
    </DataProviderContext.Provider>
  );
}

// ── SupabaseDataProvider ────────────────────────────────────────

const ACTIVE_WS_KEY = "active_workspace_id";

export function SupabaseDataProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string | null>(
    () => (typeof window !== "undefined" ? localStorage.getItem(ACTIVE_WS_KEY) : null)
  );

  // Load all workspaces the user is a member of
  const { data: workspacesList, isLoading: workspacesLoading } = useQuery({
    queryKey: ["myWorkspaces", user?.id],
    queryFn: async () => {
      const { data: rows } = await supabase
        .from("workspace_members")
        .select("workspace_id, role, created_at, workspaces!inner(id, name)")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: true });
      return (rows ?? []).map((r) => {
        const ws = r.workspaces as unknown as { id: string; name: string };
        return { id: ws.id, name: ws.name, role: r.role, created_at: r.created_at };
      });
    },
    enabled: !!user,
  });

  // Ensure active workspace is valid; if not, fall back to first
  useEffect(() => {
    if (!workspacesList || workspacesList.length === 0) return;
    const validIds = new Set(workspacesList.map((w) => w.id));
    if (!activeWorkspaceId || !validIds.has(activeWorkspaceId)) {
      const next = workspacesList[0].id;
      setActiveWorkspaceId(next);
      if (typeof window !== "undefined") localStorage.setItem(ACTIVE_WS_KEY, next);
    }
  }, [workspacesList, activeWorkspaceId]);

  // Claim any pending invitations for this email on mount; auto-switch to newest membership
  useEffect(() => {
    if (!user) return;
    supabase.rpc("accept_pending_invitations").then(async ({ data: claimed }) => {
      if (claimed && claimed > 0) {
        const { data: rows } = await supabase
          .from("workspace_members")
          .select("workspace_id, created_at")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(1);
        const newest = rows?.[0]?.workspace_id ?? null;
        if (newest) {
          setActiveWorkspaceId(newest);
          if (typeof window !== "undefined") localStorage.setItem(ACTIVE_WS_KEY, newest);
        }
        queryClient.invalidateQueries({ queryKey: ["myWorkspaces", user.id] });
        toast.success("You've joined a new workspace");
      }
    });
    // Also accept pending document permissions
    supabase.rpc("accept_pending_doc_permissions");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const workspaceId = activeWorkspaceId;
  const wsReady = !!user && !!workspaceId;

  const provider: AppDataProvider = {
    useWorkspaces: () => ({
      data: (workspacesList ?? []).map((w) => ({ id: w.id, name: w.name, role: w.role })),
      activeId: activeWorkspaceId,
      isLoading: workspacesLoading,
    }),
    useSwitchWorkspace: () => (id: string) => {
      setActiveWorkspaceId(id);
      if (typeof window !== "undefined") localStorage.setItem(ACTIVE_WS_KEY, id);
      // Invalidate all workspace-scoped queries
      queryClient.invalidateQueries();
    },
    useCreateWorkspace: () => {
      const mutation = useMutation({
        mutationFn: async (name: string) => {
          const { data: ws, error } = await supabase
            .from("workspaces")
            .insert({ name: name.trim(), created_by: user!.id })
            .select()
            .single();
          if (error) throw error;
          const { error: mErr } = await supabase
            .from("workspace_members")
            .insert({ workspace_id: ws.id, user_id: user!.id, role: "admin" });
          if (mErr) throw mErr;
          return ws.id as string;
        },
        onSuccess: (id) => {
          setActiveWorkspaceId(id);
          if (typeof window !== "undefined") localStorage.setItem(ACTIVE_WS_KEY, id);
          queryClient.invalidateQueries({ queryKey: ["myWorkspaces", user?.id] });
          queryClient.invalidateQueries();
          toast.success("Workspace created");
        },
        onError: (e: Error) => toast.error(e.message ?? "Failed to create workspace"),
      });
      return { mutate: (name: string) => mutation.mutate(name), isPending: mutation.isPending };
    },

    useOverviewStats: () => {
      const { data, isLoading } = useQuery({
        queryKey: ["overviewStats", user?.id, workspaceId],
        queryFn: async () => {
          const docsResult = await supabase
            .from("documents")
            .select("id", { count: "exact", head: true })
            .eq("workspace_id", workspaceId!);
          return {
            totalDocs: docsResult.count ?? 0,
          };
        },
        enabled: wsReady,
      });
      return { data: data ?? { totalDocs: 0 }, isLoading };
    },

    useRecentDocuments: () => {
      const { data, isLoading } = useQuery({
        queryKey: ["recentDocuments", user?.id, workspaceId],
        queryFn: async () => {
          const { data: rows } = await supabase
            .from("documents")
            .select("id, icon_emoji, title, updated_at, profiles!documents_author_profile_fkey(full_name, avatar_url)")
            .eq("workspace_id", workspaceId!)
            .order("updated_at", { ascending: false })
            .limit(3);
          return (rows ?? []).map((row) => {
            const profile = row.profiles as unknown as { full_name: string; avatar_url: string | null } | null;
            const fullName = profile?.full_name ?? "Unknown";
            return {
              id: row.id,
              icon_emoji: row.icon_emoji,
              title: row.title,
              updated_at: row.updated_at,
              author: { initials: getInitials(fullName), full_name: fullName, avatar_url: profile?.avatar_url ?? null },
            };
          });
        },
        enabled: wsReady,
      });
      return { data: data ?? [], isLoading };
    },

    useDocuments: (filters) => {
      const { data, isLoading } = useQuery({
        queryKey: ["documents", user?.id, workspaceId, filters],
        queryFn: async () => {
          let query = supabase
            .from("documents")
            .select("id, icon_emoji, title, content, content_text, word_count, updated_at, created_at, profiles!documents_author_profile_fkey(full_name, avatar_url)")
            .eq("workspace_id", workspaceId!);

          if (filters.search) {
            query = query.or(
              `title.ilike.%${filters.search}%,content_text.ilike.%${filters.search}%`
            );
          }

          if (filters.sort === "title") {
            query = query.order("title", { ascending: true });
          } else if (filters.sort === "words") {
            query = query.order("word_count", { ascending: false });
          } else {
            query = query.order("updated_at", { ascending: false });
          }

          const { data: rows } = await query;

          let mapped = (rows ?? []).map((row) => {
            const profile = row.profiles as unknown as { full_name: string; avatar_url: string | null } | null;
            const fullName = profile?.full_name ?? "Unknown";
            return {
              id: row.id,
              icon_emoji: row.icon_emoji,
              title: row.title,
              content: row.content as Record<string, unknown>,
              content_text: row.content_text,
              word_count: row.word_count,
              updated_at: row.updated_at,
              created_at: row.created_at,
              author: { initials: getInitials(fullName), full_name: fullName, avatar_url: profile?.avatar_url ?? null },
            };
          });

          if (filters.sort === "author") {
            mapped.sort((a, b) => a.author.full_name.localeCompare(b.author.full_name));
          }

          return mapped;
        },
        enabled: wsReady,
      });
      return { data: data ?? [], isLoading };
    },

    useDocument: (id) => {
      const { data, isLoading } = useQuery({
        queryKey: ["document", id],
        queryFn: async () => {
          const { data: row } = await supabase
            .from("documents")
            .select("id, title, content, content_text, cover_image_url, icon_emoji, word_count, author_id, created_at, updated_at")
            .eq("id", id)
            .single();
          if (!row) return null;
          return {
            ...row,
            content: row.content as Record<string, unknown>,
          } as Document;
        },
        enabled: !!user && !!id,
      });
      return { data: data ?? null, isLoading };
    },

    useDocsLineChart: (filters) => {
      const { data, isLoading } = useQuery({
        queryKey: ["docsLineChart", user?.id, workspaceId, filters],
        queryFn: async () => {
          const { data: rows } = await supabase
            .from("documents")
            .select("created_at")
            .eq("workspace_id", workspaceId!)
            .gte("created_at", filters.startDate)
            .lte("created_at", filters.endDate)
            .order("created_at", { ascending: true });

          const grouped: Record<string, number> = {};
          for (const row of rows ?? []) {
            const day = dateOnly(row.created_at);
            grouped[day] = (grouped[day] ?? 0) + 1;
          }
          return Object.entries(grouped)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([date, count]) => ({ date, count }));
        },
        enabled: wsReady,
      });
      return { data: data ?? [], isLoading };
    },

    useWordsAreaChart: (filters) => {
      const { data, isLoading } = useQuery({
        queryKey: ["wordsAreaChart", user?.id, workspaceId, filters],
        queryFn: async () => {
          const { data: rows } = await supabase
            .from("documents")
            .select("created_at, word_count")
            .eq("workspace_id", workspaceId!)
            .gte("created_at", filters.startDate)
            .lte("created_at", filters.endDate)
            .order("created_at", { ascending: true });

          let cumulative = 0;
          return (rows ?? []).map((row) => {
            cumulative += row.word_count;
            return { date: dateOnly(row.created_at), cumulative_words: cumulative };
          });
        },
        enabled: wsReady,
      });
      return { data: data ?? [], isLoading };
    },

    useWordDistributionPie: (filters) => {
      const { data, isLoading } = useQuery({
        queryKey: ["wordDistributionPie", user?.id, workspaceId, filters],
        queryFn: async () => {
          const { data: rows } = await supabase
            .from("documents")
            .select("word_count")
            .eq("workspace_id", workspaceId!)
            .gte("created_at", filters.startDate)
            .lte("created_at", filters.endDate);

          const buckets: Record<string, number> = {
            "Under 300": 0,
            "300–700": 0,
            "700–1,200": 0,
            "Over 1,200": 0,
          };
          for (const row of rows ?? []) {
            const b = bucketWordCount(row.word_count);
            buckets[b] = (buckets[b] ?? 0) + 1;
          }
          return Object.entries(buckets).map(([bucket, count]) => ({ bucket, count }));
        },
        enabled: wsReady,
      });
      return { data: data ?? [], isLoading };
    },

    useProfile: () => {
      const { data, isLoading } = useQuery({
        queryKey: ["profile", user?.id],
        queryFn: async () => {
          const { data: row } = await supabase
            .from("profiles")
            .select("id, full_name, avatar_url")
            .eq("id", user!.id)
            .single();
          return row as Profile | null;
        },
        enabled: !!user,
      });
      return { data: data ?? null, isLoading };
    },

    useTeamMembers: () => {
      const { data, isLoading } = useQuery({
        queryKey: ["teamMembers", workspaceId],
        queryFn: async () => {
          const { data: memberRows } = await supabase
            .from("workspace_members")
            .select("user_id, role, created_at")
            .eq("workspace_id", workspaceId!)
            .order("created_at", { ascending: true });

          const members = memberRows ?? [];
          if (members.length === 0) return [];

          const ids = members.map((m) => m.user_id);
          const { data: profileRows } = await supabase
            .from("profiles")
            .select("id, full_name, avatar_url")
            .in("id", ids);

          const byId = new Map((profileRows ?? []).map((p) => [p.id, p]));

          return members
            .map((m) => {
              const p = byId.get(m.user_id);
              const fullName = p?.full_name ?? "Unknown";
              return {
                user_id: m.user_id,
                full_name: fullName,
                role: m.role as TeamMember["role"],
                initials: getInitials(fullName),
                avatar_url: p?.avatar_url ?? null,
              };
            })
            .sort((a, b) => {
              if (a.user_id === user?.id) return -1;
              if (b.user_id === user?.id) return 1;
              return a.full_name.localeCompare(b.full_name);
            });
        },
        enabled: wsReady,
      });
      return { data: data ?? [], isLoading };
    },

    useInvitations: () => {
      const { data, isLoading } = useQuery({
        queryKey: ["invitations", workspaceId],
        queryFn: async () => {
          const { data: rows } = await supabase
            .from("invitations")
            .select("id, email, role, invited_by, status, created_at")
            .eq("workspace_id", workspaceId!)
            .eq("status", "pending")
            .order("created_at", { ascending: false });
          return (rows ?? []) as Invitation[];
        },
        enabled: wsReady,
      });
      return { data: data ?? [], isLoading };
    },


    useCreateDocument: () => {
      const mutation = useMutation({
        mutationFn: async () => {
          const { data: row } = await supabase
            .from("documents")
            .insert({
              workspace_id: workspaceId!,
              author_id: user!.id,
              title: "",
              content: {},
              content_text: "",
              word_count: 0,
            })
            .select()
            .single();
          return row!.id as string;
        },
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["documents", user?.id, workspaceId] });
          queryClient.invalidateQueries({ queryKey: ["recentDocuments", user?.id, workspaceId] });
          queryClient.invalidateQueries({ queryKey: ["overviewStats", user?.id, workspaceId] });
        },
      });
      return { mutate: mutation.mutateAsync, isPending: mutation.isPending };
    },

    useUpdateDocument: () => {
      const mutation = useMutation({
        mutationFn: async ({ id, fields }: { id: string; fields: DocumentFields }) => {
          const payload: Record<string, unknown> = {
            updated_at: new Date().toISOString(),
          };
          if (fields.title !== undefined) payload.title = fields.title;
          if (fields.content !== undefined) payload.content = fields.content;
          if (fields.contentText !== undefined) payload.content_text = fields.contentText;
          if (fields.coverImageUrl !== undefined) payload.cover_image_url = fields.coverImageUrl;
          if (fields.iconEmoji !== undefined) payload.icon_emoji = fields.iconEmoji;
          if (fields.wordCount !== undefined) payload.word_count = fields.wordCount;
          await supabase.from("documents").update(payload).eq("id", id);
        },
        onMutate: async ({ id, fields }) => {
          await queryClient.cancelQueries({ queryKey: ["document", id] });
          const previous = queryClient.getQueryData<Document>(["document", id]);
          if (previous) {
            queryClient.setQueryData<Document>(["document", id], {
              ...previous,
              ...(fields.title !== undefined && { title: fields.title }),
              ...(fields.content !== undefined && { content: fields.content }),
              ...(fields.contentText !== undefined && { content_text: fields.contentText }),
              ...(fields.coverImageUrl !== undefined && { cover_image_url: fields.coverImageUrl }),
              ...(fields.iconEmoji !== undefined && { icon_emoji: fields.iconEmoji }),
              ...(fields.wordCount !== undefined && { word_count: fields.wordCount }),
            });
          }
          return { previous };
        },
        onError: (_err, { id }, context) => {
          if (context?.previous) {
            queryClient.setQueryData(["document", id], context.previous);
          }
          toast.error("Save failed");
        },
        onSettled: (_data, _err, { id }) => {
          queryClient.invalidateQueries({ queryKey: ["document", id] });
          queryClient.invalidateQueries({ queryKey: ["documents", user?.id, workspaceId] });
          queryClient.invalidateQueries({ queryKey: ["recentDocuments", user?.id, workspaceId] });
        },
      });
      return {
        mutate: (id: string, fields: DocumentFields) => mutation.mutate({ id, fields }),
        isPending: mutation.isPending,
      };
    },

    useDeleteDocument: () => {
      const mutation = useMutation({
        mutationFn: async (documentId: string) => {
          await supabase.from("documents").delete().eq("id", documentId);
        },
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["documents", user?.id, workspaceId] });
          queryClient.invalidateQueries({ queryKey: ["recentDocuments", user?.id, workspaceId] });
          queryClient.invalidateQueries({ queryKey: ["overviewStats", user?.id, workspaceId] });
        },
      });
      return { mutate: mutation.mutate, isPending: mutation.isPending };
    },

    useDeleteDocuments: () => {
      const mutation = useMutation({
        mutationFn: async (ids: string[]) => {
          await supabase.from("documents").delete().in("id", ids);
        },
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["documents", user?.id, workspaceId] });
          queryClient.invalidateQueries({ queryKey: ["recentDocuments", user?.id, workspaceId] });
          queryClient.invalidateQueries({ queryKey: ["overviewStats", user?.id, workspaceId] });
        },
      });
      return { mutate: mutation.mutate, isPending: mutation.isPending };
    },

    useUpdateProfile: () => {
      const mutation = useMutation({
        mutationFn: async (fields: ProfileFields) => {
          await supabase
            .from("profiles")
            .update({ full_name: fields.fullName })
            .eq("id", user!.id);
          if (fields.newPassword) {
            await supabase.auth.updateUser({ password: fields.newPassword });
          }
        },
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["profile", user?.id] });
          queryClient.invalidateQueries({ queryKey: ["teamMembers", workspaceId] });
          toast.success("Profile updated");
        },
      });
      return { mutate: mutation.mutate, isPending: mutation.isPending };
    },

    useCreateInvitation: () => {
      const mutation = useMutation({
        mutationFn: async (fields: InvitationFields) => {
          await supabase
            .from("invitations")
            .insert({
              workspace_id: workspaceId!,
              email: fields.email,
              role: fields.role,
              invited_by: user!.id,
              status: "pending",
            })
            .select()
            .single();
        },
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["invitations", workspaceId] });
          toast.success("Invitation sent");
        },
      });
      return { mutate: mutation.mutate, isPending: mutation.isPending };
    },

    useUpdateMemberRole: () => {
      const mutation = useMutation({
        mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
          await supabase
            .from("workspace_members")
            .update({ role })
            .eq("workspace_id", workspaceId!)
            .eq("user_id", userId);
        },
        onMutate: async ({ userId, role }) => {
          await queryClient.cancelQueries({ queryKey: ["teamMembers", workspaceId] });
          const previous = queryClient.getQueryData<TeamMember[]>(["teamMembers", workspaceId]);
          if (previous) {
            queryClient.setQueryData<TeamMember[]>(
              ["teamMembers", workspaceId],
              previous.map((m) => (m.user_id === userId ? { ...m, role: role as TeamMember["role"] } : m))
            );
          }
          return { previous };
        },
        onError: (_err, _vars, context) => {
          if (context?.previous) {
            queryClient.setQueryData(["teamMembers", workspaceId], context.previous);
          }
        },
        onSettled: () => {
          queryClient.invalidateQueries({ queryKey: ["teamMembers", workspaceId] });
        },
      });
      return {
        mutate: (userId: string, role: string) => mutation.mutate({ userId, role }),
        isPending: mutation.isPending,
      };
    },

    useRevokeMember: () => {
      const mutation = useMutation({
        mutationFn: async (userId: string) => {
          await supabase
            .from("workspace_members")
            .delete()
            .eq("workspace_id", workspaceId!)
            .eq("user_id", userId);
        },
        onMutate: async (userId) => {
          await queryClient.cancelQueries({ queryKey: ["teamMembers", workspaceId] });
          const previous = queryClient.getQueryData<TeamMember[]>(["teamMembers", workspaceId]);
          if (previous) {
            queryClient.setQueryData<TeamMember[]>(
              ["teamMembers", workspaceId],
              previous.filter((m) => m.user_id !== userId)
            );
          }
          return { previous };
        },
        onError: (_err, _vars, context) => {
          if (context?.previous) {
            queryClient.setQueryData(["teamMembers", workspaceId], context.previous);
          }
        },
        onSettled: () => {
          queryClient.invalidateQueries({ queryKey: ["teamMembers", workspaceId] });
        },
      });
      return { mutate: mutation.mutate, isPending: mutation.isPending };
    },


    useRevokeInvitation: () => {
      const mutation = useMutation({
        mutationFn: async (invitationId: string) => {
          await supabase.from("invitations").delete().eq("id", invitationId);
        },
        onMutate: async (invitationId) => {
          await queryClient.cancelQueries({ queryKey: ["invitations", workspaceId] });
          const previous = queryClient.getQueryData<Invitation[]>(["invitations", workspaceId]);
          if (previous) {
            queryClient.setQueryData<Invitation[]>(
              ["invitations", workspaceId],
              previous.filter((i) => i.id !== invitationId)
            );
          }
          return { previous };
        },
        onError: (_err, _vars, context) => {
          if (context?.previous) {
            queryClient.setQueryData(["invitations", workspaceId], context.previous);
          }
        },
        onSettled: () => {
          queryClient.invalidateQueries({ queryKey: ["invitations", workspaceId] });
        },
        onSuccess: () => {
          toast.success("Invitation cancelled");
        },
      });
      return { mutate: mutation.mutate, isPending: mutation.isPending };
    },

    useDeleteAccount: () => {
      const mutation = useMutation({
        mutationFn: async () => {
          await supabase.functions.invoke("delete-account", {
            body: { userId: user!.id },
          });
          await supabase.auth.signOut();
        },
        onSuccess: () => {
          queryClient.clear();
        },
      });
      return { mutate: () => mutation.mutate(), isPending: mutation.isPending };
    },
  };

  return (
    <DataProviderContext.Provider value={provider}>
      {children}
    </DataProviderContext.Provider>
  );
}
