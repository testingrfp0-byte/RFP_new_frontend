import { call, put, takeLatest } from "redux-saga/effects";
import { REGISTER_REQUEST } from "./type";
import { registerRequest, registerSuccess, registerFailure } from "./reducer";
import { postAPI } from "../../../services/apiHelper";
import { AUTH_URLS } from "../../../services/urlServices";
import { validateRegisterPayload } from "../../../utilis/validations";
import { mapErrorMessage } from "../../../utilis/messages";

function* registerUserSaga(action) {
  const { payload } = action;

  const validationError = validateRegisterPayload(payload);
  if (validationError) {
    yield put(registerFailure(validationError));
    return;
  }

  try {
    yield put(registerRequest());

    yield call(postAPI, AUTH_URLS.REGISTER, {
      username: payload.username,
      email: payload.email,
      password: payload.password,
      role: "reviewer",
    });

    yield put(registerSuccess());
  } catch (error) {
    const errorMessage = mapErrorMessage(error, "REGISTER");
    yield put(registerFailure(errorMessage));
  }
}

export default function* registerSaga() {
  yield takeLatest(REGISTER_REQUEST, registerUserSaga);
}
