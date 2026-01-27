import { call, put, takeLatest } from "redux-saga/effects";
import { VERIFY_OTP_REQUEST, RESEND_OTP_REQUEST } from "./type";
import {
  verificationStart,
  verificationSuccess,
  verificationFailure,
} from "./reducer";
import { postAPI } from "../../../services/apiHelper";
import { AUTH_URLS } from "../../../services/urlServices";
import { validateOtpPayload } from "../../../utilis/validations";
import { mapErrorMessage } from "../../../utilis/messages";

function* verifyOtpSaga(action) {
  const { payload } = action;

  const validationError = validateOtpPayload(payload);
  if (validationError) {
    yield put(verificationFailure(validationError));
    return;
  }

  try {
    yield put(verificationStart());

    yield call(postAPI, AUTH_URLS.VERIFY_OTP, payload);

    yield put(verificationSuccess());
  } catch (error) {
    yield put(verificationFailure(mapErrorMessage(error, "VERIFY_OTP")));
  }
}

function* resendOtpSaga(action) {
  try {
    yield call(postAPI, AUTH_URLS.FORGOT_PASSWORD, {
      email: action.payload.email,
    });
  } catch (error) {
    // optional toast only
  }
}

export default function* verificationSaga() {
  yield takeLatest(VERIFY_OTP_REQUEST, verifyOtpSaga);
  yield takeLatest(RESEND_OTP_REQUEST, resendOtpSaga);
}
