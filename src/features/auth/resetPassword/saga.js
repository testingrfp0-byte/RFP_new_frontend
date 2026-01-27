import { call, put, takeLatest } from "redux-saga/effects";
import { RESET_PASSWORD_REQUEST } from "./type";
import {
  resetPasswordStart,
  resetPasswordSuccess,
  resetPasswordFailure,
} from "./reducer";
import { postAPI } from "../../../services/apiHelper";
import { AUTH_URLS } from "../../../services/urlServices";
import { validateResetPasswordPayload } from "../../../utilis/validations";
import { mapErrorMessage } from "../../../utilis/messages";

function* resetPasswordSaga(action) {
  const { payload } = action;

  const validationError = validateResetPasswordPayload(payload);
  if (validationError) {
    yield put(resetPasswordFailure(validationError));
    return;
  }

  try {
    yield put(resetPasswordStart());

    yield call(postAPI, AUTH_URLS.RESET_PASSWORD, {
      email: payload.email,
      new_password: payload.newPassword,
    });

    yield put(resetPasswordSuccess());
  } catch (error) {
    yield put(
      resetPasswordFailure(
        mapErrorMessage(error, "RESET_PASSWORD")
      )
    );
  }
}

export default function* resetPasswordWatcher() {
  yield takeLatest(RESET_PASSWORD_REQUEST, resetPasswordSaga);
}
