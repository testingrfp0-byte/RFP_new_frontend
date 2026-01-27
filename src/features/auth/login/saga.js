import { call, put, takeLatest } from "redux-saga/effects";
import { LOGIN_REQUEST } from "./type";
import { toast } from "react-toastify";
import { loginRequest, loginSuccess, loginFailure } from "./reducer";
import { postAPI, getAPI } from "../../../services/apiHelper";
import { AUTH_URLS } from "../../../services/urlServices";
import { mapErrorMessage } from "../../../utilis/messages";
import { validateLoginPayload } from "../../../utilis/validations";

function* loginUserSaga(action) {
  const { payload } = action;
  const { email, password, rememberMe } = payload;

  const validationError = validateLoginPayload(payload);
  if (validationError) {
    yield put(loginFailure(validationError));
    return;
  }

  try {
    yield put(loginRequest());

    const loginRes = yield call(postAPI, AUTH_URLS.LOGIN, {
      email: email,
      password: password,
    });

    let userRole = loginRes.data.role;

    if (!userRole) {
      try {
        const userDetailsRes = yield call(getAPI, AUTH_URLS.USER_DETAILS);
        const user = userDetailsRes.data.find(
          (u) => u.email === email || u.username === email
        );
        userRole = user?.role || "reviewer";
      } catch {
        userRole = "reviewer";
      }
    }

    localStorage.setItem(
      "session",
      JSON.stringify({
        email,
        token: loginRes.data.access_token,
        role: userRole,
        userId: loginRes.data.user_id,
        image_url: loginRes.data.image_url,
      })
    );

    if (rememberMe) {
      localStorage.setItem(
        "savedCredentials",
        JSON.stringify({ email, password, rememberMe: true })
      );
    } else {
      localStorage.removeItem("savedCredentials");
    }

    window.dispatchEvent(new Event("storage"));

    yield put(
      loginSuccess({
        ...loginRes.data,
        role: userRole,
      })
    );

    toast.success("Login successful! Redirecting...", {
      position: "top-right",
      autoClose: 2000,
    });
  } catch (error) {
    const errorMessage = mapErrorMessage(error, "LOGIN");
    yield put(loginFailure(errorMessage));

    toast.error(errorMessage, {
      position: "top-right",
      autoClose: 3000,
    });
  }
}

export default function* loginSaga() {
  yield takeLatest(LOGIN_REQUEST, loginUserSaga);
}
