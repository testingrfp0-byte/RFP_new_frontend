import { call, put, takeLatest } from "redux-saga/effects";
import { CHANGE_PASSWORD_REQUEST } from "./type";
import { toast } from "react-toastify";
import {
  changePasswordStart,
  changePasswordSuccess,
  changePasswordFailure,
} from "./reducer";
import { putAPI } from "../../../services/apiHelper";
import { AUTH_URLS } from "../../../services/urlServices";
import { validateChangePasswordPayload } from "../../../utilis/validations";
import { mapErrorMessage } from "../../../utilis/messages";

function* changePasswordSaga(action) {
  const { payload } = action;

  const validationError = validateChangePasswordPayload(payload);
  if (validationError) {
    yield put(changePasswordFailure(validationError));
    return;
  }

  try {
    yield put(changePasswordStart());

    const response = yield call(putAPI, AUTH_URLS.CHANGE_PASSWORD, {
      old_password: payload.oldPassword,
      new_password: payload.newPassword,
    });

    yield put(changePasswordSuccess());
    toast.success(response.data?.message || "Password changed successfully");
  } catch (error) {
    const errorMessage = mapErrorMessage(error, "CHANGE_PASSWORD");
    yield put(changePasswordFailure(errorMessage));
    toast.error(errorMessage);
  }
}

export default function* changePasswordWatcher() {
  yield takeLatest(CHANGE_PASSWORD_REQUEST, changePasswordSaga);
}
