import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/lib/auth/auth-provider";
import { FilterProvider } from "@/lib/filter-context";
import { ProtectedRoute } from "@/components/protected-route";
import { SeedDataProvider, SupabaseDataProvider } from "@/lib/data-provider";
import ApplicationLayout from "./layouts/application-layout";
import WorkspaceLayout03 from "./layouts/workspace-layout-03";
import Landing from "./pages/landing";
import AuthPage from "./pages/auth";
import AuthCallback from "./pages/auth/callback";
import OverviewPage from "./pages/overview";
import DocumentsPage from "./pages/documents";
import EditorPage from "./pages/editor";
import AnalyticsPage from "./pages/analytics";
import SettingsPage from "./pages/settings";
import MembersPage from "./pages/members";
import MemberDetailPage from "./pages/members/detail";
import NotFound from "./pages/not-found";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,
      retry: 1,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <FilterProvider>
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route element={<ApplicationLayout />}>
              <Route path="/" element={<Landing />} />
              <Route path="/auth" element={<AuthPage />} />
              {/* Managed OAuth + email-confirmation return. SocialAuthButtons always
                  redirects here, so this route must exist or SSO dead-ends on a 404. */}
              <Route path="/auth/callback" element={<AuthCallback />} />
            </Route>

            {/* Demo routes — seed data, no auth */}
            <Route
              element={
                <SeedDataProvider>
                  <WorkspaceLayout03 />
                </SeedDataProvider>
              }
            >
              <Route path="/demo/overview" element={<OverviewPage />} />
              <Route path="/demo/documents" element={<DocumentsPage />} />
              <Route path="/demo/documents/:id" element={<EditorPage />} />
              <Route path="/demo/analytics" element={<AnalyticsPage />} />
              <Route path="/demo/members" element={<MembersPage />} />
              <Route path="/demo/members/:userId" element={<MemberDetailPage />} />
              <Route path="/demo/settings" element={<SettingsPage />} />
            </Route>

            {/* Protected routes — Supabase data, auth required */}
            <Route
              element={
                <ProtectedRoute>
                  <SupabaseDataProvider>
                    <WorkspaceLayout03 />
                  </SupabaseDataProvider>
                </ProtectedRoute>
              }
            >
              <Route path="/overview" element={<OverviewPage />} />
              <Route path="/documents" element={<DocumentsPage />} />
              <Route path="/documents/:id" element={<EditorPage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              <Route path="/members" element={<MembersPage />} />
              <Route path="/members/:userId" element={<MemberDetailPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        <Toaster />
      </FilterProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
