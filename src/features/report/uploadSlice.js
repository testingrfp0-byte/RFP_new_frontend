import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  files: [],
  projectName: "",
  summary: "",
  questions: [],
  answers: [],
  assignStatus: [],
  loading: false,
  error: null,
  successMessage: "",
};

const uploadSlice = createSlice({
  name: "upload",
  initialState,
  reducers: {
    setFiles: (state, action) => {
      state.files = action.payload;
    },
    removeFile: (state, action) => {
      state.files.splice(action.payload, 1);
    },
    clearFiles: (state) => {
      state.files = [];
    },
    setProjectName: (state, action) => {
      state.projectName = action.payload;
    },

    uploadFilesRequest: (state) => {
      state.loading = true;
      state.error = null;
      state.successMessage = "";
      state.summary = "";
      state.questions = [];
      state.answers = [];
      state.assignStatus = [];
    },

    uploadFilesSuccess: (state, action) => {
      state.loading = false;
      state.summary = action.payload.summary;
      state.questions = action.payload.questions;
      state.answers = action.payload.questions.map(() => "");
      state.assignStatus = action.payload.questions.map(() => "");
      state.successMessage = action.payload.message;
    },

    uploadFilesFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    updateAnswerLocally: (state, action) => {
      const { index, value } = action.payload;
      state.answers[index] = value;
    },
  },
});

export const {
  setFiles,
  removeFile,
  clearFiles,
  setProjectName,
  uploadFilesRequest,
  uploadFilesSuccess,
  uploadFilesFailure,
  updateAnswerLocally,
} = uploadSlice.actions;

export default uploadSlice.reducer;
