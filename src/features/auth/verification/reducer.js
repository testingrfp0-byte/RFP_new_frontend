import { createSlice } from "@reduxjs/toolkit";

const verificationSlice = createSlice({
  name: "verification",
  initialState: {
    loading: false,
    error: null,
    success: false,
  },
  reducers: {
    verificationStart: (state) => {
      state.loading = true;
      state.error = null;
      state.success = false;
    },
    verificationSuccess: (state) => {
      state.loading = false;
      state.success = true;
    },
    verificationFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    clearVerificationError: (state) => {
      state.error = null;
    },
    resetVerificationState: (state) => {
      state.loading = false;
      state.error = null;
      state.success = false;
    },
  },
});

export const {
  verificationStart,
  verificationSuccess,
  verificationFailure,
  clearVerificationError,
  resetVerificationState,
} = verificationSlice.actions;

export default verificationSlice.reducer;
