import React, { useState, useEffect } from "react";
import { useTheme } from "../../contexts/ThemeContext";
import { useDispatch, useSelector } from "react-redux";
import { Send, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import {
    generateAnswerRequest,
    updateAnswerRequest,
    submitAnswerRequest,
    notForMeRequest,
    submitChatPromptRequest,
    analyzeAnswerRequest,
    toggleEditMode,
    fetchVersionsRequest,
} from "../../features/modules/answers/answersSlice";
import {
    selectIsEditing,
    selectIsGenerating,
    selectSubmissionStatus,
    selectAnalysisResult,
    selectAnalyzingId,
    selectChatLoading,
    selectVersionsByQuestion,
    selectAnswersLoading,
    selectChatPromptSaved,
} from "../../features/modules/answers/selectors";
import {
    fetchFilterQuestionsRequest,
} from "../../features/modules/questions/questionsSlice";

const ReviewerAnswerEditor = ({ question, isDarkMode }) => {
    const dispatch = useDispatch();

    const isEditing = useSelector(selectIsEditing(question.question_id));
    const isGenerating = useSelector(selectIsGenerating(question.question_id));
    const submissionStatus = useSelector(selectSubmissionStatus(question.question_id));
    const analysisResult = useSelector(selectAnalysisResult(question.question_id));
    const isAnalyzing = useSelector(selectAnalyzingId) === question.question_id;
    const chatLoading = useSelector(selectChatLoading);
    const versions = useSelector(selectVersionsByQuestion(question.question_id)) || [];
    const answersLoading = useSelector(selectAnswersLoading);
    const chatPromptSaved = useSelector(selectChatPromptSaved(question.question_id));

    const [inputValue, setInputValue] = useState("");
    const [showInput, setShowInput] = useState(false);
    const [showVersionDropdown, setShowVersionDropdown] = useState(false);
    const [manualSaved, setManualSaved] = useState(false);

    // Local state for textarea value (only updates Redux/API on Save)
    const [localAnswer, setLocalAnswer] = useState(question.answer || "");

    // Sync local answer when question changes
    useEffect(() => {
        setLocalAnswer(question.answer || "");
    }, [question.answer]);

    // Removed auto-enable editing mode - buttons will display immediately after generation
    // Users can manually click "Edit Answer" to enable editing if needed

    // Hide chat input after API call completes successfully
    useEffect(() => {
        // Only hide if we were loading and now we're not (API just completed)
        if (!chatLoading && showInput) {
            // Check if there was actually a loading state before
            // This prevents hiding when first opening the input
            const wasLoading = sessionStorage.getItem(`chat_loading_${question.question_id}`);
            if (wasLoading === 'true') {
                // Small delay to ensure user sees the success toast before input disappears
                const timer = setTimeout(() => {
                    setShowInput(false);
                    sessionStorage.removeItem(`chat_loading_${question.question_id}`);
                }, 500);
                return () => clearTimeout(timer);
            }
        } else if (chatLoading) {
            // Mark that we're currently loading
            sessionStorage.setItem(`chat_loading_${question.question_id}`, 'true');
        }
    }, [chatLoading, showInput, question.question_id]);

    // Local answer update (only updates local state, NOT Redux)
    const handleLocalAnswerChange = (newAnswer) => {
        setLocalAnswer(newAnswer);
    };

    const handleGenerateAnswer = () => {
        dispatch(generateAnswerRequest(question.question_id));
        setManualSaved(false); // Reset manual saved flag when regenerating
    };

    const handleToggleEdit = () => {
        dispatch(toggleEditMode(question.question_id));
        // Reset manual saved flag when entering edit mode
        if (!isEditing) {
            setManualSaved(false);
        }
    };

    // Save button → calls /update-answer/:id API
    const handleSaveAnswer = () => {
        dispatch(
            updateAnswerRequest({
                questionId: question.question_id,
                answer: localAnswer,
                isLocal: false, // This triggers the API call
            })
        );
        toast.success("Answer saved!");
        dispatch(fetchVersionsRequest(question.question_id));
        setManualSaved(true);
        // Disable editing mode after save
        if (isEditing) {
            dispatch(toggleEditMode(question.question_id));
        }
    };

    // Submit button → calls different API based on submit_status
    const handleSubmit = () => {
        // If already submitted, call update API instead of submit API
        if (question.submit_status === "submitted") {
            dispatch(
                updateAnswerRequest({
                    questionId: question.question_id,
                    answer: localAnswer,
                    isLocal: false,
                })
            );
            // Turn off editing mode after successful update
            if (isEditing) {
                dispatch(toggleEditMode(question.question_id));
            }
            toast.success("Answer updated successfully!");
            dispatch(fetchVersionsRequest(question.question_id));
        } else {
            // First time submission - call submit API
            dispatch(
                submitAnswerRequest({
                    questionId: question.question_id,
                    answer: localAnswer,
                })
            );
            // Disable editing mode after first submission
            if (isEditing) {
                dispatch(toggleEditMode(question.question_id));
            }
            dispatch(fetchFilterQuestionsRequest());
            dispatch(fetchVersionsRequest(question.question_id));
            toast.success("Answer submitted successfully!");
        }
    };

    const handleNotForMe = () => {
        dispatch(notForMeRequest(question.question_id));
        toast.success("Marked as Not for Me");
    };

    const handleAnalyzeQuestion = () => {
        dispatch(
            analyzeAnswerRequest({
                rfpId: question.rfp_id,
                questionId: question.question_id,
            })
        );
    };

    const handleChatButtonClick = () => {
        setShowInput(!showInput);
    };

    const handlePromptSubmit = () => {
        if (!inputValue.trim()) return;

        dispatch(
            submitChatPromptRequest({
                quesId: question.question_id,
                chatMessage: inputValue,
                userId: question.user_id || 13,
            })
        );
        setInputValue("");
        // Don't hide input immediately - let it stay visible during loading
    };

    const toggleVersionDropdown = () => {
        if (!showVersionDropdown) {
            dispatch(fetchVersionsRequest(question.question_id));
        }
        setShowVersionDropdown((prev) => !prev);
    };

    const handleLocalTextareaClick = () => {
        if (!isEditing) {
            dispatch(fetchVersionsRequest(question.question_id));
        }
    };

    return (
        <div className="space-y-4">
            <div className="mb-4">
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                    Your Response:
                </label>
                <textarea
                    placeholder="Type your detailed answer here..."
                    className={`w-full p-3 rounded-lg resize-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 ${isDarkMode
                        ? "bg-gray-800 border border-gray-600 text-white"
                        : "bg-white border border-gray-300 text-gray-900"
                        } ${isEditing ? "border-2 border-yellow-500" : "cursor-not-allowed opacity-75"}`}
                    rows={8}
                    value={localAnswer}
                    onChange={(e) => handleLocalAnswerChange(e.target.value)}
                    onClick={handleLocalTextareaClick}
                    disabled={!isEditing || manualSaved}
                />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 items-center">
                {/* Case 1: No answer generated yet - Show ONLY Generate & Not for me */}
                {question.is_submitted === false && (question.answer_id === null && (!question.answer || question.answer.trim() === "")) && (
                    <>
                        <button
                            onClick={handleGenerateAnswer}
                            disabled={isGenerating}
                            className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 ${isGenerating
                                ? "bg-gray-400 cursor-not-allowed"
                                : "bg-purple-600 hover:bg-purple-700 text-white"
                                }`}
                        >
                            {isGenerating && <Loader2 size={16} className="animate-spin" />}
                            <span>🤖</span>
                            {isGenerating ? "Generating..." : "Generate"}
                        </button>

                        <button
                            onClick={handleNotForMe}
                            disabled={answersLoading}
                            className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 ${answersLoading
                                ? "bg-gray-400 cursor-not-allowed"
                                : "bg-red-600 hover:bg-red-700 text-white"
                                }`}
                        >
                            <span>❌</span>
                            {answersLoading && <Loader2 size={16} className="animate-spin" />}
                            Not for me
                        </button>
                    </>
                )}

                {/* Case 2: Answer marked as "not submitted" (not for me) */}
                {question.submit_status === "not submitted" && (
                    <button disabled className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-400 cursor-not-allowed text-white">
                        Submitted as not for me
                    </button>
                )}

                {/* Case 2.5: Answer saved via chat prompt - Show Answer Saved (disabled) */}
                {chatPromptSaved && question.submit_status !== "submitted" && question.submit_status !== "not submitted" && (
                    <>
                        <button disabled className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-400 cursor-not-allowed text-white">
                            💾 Answer Saved
                        </button>

                        <button
                            onClick={isEditing ? handleSaveAnswer : handleToggleEdit}
                            disabled={answersLoading && isEditing}
                            className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 ${answersLoading && isEditing
                                ? "bg-gray-400 cursor-not-allowed"
                                : "bg-orange-600 hover:bg-orange-700 text-white"
                                }`}
                        >
                            {answersLoading && isEditing && <Loader2 size={16} className="animate-spin" />}
                            {isEditing ? "💾 Save" : "✏️ Edit Answer"}
                        </button>

                        <button
                            onClick={handleChatButtonClick}
                            className="px-4 py-2 rounded-lg text-sm font-medium bg-green-600 hover:bg-green-700 text-white"
                        >
                            <span>💬</span>
                            Chat Prompt
                        </button>

                        <button
                            onClick={toggleVersionDropdown}
                            className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            <span>📝</span>
                            Versions{" "}
                            {versions.length > 0 && (
                                <span className="ml-1 bg-white text-indigo-600 px-1.5 py-0.5 rounded-full text-xs">
                                    {versions.length}
                                </span>
                            )}{" "}
                            {showVersionDropdown ? "▲" : "▼"}
                        </button>

                        <button
                            onClick={handleAnalyzeQuestion}
                            disabled={isAnalyzing}
                            className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 ${isAnalyzing
                                ? "bg-gray-400 cursor-not-allowed"
                                : "bg-red-600 hover:bg-red-700 text-white"
                                }`}
                        >
                            {isAnalyzing && <Loader2 size={16} className="animate-spin" />}
                            {isAnalyzing ? "Analyzing..." : "AI Analysis"}
                        </button>

                        {localAnswer && localAnswer.trim() !== "" && (
                            <button
                                onClick={handleSubmit}
                                disabled={answersLoading}
                                className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 ${answersLoading
                                    ? "bg-gray-400 cursor-not-allowed"
                                    : "bg-green-600 hover:bg-green-700 text-white"
                                    }`}
                            >
                                {answersLoading && <Loader2 size={16} className="animate-spin" />}
                                ✅ Submit
                            </button>
                        )}
                    </>
                )}

                {/* Case 3: Answer generated, status is "process" - Show all action buttons */}
                {((question.answer_id !== null) || (question.answer && question.answer.trim() !== "")) && question.submit_status === "process" && !chatPromptSaved && (
                    <>
                        <button
                            onClick={handleGenerateAnswer}
                            disabled={isGenerating}
                            className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 ${isGenerating
                                ? "bg-gray-400 cursor-not-allowed"
                                : "bg-purple-600 hover:bg-purple-700 text-white"
                                }`}
                        >
                            <span>🤖</span>
                            {isGenerating && <Loader2 size={16} className="animate-spin" />}
                            {isGenerating ? "Generating..." : "Generate"}
                        </button>

                        {manualSaved ? (
                            <button disabled className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-400 cursor-not-allowed text-white">
                                💾 Answer Saved
                            </button>
                        ) : (
                            <button
                                onClick={isEditing ? handleSaveAnswer : handleToggleEdit}
                                disabled={answersLoading && isEditing}
                                className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 ${answersLoading && isEditing
                                    ? "bg-gray-400 cursor-not-allowed"
                                    : "bg-orange-600 hover:bg-orange-700 text-white"
                                    }`}
                            >
                                {answersLoading && isEditing && <Loader2 size={16} className="animate-spin" />}
                                {isEditing ? "💾 Save" : "✏️ Edit Answer"}
                            </button>
                        )}

                        <button
                            onClick={handleChatButtonClick}
                            className="px-4 py-2 rounded-lg text-sm font-medium bg-green-600 hover:bg-green-700 text-white"
                        >
                            <span>💬</span>
                            Chat Prompt
                        </button>

                        <button
                            onClick={toggleVersionDropdown}
                            className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            <span>📝</span>
                            Versions{" "}
                            {versions.length > 0 && (
                                <span className="ml-1 bg-white text-indigo-600 px-1.5 py-0.5 rounded-full text-xs">
                                    {versions.length}
                                </span>
                            )}{" "}
                            {showVersionDropdown ? "▲" : "▼"}
                        </button>

                        <button
                            onClick={handleAnalyzeQuestion}
                            disabled={isAnalyzing}
                            className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 ${isAnalyzing
                                ? "bg-gray-400 cursor-not-allowed"
                                : "bg-red-600 hover:bg-red-700 text-white"
                                }`}
                        >
                            {isAnalyzing && <Loader2 size={16} className="animate-spin" />}
                            {isAnalyzing ? "Analyzing..." : "AI Analysis"}
                        </button>

                        {localAnswer && localAnswer.trim() !== "" && (
                            <button
                                onClick={handleSubmit}
                                disabled={answersLoading}
                                className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 ${answersLoading
                                    ? "bg-gray-400 cursor-not-allowed"
                                    : "bg-green-600 hover:bg-green-700 text-white"
                                    }`}
                            >
                                {answersLoading && <Loader2 size={16} className="animate-spin" />}
                                ✅ Submit
                            </button>
                        )}
                    </>
                )}

                {/* Case 4: Answer submitted, NOT in editing mode */}
                {question.submit_status === "submitted" && !isEditing && (
                    <>
                        <button disabled className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-400 cursor-not-allowed text-white">
                            ✅ Answer Submitted
                        </button>
                        <button
                            onClick={handleToggleEdit}
                            className="px-4 py-2 rounded-lg text-sm font-medium bg-orange-600 hover:bg-orange-700 text-white"
                        >
                            ✏️ Continue Editing
                        </button>
                    </>
                )}

                {/* Case 5: Answer submitted AND in editing mode - Show all tools like in Case 3 */}
                {question.submit_status === "submitted" && isEditing && (
                    <>
                        <button
                            onClick={handleGenerateAnswer}
                            disabled={isGenerating}
                            className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 ${isGenerating
                                ? "bg-gray-400 cursor-not-allowed"
                                : "bg-purple-600 hover:bg-purple-700 text-white"
                                }`}
                        >
                            <span>🤖</span>
                            {isGenerating && <Loader2 size={16} className="animate-spin" />}
                            {isGenerating ? "Generating..." : "Generate"}
                        </button>

                        <button
                            onClick={handleSaveAnswer}
                            disabled={answersLoading}
                            className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 ${answersLoading
                                ? "bg-gray-400 cursor-not-allowed"
                                : "bg-orange-600 hover:bg-orange-700 text-white"
                                }`}
                        >
                            {answersLoading && <Loader2 size={16} className="animate-spin" />}
                            💾 Save
                        </button>

                        <button
                            onClick={handleChatButtonClick}
                            className="px-4 py-2 rounded-lg text-sm font-medium bg-green-600 hover:bg-green-700 text-white"
                        >
                            <span>💬</span>
                            Chat Prompt
                        </button>

                        <button
                            onClick={toggleVersionDropdown}
                            className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            <span>📝</span>
                            Versions{" "}
                            {versions.length > 0 && (
                                <span className="ml-1 bg-white text-indigo-600 px-1.5 py-0.5 rounded-full text-xs">
                                    {versions.length}
                                </span>
                            )}{" "}
                            {showVersionDropdown ? "▲" : "▼"}
                        </button>

                        <button
                            onClick={handleAnalyzeQuestion}
                            disabled={isAnalyzing}
                            className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 ${isAnalyzing
                                ? "bg-gray-400 cursor-not-allowed"
                                : "bg-red-600 hover:bg-red-700 text-white"
                                }`}
                        >
                            {isAnalyzing && <Loader2 size={16} className="animate-spin" />}
                            {isAnalyzing ? "Analyzing..." : "AI Analysis"}
                        </button>

                        <button
                            onClick={handleToggleEdit}
                            className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-600 hover:bg-gray-700 text-white"
                        >
                            ✏️ Stop Editing
                        </button>

                        {localAnswer && localAnswer.trim() !== "" && (
                            <button
                                onClick={handleSubmit}
                                disabled={answersLoading}
                                className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 ${answersLoading
                                    ? "bg-gray-400 cursor-not-allowed"
                                    : "bg-green-600 hover:bg-green-700 text-white"
                                    }`}
                            >
                                {answersLoading && <Loader2 size={16} className="animate-spin" />}
                                ✅ Submit
                            </button>
                        )}
                    </>
                )}
            </div>

            {/* Chat Input */}
            {showInput && (
                <div className="flex items-center gap-2 mt-4">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handlePromptSubmit()}
                        placeholder="Type your prompt..."
                        className={`flex-grow px-3 py-2 border rounded-md ${isDarkMode
                            ? "bg-gray-800 border-gray-600 text-white"
                            : "bg-white border-gray-300 text-gray-900"
                            }`}
                    />
                    <button
                        onClick={handlePromptSubmit}
                        disabled={chatLoading}
                        className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-4 py-2 rounded-md flex items-center justify-center"
                    >
                        {chatLoading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                    </button>
                </div>
            )}

            {/* AI Analysis Result */}
            {analysisResult && (
                <div className={`mt-4 p-4 rounded-lg border ${isDarkMode ? "bg-gray-800 border-gray-600" : "bg-gray-100 border-gray-300"}`}>
                    <h3 className={`text-lg font-semibold mb-3 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                        AI Analysis Result
                    </h3>

                    {/* Score */}
                    <div className="mb-3">
                        <p className={`${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                            <strong className={isDarkMode ? "text-white" : "text-gray-900"}>Score:</strong>{" "}
                            <span className={`text-sm ${isDarkMode ? "text-gray-200" : "text-gray-800"}
                                        }`}>
                                {analysisResult.score}
                            </span>
                        </p>
                    </div>

                    {/* Question Text */}
                    {analysisResult.question_text && (
                        <div className="mb-3">
                            <p className={`font-semibold mb-1 ${isDarkMode ? "text-gray-200" : "text-gray-800"}`}>
                                Question:
                            </p>
                            <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"} pl-3 border-l-2 ${isDarkMode ? "border-purple-500" : "border-purple-400"}`}>
                                {analysisResult.question_text}
                            </p>
                        </div>
                    )}

                    {/* Answer */}
                    {analysisResult.answer && (
                        <div className="mb-3">
                            <p className={`font-semibold mb-1 ${isDarkMode ? "text-gray-200" : "text-gray-800"}`}>
                                Answer:
                            </p>
                            <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"} pl-3 border-l-2 ${isDarkMode ? "border-blue-500" : "border-blue-400"} max-h-40 overflow-y-auto`}>
                                {analysisResult.answer}
                            </p>
                        </div>
                    )}

                    {/* Feedback (if available) */}
                    {analysisResult.feedback && (
                        <div className="mt-3 pt-3 border-t border-gray-300 dark:border-gray-600">
                            <p className={`font-semibold mb-1 ${isDarkMode ? "text-gray-200" : "text-gray-800"}`}>
                                Feedback:
                            </p>
                            <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                                {analysisResult.feedback}
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* Versions Section - Full Width */}
            {showVersionDropdown && versions.length > 0 && (
                <div className={`mt-4 p-4 rounded-lg border ${isDarkMode ? "bg-gray-800 border-gray-600" : "bg-gray-100 border-gray-300"}`}>
                    <h3 className={`text-lg font-semibold mb-3 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                        Generated Responses ({versions.length})
                    </h3>
                    <div className="space-y-3">
                        {versions.map((version, vIdx) => (
                            <div
                                key={version.id || vIdx}
                                className={`p-4 rounded-lg cursor-pointer transition-colors border ${isDarkMode
                                    ? "bg-gray-750 hover:bg-gray-700 border-gray-600"
                                    : "bg-white hover:bg-gray-50 border-gray-200"
                                    }`}
                                onClick={() => {
                                    setLocalAnswer(version.answer || "");
                                    toast.success(`Version ${vIdx + 1} loaded into editor`);
                                }}
                            >
                                <div className="flex items-center justify-between mb-3">
                                    {/* Left side */}
                                    <span
                                        className={`text-sm font-semibold ${isDarkMode ? "text-indigo-400" : "text-indigo-600"
                                            }`}
                                    >
                                        Version {vIdx + 1} (ID: {version.id})
                                    </span>

                                    {/* Right side */}
                                    <div className="flex items-center gap-3">
                                        {version.generated_at && (
                                            <span
                                                className={`text-xs ${isDarkMode ? "text-gray-500" : "text-gray-400"
                                                    }`}
                                            >
                                                {new Date(version.generated_at).toLocaleString()}
                                            </span>
                                        )}

                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                navigator.clipboard.writeText(version.answer || "");
                                            }}
                                            className={`text-xs px-2 py-1 rounded ${isDarkMode
                                                ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                                }`}
                                        >
                                            Copy
                                        </button>
                                    </div>
                                </div>
                                <p className={`text-sm ${isDarkMode ? "text-gray-300" : "text-gray-700"} leading-relaxed`}>
                                    {version.answer || "No content"}
                                </p>
                                <div className="mt-3 pt-3 border-t border-gray-300 dark:border-gray-600">
                                    <span className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                                        Click to load this version into the editor
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReviewerAnswerEditor;