import { createSlice } from "@reduxjs/toolkit";
import * as TYPES from "./libraryType";

const initialState = {
  historicRFPs: [],
  clean: [],
  trainingMaterials: [],
  learningDocuments: [],
  backgroundMaterials: [],
  loading: false,
  error: null,
};

const librarySlice = createSlice({
  name: "library",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // FETCH
      .addCase(TYPES.FETCH_LIBRARY_REQUEST, (state) => {
        state.loading = true;
      })
      .addCase(TYPES.FETCH_LIBRARY_SUCCESS, (state, action) => {
        state.loading = false;
        state.error = null;

        const data = action.payload;

        state.historicRFPs = data.filter((d) => d.category === "history");
        state.clean = data.filter((d) => d.category === "clean");
        state.trainingMaterials = data.filter((d) => d.category === "training");
        state.learningDocuments = data.filter((d) => d.category === "learning");
        state.backgroundMaterials = data.filter(
          (d) =>
            d.category === "Client and Industry Background" ||
            d.category === "client_industry_background" ||
            d.category === "Client_and_Industry_Background" ||
            d.category === "client and industry background",
        );
      })
      .addCase(TYPES.FETCH_LIBRARY_FAILURE, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // DELETE
      .addCase(TYPES.DELETE_LIBRARY_REQUEST, (state) => {
        state.loading = true;
      })
      .addCase(TYPES.DELETE_LIBRARY_SUCCESS, (state) => {
        state.loading = false;
      })
      .addCase(TYPES.DELETE_LIBRARY_FAILURE, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(TYPES.UPLOAD_LIBRARY_REQUEST, (state) => {
        state.loading = true;
      })
      .addCase(TYPES.UPLOAD_LIBRARY_SUCCESS, (state) => {
        state.loading = false;
      })
      .addCase(TYPES.UPLOAD_LIBRARY_FAILURE, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default librarySlice.reducer;
