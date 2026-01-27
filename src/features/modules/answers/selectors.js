export const selectIsEditing = (questionId) => (state) =>
  !!state.answers.editing[questionId];

export const selectIsGenerating = (questionId) => (state) =>
  !!state.answers.generating[questionId];

export const selectSubmissionStatus = (questionId) => (state) =>
  state.answers.submissionStatus[questionId];

export const selectSubmissionError = (questionId) => (state) =>
  state.answers.submissionErrors[questionId];

export const selectVersionsByQuestion = (questionId) => (state) =>
  state.answers.versions[questionId] || [];

export const selectVersionsLoading = (questionId) => (state) =>
  state.answers.loadingVersions[questionId];

export const selectVersionDropdownVisible = (questionId) => (state) =>
  state.answers.showVersionDropdown[questionId];

export const selectAnalyzingId = (state) =>
  state.answers.analyzingId;

export const selectAnalysisResult = (questionId) => (state) =>
  state.answers.analysisResults[questionId];

export const selectChatLoading = (state) =>
  state.answers.chatLoading;

export const selectAnswersLoading = (state) =>
  state.answers.loading;

export const selectAnswersError = (state) =>
  state.answers.error;

export const selectChatPromptSaved = (questionId) => (state) =>
  !!state.answers.chatPromptSaved[questionId];
