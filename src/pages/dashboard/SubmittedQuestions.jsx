import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    selectSubmittedQuestions,
    selectQuestionsLoading,
} from "../../features/modules/questions/selectors";
import {
    reassignQuestionRequest,
    updateAdminAnswerRequest,
} from "../../features/modules/questions/questionsSlice";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import EditQuestionDialog from "../../components/ui/EditQuestionDialog";

const SubmittedQuestions = ({ isDarkMode }) => {
    const dispatch = useDispatch();
    const [expandedQuestion, setExpandedQuestion] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [questionToEdit, setQuestionToEdit] = useState(null);
    const [loadingReassign, setLoadingReassign] = useState({});

    const submittedQuestions = useSelector(selectSubmittedQuestions);
    const loading = useSelector(selectQuestionsLoading);
    const selectedDocument = useSelector((state) => state.documents.selected);

    const filteredQuestions = selectedDocument
        ? submittedQuestions.filter(
            (q) => q.document_name === selectedDocument.filename
        )
        : submittedQuestions;

    const handleReassign = (question) => {
        if (!window.confirm("Are you sure you want to send this question back for further review?")) {
            return;
        }

        setLoadingReassign((prev) => ({
            ...prev,
            [question.question_id]: true,
        }));

        dispatch(
            reassignQuestionRequest({
                user_id: question.user_id,
                ques_id: question.question_id,
                file_id: question.file_id,
            })
        );

        setTimeout(() => {
            setLoadingReassign((prev) => ({
                ...prev,
                [question.question_id]: false,
            }));
        }, 800);
    };

    const handleEditSave = (questionId, newAnswer) => {
        dispatch(
            updateAdminAnswerRequest({
                questionId,
                answer: newAnswer,
            })
        );

        setIsEditModalOpen(false);
        setQuestionToEdit(null);
    };

    if (loading) {
        return (
            <LoadingSpinner
                message="Loading submitted questions..."
                isDarkMode={isDarkMode}
            />
        );
    }

    if (filteredQuestions.length === 0) {
        return (
            <div className={`p-6 rounded-xl shadow-xl transition-colors ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
                }`
            }>
                <div className="text-center py-12" >
                    <div className={
                        `w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
                        }`
                    }>
                        <span className={`text-2xl ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>📝</span>
                    </div>
                    < p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        No submitted questions yet
                    </p>
                    < p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                        Questions will appear here once reviewers submit their responses
                    </p>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className={`p-6 rounded-xl shadow-xl transition-colors ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
                }`}>
                <div className="flex items-center gap-3 mb-6" >
                    <div className="w-2 h-8 bg-purple-500 rounded-full" > </div>
                    < h2 className={`text-xl font-semibold transition-colors ${isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                        Edit and Approve Responses
                    </h2>
                    < span className="bg-purple-500/20 text-purple-400 px-2 py-1 rounded-full text-xs" >
                        {filteredQuestions.length} questions
                    </span>
                    {
                        selectedDocument && (
                            <span className={
                                `px-3 py-1 rounded-full text-sm ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                                }`
                            }>
                                {selectedDocument.filename}
                            </span>
                        )
                    }
                </div>

                < div className="space-y-3" >
                    {
                        filteredQuestions.map((question, idx) => (
                            <div
                                key={question.question_id}
                                className={`rounded-lg overflow-hidden transition-colors ${isDarkMode ? 'bg-gray-700 border border-gray-600' : 'bg-gray-50 border border-gray-200'
                                    }`}
                            >
                                <div
                                    className={
                                        `flex items-center justify-between p-4 cursor-pointer ${isDarkMode ? 'hover:bg-gray-650' : 'hover:bg-gray-100'
                                        }`
                                    }
                                    onClick={() => setExpandedQuestion(expandedQuestion === idx ? null : idx)}
                                >
                                    <div className="flex items-start gap-3 flex-1" >
                                        <span className="text-purple-400" >
                                            Q {question.question_text?.split(' ')[0] || idx + 1}
                                        </span>
                                        < div className="flex-1" >
                                            <span className={
                                                `font-medium text-sm leading-relaxed ${isDarkMode ? 'text-white' : 'text-gray-900'
                                                }`
                                            }>
                                                {question.question_text?.substring(question.question_text.indexOf(' ') + 1) || question.question_text}
                                            </span>
                                            {
                                                question.username && (
                                                    <div className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                                        Submitted by: {question.username}
                                                    </div>
                                                )
                                            }
                                        </div>
                                    </div>

                                    < div className="flex items-center gap-2" >
                                        {/* Status Badge */}
                                        < span className={`px-3 py-1 rounded-full text-xs font-medium ${question.status === 'submitted'
                                            ? 'bg-green-100 text-green-800 border border-green-200'
                                            : 'bg-orange-100 text-orange-800 border border-orange-200'
                                            }`}>
                                            {question.status === 'submitted' ? '✓ Submitted' : question.status}
                                        </span>

                                        {/* Reassign Button */}
                                        <button
                                            className={
                                                `px-4 py-2 rounded-full text-sm font-medium shadow-sm flex items-center gap-2 ${isDarkMode
                                                    ? 'bg-purple-600 text-white hover:bg-purple-500'
                                                    : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                                                } ${loadingReassign[question.question_id] ? 'opacity-50 cursor-not-allowed' : ''}`
                                            }
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleReassign(question);
                                            }}
                                            disabled={loadingReassign[question.question_id]}
                                        >
                                            {
                                                loadingReassign[question.question_id] ? (
                                                    <>
                                                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current" > </div>
                                                        Reassigning...
                                                    </>
                                                ) : (
                                                    <>
                                                        <span>↩️</span>
                                                        Reassign
                                                    </>
                                                )}
                                        </button>

                                        {/* Edit Button */}
                                        <span
                                            className="text-purple-400 hover:text-purple-300 cursor-pointer text-lg"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setIsEditModalOpen(true);
                                                setQuestionToEdit(question);
                                            }}
                                            title="Edit answer"
                                        >
                                            ✏️
                                        </span>

                                        {/* Expand Icon */}
                                        <span className="text-purple-400 ml-2" >
                                            {expandedQuestion === idx ? '▲' : '▼'}
                                        </span>
                                    </div>
                                </div>

                                {
                                    expandedQuestion === idx && (
                                        <div className={
                                            `p-4 border-t ${isDarkMode ? 'bg-gray-750 border-gray-600' : 'bg-gray-100 border-gray-200'
                                            }`
                                        }>
                                            <label className={
                                                `block text-sm font-semibold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'
                                                }`
                                            }>
                                                Submitted Answer:
                                            </label>
                                            < div className={`w-full p-3 rounded-lg ${isDarkMode ? 'bg-gray-800 border border-gray-600' : 'bg-white border border-gray-300'
                                                }`
                                            }>
                                                <p className={
                                                    `whitespace-pre-line leading-relaxed ${isDarkMode ? 'text-white' : 'text-gray-900'
                                                    }`
                                                }>
                                                    {question.answer || 'No answer provided'}
                                                </p>
                                            </div>
                                            {
                                                question.submitted_at && (
                                                    <p className={`text-sm mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                                        Submitted on {new Date(question.submitted_at).toLocaleString()}
                                                    </p>
                                                )
                                            }
                                        </div>
                                    )}
                            </div>
                        ))}
                </div>

                {/* Edit Question Dialog */}
                {
                    isEditModalOpen && questionToEdit && (
                        <EditQuestionDialog
                            isOpen={isEditModalOpen}
                            onClose={() => {
                                setIsEditModalOpen(false);
                                setQuestionToEdit(null);
                            }
                            }
                            onSave={handleEditSave}
                            question={questionToEdit}
                            isDarkMode={isDarkMode}
                        />
                    )}
            </div>
        </>
    );
};

export default SubmittedQuestions;
