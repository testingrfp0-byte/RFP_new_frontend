import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import QuestionCard from '../../components/ui/ReviewerQuestionCard';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { addQuestionRequest } from '../../features/modules/questions/questionsSlice';
import { fetchDocumentDetailsRequest } from '../../features/modules/documents/documentsSlice';
import {
  selectDocumentDetails,
  selectDocumentsLoading,
  selectFilterData,
  selectSelectedDocument,
} from '../../features/modules/documents/selectors';
import { selectUsers } from '../../features/modules/users/selectors';
import {
  selectAssignedReviewersData,
  selectAssignedReviewersLoading,
} from '../../features/modules/assignments/selectors';
import {
  fetchAssignedReviewersRequest,
  clearAssignedReviewersData,
} from '../../features/modules/assignments/assignmentsSlice';
import { toast } from "react-toastify";
import { validateAddQuestionFields } from "../../utilis/fieldValidations";

const DocumentDetails = ({ isDarkMode }) => {
  const dispatch = useDispatch();
  const [expandedSummary, setExpandedSummary] = useState(false);
  const [showAddInput, setShowAddInput] = useState(false);
  const [newQuestion, setNewQuestion] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('total question');
  const [assignStatus, setAssignStatus] = useState([]);
  const [selectedReviewers, setSelectedReviewers] = useState({});
  const [questionErrors, setQuestionErrors] = useState({});
  const details = useSelector(selectDocumentDetails);
  const loading = useSelector(selectDocumentsLoading);
  const filterData = useSelector(selectFilterData);
  const selectedDocument = useSelector(selectSelectedDocument);
  const users = useSelector(selectUsers);
  const assignedReviewersData = useSelector(selectAssignedReviewersData);
  const assignedReviewersLoading = useSelector(selectAssignedReviewersLoading);

  useEffect(() => {
    console.log('DocumentDetails - selectedDocument:', selectedDocument);
    console.log('DocumentDetails - selectedDocument.id:', selectedDocument?.id);
  }, [selectedDocument]);

  // Fetch assigned reviewers when details are loaded
  useEffect(() => {
    if (details && selectedDocument?.id) {
      console.log('Fetching assigned reviewers for document ID:', selectedDocument.id);
      dispatch(fetchAssignedReviewersRequest({ documentId: selectedDocument.id }));
    } else {
      console.warn('Cannot fetch reviewers - missing data:', {
        hasDetails: !!details,
        documentId: selectedDocument?.id
      });
    }

    return () => {
      dispatch(clearAssignedReviewersData());
    };
  }, [details?.id, selectedDocument?.id, dispatch]);

  // Process assigned reviewers data
  useEffect(() => {
    if (assignedReviewersData && details?.questions_by_section && selectedDocument?.id) {
      console.log('Processing assigned reviewers data:', assignedReviewersData);
      processAssignedReviewers(assignedReviewersData);
    }
  }, [assignedReviewersData, details?.questions_by_section, selectedDocument?.id, users]);

  const processAssignedReviewers = useCallback((reviewersData) => {
    if (!details?.questions_by_section) return;

    const flattenedQuestions = details.questions_by_section.flatMap((section) =>
      section.questions.map((question) => ({
        ...question,
        section: section.section,
      }))
    );

    const savedAssignStatus = JSON.parse(
      localStorage.getItem(`assignStatus_${selectedDocument.id}`) || "[]"
    );
    const savedSelectedReviewers = JSON.parse(
      localStorage.getItem(`selectedReviewers_${selectedDocument.id}`) || "{}"
    );

    setAssignStatus(savedAssignStatus);
    setSelectedReviewers(savedSelectedReviewers);
    updateReviewersState(reviewersData, flattenedQuestions);
  }, [details?.questions_by_section, selectedDocument?.id]);

  const updateReviewersState = useCallback((reviewersData, questions) => {
    const statusMap = {};
    const reviewersMap = {};

    reviewersData.forEach(({ ques_id, username }) => {
      if (!statusMap[ques_id]) statusMap[ques_id] = new Set();
      statusMap[ques_id].add(username);

      if (!reviewersMap[ques_id]) reviewersMap[ques_id] = new Set();
      const user = users.find((u) => u.username === username);
      if (user) reviewersMap[ques_id].add(user);
    });

    const statusArray = questions.map((q) => {
      const assigned = statusMap[q.id];
      return assigned ? `Assigned to ${[...assigned].join(", ")}` : "";
    });

    const reviewersArray = questions.reduce((acc, q, idx) => {
      const assigned = reviewersMap[q.id];
      acc[idx] = assigned ? [...assigned] : [];
      return acc;
    }, {});

    setAssignStatus(statusArray);
    setSelectedReviewers(reviewersArray);

    if (selectedDocument?.id) {
      localStorage.setItem(
        `assignStatus_${selectedDocument.id}`,
        JSON.stringify(statusArray)
      );
      localStorage.setItem(
        `selectedReviewers_${selectedDocument.id}`,
        JSON.stringify(reviewersArray)
      );
    }
  }, [users, selectedDocument?.id]);

  const handleAddQuestion = useCallback(() => {
    const validationErrors = validateAddQuestionFields({
      question: newQuestion,
    });

    if (Object.keys(validationErrors).length > 0) {
      setQuestionErrors(validationErrors);
      return;
    }

    setQuestionErrors({});

    dispatch(
      addQuestionRequest({
        id: selectedDocument.id,
        questions: [newQuestion.trim()],
      })
    );

    toast.success("Question added successfully");

    setNewQuestion("");
    setShowAddInput(false);

    setTimeout(() => {
      dispatch(
        fetchDocumentDetailsRequest({
          id: selectedDocument.id,
          status: selectedStatus,
        })
      );
    }, 500);
  }, [newQuestion, selectedDocument, selectedStatus, dispatch]);

  const handleQuestionChange = (value) => {
    setNewQuestion(value);

    if (questionErrors.question) {
      setQuestionErrors({});
    }
  };

  const handleStatusChange = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();

    const newStatus = e.target.value;
    console.log('Status changing from', selectedStatus, 'to', newStatus);

    setSelectedStatus(newStatus);

    if (selectedDocument?.id) {
      dispatch(fetchDocumentDetailsRequest({
        id: selectedDocument.id,
        status: newStatus,
      }));
    }
  }, [selectedDocument?.id, selectedStatus, dispatch]);

  const handleAssignmentComplete = useCallback(() => {
    if (selectedDocument?.id) {
      console.log('Reloading assigned reviewers after assignment');
      dispatch(fetchAssignedReviewersRequest({ documentId: selectedDocument.id }));
    }
  }, [selectedDocument?.id, dispatch]);

  // if (loading || assignedReviewersLoading) {
  //   return <LoadingSpinner message="Loading document details..." isDarkMode={isDarkMode} />;
  // }

  if (!details) {
    return (
      <div className="text-center py-12">
        <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
         📄 Failed to load document details
        </p>
      </div>
    );
  }

  if (!selectedDocument?.id) {
    return (
      <div className="text-center py-12">
        <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          No document selected. Please select a document from the list.
        </p>
      </div>
    );
  }

  return (
    <div
      className={`rounded-xl shadow-xl transition-colors animate-slide-up ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
        }`}
      style={{
        animation: 'slideUp 0.5s ease-out forwards'
      }}
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-2 h-8 bg-purple-500 rounded-full"></div>
          <h2 className={`text-xl font-semibold transition-colors ${isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
            {selectedDocument?.project_name || selectedDocument?.filename}
          </h2>
          <span className={`px-3 py-1 rounded-full text-sm transition-colors ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
            }`}>
            {selectedDocument?.filename}
          </span>
        </div>

        {/* Summary Section */}
        {details.summary && (
          <div className="mb-6">
            <div
              className={`cursor-pointer flex items-center justify-between p-4 rounded-lg transition-colors ${isDarkMode ? 'bg-gray-700 hover:bg-gray-650' : 'bg-gray-50 hover:bg-gray-100'
                }`}
              onClick={() => setExpandedSummary(!expandedSummary)}
            >
              <div className="flex items-center gap-3">
                <span className="text-purple-400 text-lg">📋</span>
                <h3 className={`text-lg font-semibold transition-colors ${isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                  RFP Summary and Key Requirements
                </h3>
              </div>
              <span className="text-purple-400 text-lg">
                {expandedSummary ? '▲' : '▼'}
              </span>
            </div>

            {expandedSummary && (
              <div className={`mt-4 p-4 rounded-lg transition-colors ${isDarkMode ? 'bg-gray-750 border border-gray-600' : 'bg-gray-100 border border-gray-200'
                }`}>
                <div className={`prose ${isDarkMode ? 'prose-invert text-white' : 'text-gray-900'}`}>
                  <ReactMarkdown rehypePlugins={[rehypeRaw]}>
                    {details.summary.summary_text}
                  </ReactMarkdown>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Question Status Filter */}
        <div className={`gap-3 mb-6 flex items-center justify-start p-4 rounded-lg transition-colors ${isDarkMode ? 'bg-gray-700 hover:bg-gray-650' : 'bg-gray-50 hover:bg-gray-100'
          }`}>
          <span className="text-purple-400 text-lg">📊</span>
          <h3 className={`text-lg font-semibold transition-colors ${isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
            Questions Status
          </h3>

          <select
            value={selectedStatus}
            onChange={handleStatusChange}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isDarkMode
              ? 'bg-gray-700 text-gray-300 border border-gray-600'
              : 'bg-white text-gray-700 border border-gray-300'
              }`}
          >
            <option value="assigned">Assigned: {filterData?.assigned_count || 0}</option>
            <option value="unassigned">Unassigned: {filterData?.unassigned_count || 0}</option>
            <option value="total question">Total Questions: {filterData?.total_questions || 0}</option>
          </select>
        </div>

        {/* Questions Section */}
        {details.questions_by_section && details.questions_by_section.length > 0 && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-3">
                <span className="text-purple-400 text-lg">❓</span>
                <h3 className={`text-lg font-semibold transition-colors ${isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                  Questions & Responses
                </h3>
                <span className="bg-purple-500/20 text-purple-400 px-2 py-1 rounded-full text-xs">
                  {details.questions_by_section.reduce((total, section) =>
                    total + section.questions.length, 0
                  )} questions
                </span>
              </div>

              <button
                onClick={() => setShowAddInput(!showAddInput)}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                + Add
              </button>
            </div>

            {/* Add Question Input */}
            {showAddInput && (
              <div className="mb-4 flex flex-col gap-2">
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={newQuestion}
                    onChange={(e) => handleQuestionChange(e.target.value)}
                    placeholder="Enter question"
                    className={`
          flex-1 px-3 py-2 rounded border transition-colors
          ${isDarkMode
                        ? "bg-gray-800 text-white placeholder-gray-400"
                        : "bg-white text-gray-900 placeholder-gray-500"}
          ${questionErrors.question
                        ? "border-red-500"
                        : isDarkMode
                          ? "border-gray-600"
                          : "border-gray-300"}
          focus:border-purple-500 focus:ring-1 focus:ring-purple-500
        `}
                  />

                  <button
                    onClick={handleAddQuestion}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
                  >
                    Submit
                  </button>
                </div>

                {questionErrors.question && (
                  <p className="text-red-500 text-sm">
                    {questionErrors.question}
                  </p>
                )}
              </div>
            )}


            {/* Questions by Section */}
            {details.questions_by_section.map((section, sectionIdx) => (
              <div key={sectionIdx} className="mb-5">
                <h4 className={`text-md font-semibold mb-3 transition-colors ${isDarkMode ? 'text-gray-200' : 'text-gray-800'
                  }`}>
                  {section.section}
                </h4>

                <div className="space-y-3">
                  {section.questions.map((question, qIdx) => {
                    const globalIdx = details.questions_by_section
                      .slice(0, sectionIdx)
                      .reduce((acc, s) => acc + s.questions.length, 0) + qIdx;

                    return (
                      <QuestionCard
                        key={question.id}
                        question={question}
                        index={globalIdx}
                        isDarkMode={isDarkMode}
                        isAdminMode={true}
                        assignStatus={assignStatus}
                        setAssignStatus={setAssignStatus}
                        selectedReviewers={selectedReviewers}
                        setSelectedReviewers={setSelectedReviewers}
                        onAssignmentComplete={handleAssignmentComplete}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentDetails;