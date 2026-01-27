import React, { useEffect, useMemo, useRef, useState } from "react";
import { useTheme } from "../../contexts/ThemeContext";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { ToastContainer } from "react-toastify";
import ToasterNotification from "../../components/ui/ToasterNotification";
import {
    fetchAssignedQuestionsRequest,
    fetchFilterQuestionsRequest
} from "../../features/modules/questions/questionsSlice";
import {
    selectAssignedQuestions,
    selectQuestionsLoading
} from "../../features/modules/questions/selectors";
import AdminQuestionCard from "../../components/ui/AdminQuestionsCard";
import FilterStatus from "../../components/ui/FilterStatus";

const SelfAssignDashboard = () => {
    const { isDarkMode } = useTheme();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const documentAnalysisRef = useRef(null);
    const assignedQuestions = useSelector(selectAssignedQuestions);
    const [selectedPdf, setSelectedPdf] = useState(null);
    const [filterStatus, setFilterStatus] = useState("all");
    const [expandedQuestion, setExpandedQuestion] = useState(null);
    const [toasterNotification, setToasterNotification] = useState(null);
    const [initialLoad, setInitialLoad] = useState(true);
    const reduxLoading = useSelector(selectQuestionsLoading);

    useEffect(() => {
        const session = localStorage.getItem("session");
        if (!session) {
            navigate("/login");
            return;
        }
        dispatch(fetchAssignedQuestionsRequest());
        dispatch(fetchFilterQuestionsRequest());
    }, [dispatch, navigate]);

    const matchedArray = useMemo(() => {
        if (!assignedQuestions) return [];
        let filtered = assignedQuestions.filter(q => q.is_deleted === false);
        if (filterStatus !== "all") {
            filtered = filtered.filter((q) => q.submit_status === filterStatus);
        }
        return filtered;
    }, [assignedQuestions, filterStatus]);

    useEffect(() => {
        const session = localStorage.getItem("session");
        if (session && assignedQuestions.length > 0) {
            const email = JSON.parse(session).email;
            const questionMap = assignedQuestions.reduce((acc, q) => {
                acc[q.question_id] = { answer: q.answer };
                return acc;
            }, {});
            localStorage.setItem(`assigned_questions_${email}`, JSON.stringify(questionMap));
        }
    }, [assignedQuestions]);

    useEffect(() => {
        if (!reduxLoading && initialLoad) {
            setInitialLoad(false);
        }
    }, [reduxLoading, initialLoad]);

    if (initialLoad && reduxLoading) {
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
        <div className={`min-h-screen p-4 ${isDarkMode ? "bg-gray-900" : "bg-gray-50"}`}>
            <ToastContainer position="top-right" autoClose={3000} />
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <h1
                        className={`text-3xl font-bold mb-2 flex items-center gap-3 ${isDarkMode ? "text-white" : "text-gray-900"
                            }`}
                    >
                        <span className="text-4xl">👤</span>
                        My Questions - Assigned to me to review and approve
                    </h1>
                    <p className={`${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                        View and respond to questions you have self-assigned
                    </p>
                </div>

                {/* Status Filter */}
                <FilterStatus isDarkMode={isDarkMode} />

                <div
                    className={`p-6 rounded-xl shadow-xl mb-6 ${isDarkMode ? "bg-gray-800 border border-gray-600" : "bg-white"
                        }`}
                >
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-2 h-8 bg-purple-500 rounded-full"></div>
                        <h2 className={`text-xl font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                            Responses in Process
                        </h2>
                    </div>

                    {matchedArray.length === 0 ? (
                        <div className="text-center py-12">
                            <div
                                className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${isDarkMode ? "bg-gray-700" : "bg-gray-200"
                                    }`}
                            >
                                <span className={`text-2xl ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>
                                    📄
                                </span>
                            </div>
                            <p className={`text-lg ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                                No questions assigned to you yet
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* Document Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 py-5">
                                {matchedArray
                                    .filter(
                                        (pdf, index, self) =>
                                            self.findIndex((p) => p.rfp_id === pdf.rfp_id) === index
                                    )
                                    .map((pdf) => (
                                        <div
                                            key={pdf.rfp_id}
                                            className={`rounded-lg p-4 cursor-pointer transition-all hover:border-purple-500 hover:shadow-lg group ${isDarkMode
                                                ? "bg-gray-700 border border-gray-600 hover:bg-gray-650"
                                                : "bg-gray-50 border border-gray-200 hover:bg-gray-100"
                                                } ${selectedPdf?.rfp_id === pdf.rfp_id
                                                    ? `ring-2 ring-purple-500 border-purple-500 ${isDarkMode ? "bg-gray-650" : "bg-gray-100"
                                                    }`
                                                    : ""
                                                }`}
                                            onClick={() => {
                                                setSelectedPdf(pdf);
                                                setTimeout(
                                                    () =>
                                                        documentAnalysisRef.current?.scrollIntoView({
                                                            behavior: "smooth",
                                                        }),
                                                    100
                                                );
                                            }}
                                        >
                                            <div className="flex flex-col items-center text-center">
                                                <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-3">
                                                    <span className="text-purple-400 text-xl">📄</span>
                                                </div>
                                                <h3
                                                    className={`font-semibold mb-2 truncate w-full text-sm ${isDarkMode ? "text-white" : "text-gray-900"
                                                        }`}
                                                >
                                                    {pdf.project_name || pdf.filename}
                                                </h3>
                                                <p className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                                                    {pdf.assigned_at &&
                                                        new Date(pdf.assigned_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                            </div>

                            {/* Questions List */}
                            {selectedPdf && (
                                <div ref={documentAnalysisRef} className="space-y-3 mt-8">
                                    {matchedArray
                                        .filter((q) => q.rfp_id === selectedPdf.rfp_id)
                                        .map((question, idx) => (
                                            <AdminQuestionCard
                                                key={question.question_id}
                                                question={question}
                                                idx={idx}
                                                expandedQuestion={expandedQuestion}
                                                setExpandedQuestion={setExpandedQuestion}
                                            />
                                        ))}
                                </div>
                            )}
                        </>
                    )}
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
};

export default SelfAssignDashboard;
