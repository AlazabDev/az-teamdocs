import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { PageHeading } from "@/components/base/page-heading";
import { ProfileForm } from "./components/profile-form";
import { TeamTab } from "./components/team-tab";
import { GeneralTab } from "./components/general-tab";

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-[933px] px-6">
      <PageHeading
        title="Settings"
        subtitle="Manage your workspace"
      />
      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
          <TabsTrigger value="general">General</TabsTrigger>
        </TabsList>
        <Separator className="mt-6" />
        <TabsContent value="profile" className="pt-6">
          <ProfileForm />
        </TabsContent>
        <TabsContent value="team" className="pt-6">
          <TeamTab />
        </TabsContent>
        <TabsContent value="general" className="pt-6">
          <GeneralTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
