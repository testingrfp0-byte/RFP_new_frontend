import React, { useState } from 'react';
import ReviewerQuestionCard from '../../pages/dashboard/ReviewerAnswerEditor';
import AssignmentControls from '../../pages/list/AssignmentControls';

const QuestionCard = ({
  question,
  index,
  isDarkMode,
  isReviewerMode = false,
  isAdminMode = false,
  assignStatus,
  setAssignStatus,
  selectedReviewers,
  setSelectedReviewers,
  onAssignmentComplete
}) => {
  const [expanded, setExpanded] = useState(false);

  const getStatusClass = () => {
    // Check if question is assigned (for admin mode)
    if (isAdminMode && assignStatus?.[index]) {
      return isDarkMode
        ? 'bg-green-900/20 border border-green-700/50'
        : 'bg-green-100/50 border border-green-300';
    }

    // Check if question is submitted (for reviewer mode)
    if (question.is_submitted || question.status === 'submitted') {
      return isDarkMode
        ? 'bg-green-900/20 border border-green-700/50'
        : 'bg-green-100/50 border border-green-300';
    }

    return isDarkMode
      ? 'bg-gray-700 border border-gray-600'
      : 'bg-gray-50 border border-gray-200';
  };

  return (
    <div className={`rounded-lg overflow-visible transition-colors ${getStatusClass()}`}>
      <div
        className={`flex items-center justify-between p-4 cursor-pointer transition-colors ${isDarkMode ? 'hover:bg-gray-650' : 'hover:bg-gray-100'
          }`}
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start gap-3 flex-1">
          <span className="text-purple-400">
            Q {question.question_text?.split(' ')[0] || index + 1}
          </span>
          <span
            className={`font-medium text-sm leading-relaxed transition-colors ${isDarkMode ? 'text-white' : 'text-gray-900'
              }`}
          >
            {question.question_text?.substring(question.question_text.indexOf(' ') + 1) || question.question_text}
          </span>
        </div>

        {question.is_submitted && (
          <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-xs mr-3">
            ✓ Submitted
          </span>
        )}

        <span className="text-purple-400 ml-4">
          {expanded ? '▲' : '▼'}
        </span>
      </div>

      {expanded && (
        <div
          className={`p-4 border-t transition-colors ${isDarkMode ? 'bg-gray-750 border-gray-600' : 'bg-gray-100 border-gray-200'
            }`}
        >
          {isReviewerMode ? (
            <ReviewerQuestionCard question={question} isDarkMode={isDarkMode} />
          ) : isAdminMode ? (
            <AssignmentControls
              question={question}
              globalIdx={index}
              isDarkMode={isDarkMode}
              assignStatus={assignStatus}
              setAssignStatus={setAssignStatus}
              selectedReviewers={selectedReviewers}
              setSelectedReviewers={setSelectedReviewers}
              onAssignmentComplete={onAssignmentComplete}
            />
          ) : (
            <div className={`p-3 rounded ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <p className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                {question.answer || 'No answer provided yet'}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default QuestionCard;