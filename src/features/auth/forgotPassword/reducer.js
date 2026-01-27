import { createSlice } from "@reduxjs/toolkit";

const forgotPasswordSlice = createSlice({
  name: "forgotPassword",
  initialState: {
    loading: false,
    error: null,
    success: false,
  },
  reducers: {
    forgotPasswordStart: (state) => {
      state.loading = true;
      state.error = null;
      state.success = false;
    },
    forgotPasswordSuccess: (state) => {
      state.loading = false;
      state.success = true;
    },
    forgotPasswordFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    clearForgotPasswordError: (state) => {
      state.error = null;
    },
    resetForgotPasswordState: (state) => {
      state.loading = false;
      state.error = null;
      state.success = false;
    },
  },
});

export const {
  forgotPasswordStart,
  forgotPasswordSuccess,
  forgotPasswordFailure,
  clearForgotPasswordError,
  resetForgotPasswordState,
} = forgotPasswordSlice.actions;

export default forgotPasswordSlice.reducer;
