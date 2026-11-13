import { useMemo, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import {
  IconMail,
  IconShieldCheck,
  IconClock,
  IconList,
  IconLayoutGrid,
} from "@tabler/icons-react";
import { formatDate, getInitials } from "@/lib/utils";
import { useDataProvider } from "@/lib/data-provider";
import { PageHeading } from "@/components/base/page-heading";
import { DocItem } from "@/components/base/doc-item";
import { Badge } from "@/components/base/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { ContentPreview } from "@/pages/documents/components/content-preview";
import * as seed from "@/data/seed";
import type { BadgeColor } from "@/components/base/badge";
import type { DocumentRow } from "@/data/seed";

const roleBadgeColor: Record<string, BadgeColor> = {
  admin: "gray",
  editor: "blue",
  viewer: "gray",
};

export default function MemberPage() {
  const { userId } = useParams<{ userId: string }>();
  const { pathname } = useLocation();
  const prefix = pathname.startsWith("/demo") ? "/demo" : "";

  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

  const data = useDataProvider();
  const { data: teamMembers } = data.useTeamMembers();

  const member = teamMembers.find((m) => m.user_id === userId);
  const profile = seed.profiles.find((p) => p.id === userId);
  const role = seed.userRoles.find((r) => r.user_id === userId);

  const memberDocs: DocumentRow[] = useMemo(() => {
    const authorProfile = profile;
    const fullName = authorProfile?.full_name ?? "Unknown";
    return seed.documents
      .filter((d) => d.author_id === userId)
      .sort((a, b) => b.updated_at.localeCompare(a.updated_at))
      .map((d) => ({
        id: d.id,
        icon_emoji: d.icon_emoji,
        title: d.title,
        content: d.content,
        content_text: d.content_text,
        word_count: d.word_count,
        updated_at: d.updated_at,
        created_at: d.created_at,
        author: {
          initials: getInitials(fullName),
          full_name: fullName,
          avatar_url: authorProfile?.avatar_url ?? null,
        },
      }));
  }, [userId, profile]);

  if (!member) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">Member not found.</p>
      </div>
    );
  }

  const email = `${member.full_name.toLowerCase().replace(/\s+/g, ".")}@yourteam.com`;
  const roleName = role?.role ?? "viewer";

  return (
    <div className="mx-auto max-w-[933px] px-6 pb-12">
      {/* Avatar */}
      <div className="mt-12">
        <Avatar className="size-20">
          {profile?.avatar_url && (
            <AvatarImage src={profile.avatar_url} alt={member.full_name} />
          )}
          <AvatarFallback className="text-2xl">
            {getInitials(member.full_name)}
          </AvatarFallback>
        </Avatar>
      </div>

      {/* Name */}
      <h1 className="mt-4 text-3xl font-semibold text-foreground">
        {member.full_name}
      </h1>

      {/* Meta row */}
      <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
        <span className="flex items-center gap-1">
          <IconMail className="size-3.5" />
          {email}
        </span>
        <span className="text-border">·</span>
        <span className="flex items-center gap-1">
          <IconShieldCheck className="size-3.5" />
          <Badge color={roleBadgeColor[roleName]}>
            {roleName.charAt(0).toUpperCase() + roleName.slice(1)}
          </Badge>
        </span>
        <span className="text-border">·</span>
        <span className="flex items-center gap-1">
          <IconClock className="size-3.5" />
          Joined {role ? formatDate(role.created_at) : "—"}
        </span>
      </div>

      {/* Documents */}
      <section className="mt-10 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-muted-foreground">
            {memberDocs.length} {memberDocs.length === 1 ? "document" : "documents"}
          </h2>
          <ToggleGroup
            type="single"
            value={viewMode}
            onValueChange={(val) => {
              if (val === "list" || val === "grid") setViewMode(val);
            }}
            className="gap-0"
          >
            <ToggleGroupItem value="list" aria-label="List view" className="size-8 px-0">
              <IconList className="size-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="grid" aria-label="Grid view" className="size-8 px-0">
              <IconLayoutGrid className="size-4" />
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        {memberDocs.length === 0 ? (
          <p className="text-sm text-muted-foreground">No documents yet.</p>
        ) : viewMode === "list" ? (
          <div>
            {memberDocs.map((doc) => (
              <DocItem
                key={doc.id}
                id={doc.id}
                title={doc.title}
                updatedAt={doc.updated_at}
                prefix={prefix}
                variant="list"
                author={doc.author}
                preview={<ContentPreview content={doc.content} />}
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {memberDocs.map((doc) => (
              <DocItem
                key={doc.id}
                id={doc.id}
                title={doc.title}
                updatedAt={doc.updated_at}
                prefix={prefix}
                variant="grid"
                preview={<ContentPreview content={doc.content} />}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
