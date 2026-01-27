import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTheme } from "../../contexts/ThemeContext";
import { useNavigate } from "react-router-dom";
import EditQuestionDialog from "../../components/ui/EditQuestionDialog";
import { toast, ToastContainer } from "react-toastify";

import {
  fetchCheckSubmitRequest,
  reassignQuestionRequest,
  updateAdminAnswerRequest,
} from "../../features/modules/questions/questionsSlice";
import {
  selectQuestionsLoading,
  selectCheckSubmitQuestions
} from "../../features/modules/questions/selectors";
import {
  selectDocument,
  startAiAnalysisRequest,
  generateDocumentRequest,
  fetchDocumentsRequest,
  fetchFilterDataRequest,
  fetchDocumentDetailsRequest,
} from "../../features/modules/documents/documentsSlice";
import { fetchAssignedReviewersRequest } from "../../features/modules/assignments/assignmentsSlice";
import {
  selectAiAnalysisLoading,
  selectCurrentAnalyzingId,
  selectAiAnalysisResults,
  selectDocuments,
  selectDocumentsLoading,
  selectSelectedDocument
} from "../../features/modules/documents/selectors";
import {
  fetchUserDetailsRequest,
} from "../../features/modules/users/usersSlice";

export default function EditApproveResponse() {
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const documentAnalysisRef = useRef(null);

  //Use checkSubmitQuestions - this has BOTH questions AND answers
  const checkSubmitQuestions = useSelector(selectCheckSubmitQuestions);
  const questionsLoading = useSelector(selectQuestionsLoading);
  const aiAnalysisLoading = useSelector(selectAiAnalysisLoading);
  const currentAnalyzingPdfId = useSelector(selectCurrentAnalyzingId);
  const aiAnalysisResults = useSelector(selectAiAnalysisResults);

  const [expandedQuestion, setExpandedQuestion] = useState(null);
  const [loadingReassign, setLoadingReassign] = useState({});
  const [loadingCheckResponse, setLoadingCheckResponse] = useState({});
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [questionToEdit, setQuestionToEdit] = useState(null);

  const pdfList = useSelector(selectDocuments);
  const pdfLoading = useSelector(selectDocumentsLoading);
  const selectedPdf = useSelector(selectSelectedDocument);

  const [generatingDoc, setGeneratingDoc] = useState({});

  const historyPdfList = useMemo(() => {
    return (pdfList || []).filter(
      (pdf) => pdf.category === "history"
    );
  }, [pdfList]);

  //Filter and deduplicate questions by selected document
  const displayQuestions = useMemo(() => {
    if (!selectedPdf) return [];

    //Filter by document
    const filtered = checkSubmitQuestions.filter(
      (q) => q.rfp_id === selectedPdf.id || q.file_id === selectedPdf.id
    );

    //Remove duplicates by question_id
    const uniqueMap = new Map();
    filtered.forEach((q) => {
      if (q.question_id && !uniqueMap.has(q.question_id)) {
        uniqueMap.set(q.question_id, q);
      }
    });

    return Array.from(uniqueMap.values());
  }, [checkSubmitQuestions, selectedPdf]);

  //Add debug logging
  // useEffect(() => {
  //   console.log("Debug Info:");
  //   console.log("checkSubmitQuestions:", checkSubmitQuestions);
  //   console.log("selectedPdf:", selectedPdf);
  //   console.log("displayQuestions:", displayQuestions);
  // }, [checkSubmitQuestions, selectedPdf, displayQuestions]);

  const formatToastMessage = (message, maxLines = 3) => {
    if (!message) return "";
    const lines = message.split("\n");
    if (lines.length <= maxLines) return message;
    return lines.slice(0, maxLines).join("\n") + "\n...";
  };

  const extractErrorMessage = (error) => {
    if (!error) return "Something went wrong";

    const data = error.response?.data;

    // Handle your AI analysis error cleanly
    if (typeof data?.message === "string") {
      return data.message;
    }

    // Sometimes backend wraps message inside another object
    if (typeof data?.message?.message === "string") {
      return data.message.message;
    }

    return "Something went wrong";
  };


  useEffect(() => {
    const fetchAllPageData = async () => {
      try {
        const session = localStorage.getItem("session");
        if (!session) {
          navigate("/login");
          return;
        }

        const { token } = JSON.parse(session);
        if (!token) {
          navigate("/login");
          return;
        }

        dispatch(fetchDocumentsRequest());
        dispatch(fetchCheckSubmitRequest());
        dispatch(fetchUserDetailsRequest());
      } catch (error) {
        console.error("Page Load Error:", error);
      }
    };

    fetchAllPageData();
  }, [dispatch, navigate]);

  const handleHistoryPdfClick = useCallback(
    (pdf) => {
      const docId = pdf.id || pdf.rfp_id || pdf.file_id;
      if (!docId) {
        console.error("No valid ID found for PDF:", pdf);
        return;
      }

      setLoadingCheckResponse((prev) => ({ ...prev, [docId]: true }));
      dispatch(selectDocument(pdf));

      let completedAPIs = 0;
      const totalAPIs = 3;

      const checkAllDone = () => {
        completedAPIs++;
        if (completedAPIs >= totalAPIs) {
          setLoadingCheckResponse((prev) => ({ ...prev, [docId]: false }));
        }
      };

      // Call additional APIs as requested
      dispatch(
        fetchFilterDataRequest({
          rfpId: docId,
          onSuccess: checkAllDone,
          onError: checkAllDone,
        })
      );
      dispatch(
        fetchDocumentDetailsRequest({
          id: docId,
          status: "total question",
          onSuccess: checkAllDone,
          onError: checkAllDone,
        })
      );
      dispatch(
        fetchAssignedReviewersRequest({
          documentId: docId,
          onSuccess: checkAllDone,
          onError: checkAllDone,
        })
      );

      setTimeout(() => {
        documentAnalysisRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);
    },
    [dispatch]
  );

  const handleAiAnalysisPdf = useCallback(
    (rfpId) => {
      dispatch(
        startAiAnalysisRequest({
          rfpId,
          onSuccess: () => {
            toast.success("AI analysis completed successfully");
          },
          onError: (error) => {
            toast.error(
              formatToastMessage(extractErrorMessage(error)),
              { whiteSpace: "pre-line" }
            );
          },
        })
      );
    },
    [dispatch]
  );

  const handleGenerateDoc = useCallback(
    (rfpId) => {
      setGeneratingDoc((prev) => ({ ...prev, [rfpId]: true }));

      dispatch(
        generateDocumentRequest({
          rfpId,
          onSuccess: () => {
            toast.success("Document generated successfully");
            setGeneratingDoc((prev) => ({ ...prev, [rfpId]: false }));
          },
          onError: (error) => {
            toast.error(
              formatToastMessage(extractErrorMessage(error)),
              { whiteSpace: "pre-line" }
            );
            setGeneratingDoc((prev) => ({ ...prev, [rfpId]: false }));
          },
        })
      );
    },
    [dispatch]
  );

  const handleSendReview = useCallback(
    async (question) => {
      setLoadingReassign((prev) => ({ ...prev, [question.question_id]: true }));

      dispatch(
        reassignQuestionRequest({
          user_id: question.user_id,
          ques_id: question.question_id,
          file_id: question.file_id || question.rfp_id,
          onSuccess: (response) => {
            const successMessage = response?.message || "Question sent back for review";
            toast.success(successMessage);

            // Refresh data to make question disappear
            dispatch(fetchCheckSubmitRequest());
            setLoadingReassign((prev) => ({ ...prev, [question.question_id]: false }));
          },
          onError: (error) => {
            toast.error(
              formatToastMessage(extractErrorMessage(error)),
              { whiteSpace: "pre-line" }
            );
            console.error("Error:", error);
            setLoadingReassign((prev) => ({ ...prev, [question.question_id]: false }));
          },
        })
      );
    },
    [dispatch]
  );

  const handleEditSave = useCallback(
    (question_id, newAnswer) => {
      return new Promise((resolve, reject) => {
        dispatch(
          updateAdminAnswerRequest({
            questionId: question_id,
            answer: newAnswer,
            onSuccess: (response) => {
              const successMessage = response?.message || "Answer updated successfully";
              toast.success(successMessage);

              setIsEditModalOpen(false);
              setQuestionToEdit(null);

              // Refresh data
              dispatch(fetchCheckSubmitRequest());
              resolve(response);
            },
            onError: (error) => {
              const errorMessage = extractErrorMessage(error);
              toast.error(
                formatToastMessage(errorMessage),
                { whiteSpace: "pre-line" }
              );
              reject(error);
            },
          })
        );
      });
    },
    [dispatch]
  );

  const getAiAnalysisResultsForPdf = (pdfId) => {
    if (aiAnalysisResults[pdfId]) {
      return aiAnalysisResults[pdfId];
    }
    const storedResults = localStorage.getItem(`aiAnalysisResults_${pdfId}`);
    if (storedResults) {
      try {
        return JSON.parse(storedResults);
      } catch (e) {
        return null;
      }
    }
    return null;
  };

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />
      <div className={`min-h-screen p-4 transition-colors ${isDarkMode ? "bg-gray-900" : "bg-gray-50"
        }`}>
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <h1 className={`text-3xl font-bold mb-2 flex items-center gap-3 transition-colors ${isDarkMode ? "text-white" : "text-gray-900"
              }`}>
              <span className="text-4xl">✅</span>
              Edit and Approve Responses
            </h1>
            <p className={`transition-colors ${isDarkMode ? "text-gray-400" : "text-gray-600"
              }`}>
              Review and approve submitted responses from reviewers
            </p>
          </div>

          {/* Document Library */}
          <div className={`p-6 rounded-xl shadow-xl mb-6 transition-colors ${isDarkMode ? "bg-gray-800 border border-gray-600" : "bg-white border-gray-200"
            }`}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-2 h-8 bg-purple-500 rounded-full"></div>
              <h2 className={`text-xl font-semibold transition-colors ${isDarkMode ? "text-white" : "text-gray-900"
                }`}>
                Document Library
              </h2>
            </div>

            {pdfLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-500"></div>
                <span className={`ml-3 transition-colors ${isDarkMode ? "text-gray-400" : "text-gray-600"
                  }`}>
                  Loading documents...
                </span>
              </div>
            ) : historyPdfList && historyPdfList.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {historyPdfList.map((pdf) => {
                  const pdfAiResults = getAiAnalysisResultsForPdf(pdf.id);

                  return (
                    <div
                      key={pdf.id}
                      className={`rounded-lg p-4 cursor-pointer transition-all hover:border-purple-500 hover:shadow-lg hover:shadow-purple-500/20 group ${isDarkMode
                        ? "bg-gray-700 border border-gray-600 hover:bg-gray-650"
                        : "bg-gray-50 border border-gray-200 hover:bg-gray-100"
                        } ${selectedPdf && selectedPdf.id === pdf.id
                          ? `ring-2 ring-purple-500 border-purple-500 ${isDarkMode ? "bg-gray-650" : "bg-gray-100"
                          }`
                          : ""
                        }`}
                      onClick={() => handleHistoryPdfClick(pdf)}
                    >
                      <div className="flex flex-col items-center text-center">
                        <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-3 group-hover:bg-purple-500/30 transition-colors">
                          <span className="text-purple-400 text-xl">📄</span>
                        </div>
                        <h3 className={`font-semibold mb-2 truncate w-full text-sm transition-colors ${isDarkMode ? "text-white" : "text-gray-900"
                          }`} title={pdf.filename}>
                          {pdf.filename || pdf.name}
                        </h3>
                        <p className={`text-xs mb-3 transition-colors ${isDarkMode ? "text-gray-400" : "text-gray-500"
                          }`}>
                          {pdf.uploaded_at && new Date(pdf.uploaded_at).toLocaleDateString()}
                        </p>

                        {pdf.project_name && (
                          <p className={`text-xs mb-3 transition-colors ${isDarkMode ? "text-purple-300" : "text-purple-600"
                            }`}>
                            Project: {pdf.project_name}
                          </p>
                        )}

                        {pdfAiResults && (
                          <div className="mb-3 p-2 bg-blue-100 text-blue-800 rounded-lg text-xs">
                            <p>
                              Overall Score: <strong>{pdfAiResults.overall_score}</strong>
                            </p>
                            <p>
                              Questions Analyzed:{" "}
                              <strong>
                                {pdfAiResults.total_answers_analyzed} / {pdfAiResults.total_questions}
                              </strong>
                            </p>
                          </div>
                        )}

                        <div className="flex gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleHistoryPdfClick(pdf);
                            }}
                            className={`bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-2 ${loadingCheckResponse[pdf.id] ? "opacity-50 cursor-not-allowed" : ""
                              }`}
                            disabled={loadingCheckResponse[pdf.id]}
                          >
                            {loadingCheckResponse[pdf.id] ? (
                              <>
                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                                Checking...
                              </>
                            ) : (
                              "Check Responses"
                            )}
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAiAnalysisPdf(pdf.id);
                            }}
                            className={`bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${aiAnalysisLoading && currentAnalyzingPdfId === pdf.id
                              ? "opacity-50 cursor-not-allowed"
                              : ""
                              }`}
                            disabled={aiAnalysisLoading && currentAnalyzingPdfId === pdf.id}
                          >
                            {aiAnalysisLoading && currentAnalyzingPdfId === pdf.id ? (
                              <div className="flex items-center">
                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2"></div>
                                Analyzing...
                              </div>
                            ) : (
                              "AI analysis"
                            )}
                          </button>
                        </div>

                        <div className="flex gap-2 mt-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleGenerateDoc(pdf.id);
                            }}
                            className={`bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${generatingDoc[pdf.id] ? "opacity-50 cursor-not-allowed" : ""
                              }`}
                            disabled={generatingDoc[pdf.id]}
                          >
                            {generatingDoc[pdf.id] ? (
                              <div className="flex items-center">
                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2"></div>
                                Generating...
                              </div>
                            ) : (
                              "Generate Doc"
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors ${isDarkMode ? "bg-gray-700" : "bg-gray-200"
                  }`}>
                  <span className={`text-2xl transition-colors ${isDarkMode ? "text-gray-500" : "text-gray-400"
                    }`}>
                    📄
                  </span>
                </div>
                <p className={`text-lg transition-colors ${isDarkMode ? "text-gray-400" : "text-gray-600"
                  }`}>
                  No documents uploaded yet
                </p>
              </div>
            )}
          </div>

          {/* Submitted Questions Section */}
          {selectedPdf && (
            <div
              ref={documentAnalysisRef}
              className={`p-6 rounded-xl shadow-xl transition-colors ${isDarkMode ? "bg-gray-800 border border-gray-700" : "bg-white border-gray-200"
                }`}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-2 h-8 bg-purple-500 rounded-full"></div>
                <h2 className={`text-xl font-semibold transition-colors ${isDarkMode ? "text-white" : "text-gray-900"
                  }`}>
                  Edit and Approve Responses
                </h2>
                <span className="bg-purple-500/20 text-purple-400 px-2 py-1 rounded-full text-xs">
                  {displayQuestions.length} questions
                </span>
                <span className={`px-3 py-1 rounded-full text-sm transition-colors ${isDarkMode ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-600"
                  }`}>
                  {selectedPdf.filename}
                </span>
              </div>

              {questionsLoading && displayQuestions.length === 0 ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-500"></div>
                  <span className={`ml-3 ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                    Loading questions...
                  </span>
                </div>
              ) : displayQuestions.length > 0 ? (
                <div className="space-y-3">
                  {displayQuestions.map((question, idx) => {
                    //Use question.question OR question.question_text
                    const questionText = question.question || question.question_text || "";
                    //Answer is ALREADY in the question object
                    const answer = question.answer || "";

                    return (
                      <div
                        key={`${question.question_id}-${idx}`}
                        className={`rounded-lg overflow-hidden ${isDarkMode
                          ? "bg-gray-700 border border-gray-600"
                          : "bg-gray-50 border border-gray-200"
                          }`}
                      >
                        <div
                          className={`flex items-center justify-between p-4 cursor-pointer ${isDarkMode ? "hover:bg-gray-650" : "hover:bg-gray-100"
                            }`}
                          onClick={() =>
                            setExpandedQuestion(expandedQuestion === idx ? null : idx)
                          }
                        >
                          <div className="flex items-start gap-3 flex-1">
                            <span className="text-purple-400">Q {idx + 1}</span>
                            <span className={`font-medium text-sm ${isDarkMode ? "text-white" : "text-gray-900"
                              }`}>
                              {questionText}
                            </span>
                          </div>

                          <button
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors shadow-sm flex items-center gap-2 ${isDarkMode
                              ? "bg-purple-600 text-white hover:bg-purple-500"
                              : "bg-purple-100 text-purple-700 hover:bg-purple-200"
                              }`}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSendReview(question);
                            }}
                            disabled={loadingReassign[question.question_id]}
                          >
                            {loadingReassign[question.question_id] ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                Reassigning...
                              </>
                            ) : (
                              "Reassign"
                            )}
                          </button>

                          <span
                            className="text-purple-400 ml-4 cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              setIsEditModalOpen(true);
                              setQuestionToEdit({
                                ...question,
                                answer: answer
                              });
                            }}
                          >
                            ✏️
                          </span>

                          <span className="text-purple-400 ml-4">
                            {expandedQuestion === idx ? "▲" : "▼"}
                          </span>
                        </div>

                        {expandedQuestion === idx && (
                          <div className={`p-4 border-t ${isDarkMode
                            ? "bg-gray-750 border-gray-600"
                            : "bg-gray-100 border-gray-200"
                            }`}>
                            <label className={`block text-sm font-semibold mb-2 ${isDarkMode ? "text-gray-300" : "text-gray-700"
                              }`}>
                              Submitted Answer:
                            </label>

                            <div className={`w-full p-3 rounded-lg ${isDarkMode
                              ? "bg-gray-800 border border-gray-600"
                              : "bg-white border border-gray-300"
                              }`}>
                              <p className={`whitespace-pre-line ${isDarkMode ? "text-white" : "text-gray-900"
                                }`}>
                                {answer || "No answer submitted yet"}
                              </p>
                            </div>

                            {question.submitted_at && (
                              <p className={`text-sm mt-2 ${isDarkMode ? "text-gray-400" : "text-gray-500"
                                }`}>
                                Submitted on {new Date(question.submitted_at).toLocaleString()}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors ${isDarkMode ? "bg-gray-700" : "bg-gray-200"
                    }`}>
                    <span className={`text-2xl transition-colors ${isDarkMode ? "text-gray-500" : "text-gray-400"
                      }`}>
                      📝
                    </span>
                  </div>
                  <p className={`text-lg transition-colors ${isDarkMode ? "text-gray-400" : "text-gray-600"
                    }`}>
                    No questions available
                  </p>
                  <p className={`text-sm mt-1 transition-colors ${isDarkMode ? "text-gray-500" : "text-gray-500"
                    }`}>
                    Check back later for reviewer submissions
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        <EditQuestionDialog
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setQuestionToEdit(null);
          }}
          onSave={handleEditSave}
          question={questionToEdit}
        />
      </div>
    </>
  );
}
