import { createSlice } from "@reduxjs/toolkit";

const recycleBinSlice = createSlice({
  name: "recycleBin",
  initialState: {
    list: [],
    loading: false,
    actionLoadingId: null,
    error: null,
  },
  reducers: {
    fetchTrashStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchTrashSuccess: (state, action) => {
      state.loading = false;
      state.list = action.payload;
    },
    fetchTrashFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    restoreTrashStart: (state, action) => {
      state.actionLoadingId = action.payload;
    },
    restoreTrashSuccess: (state) => {
      state.actionLoadingId = null;
    },
    restoreTrashFailure: (state) => {
      state.actionLoadingId = null;
    },

    deleteTrashStart: (state, action) => {
      state.actionLoadingId = action.payload;
    },
    deleteTrashSuccess: (state) => {
      state.actionLoadingId = null;
    },
    deleteTrashFailure: (state) => {
      state.actionLoadingId = null;
    },
  },
});

export const {
  fetchTrashStart,
  fetchTrashSuccess,
  fetchTrashFailure,
  restoreTrashStart,
  restoreTrashSuccess,
  restoreTrashFailure,
  deleteTrashStart,
  deleteTrashSuccess,
  deleteTrashFailure,
} = recycleBinSlice.actions;

export default recycleBinSlice.reducer;
