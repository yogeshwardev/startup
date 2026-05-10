import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import AppShell from "./layouts/AppShell";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ContestManagementPage from "./pages/admin/ContestManagementPage";
import MockTestManagementPage from "./pages/admin/MockTestManagementPage";
import ExistingProblemsPage from "./pages/admin/ExistingProblemsPage";
import ProblemManagementPage from "./pages/admin/ProblemManagementPage";
import UserCreatePage from "./pages/admin/UserCreatePage";
import UserManagementPage from "./pages/admin/UserManagementPage";
import CompanyManagementPage from "./pages/admin/CompanyManagementPage";
import QuestionManagementPage from "./pages/admin/QuestionManagementPage";
import AuthPage from "./pages/AuthPage";
import AnalyticsPage from "./pages/shared/AnalyticsPage";
import ConnectionsPage from "./pages/shared/ConnectionsPage";
import DepartmentsPage from "./pages/shared/DepartmentsPage";
import SettingsPage from "./pages/shared/SettingsPage";
import UserProfilePage from "./pages/shared/UserProfilePage";
import CompanyDetailPage from "./pages/shared/CompanyDetailPage";
import ContestDetailPage from "./pages/student/ContestDetailPage";
import ContestListPage from "./pages/student/ContestListPage";
import DepartmentWarPage from "./pages/student/DepartmentWarPage";
import LeaderboardPage from "./pages/student/LeaderboardPage";
import ProblemWorkspacePage from "./pages/student/ProblemWorkspacePage";
import PlacementProblemWorkspacePage from "./pages/student/PlacementProblemWorkspacePage";
import ProblemsPage from "./pages/student/ProblemsPage";
import StudentDashboard from "./pages/student/StudentDashboard";
import SubmissionsPage from "./pages/student/SubmissionsPage";
import ContactAdminPage from "./pages/teacher/ContactAdminPage";
import TeacherProblemsPage from "./pages/teacher/TeacherProblemsPage";
import TeacherMockTestPage from "./pages/teacher/TeacherMockTestPage";
import TeacherDashboard from "./pages/teacher/TeacherDashboard";
import PlacementHubPage from "./pages/student/PlacementHubPage";
import PlacementCompanyDetailPage from "./pages/student/PlacementCompanyDetailPage";
import MockTestPage from "./pages/student/MockTestPage";
import MockTestResultPage from "./pages/student/MockTestResultPage";
import PlacementLeaderboardPage from "./pages/student/PlacementLeaderboardPage";
import { useAuth } from "./hooks/useAuth";

