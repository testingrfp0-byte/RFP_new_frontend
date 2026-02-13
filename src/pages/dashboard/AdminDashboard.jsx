import React, { useRef, useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

import { useDispatch, useSelector } from "react-redux";
import { useMemo } from "react";
import DocumentLibrary from "../list/DocumentLibrary";
import DocumentDetails from "../list/DocumentDetails";
import SubmittedQuestions from "./SubmittedQuestions";
import ToasterNotification from "../../components/ui/ToasterNotification";
import {
  selectDocuments,
  selectSelectedDocument,
  selectDocumentsLoading,
} from "../../features/modules/documents/selectors";
import {
  selectDocument,
} from "../../features/modules/documents/documentsSlice";
import {
  fetchDocumentDetailsRequest,
  fetchFilterDataRequest,
} from "../../features/modules/documents/documentsSlice";
import {
  fetchAssignedReviewersRequest,
} from "../../features/modules/assignments/assignmentsSlice";
import { fetchUsersRequest } from "../../features/modules/users/usersSlice";

const AdminDashboard = ({ isDarkMode, pageType }) => {
  const dispatch = useDispatch();
  const location = useLocation();
  const documentAnalysisRef = useRef(null);
  const documents = useSelector(selectDocuments);
  const documentsLoading = useSelector(selectDocumentsLoading);
  const selectedDocument = useSelector(selectSelectedDocument);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Track when documents are loaded for the first time
  useEffect(() => {
    dispatch(fetchUsersRequest());
    if (documents && documents.length > 0) {
      setIsInitialLoad(false);
    }
  }, [documents, dispatch]);

  const handleDocumentSelect = (document) => {
    dispatch(selectDocument(document));

    dispatch(fetchFilterDataRequest(document.id));
    dispatch(fetchDocumentDetailsRequest({
      id: document.id,
      status: "total question",
    }));
    dispatch(fetchAssignedReviewersRequest({ documentId: document.id }));

    setTimeout(() => {
      documentAnalysisRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 100);
  };

  const historyDocuments = useMemo(() => {
    return (documents || []).filter(
      (doc) => doc.category === "history"
    );
  }, [documents]);

  // Main big loader - only show on initial load
  if (documentsLoading && isInitialLoad) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center transition-colors ${isDarkMode ? "bg-gray-900" : "bg-gray-50"
          }`}
      >
        <div
          className={`p-8 rounded-xl shadow-2xl text-center transition-colors ${isDarkMode
            ? "bg-gray-800 border border-gray-700"
            : "bg-white border border-gray-200"
            }`}
        >
          <div className="mb-6">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-500 mx-auto"></div>
          </div>
          <h2
            className={`text-2xl font-bold mb-2 transition-colors ${isDarkMode ? "text-white" : "text-gray-900"
              }`}
          >
            📄 RFP Response Generator
          </h2>
          <p
            className={`mb-4 transition-colors ${isDarkMode ? "text-gray-300" : "text-gray-600"
              }`}
          >
            Loading your dashboard...
          </p>
          <div className="flex justify-center space-x-1">
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
            <div
              className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"
              style={{ animationDelay: "0.1s" }}
            ></div>
            <div
              className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"
              style={{ animationDelay: "0.2s" }}
            ></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-4 ${isDarkMode ? "bg-gray-900" : "bg-gray-50"}`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          {pageType === "home" ? (
            <h1 className={`text-3xl font-bold flex gap-3 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
              <span className="text-4xl">📄</span>
              RFP Response Generator
            </h1>
          ) : (
            <h1 className={`text-3xl font-bold flex gap-3 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
              <span className="text-4xl">✅</span>
              Edit and Approve Responses
            </h1>
          )}
          <p className={`${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
            Manage and analyze your RFP documents with AI-powered insights
          </p>
        </div>

        {/* Document Library */}
        <div
          className={`p-6 rounded-xl shadow-xl mb-6 ${isDarkMode
            ? "bg-gray-800 border border-gray-600"
            : "bg-white border-gray-200"
            }`}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-2 h-8 bg-purple-500 rounded-full"></div>

            <h2
              className={`text-xl font-semibold ${isDarkMode ? "text-white" : "text-gray-900"
                }`}
            >
              {location.pathname === "/submitted-questions"
                ? "Document Library"
                : "Responses in Process"}
            </h2>
          </div>

          <DocumentLibrary
            documents={historyDocuments}
            isDarkMode={isDarkMode}
            onDocumentSelect={handleDocumentSelect}
            showAdminActions={false}
            showDelete={true}
          />
        </div>

        {/* Details */}
        {selectedDocument && (
          <div ref={documentAnalysisRef}>
            {location.pathname === "/submitted-questions" ? (
              <SubmittedQuestions isDarkMode={isDarkMode} />
            ) : (
              <DocumentDetails isDarkMode={isDarkMode} />
            )}
          </div>
        )}
      </div>

      <ToasterNotification />
    </div>
  );
};

export default AdminDashboard;
