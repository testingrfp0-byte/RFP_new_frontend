import { createSlice } from "@reduxjs/toolkit";

const simpleEmailVerificationSlice = createSlice({
  name: "simpleEmailVerification",
  initialState: {
    loading: false,
    error: null,
    success: false,
  },
  reducers: {
    simpleEmailVerificationStart: (state) => {
      state.loading = true;
      state.error = null;
      state.success = false;
    },
    simpleEmailVerificationSuccess: (state) => {
      state.loading = false;
      state.success = true;
    },
    simpleEmailVerificationFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    clearSimpleEmailVerificationError: (state) => {
      state.error = null;
    },
    resetSimpleEmailVerificationState: (state) => {
      state.loading = false;
      state.error = null;
      state.success = false;
    },
  },
});

export const {
  simpleEmailVerificationStart,
  simpleEmailVerificationSuccess,
  simpleEmailVerificationFailure,
  clearSimpleEmailVerificationError,
  resetSimpleEmailVerificationState,
} = simpleEmailVerificationSlice.actions;

export default simpleEmailVerificationSlice.reducer;
