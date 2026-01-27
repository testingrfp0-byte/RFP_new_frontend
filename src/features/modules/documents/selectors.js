export const selectDocuments = (state) => state.documents?.list || [];
export const selectDocumentsLoading = (state) => state.documents?.loading;
export const selectSelectedDocument = (state) => state.documents?.selected;
export const selectDocumentDetails = (state) =>
  state.documents.details;

export const selectDocumentDetailsLoading = (state) =>
  state.documents.detailsLoading;

export const selectAiAnalysisLoading = (state) =>
  state.documents.aiAnalysisLoading;

export const selectCurrentAnalyzingId = (state) =>
  state.documents.currentAnalyzingId;

export const selectAiAnalysisResults = (state) =>
  state.documents.aiAnalysisResults;

export const selectFilterData = (state) =>
  state.documents.filterData;

export const selectDeleteLoading = (state) =>
  state.documents.deleteLoading;

export const selectDeleteSuccess = (state) =>
  state.documents.deleteSuccess;

export const selectDocumentsError = (state) =>
  state.documents.error;