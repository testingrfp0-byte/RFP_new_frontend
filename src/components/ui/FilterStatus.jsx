import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchFilterQuestionsRequest,
  setQuestionFilter,
} from "../../features/modules/questions/questionsSlice";
import {
  selectCurrentQuestionFilter,
  selectAssignedQuestions,
} from "../../features/modules/questions/selectors";

const FilterStatus = ({ isDarkMode }) => {
  const dispatch = useDispatch();
  const assignedQuestions = useSelector(selectAssignedQuestions);
  const currentFilter = useSelector(selectCurrentQuestionFilter);

  // Calculate counts from ALL assigned questions (not filtered by document)
  const statusCounts = React.useMemo(() => {
    if (!assignedQuestions) {
      return {
        submitted: 0,
        notSubmitted: 0,
        process: 0,
        total: 0,
      };
    }

    // Filter out deleted questions
    const activeQuestions = assignedQuestions.filter((q) => q.is_deleted === false);

    return {
      submitted: activeQuestions.filter((q) => q.submit_status === "submitted").length,
      notSubmitted: activeQuestions.filter((q) => q.submit_status === "not submitted").length,
      process: activeQuestions.filter((q) => q.submit_status === "process").length,
      total: activeQuestions.length,
    };
  }, [assignedQuestions]);

  useEffect(() => {
    dispatch(fetchFilterQuestionsRequest());
  }, [dispatch]);

  const handleFilterChange = (status) => {
    dispatch(setQuestionFilter(status));
  };

  return (
    <div
      className={`gap-3 mb-6 flex items-center justify-start p-4 rounded-lg transition-colors ${isDarkMode ? "bg-gray-700 hover:bg-gray-650" : "bg-gray-50 hover:bg-gray-100"
        }`}
    >
      <span className="text-purple-400 text-lg">📊</span>

      <h3
        className={`text-lg font-semibold transition-colors ${isDarkMode ? "text-white" : "text-gray-900"
          }`}
      >
        Questions Status
      </h3>

      <div className="w-md">
        <select
          value={currentFilter}
          onChange={(e) => handleFilterChange(e.target.value)}
          className={`flex-grow px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isDarkMode
            ? "bg-gray-700 text-gray-300 border border-gray-600 focus:ring-purple-500 focus:border-purple-500"
            : "bg-white text-gray-700 border border-gray-300 focus:ring-purple-500 focus:border-purple-500"
            }`}
        >
          <option value="submitted">
            Submitted: {statusCounts.submitted}
          </option>

          <option value="not submitted">
            Not Submitted: {statusCounts.notSubmitted}
          </option>

          <option value="process">
            Process: {statusCounts.process}
          </option>

          <option value="all">
            Total Questions: {statusCounts.total}
          </option>
        </select>
      </div>
    </div>
  );
};

export default FilterStatus;