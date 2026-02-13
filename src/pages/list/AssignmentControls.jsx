import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setAssignmentDropdown, assignReviewerRequest } from "../../features/modules/assignments/assignmentsSlice";
import { selectAssignmentDropdown, selectUnassignLoading } from "../../features/modules/assignments/selectors";
import { deleteQuestionRequest } from "../../features/modules/questions/questionsSlice";
import { selectUsers } from "../../features/modules/users/selectors";
import { selectSelectedDocument } from "../../features/modules/documents/selectors";
import { fetchUsersRequest } from "../../features/modules/users/usersSlice";
import { toast } from "react-toastify";
import ConfirmationDialog from "../../components/ui/ConfirmationDialog";

const AssignmentControls = ({
  question,
  globalIdx,
  isDarkMode,
  assignStatus,
  selectedReviewers,
  onAssignmentComplete
}) => {
  const dispatch = useDispatch();
  const [draftReviewers, setDraftReviewers] = useState([]);
  const [doneLoading, setDoneLoading] = useState(false);
  const users = useSelector(selectUsers);
  const assignmentDropdown = useSelector(selectAssignmentDropdown);
  const unassignLoading = useSelector(selectUnassignLoading) || {};
  const selectedDocument = useSelector(selectSelectedDocument);
  const showDropdown = assignmentDropdown === globalIdx;
  const isAssigned = assignStatus && assignStatus[globalIdx];
  const verifiedReviewers = users.filter(
    (u) => u.is_verified && ["reviewer", "admin"].includes(u.role?.toLowerCase())
  );
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Sync draftReviewers with selectedReviewers whenever it changes
  useEffect(() => {
    if (showDropdown) {
      const currentReviewers = selectedReviewers?.[globalIdx] || [];
      console.log(`Syncing reviewers for question ${globalIdx}:`, currentReviewers);
      setDraftReviewers(currentReviewers);
    }
  }, [showDropdown, selectedReviewers, globalIdx]);

  const handleAssignClick = () => {
    dispatch(fetchUsersRequest());
    dispatch(setAssignmentDropdown(showDropdown ? null : globalIdx));
  };

  const handleDeleteConfirm = () => {
    dispatch(
      deleteQuestionRequest({
        questionId: question.id,
        rfpId: selectedDocument?.id,
        onSuccess: (msg) => toast.success(msg),
        onError: (msg) => toast.error(msg),
      })
    );
    setShowDeleteDialog(false);
  };

  const handleDelete = () => {
    setShowDeleteDialog(true);
  };

  const handleReviewerToggle = (user, checked) => {
    setDraftReviewers((prev) => {
      if (checked) {
        return [...prev, user];
      }
      return prev.filter((u) => u.user_id !== user.user_id);
    });
  };

  const handleDone = () => {
    if (!draftReviewers.length) {
      toast.error("Please select at least one reviewer");
      return;
    }

    if (!selectedDocument?.id) {
      toast.error("No document selected");
      console.error("selectedDocument:", selectedDocument);
      return;
    }

    if (!question?.id) {
      toast.error("Invalid question");
      console.error("question:", question);
      return;
    }

    setDoneLoading(true);

    dispatch(
      assignReviewerRequest({
        qIdx: globalIdx,
        users: draftReviewers,
        questionId: question.id,
        fileId: selectedDocument.id,
        onSuccess: () => {
          console.log(`Assignment successful for question ${globalIdx}`);
          console.log('Assigned reviewers:', draftReviewers);
          toast.success("Reviewers assigned successfully");
          dispatch(setAssignmentDropdown(null));
          setDoneLoading(false);

          if (onAssignmentComplete) {
            console.log('Calling onAssignmentComplete to refresh data...');
            onAssignmentComplete();
          } else {
            console.warn('onAssignmentComplete callback is not defined!');
          }
        },
        onError: (msg) => {
          console.error('Assignment failed:', msg);
          toast.error(msg);
          setDoneLoading(false);
        },
      })
    );
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <button
            onClick={handleAssignClick}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
          >
            <span>👤</span>
            Assign
          </button>

          {!isAssigned && (
            <button
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Delete
            </button>
          )}

          {isAssigned && (
            <span className="text-purple-400 text-sm bg-purple-500/20 px-3 py-1 rounded-full">
              {assignStatus[globalIdx]}
            </span>
          )}
        </div>
      </div>

      {showDropdown && (
        <div className="mt-3">
          <div
            className={`p-3 rounded-lg border transition-colors ${isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'
              }`}
          >
            <div className="mb-2">
              <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Select reviewers:
              </span>
            </div>

            <div className="max-h-40 overflow-y-auto space-y-2">
              {verifiedReviewers.map((user) => {
                const isChecked = draftReviewers.some((r) => r.user_id === user.user_id);
                const isLoading = unassignLoading?.[`${globalIdx}-${user.user_id}`];

                return (
                  <label
                    key={user.user_id}
                    className={`flex items-center gap-3 p-2 rounded cursor-pointer transition-colors ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                      }`}
                  >
                    <div className="relative">
                      <input
                        type="checkbox"
                        className={`w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 focus:ring-2 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                        checked={isChecked}
                        onChange={(e) => handleReviewerToggle(user, e.target.checked)}
                        disabled={isLoading}
                      />
                      {isLoading && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-500"></div>
                        </div>
                      )}
                    </div>

                    <span className={`text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {user.username}
                      {user.email && (
                        <span className={`ml-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          ({user.email})
                        </span>
                      )}
                      {user.role && (
                        <span
                          className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium ${user.role.toLowerCase() === 'reviewer'
                            ? 'bg-green-100 text-green-800 border border-green-200'
                            : 'bg-gray-100 text-gray-800 border border-gray-200'
                            } ${isDarkMode && user.role.toLowerCase() === 'reviewer'
                              ? 'bg-green-900/30 text-green-300 border-green-700'
                              : isDarkMode
                                ? 'bg-gray-700 text-gray-300 border-gray-600'
                                : ''
                            }`}
                        >
                          {user.role}
                        </span>
                      )}
                    </span>
                  </label>
                );
              })}
            </div>

            <div className="mt-3 pt-2 border-t border-gray-300">
              <button
                onClick={handleDone}
                disabled={doneLoading}
                className={`px-3 py-1 rounded text-sm transition-colors ${doneLoading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gray-500 hover:bg-gray-600 text-white"
                  }`}
              >
                {doneLoading ? "Saving..." : "Done"}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmationDialog
        isOpen={showDeleteDialog}
        title="Delete Question"
        message="Are you sure you want to delete this question? This action cannot be undone."
        onConfirm={handleDeleteConfirm}
        onClose={() => setShowDeleteDialog(false)}
      />
    </div>
  );
};

export default AssignmentControls;
