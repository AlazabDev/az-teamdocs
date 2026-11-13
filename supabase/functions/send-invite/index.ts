import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

interface InviteRequest {
  email: string;
  role: string;
  kind: "workspace" | "document";
  targetId: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Verify the caller is authenticated
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Create admin client (service role — bypasses RLS)
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Create user client to get caller identity
    const supabaseUser = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user: caller }, error: authError } = await supabaseUser.auth.getUser();
    if (authError || !caller) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const body: InviteRequest = await req.json();
    const { email, role, kind, targetId } = body;

    if (!email || !role || !kind || !targetId) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: email, role, kind, targetId" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Validate role against the allowed set for this kind
    const WORKSPACE_ROLES = new Set(["admin", "editor", "viewer"]);
    const DOCUMENT_ROLES = new Set(["editor", "commenter", "viewer"]);
    if (kind === "workspace" && !WORKSPACE_ROLES.has(role)) {
      return new Response(
        JSON.stringify({ error: "Invalid workspace role" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    if (kind === "document" && !DOCUMENT_ROLES.has(role)) {
      return new Response(
        JSON.stringify({ error: "Invalid document role" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Authorization: caller must have rights on the target
    if (kind === "workspace") {
      const { data: isAdmin, error: roleErr } = await supabaseAdmin.rpc(
        "has_workspace_role",
        { _ws: targetId, _uid: caller.id, _role: "admin" },
      );
      if (roleErr || !isAdmin) {
        return new Response(
          JSON.stringify({ error: "Forbidden: workspace admin required" }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
    } else if (kind === "document") {
      // Caller must be author of the doc OR an admin/editor of its workspace
      const { data: doc, error: docErr } = await supabaseAdmin
        .from("documents")
        .select("id, author_id, workspace_id")
        .eq("id", targetId)
        .maybeSingle();
      if (docErr || !doc) {
        return new Response(
          JSON.stringify({ error: "Document not found" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      let allowed = doc.author_id === caller.id;
      if (!allowed) {
        const { data: canWrite } = await supabaseAdmin.rpc(
          "can_write_workspace",
          { _ws: doc.workspace_id, _uid: caller.id },
        );
        allowed = !!canWrite;
      }
      if (!allowed) {
        return new Response(
          JSON.stringify({ error: "Forbidden: no permission to share this document" }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
    } else {
      return new Response(
        JSON.stringify({ error: "Invalid kind" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Don't allow self-invite
    if (normalizedEmail === caller.email?.toLowerCase()) {
      return new Response(
        JSON.stringify({ error: "You can't invite yourself" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Look up if the invitee already has an account
    const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    if (listError) throw listError;

    const existingUser = users.find(
      (u) => u.email?.toLowerCase() === normalizedEmail,
    );

    let inviteeUserId: string | null = null;

    if (existingUser) {
      inviteeUserId = existingUser.id;
    } else {
      // Create stub account + send magic link email
      const appUrl = supabaseUrl.replace(".supabase.co", ".lovable.app");
      const redirectPath = kind === "document" ? `/documents/${targetId}` : "/overview";
      const { data: invited, error: inviteError } =
        await supabaseAdmin.auth.admin.inviteUserByEmail(normalizedEmail, {
          redirectTo: `${appUrl}${redirectPath}`,
        });
      if (inviteError) throw inviteError;
      inviteeUserId = invited.user.id;
    }

    // Get caller's profile for the notification
    const { data: callerProfile } = await supabaseAdmin
      .from("profiles")
      .select("full_name")
      .eq("id", caller.id)
      .single();
    const callerName = callerProfile?.full_name || caller.email || "Someone";

    if (kind === "workspace") {
      // Insert workspace invitation (existing pattern)
      const { error: insertError } = await supabaseAdmin
        .from("invitations")
        .upsert(
          {
            workspace_id: targetId,
            email: normalizedEmail,
            role,
            invited_by: caller.id,
            status: inviteeUserId ? "pending" : "pending",
          },
          { onConflict: "workspace_id,email" },
        );
      if (insertError) throw insertError;

      // If user exists, also add them as a member directly
      if (inviteeUserId) {
        await supabaseAdmin
          .from("workspace_members")
          .upsert(
            { workspace_id: targetId, user_id: inviteeUserId, role },
            { onConflict: "workspace_id,user_id" },
          );
        await supabaseAdmin
          .from("invitations")
          .update({ status: "accepted" })
          .eq("workspace_id", targetId)
          .ilike("email", normalizedEmail);
      }
    } else if (kind === "document") {
      // Insert document permission
      if (inviteeUserId) {
        // User exists — grant immediately
        const { error: insertError } = await supabaseAdmin
          .from("document_permissions")
          .upsert(
            {
              document_id: targetId,
              user_id: inviteeUserId,
              email: normalizedEmail,
              role,
              granted_by: caller.id,
              status: "active",
            },
            { onConflict: "document_id,user_id" },
          );
        if (insertError) throw insertError;
      } else {
        // User doesn't exist — pending invite
        const { error: insertError } = await supabaseAdmin
          .from("document_permissions")
          .insert({
            document_id: targetId,
            email: normalizedEmail,
            role,
            granted_by: caller.id,
            status: "pending",
          });
        if (insertError) throw insertError;
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        email: normalizedEmail,
        isNewUser: !existingUser,
        message: existingUser
          ? `${normalizedEmail} now has ${role} access`
          : `Invitation email sent to ${normalizedEmail}`,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
