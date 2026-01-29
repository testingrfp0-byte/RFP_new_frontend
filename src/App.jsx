import { useCallback, useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { Provider, useDispatch, useSelector } from "react-redux";

import { store } from "../src/app/store";
import { ThemeProvider, useTheme } from "./contexts/ThemeContext";
import { UserProvider } from "./contexts/UserContext";

import Login from "./pages/authentication/Login";
import Register from "./pages/authentication/Register";
import VerifyEmailByOtp from "./pages/authentication/VerifyEmailByOtp";
import ForgotPassword from "./pages/authentication/ForgotPassword";
import ResetPassword from "./pages/authentication/ResetPassword";
import ChangePassword from "./pages/authentication/ChangePassword";
import AdminRegister from "./pages/authentication/AdminRegister";
import RegisterVerification from "./pages/authentication/RegisterVerification";
import { SimpleEmailVerification } from "./pages/authentication/SimpleEmailVerification";

import Layout from "./components/Layout";
import Profile from "./pages/profile/Profile";
import Home from "./pages/dashboard/Home";
import EnhancedUploadPdf from "./pages/report/EnhancedUploadPdf";

import { setCurrentUser } from "./features/modules/users/usersSlice";
import TeamUser from "./pages/team/TeamUser";
import SelfAssignView from "./pages/dashboard/SelfAssign";
import { RecycleBin } from "./components/ui/RecycleBin";
import ReviewerAssignedQuestions from "./pages/list/ReviewerAssignedQuestions";
import Library from "./pages/report/Library";
import RfpReport from "./pages/list/RfpReport";
import EditApproveResponse from "./pages/list/EditApproveResponse";
import SelfAssignDashboard from "./pages/dashboard/SelfAssign";

function AppContent() {
  const { isDarkMode } = useTheme();
  const dispatch = useDispatch();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState("");
  const [userRole, setUserRole] = useState("");
  const [userId, setUserId] = useState(null);
  const [sessionChecked, setSessionChecked] = useState(false);
  const [pdfList, setPdfList] = useState(false);

  useEffect(() => {
    const session = localStorage.getItem("session");
    if (session) {
      const parsed = JSON.parse(session);
      dispatch(
        setCurrentUser({
          email: parsed.email,
          role: parsed.role,
        })
      );
    }
  }, [dispatch]);

  useEffect(() => {
    const checkSession = () => {
      const session = localStorage.getItem("session");
      if (session) {
        try {
          const parsedSession = JSON.parse(session);
          setIsAuthenticated(true);
          setUserName(parsedSession.email);
          setUserRole(parsedSession.role || "reviewer");
          setUserId(parsedSession.userId);
        } catch (err) {
          console.error("Error parsing session:", err);
          localStorage.removeItem("session");
          setIsAuthenticated(false);
          setUserName("");
          setUserRole("");
          setPdfList([]);
        }
      } else {
        setIsAuthenticated(false);
        setUserName("");
        setUserRole("");
        setPdfList([]);
      }
      setSessionChecked(true);
    };
    checkSession();
    window.addEventListener("storage", checkSession);
    return () => window.removeEventListener("storage", checkSession);
  }, []);

  const handleLogout = useCallback(() => {
    localStorage.removeItem("session");
    setIsAuthenticated(false);
    setUserName("");
    setUserRole("");
  }, []);

  function PrivateRoute({ children }) {
    if (!sessionChecked) {
      return null;
    }
    return isAuthenticated ? children : <Navigate to="/login" />;
  }

  return (
    <Router>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        theme={isDarkMode ? "dark" : "light"}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss={false}
        draggable
        pauseOnHover
        limit={5}
        style={{ zIndex: 9999 }}
      />

      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-email-otp" element={<VerifyEmailByOtp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/admin-register" element={<AdminRegister />} />
        <Route path="/register-verification" element={<RegisterVerification />} />
        <Route path="/verify-email" element={<SimpleEmailVerification />} />

        <Route
          path="/"
          element={
            <PrivateRoute>
              <Layout
                userName={userName}
                userRole={userRole}
                onLogout={handleLogout}
                userId={userId}
              >
                <Home />
              </Layout>
            </PrivateRoute>
          }
        />

        <Route
          path="/upload"
          element={
            <PrivateRoute>
              <Layout
                userName={userName}
                userRole={userRole}
                onLogout={handleLogout}
                userId={userId}
              >
                <EnhancedUploadPdf />
              </Layout>
            </PrivateRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <Layout
                userName={userName}
                userRole={userRole}
                onLogout={handleLogout}
                userId={userId}
              >
                <Profile />
              </Layout>
            </PrivateRoute>
          }
        />

        <Route
          path="/change-password"
          element={
            <PrivateRoute>
              <Layout
                userName={userName}
                userRole={userRole}
                onLogout={handleLogout}
                userId={userId}
              >
                <ChangePassword />
              </Layout>
            </PrivateRoute>
          }
        />

        <Route
          path="/team-user"
          element={
            <PrivateRoute>
              <Layout
                userName={userName}
                userRole={userRole}
                onLogout={handleLogout}
                userId={userId}
              >
                <TeamUser />
              </Layout>
            </PrivateRoute>
          }
        />

        <Route
          path="/submitted-questions"
          element={
            <PrivateRoute>
              <Layout
                userName={userName}
                userRole={userRole}
                onLogout={handleLogout}
                userId={userId}
              >
                <EditApproveResponse />
              </Layout>
            </PrivateRoute>
          }
        />

        <Route
          path="/self-assign"
          element={
            <PrivateRoute>
              <Layout
                userName={userName}
                userRole={userRole}
                onLogout={handleLogout}
                userId={userId}
              >
                <SelfAssignDashboard />
              </Layout>
            </PrivateRoute>
          }
        />

        <Route
          path="/doc-list"
          element={
            <PrivateRoute>
              <Layout
                userName={userName}
                userRole={userRole}
                onLogout={handleLogout}
                userId={userId}
              >
                <RfpReport />
              </Layout>
            </PrivateRoute>
          }
        />

        <Route
          path="/recylebin"
          element={
            <PrivateRoute>
              <Layout
                userName={userName}
                userRole={userRole}
                onLogout={handleLogout}
                userId={userId}
              >
                <RecycleBin />
              </Layout>
            </PrivateRoute>
          }
        />

        <Route
          path="/submitted-questions/:documentId"
          element={
            <PrivateRoute>
              <Layout
                userName={userName}
                userRole={userRole}
                onLogout={handleLogout}
                userId={userId}
              >
                <ReviewerAssignedQuestions />
              </Layout>
            </PrivateRoute>
          }
        />

        <Route
          path="/reviewer-assigned-questions"
          element={
            <PrivateRoute>
              <Layout
                userName={userName}
                userRole={userRole}
                onLogout={handleLogout}
                userId={userId}
              >
                <ReviewerAssignedQuestions />
              </Layout>
            </PrivateRoute>
          }
        />

        <Route
          path="/library"
          element={
            <PrivateRoute>
              <Layout
                userName={userName}
                userRole={userRole}
                onLogout={handleLogout}
                userId={userId}
              >
                <Library />
              </Layout>
            </PrivateRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <UserProvider>
          <AppContent />
        </UserProvider>
      </ThemeProvider>
    </Provider>
  );
}
