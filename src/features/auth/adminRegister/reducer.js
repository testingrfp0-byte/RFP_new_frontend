import { createSlice } from "@reduxjs/toolkit";

const adminRegisterSlice = createSlice({
  name: "adminRegister",
  initialState: {
    loading: false,
    error: null,
    success: false,
  },
  reducers: {
    adminRegisterStart: (state) => {
      state.loading = true;
      state.error = null;
      state.success = false;
    },
    adminRegisterSuccess: (state) => {
      state.loading = false;
      state.success = true;
    },
    adminRegisterFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    clearAdminRegisterError: (state) => {
      state.error = null;
    },
    resetAdminRegisterState: (state) => {
      state.loading = false;
      state.error = null;
      state.success = false;
    },
  },
});

export const {
  adminRegisterStart,
  adminRegisterSuccess,
  adminRegisterFailure,
  clearAdminRegisterError,
  resetAdminRegisterState,
} = adminRegisterSlice.actions;

export default adminRegisterSlice.reducer;
