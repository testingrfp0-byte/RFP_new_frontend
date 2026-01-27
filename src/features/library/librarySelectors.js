export const selectLibraryLoading = (state) => state.library.loading;

export const selectHistoricRFPs = (state) =>
  state.library.historicRFPs;

export const selectCleanFiles = (state) => state.library.clean;

export const selectTrainingMaterials = (state) =>
  state.library.trainingMaterials;

export const selectLearningDocuments = (state) =>
  state.library.learningDocuments;