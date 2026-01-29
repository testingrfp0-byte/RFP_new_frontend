import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";

import { useTheme } from "../../contexts/ThemeContext";
import { useUser } from "../../contexts/UserContext";

// Redux
import {
  fetchDocumentsRequest,
} from "../../features/modules/documents/documentsSlice";

import {
  fetchAssignedQuestionsRequest,
  fetchFilterQuestionsRequest,
  fetchSubmittedQuestionsRequest,
  fetchCheckSubmitRequest,
} from "../../features/modules/questions/questionsSlice";

import {
  setCurrentUser,
} from "../../features/modules/users/usersSlice";

import { selectUserRole } from "../../features/modules/users/selectors";

// Dashboards
import AdminDashboard from "./AdminDashboard";
import ReviewersDashboard from "./ReviwersDashboard";

const Home = ({ pageType = "home", selfAssignMode = false }) => {
  const { isDarkMode } = useTheme();
  const { fetchUserDetails } = useUser();
  const dispatch = useDispatch();
  const location = useLocation();

  const userRole = useSelector(selectUserRole);
  const [initialLoading, setInitialLoading] = useState(true);

  // Init session and fetch user details
  useEffect(() => {
    const session = localStorage.getItem("session");
    if (session) {
      const parsed = JSON.parse(session);
      dispatch(setCurrentUser(parsed));

      // Fetch user details to get profile image
      if (parsed.userId) {
        // console.log("Home: Fetching user details for userId:", parsed.userId);
        fetchUserDetails(parsed.userId);
      }
    }
  }, [dispatch, fetchUserDetails]);

  // Role-based fetching
  useEffect(() => {
    if (!userRole) return;

    if (userRole === "admin") {
      dispatch(fetchDocumentsRequest());
    }

    if (userRole === "reviewer" || (selfAssignMode && userRole !== "admin")) {
      dispatch(fetchAssignedQuestionsRequest());
      dispatch(fetchFilterQuestionsRequest());
    }

    if (userRole === "admin" && location.pathname === "/submitted-questions") {
      dispatch(fetchSubmittedQuestionsRequest());
      dispatch(fetchCheckSubmitRequest());
    }

    setInitialLoading(false);
  }, [userRole, selfAssignMode, location.pathname, dispatch]);


  if (initialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-500" />
      </div>
    );
  }

  if (userRole === "reviewer" || (selfAssignMode && userRole == "admin")) {
    return (
      <ReviewersDashboard
        isDarkMode={isDarkMode}
        selfAssignMode={selfAssignMode}
      />
    );
  }

  if (userRole === "admin" && location.pathname === "/self-assign") {
    return <SelfAssignDashboard />;
  }

  if (userRole === "admin") {
    return (
      <AdminDashboard
        isDarkMode={isDarkMode}
        pageType={pageType}
      />
    );
  }

  return null;
};

export default Home;
