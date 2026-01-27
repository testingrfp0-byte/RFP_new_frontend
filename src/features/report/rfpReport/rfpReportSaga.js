import { call, put, takeLatest } from "redux-saga/effects";
import api from "../../../services/apiHelper";
import * as TYPES from "./rfpReportTypes";
import { toast } from "react-toastify";
import { RFP_REPORT_URLS } from "../../../services/urlServices";

function* fetchRfpDocsSaga() {
  try {
    const res = yield call(api.get, RFP_REPORT_URLS.LIST);

    yield put({
      type: TYPES.FETCH_RFP_DOCS_SUCCESS,
      payload: res.data?.docs || [],
    });
  } catch (e) {
    yield put({
      type: TYPES.FETCH_RFP_DOCS_FAILURE,
      payload: e.message,
    });
    toast.error("Failed to load documents");
  }
}

function* deleteRfpDocSaga(action) {
  try {
    yield call(api.delete, RFP_REPORT_URLS.DELETE(action.payload));

    yield put({
      type: TYPES.DELETE_RFP_DOC_SUCCESS,
      payload: action.payload,
    });

    toast.success("Document deleted successfully");

    yield put({
      type: TYPES.FETCH_RFP_DOCS_REQUEST,
    });

  } catch (e) {
    yield put({
      type: TYPES.DELETE_RFP_DOC_FAILURE,
      payload: e.message,
    });
    toast.error("Delete failed");
  }
}

export default function* rfpReportSaga() {
  yield takeLatest(TYPES.FETCH_RFP_DOCS_REQUEST, fetchRfpDocsSaga);
  yield takeLatest(TYPES.DELETE_RFP_DOC_REQUEST, deleteRfpDocSaga);
}
