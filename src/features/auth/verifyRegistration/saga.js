import { call, put, takeLatest } from "redux-saga/effects";
import { REGISTER_VERIFIED_REQUEST } from "./type";
import {
  registerVerifiedStart,
  registerVerifiedSuccess,
  registerVerifiedFailure,
} from "./reducer";
import { postAPI } from "../../../services/apiHelper";
import { AUTH_URLS } from "../../../services/urlServices";
import { validateRegisterVerifiedPayload } from "../../../utilis/validations";
import { mapErrorMessage } from "../../../utilis/messages";

function* registerVerifiedSaga(action) {
  const { payload } = action;

  const validationError = validateRegisterVerifiedPayload(payload);
  if (validationError) {
    yield put(registerVerifiedFailure(validationError));
    return;
  }

  try {
    yield put(registerVerifiedStart());

    yield call(postAPI, AUTH_URLS.REGISTER_VERIFICATION, {
      email: payload.email,
      old_password: payload.oldPassword,
      new_password: payload.newPassword,
      username: payload.username,
      role: payload.role,
    });

    yield put(registerVerifiedSuccess());
  } catch (error) {
    yield put(
      registerVerifiedFailure(
        mapErrorMessage(error, "REGISTER_VERIFIED")
      )
    );
  }
}

export default function* registerVerifiedWatcher() {
  yield takeLatest(REGISTER_VERIFIED_REQUEST, registerVerifiedSaga);
}
