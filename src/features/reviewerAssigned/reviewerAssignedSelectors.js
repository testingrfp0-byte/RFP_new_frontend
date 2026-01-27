export const selectReviewers = (state) =>
  state.reviewerAssigned.reviewers;

export const selectAssignedQuestions = (state) =>
  state.reviewerAssigned.assignedQuestions;

export const selectDocumentQuestions = (state) =>
  state.reviewerAssigned.documentQuestions;

export const selectSelectedReviewer = (state) =>
  state.reviewerAssigned.selectedReviewer;

export const selectReviewerLoading = (state) =>
  state.reviewerAssigned.loading;

export const selectRemovingQuestion = (state) =>
  state.reviewerAssigned.removingQuestion;

export const selectReviewerError = (state) =>
  state.reviewerAssigned.error;

export const selectUserRole = (state) =>
  state.reviewerAssigned.userRole;
