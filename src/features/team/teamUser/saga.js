import { call, put, takeLatest } from "redux-saga/effects";
import api from "../../../services/apiHelper";
import * as TYPES from "./teamUserTypes";
import { TEAM_USER_URLS } from "../../../services/urlServices";
import { toast } from "react-toastify";

function* fetchTeamUsers() {
  try {
    const res = yield call(api.get, TEAM_USER_URLS.LIST);
    yield put({
      type: TYPES.FETCH_TEAM_USERS_SUCCESS,
      payload: res.data || [],
    });
  } catch (e) {
    yield put({
      type: TYPES.FETCH_TEAM_USERS_FAILURE,
      payload: e.response?.data?.detail || e.message,
    });
    toast.error(e.response?.data?.detail || "Failed to fetch users");
  }
}

function* addTeamUser(action) {
  try {
    yield call(api.post, TEAM_USER_URLS.ADD, action.payload);

    yield put({
      type: TYPES.ADD_TEAM_USER_SUCCESS,
      payload: "User added successfully",
    });

    toast.success("User added successfully");

    yield put({ type: TYPES.FETCH_TEAM_USERS_REQUEST });
  } catch (e) {
    yield put({
      type: TYPES.ADD_TEAM_USER_FAILURE,
      payload: e.response?.data?.detail || e.message,
    });
    toast.error(e.response?.data?.detail || "Failed to add user");
  }
}

function* deleteTeamUser(action) {
  try {
    yield call(api.delete, TEAM_USER_URLS.DELETE, {
      data: action.payload,
    });

    yield put({ type: TYPES.DELETE_TEAM_USER_SUCCESS });

    toast.success("User deleted successfully");

    yield put({ type: TYPES.FETCH_TEAM_USERS_REQUEST });
  } catch (e) {
    yield put({
      type: TYPES.DELETE_TEAM_USER_FAILURE,
      payload: e.response?.data?.detail || e.message,
    });
    toast.error(e.response?.data?.detail || "Failed to delete user");
  }
}

export default function* teamUsersSaga() {
  yield takeLatest(TYPES.FETCH_TEAM_USERS_REQUEST, fetchTeamUsers);
  yield takeLatest(TYPES.ADD_TEAM_USER_REQUEST, addTeamUser);
  yield takeLatest(TYPES.DELETE_TEAM_USER_REQUEST, deleteTeamUser);
}
