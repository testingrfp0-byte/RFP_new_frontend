import { call, put, takeLatest } from "redux-saga/effects";
import { FORGOT_PASSWORD_REQUEST } from "./type";
import {
  forgotPasswordStart,
  forgotPasswordSuccess,
  forgotPasswordFailure,
} from "./reducer";
import { postAPI } from "../../../services/apiHelper";
import { AUTH_URLS } from "../../../services/urlServices";
import { validateForgotPasswordPayload } from "../../../utilis/validations";
import { mapErrorMessage } from "../../../utilis/messages";

function* forgotPasswordSaga(action) {
  const { payload } = action;

  const validationError = validateForgotPasswordPayload(payload);
  if (validationError) {
    yield put(forgotPasswordFailure(validationError));
    return;
  }

  try {
    yield put(forgotPasswordStart());

    yield call(postAPI, AUTH_URLS.FORGOT_PASSWORD, {
      email: payload.email,
    });

    yield put(forgotPasswordSuccess());
  } catch (error) {
    yield put(
      forgotPasswordFailure(
        mapErrorMessage(error, "FORGOT_PASSWORD")
      )
    );
  }
}

export default function* forgotPasswordWatcher() {
  yield takeLatest(FORGOT_PASSWORD_REQUEST, forgotPasswordSaga);
}
