import { call, put, takeLatest } from "redux-saga/effects";
import { ADMIN_REGISTER_REQUEST } from "./type";
import {
  adminRegisterStart,
  adminRegisterSuccess,
  adminRegisterFailure,
} from "./reducer";
import { postAPI } from "../../../services/apiHelper";
import { AUTH_URLS } from "../../../services/urlServices";
import { validateAdminRegisterPayload } from "../../../utilis/validations";
import { mapErrorMessage } from "../../../utilis/messages";

function* adminRegisterSaga(action) {
  const { payload } = action;

  const validationError = validateAdminRegisterPayload(payload);
  if (validationError) {
    yield put(adminRegisterFailure(validationError));
    return;
  }

  try {
    yield put(adminRegisterStart());

    /* register admin */
    yield call(postAPI, AUTH_URLS.REGISTER, {
      username: payload.username,
      email: payload.email,
      password: payload.password,
      role: "admin",
    });

    /* auto login admin */
    const loginRes = yield call(postAPI, AUTH_URLS.LOGIN, {
      email: payload.email,
      password: payload.password,
    });

    localStorage.setItem(
      "session",
      JSON.stringify({
        email: payload.email,
        token: loginRes.data.access_token,
        role: "admin",
      })
    );

    window.dispatchEvent(new Event("storage"));

    yield put(adminRegisterSuccess());
  } catch (error) {
    yield put(adminRegisterFailure(mapErrorMessage(error, "ADMIN_REGISTER")));
  }
}

export default function* adminRegisterWatcher() {
  yield takeLatest(ADMIN_REGISTER_REQUEST, adminRegisterSaga);
}
