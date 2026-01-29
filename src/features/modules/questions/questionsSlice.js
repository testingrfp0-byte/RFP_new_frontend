import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  assigned: [],
  submitted: [],
  filtered: [],
  checkSubmitQuestions: [],
  statusCounts: {
    submitted: 0,
    notSubmitted: 0,
    process: 0,
    total: 0,
  },
  currentFilter: "all",
  loading: false,
  error: null,
};

const questionsSlice = createSlice({
  name: "questions",
  initialState,
  reducers: {
    fetchAssignedQuestionsRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchAssignedQuestionsSuccess: (state, action) => {
      state.loading = false;
      state.assigned = action.payload;
    },
    fetchAssignedQuestionsFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    fetchSubmittedQuestionsRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchSubmittedQuestionsSuccess: (state, action) => {
      state.loading = false;
      state.submitted = action.payload;
    },
    fetchSubmittedQuestionsFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    fetchFilterQuestionsRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchFilterQuestionsSuccess: (state, action) => {
      state.loading = false;
      state.statusCounts = action.payload.counts;
      state.filtered = action.payload.questions;
    },

    fetchFilterQuestionsFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    addQuestionRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    addQuestionSuccess: (state) => {
      state.loading = false;
    },
    addQuestionFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    deleteQuestionRequest: (state) => {
      state.error = null;
    },
    deleteQuestionSuccess: (state, action) => {
      const questionId = action.payload;

      // Remove from all question lists
      state.assigned = state.assigned.filter(
        (q) => q.question_id !== questionId && q.id !== questionId
      );

      state.filtered = state.filtered.filter(
        (q) => q.question_id !== questionId && q.id !== questionId
      );

      state.submitted = state.submitted.filter(
        (q) => q.question_id !== questionId && q.id !== questionId
      );

      state.checkSubmitQuestions = state.checkSubmitQuestions.filter(
        (q) => q.question_id !== questionId && q.id !== questionId
      );
    },
    deleteQuestionFailure: (state, action) => {
      state.error = action.payload;
    },

    analyzeQuestionRequest: (state) => {
      state.error = null;
    },
    analyzeQuestionFailure: (state, action) => {
      state.error = action.payload;
    },

    setQuestionFilter: (state, action) => {
      state.currentFilter = action.payload;
    },

    updateQuestionLocally: (state, action) => {
      const { questionId, updates } = action.payload;

      const updateList = (list) =>
        list.map((q) =>
          q.question_id == questionId ? { ...q, ...updates } : q
        ); // Using loose equality (==) to handle potential string/number mismatches

      if (state.assigned?.length) {
        state.assigned = updateList(state.assigned);
      }

      if (state.submitted?.length) {
        state.submitted = updateList(state.submitted);
      }

      if (state.filtered?.length) {
        state.filtered = updateList(state.filtered);
      }
    },

    reassignQuestionRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    reassignQuestionSuccess: (state) => {
      state.loading = false;
    },
    reassignQuestionFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    updateAdminAnswerRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    updateAdminAnswerSuccess: (state, action) => {
      const { questionId, answer } = action.payload;

      state.submitted = state.submitted.map((q) =>
        q.question_id === questionId ? { ...q, answer } : q
      );

      state.loading = false;
    },
    updateAdminAnswerFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    fetchCheckSubmitRequest: (state) => {
      state.loading = true;
    },
    fetchCheckSubmitSuccess: (state, action) => {
      state.loading = false;
      state.checkSubmitQuestions = action.payload;
    },
    fetchCheckSubmitFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    fetchEditApprovePageRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchEditApprovePageSuccess: (state, action) => {
      state.loading = false;
      state.submitted = action.payload.combinedQuestions;
      state.checkSubmitQuestions = action.payload.checkSubmit;
    },
    fetchEditApprovePageFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

  },
});

export const {
  fetchAssignedQuestionsRequest,
  fetchAssignedQuestionsSuccess,
  fetchAssignedQuestionsFailure,

  fetchSubmittedQuestionsRequest,
  fetchSubmittedQuestionsSuccess,
  fetchSubmittedQuestionsFailure,

  fetchFilterQuestionsRequest,
  fetchFilterQuestionsSuccess,
  fetchFilterQuestionsFailure,

  addQuestionRequest,
  addQuestionSuccess,
  addQuestionFailure,

  deleteQuestionRequest,
  deleteQuestionSuccess,
  deleteQuestionFailure,

  analyzeQuestionRequest,
  analyzeQuestionFailure,

  setQuestionFilter,
  updateQuestionLocally,

  reassignQuestionRequest,
  reassignQuestionSuccess,
  reassignQuestionFailure,

  updateAdminAnswerRequest,
  updateAdminAnswerSuccess,
  updateAdminAnswerFailure,

  fetchCheckSubmitRequest,
  fetchCheckSubmitSuccess,
  fetchCheckSubmitFailure,

  fetchEditApprovePageRequest,
  fetchEditApprovePageSuccess,
  fetchEditApprovePageFailure,

} = questionsSlice.actions;

export default questionsSlice.reducer;
