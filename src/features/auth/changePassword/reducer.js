import { createSlice } from "@reduxjs/toolkit";

const changePasswordSlice = createSlice({
  name: "changePassword",
  initialState: {
    loading: false,
    error: null,
    success: false,
  },
  reducers: {
    changePasswordStart: (state) => {
      state.loading = true;
      state.error = null;
      state.success = false;
    },
    changePasswordSuccess: (state) => {
      state.loading = false;
      state.success = true;
    },
    changePasswordFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    clearChangePasswordError: (state) => {
      state.error = null;
    },
    resetChangePasswordState: (state) => {
      state.loading = false;
      state.error = null;
      state.success = false;
    },
  },
});

export const {
  changePasswordStart,
  changePasswordSuccess,
  changePasswordFailure,
  clearChangePasswordError,
  resetChangePasswordState,
} = changePasswordSlice.actions;

export default changePasswordSlice.reducer;
