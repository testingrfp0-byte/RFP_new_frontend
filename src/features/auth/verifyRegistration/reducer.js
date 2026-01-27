import { createSlice } from "@reduxjs/toolkit";

const registerVerifiedSlice = createSlice({
  name: "registerVerified",
  initialState: {
    loading: false,
    error: null,
    success: false,
  },
  reducers: {
    registerVerifiedStart: (state) => {
      state.loading = true;
      state.error = null;
      state.success = false;
    },
    registerVerifiedSuccess: (state) => {
      state.loading = false;
      state.success = true;
    },
    registerVerifiedFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    clearRegisterVerifiedError: (state) => {
      state.error = null;
    },
    resetRegisterVerifiedState: (state) => {
      state.loading = false;
      state.error = null;
      state.success = false;
    },
  },
});

export const {
  registerVerifiedStart,
  registerVerifiedSuccess,
  registerVerifiedFailure,
  clearRegisterVerifiedError,
  resetRegisterVerifiedState,
} = registerVerifiedSlice.actions;

export default registerVerifiedSlice.reducer;
