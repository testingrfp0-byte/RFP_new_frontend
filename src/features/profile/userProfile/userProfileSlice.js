import { createSlice } from "@reduxjs/toolkit";

const userDetailsSlice = createSlice({
  name: "userDetails",
  initialState: {
    loading: false,
    data: null,
    error: null,
  },
  reducers: {
    userDetailsStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    userDetailsSuccess: (state, action) => {
      state.loading = false;
      state.data = action.payload;
    },
    userDetailsFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    resetUserDetailsState: () => ({
      loading: false,
      data: null,
      error: null,
    }),
  },
});

const updateProfileSlice = createSlice({
  name: "updateProfile",
  initialState: {
    loading: false,
    success: false,
    error: null,
  },
  reducers: {
    updateProfileStart: (state) => {
      state.loading = true;
      state.success = false;
      state.error = null;
    },
    updateProfileSuccess: (state) => {
      state.loading = false;
      state.success = true;
    },
    updateProfileFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    resetUpdateProfileState: () => ({
      loading: false,
      success: false,
      error: null,
    }),
  },
});

export const {
  userDetailsStart,
  userDetailsSuccess,
  userDetailsFailure,
  resetUserDetailsState,
} = userDetailsSlice.actions;

export const {
  updateProfileStart,
  updateProfileSuccess,
  updateProfileFailure,
  resetUpdateProfileState,
} = updateProfileSlice.actions;

export const userDetailsReducer = userDetailsSlice.reducer;
export const updateProfileReducer = updateProfileSlice.reducer;
