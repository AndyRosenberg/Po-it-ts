import { Route, Routes, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import { SignUp } from "./pages/SignUp";
import { Login } from "./pages/Login";
import { CreatePoem } from "./pages/CreatePoem";
import { ViewPoem } from "./pages/ViewPoem";
import { EditPoem } from "./pages/EditPoem";
import { PublicPoems } from "./pages/PublicPoems";
import { Settings } from "./pages/Settings";
import { ForgotPassword } from "./pages/ForgotPassword";
import { ResetPassword } from "./pages/ResetPassword";
import UserProfile from "./pages/UserProfile";
import { useAuthContext } from "./hooks/useAuthContext";

// Protected route component
const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { authUser, isLoading } = useAuthContext();
  
  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
    </div>;
  }
  
  if (!authUser) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/signup" element={<SignUp />} />
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      
      {/* Protected routes */}
      <Route path="/" element={
        <ProtectedRoute>
          <Home />
        </ProtectedRoute>
      } />
      <Route path="/poems/create" element={
        <ProtectedRoute>
          <CreatePoem />
        </ProtectedRoute>
      } />
      <Route path="/poems/:poemId" element={
        <ProtectedRoute>
          <ViewPoem />
        </ProtectedRoute>
      } />
      <Route path="/poems/:poemId/edit" element={
        <ProtectedRoute>
          <EditPoem />
        </ProtectedRoute>
      } />
      <Route path="/explore" element={
        <ProtectedRoute>
          <PublicPoems />
        </ProtectedRoute>
      } />
      <Route path="/settings" element={
        <ProtectedRoute>
          <Settings />
        </ProtectedRoute>
      } />
      <Route path="/profile/:userId" element={
        <ProtectedRoute>
          <UserProfile />
        </ProtectedRoute>
      } />
    </Routes>
  );
}