const App = () => {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/auth" element={user ? <Navigate to="/" replace /> : <AuthPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Navigate to={user?.role === "ADMIN" ? "/admin" : user?.role === "TEACHER" ? "/teacher" : "/dashboard"} replace />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute roles={["STUDENT"]}>
            <AppShell>
              <StudentDashboard />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/submissions"
        element={
          <ProtectedRoute roles={["STUDENT"]}>
            <AppShell>
              <SubmissionsPage />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/problems"
        element={
          <ProtectedRoute roles={["STUDENT"]}>
            <AppShell>
              <ProblemsPage />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/problems/:slug"
        element={
          <ProtectedRoute roles={["STUDENT"]}>
            <AppShell>
              <ProblemWorkspacePage />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/contest"
        element={
          <ProtectedRoute roles={["STUDENT"]}>
            <AppShell>
              <ContestListPage />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/contest/:id"
        element={
          <ProtectedRoute roles={["STUDENT"]}>
            <AppShell>
              <ContestDetailPage />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/leaderboard"
        element={
          <ProtectedRoute roles={["STUDENT"]}>
            <AppShell>
              <LeaderboardPage />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/department-war"
        element={
          <ProtectedRoute roles={["STUDENT"]}>
            <AppShell>
              <DepartmentWarPage />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute roles={["STUDENT", "TEACHER", "ADMIN"]}>
            <AppShell>
              <UserProfilePage />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile/connections"
        element={
          <ProtectedRoute roles={["STUDENT", "TEACHER", "ADMIN"]}>
            <AppShell>
              <ConnectionsPage />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile/:id"
        element={
          <ProtectedRoute roles={["STUDENT", "TEACHER", "ADMIN"]}>
            <AppShell>
              <UserProfilePage />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile/:id/connections"
        element={
          <ProtectedRoute roles={["STUDENT", "TEACHER", "ADMIN"]}>
            <AppShell>
              <ConnectionsPage />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher"
        element={
          <ProtectedRoute roles={["TEACHER", "ADMIN"]}>
            <AppShell>
              <TeacherDashboard />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher/users"
        element={
          <ProtectedRoute roles={["TEACHER", "ADMIN"]}>
            <AppShell>
              <UserManagementPage />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher/departments"
        element={
          <ProtectedRoute roles={["TEACHER", "ADMIN"]}>
            <AppShell>
              <DepartmentsPage />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher/problems"
        element={
          <ProtectedRoute roles={["TEACHER", "ADMIN"]}>
            <AppShell>
              <TeacherProblemsPage />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher/mock-tests"
        element={
          <ProtectedRoute roles={["TEACHER", "ADMIN"]}>
            <AppShell>
              <TeacherMockTestPage />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher/analytics"
        element={
          <ProtectedRoute roles={["TEACHER", "ADMIN"]}>
            <AppShell>
              <AnalyticsPage />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher/settings"
        element={
          <ProtectedRoute roles={["TEACHER", "ADMIN"]}>
            <AppShell>
              <SettingsPage />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher/contact-admin"
        element={
          <ProtectedRoute roles={["TEACHER", "ADMIN"]}>
            <AppShell>
              <ContactAdminPage />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute roles={["ADMIN"]}>
            <AppShell>
              <AdminDashboard />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute roles={["ADMIN"]}>
            <AppShell>
              <UserManagementPage />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users/new"
        element={
          <ProtectedRoute roles={["ADMIN"]}>
            <AppShell>
              <UserCreatePage />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/problems"
        element={
          <ProtectedRoute roles={["ADMIN"]}>
            <AppShell>
              <ProblemManagementPage />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/problems/existing"
        element={
          <ProtectedRoute roles={["ADMIN"]}>
            <AppShell>
              <ExistingProblemsPage />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/contests"
        element={
          <ProtectedRoute roles={["ADMIN"]}>
            <AppShell>
              <ContestManagementPage />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/mock-tests"
        element={
          <ProtectedRoute roles={["ADMIN"]}>
            <AppShell>
              <MockTestManagementPage />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/departments"
        element={
          <ProtectedRoute roles={["ADMIN"]}>
            <AppShell>
              <DepartmentsPage />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/analytics"
        element={
          <ProtectedRoute roles={["ADMIN"]}>
            <AppShell>
              <AnalyticsPage />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/settings"
        element={
          <ProtectedRoute roles={["ADMIN"]}>
            <AppShell>
              <SettingsPage />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/placement/companies"
        element={
          <ProtectedRoute roles={["ADMIN"]}>
            <AppShell>
              <CompanyManagementPage />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/placement/questions"
        element={
          <ProtectedRoute roles={["ADMIN"]}>
            <AppShell>
              <QuestionManagementPage />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/placement"
        element={
          <ProtectedRoute roles={["STUDENT"]}>
            <AppShell>
              <PlacementHubPage />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/placement/company/:name"
        element={
          <ProtectedRoute roles={["STUDENT"]}>
            <AppShell>
              <CompanyDetailPage />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/placement/company/:companyId"
        element={
          <ProtectedRoute roles={["STUDENT"]}>
            <AppShell>
              <PlacementCompanyDetailPage />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/placement/question/:id"
        element={
          <ProtectedRoute roles={["STUDENT"]}>
            <AppShell>
              <PlacementProblemWorkspacePage />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/placement/mock-test"
        element={
          <ProtectedRoute roles={["STUDENT"]}>
            <AppShell>
              <MockTestPage />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/placement/mock-result"
        element={
          <ProtectedRoute roles={["STUDENT"]}>
            <AppShell>
              <MockTestResultPage />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/placement/leaderboard"
        element={
          <ProtectedRoute roles={["STUDENT"]}>
            <AppShell>
              <PlacementLeaderboardPage />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to={user ? "/" : "/auth"} replace />} />
    </Routes>
  );
};

export default App;
