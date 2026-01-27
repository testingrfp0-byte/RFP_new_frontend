export const selectAssignedQuestions = (state) => state.questions.assigned || [];

export const selectSubmittedQuestions = (state) => state.questions.submitted;

export const selectFilteredQuestions = (state) => state.questions.filtered || [];

export const selectQuestionsLoading = (state) => state.questions.loading;

export const selectCurrentQuestionFilter = (state) => state.questions.currentFilter;

export const selectQuestionsStatusCounts = (state) => state.questions.statusCounts;

export const selectCheckSubmitQuestions = (state) => state.questions.checkSubmitQuestions;

export const selectEditApproveQuestions = (state) =>
    state.questions.submitted;

export const selectEditApproveLoading = (state) =>
    state.questions.loading;

export const selectEditApproveError = (state) =>
    state.questions.error;
