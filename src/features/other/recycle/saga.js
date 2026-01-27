import { call, put, takeLatest } from "redux-saga/effects";
import api from "../../../services/apiHelper";
import { mapErrorMessage } from "../../../utilis/messages";
import {
  fetchTrashStart,
  fetchTrashSuccess,
  fetchTrashFailure,
  restoreTrashStart,
  restoreTrashSuccess,
  restoreTrashFailure,
  deleteTrashStart,
  deleteTrashSuccess,
  deleteTrashFailure,
} from "./recycleBinSlice";
import {
  FETCH_TRASH_REQUEST,
  RESTORE_TRASH_REQUEST,
  DELETE_TRASH_REQUEST,
} from "./type";
import { DOCUMENT_URLS } from "../../../services/urlServices";
// import { showToast } from "../../ui/toastSlice"; 

function* fetchTrashSaga() {
  try {
    yield put(fetchTrashStart());
    const res = yield call(api.get, DOCUMENT_URLS.TRASH);
    yield put(fetchTrashSuccess(res.data || []));
  } catch (e) {
    const msg = mapErrorMessage(e);
    yield put(fetchTrashFailure(msg));
    // yield put(showToast({ type: "error", message: msg }));
  }
}

function* restoreTrashSaga(action) {
  const rfpId = action.payload;
  try {
    yield put(restoreTrashStart(rfpId));
    const res = yield call(api.post, DOCUMENT_URLS.RESTORE(rfpId));
    // yield put(showToast({ type: "success", message: res.data?.message }));
    yield put(restoreTrashSuccess());
    yield put({ type: FETCH_TRASH_REQUEST });
  } catch (e) {
    yield put(restoreTrashFailure());
    // yield put(showToast({ type: "error", message: "Restore failed" }));
  }
}

function* deleteTrashSaga(action) {
  const rfpId = action.payload;
  try {
    yield put(deleteTrashStart(rfpId));
    const res = yield call(api.delete, DOCUMENT_URLS.PERMANENT_DELETE(rfpId));
    // yield put(showToast({ type: "error", message: res.data?.message }));
    yield put(deleteTrashSuccess());
    yield put({ type: FETCH_TRASH_REQUEST });
  } catch (e) {
    yield put(deleteTrashFailure());
    // yield put(showToast({ type: "error", message: "Delete failed" }));
  }
}

export default function* recycleBinSaga() {
  yield takeLatest(FETCH_TRASH_REQUEST, fetchTrashSaga);
  yield takeLatest(RESTORE_TRASH_REQUEST, restoreTrashSaga);
  yield takeLatest(DELETE_TRASH_REQUEST, deleteTrashSaga);
}
