// Cache for empty arrays per questionId to avoid creating new references
const emptyArrayCache = new Map();

export const selectIsEditing = (questionId) => (state) =>
  !!state.answers.editing[questionId];

export const selectIsGenerating = (questionId) => (state) =>
  !!state.answers.generating[questionId];

export const selectSubmissionStatus = (questionId) => (state) =>
  state.answers.submissionStatus[questionId];

export const selectSubmissionError = (questionId) => (state) =>
  state.answers.submissionErrors[questionId];

// Memoized selector to prevent unnecessary rerenders
export const selectVersionsByQuestion = (questionId) => (state) => {
  const versions = state.answers.versions[questionId];
  if (versions) return versions;

  // Return cached empty array for this questionId
  if (!emptyArrayCache.has(questionId)) {
    emptyArrayCache.set(questionId, []);
  }
  return emptyArrayCache.get(questionId);
};

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
