import { useLocation } from "react-router-dom";
import { useDataProvider } from "@/lib/data-provider";
import { PageHeading } from "@/components/base/page-heading";
import { MemberRow } from "@/components/base/member-row";

export default function MembersPage() {
  const { pathname } = useLocation();
  const prefix = pathname.startsWith("/demo") ? "/demo" : "";

  const data = useDataProvider();
  const { data: members } = data.useTeamMembers();

  return (
    <div className="mx-auto max-w-[933px] px-6 pb-12">
      <PageHeading
        title="Members"
        subtitle={`${members.length} ${members.length === 1 ? "member" : "members"}`}
      />
      <div>
        {members.map((m) => (
          <MemberRow
            key={m.user_id}
            userId={m.user_id}
            fullName={m.full_name}
            initials={m.initials}
            avatarUrl={m.avatar_url}
            role={m.role}
            prefix={prefix}
          />
        ))}
      </div>
    </div>
  );
}
