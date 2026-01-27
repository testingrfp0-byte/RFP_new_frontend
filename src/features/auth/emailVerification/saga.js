import { call, put, takeLatest } from "redux-saga/effects";
import { SIMPLE_EMAIL_VERIFY_REQUEST } from "./type";
import {
  simpleEmailVerificationStart,
  simpleEmailVerificationSuccess,
  simpleEmailVerificationFailure,
} from "./reducer";
import { getAPI } from "../../../services/apiHelper";
import { AUTH_URLS } from "../../../services/urlServices";
import { mapErrorMessage } from "../../../utilis/messages";

function* simpleEmailVerificationSaga(action) {
  const { payload } = action;

  try {
    yield put(simpleEmailVerificationStart());

    yield call(getAPI, AUTH_URLS.SIMPLE_EMAIL_VERIFY, {
      params: {
        otp: payload.otp,
        email: payload.email,
        role: payload.role,
      },
    });

    yield put(simpleEmailVerificationSuccess());
  } catch (error) {
    yield put(
      simpleEmailVerificationFailure(mapErrorMessage(error, "EMAIL_VERIFY"))
    );
  }
}

export default function* simpleEmailVerificationWatcher() {
  yield takeLatest(SIMPLE_EMAIL_VERIFY_REQUEST, simpleEmailVerificationSaga);
}
