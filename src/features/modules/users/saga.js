import { call, put, takeLatest } from "redux-saga/effects";
import api from "../../../services/apiHelper";
import { USER_URLS } from "../../../services/urlServices";

import {
  fetchUsersRequest,
  fetchUsersSuccess,
  fetchUsersFailure,
  fetchUserDetailsRequest,
  fetchUserDetailsSuccess,
  fetchUserDetailsFailure,
} from "./usersSlice";

function* fetchUsersWorker() {
  try {
    const response = yield call(api.get, USER_URLS.LIST);
    yield put(fetchUsersSuccess(response.data));
  } catch (error) {
    yield put(
      fetchUsersFailure(
        error.response?.data?.detail || error.message
      )
    );
  }
}

function* fetchUserDetailsWorker(action) {
  try {
    const { userId } = action.payload;

    if (!userId) {
      throw new Error("User ID is required");
    }

    const response = yield call(
      api.get,
      PROFILE_URLS.USER_DETAILS(userId)
    );

    yield put(fetchUserDetailsSuccess(response.data));
  } catch (error) {
    yield put(
      fetchUserDetailsFailure(
        error.response?.data?.detail || error.message
      )
    );
  }
}

export default function* usersSaga() {
  yield takeLatest(fetchUsersRequest.type, fetchUsersWorker);
  yield takeLatest(fetchUserDetailsRequest.type, fetchUserDetailsWorker);
}