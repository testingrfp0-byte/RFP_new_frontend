import { call, put, takeLatest } from "redux-saga/effects";
import { USER_DETAILS_REQUEST, UPDATE_PROFILE_REQUEST } from "./type";
import {
  userDetailsStart,
  userDetailsSuccess,
  userDetailsFailure,
  updateProfileStart,
  updateProfileSuccess,
  updateProfileFailure,
} from "./userProfileSlice";
import api from "../../../services/apiHelper";
import { PROFILE_URLS } from "../../../services/urlServices";
import { mapErrorMessage } from "../../../utilis/messages";
import { validateUpdateProfileFields } from "../../../utilis/fieldValidations";

function* fetchUserDetailsSaga(action) {
  try {
    yield put(userDetailsStart());

    const { userId } = action.payload;

    const response = yield call(
      api.get,
      PROFILE_URLS.USER_DETAILS(userId)
    );

    yield put(userDetailsSuccess(response.data));
  } catch (error) {
    yield put(userDetailsFailure(mapErrorMessage(error)));
  }
}

function* updateProfileSaga(action) {
  const validationErrors = validateUpdateProfileFields(action.payload);

  if (Object.keys(validationErrors).length > 0) {
    yield put(updateProfileFailure("Invalid profile data"));
    return;
  }

  try {
    yield put(updateProfileStart());

    const formData = new FormData();
    formData.append("username", action.payload.username);
    formData.append("email", action.payload.email);

    if (action.payload.image_name && action.payload.image_base64) {
      formData.append("image_name", action.payload.image_name);
      formData.append("image_base64", action.payload.image_base64);
    }

    yield call(api.put, PROFILE_URLS.UPDATE_PROFILE, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    yield put(updateProfileSuccess());

    const session = localStorage.getItem("session");
    const parsedSession = JSON.parse(session);
    const userId = parsedSession.userId;

    if (userId) {
      yield put({
        type: USER_DETAILS_REQUEST,
        payload: { userId },
      });
    }
  } catch (error) {
    yield put(updateProfileFailure(mapErrorMessage(error)));
  }
}

export default function* userProfileSaga() {
  yield takeLatest(USER_DETAILS_REQUEST, fetchUserDetailsSaga);
  yield takeLatest(UPDATE_PROFILE_REQUEST, updateProfileSaga);
}