import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  list: [],
  selected: null,
  details: null,
  filterData: null,

  aiAnalysisResults: {},
  currentAnalyzingId: null,

  loading: false,
  detailsLoading: false,
  aiAnalysisLoading: false,

  deleteLoading: false,
  deleteSuccess: false,

  error: null,
};

const documentsSlice = createSlice({
  name: "documents",
  initialState,
  reducers: {
    selectDocument: (state, action) => {
      state.selected = action.payload;
    },

    fetchDocumentsRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchDocumentsSuccess: (state, action) => {
      state.loading = false;
      state.list = action.payload;
    },
    fetchDocumentsFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    fetchDocumentDetailsRequest: (state) => {
      state.detailsLoading = true;
      state.error = null;
    },
    fetchDocumentDetailsSuccess: (state, action) => {
      state.detailsLoading = false;
      state.details = action.payload;
    },
    fetchDocumentDetailsFailure: (state, action) => {
      state.detailsLoading = false;
      state.error = action.payload;
    },

    // 🔥 DELETE
    deleteDocumentRequest: (state) => {
      state.deleteLoading = true;
      state.deleteSuccess = false;
      state.error = null;
    },
    deleteDocumentSuccess: (state, action) => {
      state.deleteLoading = false;
      state.deleteSuccess = true;
      state.list = state.list.filter(
        (doc) => doc.id !== action.payload
      );
    },
    deleteDocumentFailure: (state, action) => {
      state.deleteLoading = false;
      state.deleteSuccess = false;
      state.error = action.payload;
    },
    resetDeleteState: (state) => {
      state.deleteLoading = false;
      state.deleteSuccess = false;
    },

    startAiAnalysisRequest: (state, action) => {
      state.aiAnalysisLoading = true;
      state.currentAnalyzingId = action.payload.rfpId;
      state.error = null;
    },
    startAiAnalysisSuccess: (state, action) => {
      state.aiAnalysisLoading = false;
      state.currentAnalyzingId = null;
      state.aiAnalysisResults[action.payload.rfpId] =
        action.payload.results;
    },
    startAiAnalysisFailure: (state, action) => {
      state.aiAnalysisLoading = false;
      state.currentAnalyzingId = null;
      state.error = action.payload;
    },

    generateDocumentRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    generateDocumentSuccess: (state, action) => {
      state.loading = false;
      state.details = action.payload;
    },
    generateDocumentFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    fetchFilterDataRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchFilterDataSuccess: (state, action) => {
      state.loading = false;
      state.filterData = action.payload;
    },
    fetchFilterDataFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const {
  selectDocument,

  fetchDocumentsRequest,
  fetchDocumentsSuccess,
  fetchDocumentsFailure,

  fetchDocumentDetailsRequest,
  fetchDocumentDetailsSuccess,
  fetchDocumentDetailsFailure,

  deleteDocumentRequest,
  deleteDocumentSuccess,
  deleteDocumentFailure,
  resetDeleteState,

  startAiAnalysisRequest,
  startAiAnalysisSuccess,
  startAiAnalysisFailure,

  generateDocumentRequest,
  generateDocumentSuccess,
  generateDocumentFailure,

  fetchFilterDataRequest,
  fetchFilterDataSuccess,
  fetchFilterDataFailure,
} = documentsSlice.actions;

export default documentsSlice.reducer;
