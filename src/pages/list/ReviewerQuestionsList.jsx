import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import QuestionCard from "../../components/ui/ReviewerQuestionCard";

import {
  selectAssignedQuestions,
  selectQuestionsLoading,
  selectCurrentQuestionFilter,
} from "../../features/modules/questions/selectors";

import { selectSelectedDocument } from "../../features/modules/documents/selectors";

const ReviewerQuestionsList = ({ isDarkMode, selfAssignMode }) => {
  const assignedQuestions = useSelector(selectAssignedQuestions);
  const loading = useSelector(selectQuestionsLoading);
  const currentFilter = useSelector(selectCurrentQuestionFilter);
  const selectedDocument = useSelector(selectSelectedDocument);
  const [selectedDocKey, setSelectedDocKey] = useState(null);
  const filteredQuestions = assignedQuestions.filter((q) => {
    if (selectedDocument && q.rfp_id !== selectedDocument.rfp_id) {
      return false;
    }

    switch (currentFilter) {
      case "submitted":
        return q.is_submitted;
      case "not submitted":
        return q.submit_status === "not submitted";
      case "process":
        return q.submit_status === "process";
      case "all":
      default:
        return true;
    }
  });

  const documentGroups = filteredQuestions.reduce((acc, q) => {
    const docName = q.project_name || q.filename || "Unknown Document";
    const docKey = `${docName}_${q.rfp_id}`;

    if (!acc[docKey]) {
      acc[docKey] = {
        docName,
        fileName: q.filename,
        assignedAt: q.assigned_at,
        questions: [],
      };
    }

    acc[docKey].questions.push(q);
    return acc;
  }, {});

  useEffect(() => {
    if (selectedDocKey && !documentGroups[selectedDocKey]) {
      setSelectedDocKey(null);
    }
  }, [selectedDocKey, documentGroups]);

  // Auto-select first document when data loads to prevent empty state
  useEffect(() => {
    const documents = Object.entries(documentGroups);

    // Auto-select first document if:
    // 1. No document is currently selected
    // 2. Documents are available
    // 3. Questions exist
    if (!selectedDocKey && documents.length > 0 && filteredQuestions.length > 0) {
      setSelectedDocKey(documents[0][0]);
    }
  }, [documentGroups, selectedDocKey, filteredQuestions.length]);

  // Calculate counts from ALL assigned questions (not filtered by status)
  // Only filter by selectedDocument if one is selected
  const questionsForCounting = selectedDocument
    ? assignedQuestions.filter((q) => q.rfp_id === selectedDocument.rfp_id)
    : assignedQuestions;

  const totalQuestionsCount = questionsForCounting.length;
  const submittedCount = questionsForCounting.filter((q) => q.is_submitted || q.submit_status === "submitted").length;
  const notSubmittedCount = questionsForCounting.filter(
    (q) => q.submit_status === "not submitted"
  ).length;
  const processCount = questionsForCounting.filter(
    (q) => q.submit_status === "process"
  ).length;

  const documents = Object.entries(documentGroups);

  if (loading) {
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

  if (!filteredQuestions.length && selfAssignMode) {
    return null;
  }

  return (
    <div
      className={`p-6 rounded-xl shadow-xl ${isDarkMode
        ? "bg-gray-800 border border-gray-600"
        : "bg-white border border-gray-200"
        }`}
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-2 h-8 bg-purple-500 rounded-full" />
        <h2
          className={`text-xl font-semibold ${isDarkMode ? "text-white" : "text-gray-900"
            }`}
        >
          Responses in Process
        </h2>
        {currentFilter === "all" && (
          <span className="bg-purple-500/20 text-purple-400 px-2 py-1 rounded-full text-xs">
            {totalQuestionsCount} questions
          </span>
        )}

        {currentFilter === "submitted" && (
          <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
            Submitted: <b>{submittedCount}</b>
          </span>
        )}

        {currentFilter === "not submitted" && (
          <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs">
            Not for me: <b>{notSubmittedCount}</b>
          </span>
        )}

        {currentFilter === "process" && (
          <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs">
            Pending: <b>{processCount}</b>
          </span>
        )}
      </div>

      {/* Show empty state inside the box */}
      {!filteredQuestions.length ? (
        <div className="text-center py-12">
          <div
            className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${isDarkMode ? "bg-gray-700" : "bg-gray-200"
              }`}
          >
            <span className="text-2xl">📝</span>
          </div>

          <p
            className={`text-lg ${isDarkMode ? "text-gray-400" : "text-gray-600"
              }`}
          >
            No questions found
          </p>

          <p className="text-sm mt-1 text-gray-500">
            {currentFilter === "all"
              ? "No questions assigned to you yet"
              : `No ${currentFilter} questions found`}
          </p>
        </div>
      ) : (
        <>
          <div className="flex gap-4 overflow-x-auto pb-4 mb-8">
            {documents.map(([docKey, doc]) => {
              const isSelected = selectedDocKey === docKey;

              return (
                <div
                  key={docKey}
                  onClick={() => setSelectedDocKey(docKey)}
                  className={`min-w-[260px] cursor-pointer rounded-xl p-5 border-2 transition-all border ${isSelected
                    ? isDarkMode
                      ? "border-4 bg-gray-600/40 border-purple-500"
                      : "border-4 bg-gray-100 border-purple-500"
                    : isDarkMode
                      ? "bg-gray-700/50 border-gray-600 hover:border-purple-400"
                      : "bg-gray-100 border-gray-300 hover:border-purple-400"
                    }`}
                >
                  <div className="flex flex-col items-center text-center gap-2">
                    <div className="w-12 h-12 bg-purple-500/30 rounded-lg flex items-center justify-center">
                      <span className="text-2xl">📄</span>
                    </div>

                    <h3
                      className={`font-semibold text-sm truncate max-w-full ${isDarkMode ? "text-white" : "text-gray-900"
                        }`}
                      title={doc.fileName}
                    >
                      {doc.docName}
                    </h3>

                    {doc.assignedAt && (
                      <p className="text-xs text-gray-500">
                        {new Date(doc.assignedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {!selectedDocKey ? (
            <div className="text-center py-5 text-gray-500">
              <span>📄</span>Please select a document to view questions
            </div>
          ) : documentGroups[selectedDocKey] ? (
            <div className="space-y-3">
              {documentGroups[selectedDocKey].questions.map(
                (question, index) => (
                  <QuestionCard
                    key={question.question_id}
                    question={question}
                    index={index}
                    isDarkMode={isDarkMode}
                    isReviewerMode
                  />
                )
              )}
            </div>
          ) : null}
        </>
      )}
    </div>
  );
};

export default ReviewerQuestionsList;