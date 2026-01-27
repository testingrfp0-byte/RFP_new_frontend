import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  list: [],
  currentUser: null,
  userDetails: null,
  role: null,
  loading: false,
  userDetailsLoading: false,
  error: null,
};

const usersSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    fetchUsersRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchUsersSuccess: (state, action) => {
      state.loading = false;
      state.list = action.payload;
    },
    fetchUsersFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    fetchUserDetailsRequest: (state) => {
      state.userDetailsLoading = true;
      state.error = null;
    },
    fetchUserDetailsSuccess: (state, action) => {
      state.userDetailsLoading = false;
      state.userDetails = action.payload;
    },
    fetchUserDetailsFailure: (state, action) => {
      state.userDetailsLoading = false;
      state.error = action.payload;
    },

    setCurrentUser: (state, action) => {
      state.currentUser = action.payload.email;
      state.role = action.payload.role;
    },
    clearCurrentUser: (state) => {
      state.currentUser = null;
      state.role = null;
      state.userDetails = null;
    },
  },
});

export const {
  fetchUsersRequest,
  fetchUsersSuccess,
  fetchUsersFailure,
  fetchUserDetailsRequest,
  fetchUserDetailsSuccess,
  fetchUserDetailsFailure,
  setCurrentUser,
  clearCurrentUser,
} = usersSlice.actions;

export default usersSlice.reducer;
