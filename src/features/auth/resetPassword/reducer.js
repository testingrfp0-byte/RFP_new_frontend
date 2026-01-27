import { createSlice } from "@reduxjs/toolkit";

const resetPasswordSlice = createSlice({
  name: "resetPassword",
  initialState: {
    loading: false,
    error: null,
    success: false,
  },
  reducers: {
    resetPasswordStart: (state) => {
      state.loading = true;
      state.error = null;
      state.success = false;
    },
    resetPasswordSuccess: (state) => {
      state.loading = false;
      state.success = true;
    },
    resetPasswordFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    clearResetPasswordError: (state) => {
      state.error = null;
    },
    resetResetPasswordState: (state) => {
      state.loading = false;
      state.error = null;
      state.success = false;
    },
  },
});

export const {
  resetPasswordStart,
  resetPasswordSuccess,
  resetPasswordFailure,
  clearResetPasswordError,
  resetResetPasswordState,
} = resetPasswordSlice.actions;

export default resetPasswordSlice.reducer;
