export const selectAssignmentStatus = (state) =>
  state.assignments.status;

export const selectSelectedReviewers = (state) =>
  state.assignments.selectedReviewers;

export const selectAssignmentDropdown = (state) =>
  state.assignments.dropdown;

export const selectUnassignLoading = (state) =>
  state.assignments.unassignLoading;

export const selectAssignedReviewersData = (state) =>
  state.assignments.assignedReviewersData;

export const selectAssignedReviewersLoading = (state) =>
  state.assignments.assignedReviewersLoading;