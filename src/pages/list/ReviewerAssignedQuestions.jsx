
import React, { useEffect, useRef, useState } from "react";
import { useTheme } from "../../contexts/ThemeContext";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { ToastContainer } from "react-toastify";
import ToasterNotification from "../../components/ui/ToasterNotification";

import {
  CHECK_USER_ROLE_REQUEST,
  FETCH_REVIEWERS_REQUEST,
  FETCH_REVIEWER_QUESTIONS_REQUEST,
  FETCH_DOCUMENT_QUESTIONS_REQUEST,
  REMOVE_REVIEWER_QUESTION_REQUEST,
} from "../../features/reviewerAssigned/reviewerAssignedTypes";

import {
  selectReviewers,
  selectAssignedQuestions,
  selectDocumentQuestions,
  selectSelectedReviewer,
  selectReviewerLoading,
  selectReviewerError,
  selectRemovingQuestion,
  selectUserRole,
} from "../../features/reviewerAssigned/reviewerAssignedSelectors";

export default function ReviewerAssignedQuestions() {
  const { isDarkMode } = useTheme();
  const dispatch = useDispatch();
  const { documentId } = useParams();
  const reviewers = useSelector(selectReviewers);
  const assignedQuestions = useSelector(selectAssignedQuestions);
  const documentQuestions = useSelector(selectDocumentQuestions);
  const selectedReviewer = useSelector(selectSelectedReviewer);
  const loading = useSelector(selectReviewerLoading);
  const error = useSelector(selectReviewerError);
  const removingQuestion = useSelector(selectRemovingQuestion);
  const userRole = useSelector(selectUserRole);
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [filterStatus, setFilterStatus] = useState("all");
  const [submittedCount, setSubmittedCount] = useState(0);
  const [notSubmittedCount, setNotSubmittedCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [toasterNotification, setToasterNotification] = useState(null);
  const calledOnceRef = useRef(false);

  const applyFilter = (status, data) => {
    if (status === "all") return data;
    return data.filter((q) => q.status === status);
  };

  const handleFilterClick = (status) => {
    setFilterStatus(status);
    const baseData = documentId ? documentQuestions : assignedQuestions;
    setFilteredQuestions(applyFilter(status, baseData));
  };

  const calculateCounts = (questions) => {
    const submitted = questions.filter((q) => q.status === "submitted").length;
    const notSubmitted = questions.filter(
      (q) => q.status === "not submitted"
    ).length;
    const pending = questions.filter(
      (q) => !q.status || q.status === "process"
    ).length;

    setSubmittedCount(submitted);
    setNotSubmittedCount(notSubmitted);
    setPendingCount(pending);
    setTotalCount(questions.length);
  };

  useEffect(() => {
    if (!calledOnceRef.current) {
      dispatch({ type: CHECK_USER_ROLE_REQUEST });
      calledOnceRef.current = true;
    }
  }, [dispatch]);

  useEffect(() => {
    if (documentId) {
      dispatch({
        type: FETCH_DOCUMENT_QUESTIONS_REQUEST,
        payload: documentId,
      });
    } else if (userRole && userRole !== "reviewer") {
      dispatch({ type: FETCH_REVIEWERS_REQUEST });
    }
  }, [dispatch, userRole, documentId]);

  useEffect(() => {
    const data = documentId ? documentQuestions : assignedQuestions;
    calculateCounts(data);
    setFilteredQuestions(applyFilter(filterStatus, data));
  }, [assignedQuestions, documentQuestions, filterStatus]);

  const fetchReviewerQuestions = (username) => {
    dispatch({
      type: FETCH_REVIEWER_QUESTIONS_REQUEST,
      payload: username,
    });
  };

  const handleRemoveQuestion = (question) => {
    dispatch({
      type: REMOVE_REVIEWER_QUESTION_REQUEST,
      payload: {
        ques_id:
          question.ques_id ||
          question.question_id ||
          question.id ||
          question.question,
        user_id: question.user_id,
      },
    });
  };

  if (documentId) {
    return (
      <div
        className={`min-h-screen p-4 transition-colors ${isDarkMode ? "bg-gray-900" : "bg-gray-50"
          }`}
      >
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1
              className={`text-3xl font-bold mb-2 flex items-center gap-3 transition-colors ${isDarkMode ? "text-white" : "text-gray-900"
                }`}
            >
              <span className="text-4xl">📄</span>
              Questions for Document
            </h1>
            <p
              className={`transition-colors ${isDarkMode ? "text-gray-400" : "text-gray-600"
                }`}
            >
              View questions associated with this document
            </p>
          </div>

          {error && (
            <div className="mb-6 bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-500"></div>
              <span
                className={`ml-3 transition-colors ${isDarkMode ? "text-gray-300" : "text-gray-600"
                  }`}
              >
                Loading questions...
              </span>
            </div>
          ) : filteredQuestions.length > 0 ? (
            <div className="space-y-4">
              {filteredQuestions.map((question, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-lg transition-colors ${isDarkMode
                    ? "bg-gray-700 border border-gray-600"
                    : "bg-gray-50 border border-gray-200"
                    }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3 flex-1">
                      <span className="text-purple-400">
                        Q {question.question_text?.split(" ")[0]}
                      </span>
                      <span
                        className={`font-medium text-sm leading-relaxed transition-colors ${isDarkMode ? "text-white" : "text-gray-900"
                          }`}
                      >
                        {question.question_text?.substring(
                          question.question_text?.indexOf(" ") + 1
                        )}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <div
                        className={`px-3 py-1 rounded-full text-xs font-medium ${question.status === "submitted"
                          ? "bg-green-100 text-green-800 border border-green-200"
                          : question.status === "not submitted"
                            ? "bg-orange-100 text-orange-800 border border-orange-200"
                            : "bg-gray-100 text-gray-800 border border-gray-200"
                          }`}
                      >
                        {question.status === "submitted"
                          ? "✅ Submitted"
                          : question.status === "not submitted"
                            ? "❌ Not for Me"
                            : "⏳ Pending"}
                      </div>
                    </div>
                  </div>
                  {question.answer && (
                    <div className="mt-3">
                      <label
                        className={`block text-xs font-medium mb-2 transition-colors ${isDarkMode ? "text-gray-300" : "text-gray-700"
                          }`}
                      >
                        Answer:
                      </label>
                      <div
                        className={`p-3 rounded-lg transition-colors ${isDarkMode
                          ? "bg-gray-800 border border-gray-600 text-white"
                          : "bg-white border border-gray-300 text-gray-900"
                          }`}
                      >
                        <p className="text-sm whitespace-pre-line leading-relaxed">
                          {question.answer}
                        </p>
                      </div>
                    </div>
                  )}
                  {question.submitted_at && (
                    <p
                      className={`text-xs mt-2 transition-colors ${isDarkMode ? "text-gray-400" : "text-gray-500"
                        }`}
                    >
                      Submitted on:{" "}
                      {new Date(question.submitted_at).toLocaleString()}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div
                className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors ${isDarkMode ? "bg-gray-700" : "bg-gray-200"
                  }`}
              >
                <span
                  className={`text-2xl transition-colors ${isDarkMode ? "text-gray-500" : "text-gray-400"
                    }`}
                >
                  ❓
                </span>
              </div>
              <p
                className={`text-lg transition-colors ${isDarkMode ? "text-gray-400" : "text-gray-600"
                  }`}
              >
                No questions found for this document.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`p-4 transition-colors ${isDarkMode ? "bg-gray-900" : "bg-gray-50"
        }`}
    >
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1
            className={`text-3xl font-bold mb-2 flex items-center gap-3 transition-colors ${isDarkMode ? "text-white" : "text-gray-900"
              }`}
          >
            <span className="text-4xl">📋</span>
            Reviewer Assigned Questions
          </h1>
          <p
            className={`transition-colors ${isDarkMode ? "text-gray-400" : "text-gray-600"
              }`}
          >
            View questions assigned to reviewers and their status
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div
            className={`p-6 rounded-xl shadow-xl transition-colors ${isDarkMode
              ? "bg-gray-800 border border-gray-700"
              : "bg-white border border-gray-200"
              }`}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-2 h-8 bg-purple-500 rounded-full"></div>
              <h2
                className={`text-xl font-semibold transition-colors ${isDarkMode ? "text-white" : "text-gray-900"
                  }`}
              >
                Reviewers
              </h2>
              <span className="bg-purple-500/20 text-purple-400 px-2 py-1 rounded-full text-xs">
                {reviewers.length} reviewers
              </span>
            </div>

            {/* Select reviwers */}
            {reviewers.length > 0 ? (
              <div className="space-y-3">
                {reviewers.map((reviewer, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-lg cursor-pointer transition-all duration-200 ${selectedReviewer === reviewer.username
                      ? "bg-purple-600 text-white shadow-lg"
                      : isDarkMode
                        ? "bg-gray-700 hover:bg-gray-650 text-gray-300"
                        : "bg-gray-50 hover:bg-gray-100 text-gray-700"
                      }`}
                    onClick={() => fetchReviewerQuestions(reviewer.username)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-sm">
                          {reviewer.username}
                        </h3>
                        {reviewer.email && (
                          <p
                            className={`text-xs mt-1 ${selectedReviewer === reviewer.username
                              ? "text-purple-200"
                              : isDarkMode
                                ? "text-gray-400"
                                : "text-gray-500"
                              }`}
                          >
                            {reviewer.email}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <div
                          className={`text-xs ${selectedReviewer === reviewer.username
                            ? "text-purple-200"
                            : isDarkMode
                              ? "text-gray-400"
                              : "text-gray-500"
                            }`}
                        >
                          {reviewer.totalQuestions} questions
                        </div>
                        <div
                          className={`text-xs ${selectedReviewer === reviewer.username
                            ? "text-purple-200"
                            : isDarkMode
                              ? "text-gray-400"
                              : "text-gray-500"
                            }`}
                        >
                          {reviewer.submittedQuestions} submitted
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 transition-colors ${isDarkMode ? "bg-gray-700" : "bg-gray-200"
                    }`}
                >
                  <span
                    className={`text-xl transition-colors ${isDarkMode ? "text-gray-500" : "text-gray-400"
                      }`}
                  >
                    👥
                  </span>
                </div>
                <p
                  className={`text-sm transition-colors ${isDarkMode ? "text-gray-400" : "text-gray-600"
                    }`}
                >
                  No reviewers found
                </p>
              </div>
            )}
          </div>

          <div
            className={`lg:col-span-2 p-6 rounded-xl shadow-xl transition-colors ${isDarkMode
              ? "bg-gray-800 border border-gray-700"
              : "bg-white border border-gray-200"
              }`}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-2 h-8 bg-purple-500 rounded-full"></div>
              <h2
                className={`text-xl font-semibold transition-colors ${isDarkMode ? "text-white" : "text-gray-900"
                  }`}
              >
                {selectedReviewer
                  ? `Questions for ${selectedReviewer}`
                  : "Select a Reviewer"}
              </h2>
              {selectedReviewer && (
                <span className="bg-purple-500/20 text-purple-400 px-2 py-1 rounded-full text-xs">
                  {filteredQuestions.length} questions
                </span>
              )}
            </div>

            {selectedReviewer && (
              <div
                className={`gap-3 mb-6 flex items-center justify-start p-4 rounded-lg transition-colors ${isDarkMode
                  ? "bg-gray-700 hover:bg-gray-650"
                  : "bg-gray-50 hover:bg-gray-100"
                  }`}
              >
                <span className="text-purple-400 text-lg">📊</span>
                <h3
                  className={`text-xg font-semibold transition-colors ${isDarkMode ? "text-white" : "text-gray-900"
                    }`}
                >
                  Questions Status
                </h3>
                <div className="w-md">
                  <select
                    value={filterStatus}
                    onChange={(e) => handleFilterClick(e.target.value)}
                    className={`flex-grow px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isDarkMode
                      ? "bg-gray-700 text-gray-300 border border-gray-600 focus:ring-purple-500 focus:border-purple-500"
                      : "bg-white text-gray-700 border border-gray-300 focus:ring-purple-500 focus:border-purple-500"
                      }`}
                  >
                    <option value="submitted">
                      Submitted: {submittedCount}
                    </option>
                    <option value="not submitted">
                      Not for me: {notSubmittedCount}
                    </option>
                    <option value="process">Pending: {pendingCount}</option>
                    <option value="all">Total Questions: {totalCount}</option>
                  </select>
                </div>
              </div>
            )}

            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-500"></div>
                <span
                  className={`ml-3 transition-colors ${isDarkMode ? "text-gray-300" : "text-gray-600"
                    }`}
                >
                  Loading questions...
                </span>
              </div>
            ) : selectedReviewer ? (
              filteredQuestions.length > 0 ? (
                <div className="space-y-4">
                  {filteredQuestions.map((question, idx) => {
                    const questionId =
                      question.ques_id || question.question_id || question.id;

                    return (
                      <div
                        key={idx}
                        className={`p-4 rounded-lg transition-colors ${isDarkMode
                          ? "bg-gray-700 border border-gray-600"
                          : "bg-gray-50 border border-gray-200"
                          }`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-start gap-3 flex-1">
                            <span className="text-purple-400">
                              Q {question?.question?.split(" ")[0]}
                            </span>
                            <span
                              className={`font-medium text-sm leading-relaxed transition-colors ${isDarkMode ? "text-white" : "text-gray-900"
                                }`}
                            >
                              {question?.question?.substring(
                                question?.question.indexOf(" ") + 1
                              )}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 ml-4">
                            <div
                              className={`px-3 py-1 rounded-full text-xs font-medium ${question.status === "submitted"
                                ? "bg-green-100 text-green-800 border border-green-200"
                                : question.status === "not submitted"
                                  ? "bg-orange-100 text-orange-800 border border-orange-200"
                                  : "bg-gray-100 text-gray-800 border border-gray-200"
                                }`}
                            >
                              {question.status === "submitted"
                                ? "✅ Submitted"
                                : question.status === "not submitted"
                                  ? "❌ Not for Me"
                                  : "⏳ Pending"}
                            </div>

                            <button
                              onClick={() => handleRemoveQuestion(question)}
                              disabled={removingQuestion === questionId}
                              className={`bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg text-xs font-medium flex items-center gap-1
    ${removingQuestion === questionId ? "opacity-50 cursor-not-allowed" : ""}
  `}
                            >
                              {removingQuestion === questionId ? (
                                <>
                                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                                  Removing...
                                </>
                              ) : (
                                <>
                                  🗑️ Remove
                                </>
                              )}
                            </button>
                          </div>
                        </div>

                        {question.answer && (
                          <div className="mt-3">
                            <label
                              className={`block text-xs font-medium mb-2 transition-colors ${isDarkMode ? "text-gray-300" : "text-gray-700"
                                }`}
                            >
                              Answer:
                            </label>
                            <div
                              className={`p-3 rounded-lg transition-colors ${isDarkMode
                                ? "bg-gray-800 border border-gray-600 text-white"
                                : "bg-white border border-gray-300 text-gray-900"
                                }`}
                            >
                              <p className="text-sm whitespace-pre-line leading-relaxed">
                                {question.answer}
                              </p>
                            </div>
                          </div>
                        )}

                        {question.submitted_at && (
                          <p
                            className={`text-xs mt-2 transition-colors ${isDarkMode ? "text-gray-400" : "text-gray-500"
                              }`}
                          >
                            Submitted on:{" "}
                            {new Date(question.submitted_at).toLocaleString()}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div
                    className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors ${isDarkMode ? "bg-gray-700" : "bg-gray-200"
                      }`}
                  >
                    <span
                      className={`text-2xl transition-colors ${isDarkMode ? "text-gray-500" : "text-gray-400"
                        }`}
                    >
                      📝
                    </span>
                  </div>
                  <p
                    className={`text-lg transition-colors ${isDarkMode ? "text-gray-400" : "text-gray-600"
                      }`}
                  >
                    No questions match the current filter
                  </p>
                </div>
              )
            ) : (
              <div className="text-center py-12">
                <div
                  className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors ${isDarkMode ? "bg-gray-700" : "bg-gray-200"
                    }`}
                >
                  <span
                    className={`text-2xl transition-colors ${isDarkMode ? "text-gray-500" : "text-gray-400"
                      }`}
                  >
                    👥
                  </span>
                </div>
                <p
                  className={`text-lg transition-colors ${isDarkMode ? "text-gray-400" : "text-gray-600"
                    }`}
                >
                  Select a reviewer to view their assigned questions
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {toasterNotification && (
        <ToasterNotification
          message={toasterNotification.message}
          type={toasterNotification.type}
          onClose={() => setToasterNotification(null)}
        />
      )}
    </div>
  );
}