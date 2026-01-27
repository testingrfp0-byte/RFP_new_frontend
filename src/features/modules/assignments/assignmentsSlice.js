import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  status: {},
  selectedReviewers: {},
  unassignLoading: {},
  dropdown: null,
  loading: false,
  error: null,
  assignedReviewersData: null,
  assignedReviewersLoading: false,
};

const assignmentsSlice = createSlice({
  name: "assignments",
  initialState,
  reducers: {
    submitAssignmentRequest: (state) => {
      state.loading = true;
      state.error = null;
    },

    submitAssignmentSuccess: (state, action) => {
      const { qIdx, users } = action.payload;

      const usernames = users.map((u) => u.username);

      state.status[qIdx] = usernames.length
        ? `Assigned to ${usernames.join(", ")}`
        : "";

      state.selectedReviewers[qIdx] = users;
      state.loading = false;
    },

    submitAssignmentFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    assignReviewerRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    assignReviewerSuccess: (state, action) => {
      const { qIdx, users } = action.payload;

      const usernames = users.map((u) => u.username);
      const existing = state.status[qIdx] || "";
      const match = existing.match(/Assigned to (.*)/);

      const existingUsers = match
        ? match[1].split(",").map((u) => u.trim())
        : [];

      const allUsers = Array.from(new Set([...existingUsers, ...usernames]));

      state.loading = false;
      state.status[qIdx] = `Assigned to ${allUsers.join(", ")}`;
      state.selectedReviewers[qIdx] = users;
    },
    assignReviewerFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    unassignReviewerRequest: (state, action) => {
      const { qIdx, userId } = action.payload;
      state.unassignLoading[`${qIdx}-${userId}`] = true;
    },
    unassignReviewerSuccess: (state, action) => {
      const { qIdx, userId, username } = action.payload;

      const updated =
        state.selectedReviewers[qIdx]?.filter(
          (r) => r.user_id !== userId
        ) || [];

      const assignedUsers =
        (state.status[qIdx] || "")
          .replace("Assigned to ", "")
          .split(", ")
          .filter(Boolean)
          .filter((name) => name !== username);

      state.selectedReviewers[qIdx] = updated;
      state.status[qIdx] = assignedUsers.length
        ? `Assigned to ${assignedUsers.join(", ")}`
        : "";

      state.unassignLoading[`${qIdx}-${userId}`] = false;
    },
    unassignReviewerFailure: (state, action) => {
      const { qIdx, userId, error } = action.payload;
      state.unassignLoading[`${qIdx}-${userId}`] = false;
      state.error = error;
    },

    fetchAssignedReviewersRequest: (state) => {
      state.assignedReviewersLoading = true;
      state.error = null;
    },
    fetchAssignedReviewersSuccess: (state, action) => {
      state.assignedReviewersLoading = false;
      state.assignedReviewersData = action.payload;
    },
    fetchAssignedReviewersFailure: (state, action) => {
      state.assignedReviewersLoading = false;
      state.error = action.payload;
    },

    setAssignmentDropdown: (state, action) => {
      state.dropdown = action.payload;
    },

    clearAssignmentError: (state) => {
      state.error = null;
    },

    clearAssignedReviewersData: (state) => {
      state.assignedReviewersData = null;
    },
  },
});

export const {
  submitAssignmentRequest,
  submitAssignmentSuccess,
  submitAssignmentFailure,

  assignReviewerRequest,
  assignReviewerSuccess,
  assignReviewerFailure,

  unassignReviewerRequest,
  unassignReviewerSuccess,
  unassignReviewerFailure,

  fetchAssignedReviewersRequest,
  fetchAssignedReviewersSuccess,
  fetchAssignedReviewersFailure,

  setAssignmentDropdown,
  clearAssignmentError,
  clearAssignedReviewersData,
} = assignmentsSlice.actions;

export default assignmentsSlice.reducer;
