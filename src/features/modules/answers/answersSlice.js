import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  editing: {},
  generating: {},
  submissionStatus: {},
  submissionErrors: {},
  versions: {},
  showVersionDropdown: {},
  loadingVersions: {},
  analysisResults: {},
  analyzingId: null,

  chatLoading: false,
  chatError: null,
  chatPromptSaved: {},

  loading: false,
  error: null,
};

const answersSlice = createSlice({
  name: "answers",
  initialState,
  reducers: {
    generateAnswerRequest: (state, action) => {
      state.generating[action.payload] = true;
    },
    generateAnswerSuccess: (state, action) => {
      state.generating[action.payload.questionId] = false;
      // CLEAR chatPromptSaved when generating via Generate button
      state.chatPromptSaved[action.payload.questionId] = false;
    },
    generateAnswerFailure: (state, action) => {
      state.generating[action.payload.questionId] = false;
      state.error = action.payload.error;
    },

    updateAnswerRequest: (state) => {
      state.loading = true;
    },
    updateAnswerSuccess: (state, action) => {
      state.loading = false;
      if (action.payload?.questionId) {
        state.analysisResults[action.payload.questionId] = null;
      }
    },
    updateAnswerFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload.error;
    },

    submitAnswerRequest: (state) => {
      state.loading = true;
    },
    submitAnswerSuccess: (state, action) => {
      state.loading = false;
      // Clear chatPromptSaved on submit
      if (action.payload?.questionId) {
        state.chatPromptSaved[action.payload.questionId] = false;
        state.analysisResults[action.payload.questionId] = null;
      }
    },
    submitAnswerFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload.error;
    },

    notForMeRequest: (state) => {
      state.loading = true;
    },
    notForMeSuccess: (state, action) => {
      state.loading = false;
      // Clear chatPromptSaved when marked as not for me
      if (action.payload?.questionId) {
        state.chatPromptSaved[action.payload.questionId] = false;
      }
    },
    notForMeFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload.error;
    },

    submitChatPromptRequest: (state) => {
      state.chatLoading = true;
      state.chatError = null;
    },
    submitChatPromptSuccess: (state, action) => {
      state.chatLoading = false;
      if (action.payload?.questionId) {
        state.chatPromptSaved[action.payload.questionId] = true;
      }
    },
    submitChatPromptFailure: (state, action) => {
      state.chatLoading = false;
      state.chatError = action.payload;
    },

    fetchVersionsRequest: (state, action) => {
      state.loadingVersions[action.payload] = true;
    },
    fetchVersionsSuccess: (state, action) => {
      const { questionId, versions } = action.payload;
      state.versions[questionId] = versions;
      state.loadingVersions[questionId] = false;
    },
    fetchVersionsFailure: (state, action) => {
      state.error = action.payload;
    },

    toggleVersionDropdown: (state, action) => {
      const id = action.payload;
      state.showVersionDropdown[id] = !state.showVersionDropdown[id];
    },

    analyzeAnswerRequest: (state, action) => {
      state.analyzingId = action.payload.questionId;
    },
    analyzeAnswerSuccess: (state, action) => {
      state.analyzingId = null;
      state.analysisResults[action.payload.questionId] =
        action.payload.result;
    },
    analyzeAnswerFailure: (state, action) => {
      state.analyzingId = null;
      state.error = action.payload;
    },

    clearSubmissionError: (state, action) => {
      state.submissionErrors[action.payload] = null;
    },

    toggleEditMode: (state, action) => {
      const questionId = action.payload;
      state.editing[questionId] = !state.editing[questionId];
    },

    // NEW: Action to clear chatPromptSaved flag
    clearChatPromptSaved: (state, action) => {
      state.chatPromptSaved[action.payload] = false;
    },
  },
});

export const {
  generateAnswerRequest,
  generateAnswerSuccess,
  generateAnswerFailure,

  updateAnswerRequest,
  updateAnswerSuccess,
  updateAnswerFailure,

  submitAnswerRequest,
  submitAnswerSuccess,
  submitAnswerFailure,

  notForMeRequest,
  notForMeSuccess,
  notForMeFailure,

  submitChatPromptRequest,
  submitChatPromptSuccess,
  submitChatPromptFailure,

  fetchVersionsRequest,
  fetchVersionsSuccess,
  fetchVersionsFailure,

  toggleVersionDropdown,
  toggleEditMode,

  analyzeAnswerRequest,
  analyzeAnswerSuccess,
  analyzeAnswerFailure,

  clearSubmissionError,
  clearChatPromptSaved,
} = answersSlice.actions;

export default answersSlice.reducer;