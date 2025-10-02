import { createBrowserRouter } from "react-router-dom";
import App from "@/App";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import DashboardPage from "@/pages/DashboardPage";
import SummarizePage from "@/pages/SummarizePage";
import HistoryPage from "@/pages/HistoryPage";
import AdminDashboardPage from "@/pages/AdminDashboardPage";
import EditorDashboardPage from "@/pages/EditorDashboardPage";
import ReviewerDashboardPage from "@/pages/ReviewerDashboardPage";
import MainLayout from "@/layout/MainLayout";
import ProtectedRoute from "@/components/ProtectedRoute";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/register", 
    element: <RegisterPage />,
  },
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute>
        <MainLayout>
          <DashboardPage />
        </MainLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/summarize",
    element: (
      <ProtectedRoute>
        <MainLayout>
          <SummarizePage />
        </MainLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/history",
    element: (
      <ProtectedRoute>
        <MainLayout>
          <HistoryPage />
        </MainLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin",
    element: (
      <ProtectedRoute>
        <MainLayout>
          <AdminDashboardPage />
        </MainLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/editor",
    element: (
      <ProtectedRoute>
        <MainLayout>
          <EditorDashboardPage />
        </MainLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/reviewer",
    element: (
      <ProtectedRoute>
        <MainLayout>
          <ReviewerDashboardPage />
        </MainLayout>
      </ProtectedRoute>
    ),
  },
  // Redirect root to dashboard for authenticated users, login for others
  {
    path: "*",
    element: <App />,
  },
]);

export default router;