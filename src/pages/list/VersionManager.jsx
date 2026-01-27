import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  fetchVersionsRequest,
  toggleVersionDropdown,
} from "../../features/modules/answers/answersSlice";

import {
  selectVersionsByQuestion,
  selectVersionDropdownVisible,
  selectVersionsLoading,
} from "../../features/modules/answers/selectors";

import { updateQuestionLocally } from
  "../../features/modules/questions/questionsSlice";

const VersionManager = ({ questionId, isDarkMode }) => {
  const dispatch = useDispatch();

  const versions = useSelector(selectVersionsByQuestion(questionId));
  const show = useSelector(selectVersionDropdownVisible(questionId));
  const loading = useSelector(selectVersionsLoading(questionId));

  useEffect(() => {
    if (versions.length === 0) {
      dispatch(fetchVersionsRequest(questionId));
    }
  }, [questionId, dispatch]);

  const handleToggle = () => {
    dispatch(toggleVersionDropdown(questionId));
  };

  const handleSelect = (version) => {
    dispatch(
      updateQuestionLocally({
        questionId,
        updates: { answer: version.answer || "" },
      })
    );
  };

  return (
    <div className="w-full">
      <button
        onClick={handleToggle}
        disabled={loading}
        className={`px-4 py-2 rounded-lg text-sm font-medium
          flex items-center gap-2 transition-all
          ${loading
            ? "bg-gray-400 cursor-not-allowed opacity-60"
            : "bg-blue-600 hover:bg-blue-700 text-white"
          }`}
      >
        <span>📄</span>
        Versions
        <span className="ml-1 bg-white text-blue-600 px-2 py-0.5 rounded-full text-xs">
          {versions.length}
        </span>
        <span className="ml-1">{show ? "▲" : "▼"}</span>
      </button>

      {/* INLINE PANEL (NOT DROPDOWN) */}
      {show && (
        <div
          className={`mt-4 rounded-lg border
            ${isDarkMode
              ? "bg-gray-900 border-gray-700"
              : "bg-gray-50 border-gray-200"
            }`}
        >
          {/* Header */}
          <div
            className={`px-4 py-3 border-b text-sm font-semibold
              ${isDarkMode
                ? "border-gray-700 text-gray-300"
                : "border-gray-200 text-gray-700"
              }`}
          >
            Generated Responses ({versions.length})
          </div>

          {/* Versions */}
          <div className="divide-y max-h-[320px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent">
            {versions.map((version, idx) => (
              <div
                key={version.id}
                className={`p-4 cursor-pointer
                  ${isDarkMode ? "hover:bg-gray-800" : "hover:bg-white"}`}
                onClick={() => handleSelect(version)}
              >
                <div className="flex justify-between items-center mb-2">
                  <span className={`text-xs font-medium
                    ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}
                  >
                    Version {idx + 1} (ID: {version.id})
                  </span>

                  <div className="flex items-center gap-2">
                    {version.generated_at && (
                      <span className="text-xs text-gray-400">
                        {new Date(version.generated_at).toLocaleString()}
                      </span>
                    )}

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigator.clipboard.writeText(version.answer || "");
                      }}
                      className={`text-xs px-2 py-1 rounded
                        ${isDarkMode
                          ? "bg-gray-700 text-gray-300"
                          : "bg-gray-200 text-gray-700"
                        }`}
                    >
                      Copy
                    </button>
                  </div>
                </div>

                <p
                  className={`text-sm leading-relaxed
                    ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}
                >
                  {version.answer || "No content available"}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default VersionManager;
