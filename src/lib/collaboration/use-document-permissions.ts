/**
 * React Query hooks for document-level permissions (share dialog).
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { DocumentPermission, PermissionRole } from "./types";

export function useDocumentPermissions(documentId: string) {
  return useQuery({
    queryKey: ["documentPermissions", documentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("document_permissions")
        .select("id, document_id, user_id, email, role, status, granted_by, created_at")
        .eq("document_id", documentId)
        .order("created_at", { ascending: true });

      if (error) throw error;

      const rows = data ?? [];
      if (rows.length === 0) return [];

      // Enrich active rows (with user_id) with profiles
      const activeIds = rows
        .filter((r) => r.user_id)
        .map((r) => r.user_id as string);

      let byId = new Map<string, { full_name: string; avatar_url: string | null }>();
      if (activeIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, full_name, avatar_url")
          .in("id", activeIds);

        byId = new Map(
          (profiles ?? []).map((p) => [
            p.id,
            { full_name: p.full_name ?? "User", avatar_url: p.avatar_url },
          ]),
        );
      }

      return rows.map((r) => {
        const p = r.user_id ? byId.get(r.user_id) : undefined;
        return {
          ...r,
          profiles: p ?? undefined,
        } as DocumentPermission;
      });
    },
    enabled: !!documentId,
  });
}

export function useGrantPermission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      documentId,
      email,
      role,
    }: {
      documentId: string;
      email: string;
      role: PermissionRole;
    }) => {
      const { data, error } = await supabase.functions.invoke("send-invite", {
        body: {
          email,
          role,
          kind: "document",
          targetId: documentId,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      return {
        email,
        role,
        message: data.message as string,
        isNewUser: data.isNewUser as boolean,
      };
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["documentPermissions", variables.documentId],
      });
    },
  });
}

export function useUpdatePermissionRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      permissionId,
      documentId,
      role,
    }: {
      permissionId: string;
      documentId: string;
      role: PermissionRole;
    }) => {
      const { error } = await supabase
        .from("document_permissions")
        .update({ role })
        .eq("id", permissionId);

      if (error) throw error;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["documentPermissions", variables.documentId],
      });
    },
  });
}

export function useRevokePermission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      permissionId,
      documentId,
    }: {
      permissionId: string;
      documentId: string;
    }) => {
      const { error } = await supabase
        .from("document_permissions")
        .delete()
        .eq("id", permissionId);

      if (error) throw error;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["documentPermissions", variables.documentId],
      });
    },
  });
}
