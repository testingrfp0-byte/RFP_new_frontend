import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useTheme } from '../../contexts/ThemeContext';
import { fetchCheckSubmitRequest } from '../../features/modules/questions/questionsSlice';
import { fetchDocumentDetailsRequest } from '../../features/modules/documents/documentsSlice';

const EditQuestionDialog = ({ isOpen, onClose, question, onSave }) => {
  const [editedAnswer, setEditedAnswer] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const { isDarkMode } = useTheme();
  const dispatch = useDispatch();

  useEffect(() => {
    if (question) {
      setEditedAnswer(question.answer || '');
    }
  }, [question]);

  const handleSave = async () => {
    if (!question) return;
    setIsSaving(true);

    try {
      // Call the parent's onSave function (now returns a promise)
      await onSave(question.question_id, editedAnswer);

      // ✅ Refresh document details if we have rfp_id or file_id
      // (fetchCheckSubmitRequest is handled in parent's onSuccess)
      if (question.rfp_id || question.file_id) {
        const docId = question.rfp_id || question.file_id;
        dispatch(
          fetchDocumentDetailsRequest({
            id: docId,
            status: "total question",
          })
        );
      }

      // Dialog closure is handled in parent's onSuccess, 
      // but we can call onClose here for safety if the promise resolves.
      // Actually, parent already sets isOpen to false via state.
    } catch (error) {
      console.error("Error saving answer:", error);
      // Toaster is handled in parent's handleEditSave onError
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  // ✅ Handle multiple possible field names for question text
  const questionText = question?.question_text || question?.question || "No question text available";

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center z-50 transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0'
        }`}
      style={{ background: 'rgba(0, 0, 0, 0.5)' }}
      onClick={onClose}
    >
      <div
        className={`relative p-6 rounded-xl shadow-2xl w-full max-w-xl mx-4 transform transition-all duration-300 ${isOpen ? 'scale-100' : 'scale-95'
          } ${isDarkMode
            ? 'bg-gray-800 border border-gray-700'
            : 'bg-white border border-gray-200'
          }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3
            className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'
              }`}
          >
            Edit Answer
          </h3>
          <button
            onClick={onClose}
            className={`text-2xl leading-none ${isDarkMode
              ? 'text-gray-400 hover:text-white'
              : 'text-gray-500 hover:text-gray-900'
              }`}
            disabled={isSaving}
          >
            ×
          </button>
        </div>

        {/* Question Display */}
        {question && (
          <div className="mb-4">
            <p
              className={`font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}
            >
              Question:
            </p>
            <div
              className={`p-3 rounded-lg ${isDarkMode
                ? 'bg-gray-700 border border-gray-600'
                : 'bg-gray-50 border border-gray-200'
                }`}
            >
              <p
                className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  } text-sm leading-relaxed`}
              >
                {questionText}
              </p>
            </div>
          </div>
        )}

        {/* Answer Editor */}
        <div className="mb-6">
          <label
            className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}
          >
            Your Answer:
          </label>
          <textarea
            className={`w-full p-3 rounded-lg resize-none ${isDarkMode
              ? 'bg-gray-700 border border-gray-600 text-white placeholder-gray-400'
              : 'bg-white border border-gray-300 text-gray-900 placeholder-gray-500'
              } focus:ring-2 focus:ring-purple-500 focus:border-purple-500`}
            rows="8"
            value={editedAnswer}
            onChange={(e) => setEditedAnswer(e.target.value)}
            placeholder="Enter your answer here..."
            disabled={isSaving}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isSaving}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isDarkMode
              ? 'bg-gray-600 hover:bg-gray-500 text-white'
              : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
              } ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className={`px-4 py-2 rounded-lg text-sm font-medium bg-purple-600 hover:bg-purple-700 text-white transition-colors flex items-center gap-2 ${isSaving ? 'opacity-50 cursor-not-allowed' : ''
              }`}
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Saving...
              </>
            ) : (
              'Save'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditQuestionDialog;